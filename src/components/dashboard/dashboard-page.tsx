"use client";

import { useEffect, useState } from "react";
import { RefreshCw, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api-client";
import type { DashboardData } from "@/types";
import { ActionCharts } from "./action-charts";
import { DocumentCharts } from "./document-charts";
import { PeriodFilter, type PeriodValue } from "./period-filter";
import { RecentActivities } from "./recent-activities";
import { SummaryCards } from "./summary-cards";

function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Memuat dashboard">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-[76px]" />
        ))}
      </div>
      <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-64" />
        ))}
      </div>
    </div>
  );
}

export function DashboardPage() {
  const [period, setPeriod] = useState<PeriodValue>({ key: "month", from: "", to: "" });
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const ctrl = new AbortController();
    const params = new URLSearchParams({ range: period.key });
    if (period.key === "custom") {
      params.set("from", period.from);
      params.set("to", period.to);
    }
    // Memulai fetch: status loading harus sinkron dengan perubahan periode.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);
    apiFetch<{ data: DashboardData }>(`/api/dashboard?${params}`, { signal: ctrl.signal })
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        setError(err?.message ?? "Gagal memuat dashboard.");
        setLoading(false);
      });
    return () => ctrl.abort();
  }, [period, tick]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <PeriodFilter value={period} onChange={setPeriod} resolved={data?.range} />
        <Button variant="outline" size="sm" onClick={() => setTick((t) => t + 1)} disabled={loading}>
          <RefreshCw className={loading ? "animate-spin" : undefined} /> Muat ulang
        </Button>
      </div>

      {loading && !data && <DashboardSkeleton />}

      {error && (
        <div className="flex flex-col items-center gap-2 rounded-xl border bg-card px-4 py-12 text-center">
          <TriangleAlert className="size-8 text-destructive" />
          <p className="font-medium">Gagal memuat dashboard</p>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" size="sm" onClick={() => setTick((t) => t + 1)}>
            Coba lagi
          </Button>
        </div>
      )}

      {data && !error && (
        <div className={loading ? "space-y-6 opacity-60 transition-opacity" : "space-y-6"} aria-busy={loading}>
          <SummaryCards cards={data.cards} />
          <ActionCharts data={data.action} />
          <DocumentCharts data={data.documents} />
          <RecentActivities items={data.activities} />
        </div>
      )}
    </div>
  );
}