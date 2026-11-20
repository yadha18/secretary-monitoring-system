"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardData } from "@/types";
import { ChartCard } from "./chart-card";
import { DonutWithLegend, HorizontalBars, VerticalBars } from "./chart-parts";
import { DEADLINE_COLORS, DEPARTMENT_COLORS, STATUS_COLORS } from "./colors";

const sum = (a: { value: number }[]) => a.reduce((x, y) => x + y.value, 0);

export function ActionCharts({ data }: { data: DashboardData["action"] }) {
  const total = sum(data.byStatus);
  const table = (rows: { name: string; value: number }[], label = "Jumlah") => ({
    columns: ["Kategori", label],
    rows: rows.map((r) => [r.name, r.value]),
  });

  return (
    <section aria-labelledby="h-action" className="space-y-3">
      <h2 id="h-action" className="text-sm font-semibold text-primary">
        Action Tracker
      </h2>
      <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
        <ChartCard title="Distribusi Status" table={table(data.byStatus)} empty={total === 0}>
          <DonutWithLegend data={data.byStatus} colors={STATUS_COLORS} />
        </ChartCard>

        <ChartCard title="Distribusi Divisi/Unit" table={table(data.byDepartment)} empty={total === 0}>
          <HorizontalBars data={data.byDepartment} colors={DEPARTMENT_COLORS} />
        </ChartCard>

        <ChartCard title="Distribusi Prioritas" table={table(data.byPriority)} empty={total === 0}>
          <HorizontalBars data={data.byPriority} colors={STATUS_COLORS} height={120} />
        </ChartCard>

        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Persentase Penyelesaian</CardTitle>
            <CardDescription className="text-xs">Action Item berstatus Done dari seluruh Action Item pada periode.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col justify-center gap-4">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-semibold tabular-nums text-success">{data.completionPercent}%</span>
              <span className="text-sm text-muted-foreground">selesai</span>
            </div>
            <div
              role="progressbar"
              aria-valuenow={data.completionPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Persentase penyelesaian Action Tracker"
              className="h-2.5 overflow-hidden rounded-full bg-muted"
            >
              <div className="h-full rounded-full bg-success transition-all" style={{ width: `${data.completionPercent}%` }} />
            </div>
            <p className="text-xs text-muted-foreground">
              Rata-rata progress seluruh Action Item: <span className="font-medium text-foreground">{data.averageProgress}%</span>
            </p>
          </CardContent>
        </Card>

        <ChartCard
          title="Action Item Berdasarkan Deadline"
          description="Hanya yang belum Done; dihitung dari hari ini (WIB)."
          table={table(data.byDeadline)}
          empty={sum(data.byDeadline) === 0}
          className="lg:col-span-2 xl:col-span-2"
        >
          <VerticalBars data={data.byDeadline} xKey="name" colors={DEADLINE_COLORS} />
        </ChartCard>
      </div>
    </section>
  );
}