"use client";

import Link from "next/link";
import { TriangleAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateID } from "@/lib/date";
import type { DashboardData } from "@/types";
import { ChartCard } from "./chart-card";
import { GroupedBars, HorizontalBars, VerticalBars } from "./chart-parts";
import { SERIES, STATUS_COLORS, fmtMonth, fmtMonthShort, fmtNumber } from "./colors";

const sum = (a: { value: number }[]) => a.reduce((x, y) => x + y.value, 0);

export function DocumentCharts({ data }: { data: DashboardData["documents"] }) {
  const multiYear = new Set(data.amsPerMonth.map((m) => m.month.slice(0, 4))).size > 1;
  const short = (m: string) => fmtMonthShort(m, multiYear);
  const manyMonths = data.amsPerMonth.length > 12;
  const ams = data.amsPerMonth.map((m) => ({ name: short(m.month), full: fmtMonth(m.month), value: m.value }));
  const inc = data.incomingPerMonth.map((m) => ({ name: short(m.month), full: fmtMonth(m.month), value: m.value }));
  const statusRows = data.statusDistribution;
  const statusEmpty = statusRows.every((s) => s.ams === 0 && s.incoming === 0);

  return (
    <section aria-labelledby="h-doc" className="space-y-3">
      <h2 id="h-doc" className="text-sm font-semibold text-primary">
        Dokumen
      </h2>
      <div className="grid gap-3 lg:grid-cols-2">
        <ChartCard
          title="Dokumen AMS per Bulan"
          description="Berdasarkan Tanggal Terima."
          table={{ columns: ["Bulan", "Jumlah"], rows: ams.map((r) => [r.full, r.value]) }}
          empty={sum(ams) === 0}
        >
          <VerticalBars data={ams} xKey="name" color={SERIES.blue} interval={manyMonths ? "preserveStartEnd" : 0} tickSize={11} />
        </ChartCard>

        <ChartCard
          title="Dokumen Masuk per Bulan"
          description="Berdasarkan Tanggal Terima."
          table={{ columns: ["Bulan", "Jumlah"], rows: inc.map((r) => [r.full, r.value]) }}
          empty={sum(inc) === 0}
        >
          <VerticalBars data={inc} xKey="name" color={SERIES.orange} interval={manyMonths ? "preserveStartEnd" : 0} tickSize={11} />
        </ChartCard>

        <ChartCard
          title="Distribusi Status Dokumen"
          table={{ columns: ["Status", "Dokumen AMS", "Dokumen Masuk"], rows: statusRows.map((s) => [s.name, s.ams, s.incoming]) }}
          empty={statusEmpty}
        >
          <GroupedBars
            data={statusRows}
            xKey="name"
            series={[
              { key: "ams", label: "Dokumen AMS", color: SERIES.blue },
              { key: "incoming", label: "Dokumen Masuk", color: SERIES.orange },
            ]}
          />
        </ChartCard>

        <ChartCard
          title="Dokumen AMS yang Membutuhkan Tindak Lanjut"
          description="Dokumen dengan isian Need Tindak Lanjut, menurut Status Tindak Lanjut."
          table={{ columns: ["Status Tindak Lanjut", "Jumlah"], rows: data.followUpByStatus.map((r) => [r.name, r.value]) }}
          empty={sum(data.followUpByStatus) === 0}
        >
          <HorizontalBars data={data.followUpByStatus} colors={STATUS_COLORS} height={170} />
        </ChartCard>

        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-start justify-between pb-3">
            <div className="space-y-1">
              <CardTitle className="text-sm">Dokumen Overdue</CardTitle>
              <CardDescription className="text-xs">
                Dokumen AMS yang Due Date Tindak Lanjut-nya terlewati dan statusnya belum Selesai.
              </CardDescription>
            </div>
            <span className={`text-3xl font-semibold tabular-nums ${data.overdueCount > 0 ? "text-destructive" : "text-success"}`}>
              {fmtNumber(data.overdueCount)}
            </span>
          </CardHeader>
          <CardContent>
            {data.overdueList.length === 0 ? (
              <p className="text-sm text-muted-foreground">Tidak ada dokumen overdue pada periode ini.</p>
            ) : (
              <ul className="divide-y">
                {data.overdueList.map((d) => (
                  <li key={d.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2 text-sm">
                    <TriangleAlert className="size-4 shrink-0 text-destructive" aria-hidden />
                    <Link href="/ams-documents" className="min-w-0 flex-1 truncate font-medium hover:underline">
                      {d.documentNumber}
                    </Link>
                    <span className="text-xs text-muted-foreground">Due {formatDateID(d.dueDate)}</span>
                    <Badge variant="red">Terlambat {d.daysLate} hari</Badge>
                  </li>
                ))}
              </ul>
            )}
            {data.overdueCount > data.overdueList.length && (
              <p className="mt-2 text-xs text-muted-foreground">
                Menampilkan {data.overdueList.length} terlama dari {fmtNumber(data.overdueCount)} dokumen overdue.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}