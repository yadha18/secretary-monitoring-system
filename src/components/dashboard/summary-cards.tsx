import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  FileText,
  Inbox,
  ListChecks,
  TriangleAlert,
  Hourglass,
  FileWarning,
  type LucideIcon,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { DashboardData } from "@/types";
import { fmtNumber } from "./colors";

type Tone = "navy" | "blue" | "green" | "red" | "amber";
const TONE: Record<Tone, string> = {
  navy: "bg-primary/10 text-primary",
  blue: "bg-blue-100 text-blue-700",
  green: "bg-green-100 text-green-700",
  red: "bg-red-100 text-red-700",
  amber: "bg-amber-100 text-amber-700",
};

function StatCard({ label, value, icon: Icon, tone, href, alert }: { label: string; value: number; icon: LucideIcon; tone: Tone; href: string; alert?: boolean }) {
  return (
    <Link href={href} className="group block focus-visible:outline-none">
      <Card className={cn("flex items-center gap-4 p-4 transition-shadow group-hover:shadow-md group-focus-visible:ring-2 group-focus-visible:ring-ring", alert && value > 0 && "border-red-200")}>
        <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-lg", TONE[tone])}>
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <p className={cn("text-2xl font-semibold leading-tight tabular-nums", alert && value > 0 && "text-destructive")}>{fmtNumber(value)}</p>
          <p className="line-clamp-2 text-xs text-muted-foreground">{label}</p>
        </div>
      </Card>
    </Link>
  );
}

export function SummaryCards({ cards }: { cards: DashboardData["cards"] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Total Action Tracker" value={cards.actionTotal} icon={ListChecks} tone="navy" href="/action-tracker" />
      <StatCard label="Action Tracker On Progress" value={cards.actionOnProgress} icon={Clock} tone="blue" href="/action-tracker" />
      <StatCard label="Action Tracker Done" value={cards.actionDone} icon={CheckCircle2} tone="green" href="/action-tracker" />
      <StatCard label="Action Tracker Overdue" value={cards.actionOverdue} icon={TriangleAlert} tone="red" href="/action-tracker" alert />
      <StatCard label="Total Dokumen AMS" value={cards.amsTotal} icon={FileText} tone="navy" href="/ams-documents" />
      <StatCard label="Dokumen AMS Perlu Tindak Lanjut" value={cards.amsNeedFollowUp} icon={FileWarning} tone="amber" href="/ams-documents" />
      <StatCard label="Total Dokumen Masuk" value={cards.incomingTotal} icon={Inbox} tone="navy" href="/incoming-documents" />
      <StatCard label="Dokumen Masuk Belum Selesai" value={cards.incomingNotDone} icon={Hourglass} tone="amber" href="/incoming-documents" />
    </div>
  );
}