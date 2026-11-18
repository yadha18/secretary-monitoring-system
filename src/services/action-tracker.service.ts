import { connectDB } from "@/lib/mongodb";
import { parseDateOnly, todayDateOnly } from "@/lib/date";
import { AppError } from "@/lib/errors";
import { EXPORT_MAX_ROWS, buildSort, combine, dateRangeFilter, pageMeta, searchFilter } from "@/lib/query";
import type { ActionTrackerInput, ActionTrackerListQuery } from "@/lib/validations/action-tracker";
import { ActionTracker } from "@/models/ActionTracker";
import type { Paginated, ActionTrackerDto } from "@/types";
import { toActionTrackerDto } from "./serializers";

const SORTABLE = {
  number: "number",
  meetingDate: "meetingDate",
  startDate: "startDate",
  deadline: "deadline",
  priority: "priority",
  status: "status",
  progress: "progress",
  department: "department",
  lastUpdated: "lastUpdated",
} as const;

function buildFilter(q: ActionTrackerListQuery) {
  return combine(
    searchFilter(q.q, ["number", "agenda", "actionItem", "pic"]),
    q.department && { department: q.department },
    q.priority && { priority: q.priority },
    q.status && { status: q.status },
    q.progress !== undefined && { progress: q.progress },
    dateRangeFilter("deadline", q.deadlineFrom, q.deadlineTo),
    q.overdue && { status: { $ne: "Done" }, deadline: { $lt: todayDateOnly() } }
  );
}

const sortOf = (q: ActionTrackerListQuery) =>
  buildSort(q.sort, q.order, SORTABLE, { field: "meetingDate", order: "desc" });

export async function listActionTrackers(q: ActionTrackerListQuery): Promise<Paginated<ActionTrackerDto>> {
  const filter = buildFilter(q);
  const sort = sortOf(q); // validasi sebelum menyentuh database
  await connectDB();
  const [rows, total] = await Promise.all([
    ActionTracker.find(filter)
      .sort(sort)
      .skip((q.page - 1) * q.pageSize)
      .limit(q.pageSize)
      .lean(),
    ActionTracker.countDocuments(filter),
  ]);
  return { data: rows.map(toActionTrackerDto), meta: pageMeta(q.page, q.pageSize, total) };
}

export async function exportActionTrackers(q: ActionTrackerListQuery): Promise<ActionTrackerDto[]> {
  const filter = buildFilter(q);
  const sort = sortOf(q);
  await connectDB();
  const rows = await ActionTracker.find(filter).sort(sort).limit(EXPORT_MAX_ROWS).lean();
  return rows.map(toActionTrackerDto);
}

export async function getActionTracker(id: string): Promise<ActionTrackerDto> {
  await connectDB();
  const doc = await ActionTracker.findById(id).lean();
  if (!doc) throw new AppError("NOT_FOUND", "Action Tracker tidak ditemukan.");
  return toActionTrackerDto(doc);
}

function toDocData(i: ActionTrackerInput) {
  return {
    number: i.number,
    meetingDate: parseDateOnly(i.meetingDate),
    agenda: i.agenda,
    actionItem: i.actionItem,
    pic: i.pic,
    department: i.department,
    priority: i.priority,
    startDate: parseDateOnly(i.startDate),
    deadline: parseDateOnly(i.deadline),
    status: i.status,
    progress: i.progress,
  };
}

export async function createActionTracker(input: ActionTrackerInput): Promise<ActionTrackerDto> {
  await connectDB();
  const doc = await ActionTracker.create({ ...toDocData(input), lastUpdated: new Date() });
  return toActionTrackerDto(doc.toObject());
}

export async function updateActionTracker(id: string, input: ActionTrackerInput): Promise<ActionTrackerDto> {
  await connectDB();
  const doc = await ActionTracker.findById(id);
  if (!doc) throw new AppError("NOT_FOUND", "Action Tracker tidak ditemukan.");
  doc.set(toDocData(input));
  await doc.save(); // hook pre('save') memperbarui lastUpdated
  return toActionTrackerDto(doc.toObject());
}

export async function deleteActionTracker(id: string): Promise<void> {
  await connectDB();
  const res = await ActionTracker.findByIdAndDelete(id);
  if (!res) throw new AppError("NOT_FOUND", "Action Tracker tidak ditemukan.");
}
