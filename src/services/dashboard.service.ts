import { ACTION_STATUSES, DEPARTMENTS, DOC_STATUSES, PRIORITIES } from "@/lib/constants";
import { addDaysYmd, monthsInRange, type ResolvedRange } from "@/lib/date-range";
import { formatDateOnly, parseDateOnly, toWibYmd } from "@/lib/date";
import { connectDB } from "@/lib/mongodb";
import { ActionTracker } from "@/models/ActionTracker";
import { AmsDocument } from "@/models/AmsDocument";
import { IncomingDocument } from "@/models/IncomingDocument";
import type { ActivityItem, CountItem, DashboardData, MonthItem, OverdueDoc } from "@/types";

type Row = { _id: string | null; n: number };

/** Urutkan sesuai daftar tetap dan isi 0 untuk kategori yang tidak muncul. */
function toCounts(rows: Row[] | undefined, order: readonly string[]): CountItem[] {
  const map = new Map((rows ?? []).map((r) => [String(r._id), r.n]));
  return order.map((name) => ({ name, value: map.get(name) ?? 0 }));
}

const count = (rows: { n: number }[] | undefined) => rows?.[0]?.n ?? 0;
const group = (field: string) => [{ $group: { _id: `$${field}`, n: { $sum: 1 } } }];

function toMonths(rows: Row[] | undefined, range: ResolvedRange): MonthItem[] {
  const map = new Map((rows ?? []).map((r) => [String(r._id), r.n]));
  return monthsInRange(range.from, range.to).map((month) => ({ month, value: map.get(month) ?? 0 }));
}

const NEEDS_FOLLOW_UP = { needsFollowUp: { $exists: true, $nin: ["", null] } };

export async function getDashboard(range: ResolvedRange, now: Date = new Date()): Promise<DashboardData> {
  await connectDB();

  const todayYmd = toWibYmd(now);
  const today = parseDateOnly(todayYmd);
  const d7 = parseDateOnly(addDaysYmd(todayYmd, 7));
  const d30 = parseDateOnly(addDaysYmd(todayYmd, 30));
  const notDone = { status: { $ne: "Done" } };

  const inRange = (field: string) => ({ [field]: { $gte: range.fromDate, $lte: range.toDate } });
  const activityWindow = { updatedAt: { $gte: range.startInstant, $lt: range.endInstant } };

  const [[at], [ams], [inc], atAct, amsAct, incAct] = await Promise.all([
    ActionTracker.aggregate([
      { $match: inRange("meetingDate") },
      {
        $facet: {
          total: [{ $count: "n" }],
          byStatus: group("status"),
          byDepartment: group("department"),
          byPriority: group("priority"),
          avgProgress: [{ $group: { _id: null, n: { $avg: "$progress" } } }],
          overdue: [{ $match: { ...notDone, deadline: { $lt: today } } }, { $count: "n" }],
          dlWeek: [{ $match: { ...notDone, deadline: { $gte: today, $lte: d7 } } }, { $count: "n" }],
          dlMonth: [{ $match: { ...notDone, deadline: { $gt: d7, $lte: d30 } } }, { $count: "n" }],
          dlLater: [{ $match: { ...notDone, deadline: { $gt: d30 } } }, { $count: "n" }],
          dlNone: [{ $match: { ...notDone, deadline: { $exists: false } } }, { $count: "n" }],
        },
      },
    ]),
    AmsDocument.aggregate([
      { $match: inRange("receivedDate") },
      {
        $facet: {
          total: [{ $count: "n" }],
          byStatus: group("status"),
          followUp: [{ $match: NEEDS_FOLLOW_UP }, ...group("followUpStatus")],
          monthly: [{ $group: { _id: { $dateToString: { format: "%Y-%m", date: "$receivedDate" } }, n: { $sum: 1 } } }],
          overdue: [{ $match: { followUpStatus: { $ne: "Selesai" }, followUpDueDate: { $lt: today } } }, { $count: "n" }],
          overdueList: [
            { $match: { followUpStatus: { $ne: "Selesai" }, followUpDueDate: { $lt: today } } },
            { $sort: { followUpDueDate: 1, _id: 1 } },
            { $limit: 5 },
            { $project: { documentNumber: 1, followUpDueDate: 1, followUpStatus: 1 } },
          ],
        },
      },
    ]),
    IncomingDocument.aggregate([
      { $match: inRange("receivedDate") },
      {
        $facet: {
          total: [{ $count: "n" }],
          byStatus: group("status"),
          monthly: [{ $group: { _id: { $dateToString: { format: "%Y-%m", date: "$receivedDate" } }, n: { $sum: 1 } } }],
        },
      },
    ]),
    ActionTracker.find(activityWindow).sort({ updatedAt: -1 }).limit(10).select("number agenda createdAt updatedAt").lean(),
    AmsDocument.find(activityWindow).sort({ updatedAt: -1 }).limit(10).select("documentNumber documentType sender createdAt updatedAt").lean(),
    IncomingDocument.find(activityWindow).sort({ updatedAt: -1 }).limit(10).select("documentNumber documentType sender subject createdAt updatedAt").lean(),
  ]);

  // ----- Action Tracker
  const atStatus = toCounts(at.byStatus, ACTION_STATUSES);
  const atTotal = count(at.total);
  const atDone = atStatus.find((s) => s.name === "Done")?.value ?? 0;
  const byDeadline: CountItem[] = [
    { name: "Terlambat", value: count(at.overdue) },
    { name: "0–7 hari", value: count(at.dlWeek) },
    { name: "8–30 hari", value: count(at.dlMonth) },
    { name: "> 30 hari", value: count(at.dlLater) },
  ];
  const dlNone = count(at.dlNone);
  if (dlNone > 0) byDeadline.push({ name: "Tanpa deadline", value: dlNone });

  // ----- AMS
  const amsStatus = toCounts(ams.byStatus, DOC_STATUSES);
  const followUp = toCounts(ams.followUp, DOC_STATUSES);
  const amsNeedFollowUp = followUp.filter((f) => f.name !== "Selesai").reduce((a, b) => a + b.value, 0);

  // ----- Dokumen Masuk
  const incStatus = toCounts(inc.byStatus, DOC_STATUSES);
  const incTotal = count(inc.total);
  const incDone = incStatus.find((s) => s.name === "Selesai")?.value ?? 0;

  const overdueList: OverdueDoc[] = (ams.overdueList ?? []).map(
    (d: { _id: unknown; documentNumber: string; followUpDueDate: Date; followUpStatus: string }) => ({
      id: String(d._id),
      documentNumber: d.documentNumber,
      dueDate: formatDateOnly(d.followUpDueDate),
      daysLate: Math.max(1, Math.round((today.getTime() - new Date(d.followUpDueDate).getTime()) / 86_400_000)),
      status: d.followUpStatus,
    })
  );

  // ----- Aktivitas terbaru (gabungan 3 modul)
  const kindOf = (c: Date, u: Date): ActivityItem["kind"] =>
    new Date(u).getTime() - new Date(c).getTime() < 2000 ? "created" : "updated";
  const activities: ActivityItem[] = [
    ...atAct.map((d) => ({
      id: String(d._id), module: "action-tracker" as const, kind: kindOf(d.createdAt, d.updatedAt),
      title: d.number, description: d.agenda, at: new Date(d.updatedAt).toISOString(),
    })),
    ...amsAct.map((d) => ({
      id: String(d._id), module: "ams" as const, kind: kindOf(d.createdAt, d.updatedAt),
      title: d.documentNumber, description: [d.documentType, d.sender].filter(Boolean).join(" · "), at: new Date(d.updatedAt).toISOString(),
    })),
    ...incAct.map((d) => ({
      id: String(d._id), module: "incoming" as const, kind: kindOf(d.createdAt, d.updatedAt),
      title: d.documentNumber, description: d.subject || d.sender || d.documentType, at: new Date(d.updatedAt).toISOString(),
    })),
  ]
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 10);

  return {
    range: { key: range.key, from: range.from, to: range.to },
    generatedAt: now.toISOString(),
    cards: {
      actionTotal: atTotal,
      actionOnProgress: atStatus.find((s) => s.name === "On Progress")?.value ?? 0,
      actionDone: atDone,
      actionOverdue: count(at.overdue),
      amsTotal: count(ams.total),
      amsNeedFollowUp,
      incomingTotal: incTotal,
      incomingNotDone: incTotal - incDone,
    },
    action: {
      byStatus: atStatus,
      byDepartment: toCounts(at.byDepartment, DEPARTMENTS),
      byPriority: toCounts(at.byPriority, PRIORITIES),
      completionPercent: atTotal ? Math.round((atDone / atTotal) * 100) : 0,
      averageProgress: Math.round(at.avgProgress?.[0]?.n ?? 0),
      byDeadline,
    },
    documents: {
      amsPerMonth: toMonths(ams.monthly, range),
      incomingPerMonth: toMonths(inc.monthly, range),
      statusDistribution: DOC_STATUSES.map((name, i) => ({ name, ams: amsStatus[i].value, incoming: incStatus[i].value })),
      followUpByStatus: followUp,
      overdueCount: count(ams.overdue),
      overdueList,
    },
    activities,
  };
}