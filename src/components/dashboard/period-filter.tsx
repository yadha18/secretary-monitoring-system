"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DASHBOARD_RANGES, MAX_CUSTOM_DAYS, RANGE_LABEL, type DashboardRangeKey } from "@/lib/date-range";
import { formatDateID } from "@/lib/date";
import { cn } from "@/lib/utils";

export type PeriodValue = { key: DashboardRangeKey; from: string; to: string };

export function PeriodFilter({ value, onChange, resolved }: { value: PeriodValue; onChange: (v: PeriodValue) => void; resolved?: { from: string; to: string } }) {
  const [from, setFrom] = useState(value.from);
  const [to, setTo] = useState(value.to);
  const [error, setError] = useState<string | null>(null);
  // "Kustom" hanya membuka input tanggal; data baru dimuat setelah "Terapkan" dengan tanggal valid.
  const [customOpen, setCustomOpen] = useState(value.key === "custom");
  const active: DashboardRangeKey = customOpen ? "custom" : value.key;

  function pick(key: DashboardRangeKey) {
    setError(null);
    if (key === "custom") return setCustomOpen(true);
    setCustomOpen(false);
    onChange({ key, from, to });
  }

  function apply() {
    if (!from || !to) return setError("Isi tanggal awal dan akhir.");
    if (from > to) return setError("Tanggal akhir tidak boleh sebelum tanggal awal.");
    if ((Date.parse(to) - Date.parse(from)) / 86_400_000 > MAX_CUSTOM_DAYS) return setError("Rentang maksimal 5 tahun.");
    setError(null);
    onChange({ key: "custom", from, to });
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <div role="group" aria-label="Periode" className="inline-flex flex-wrap gap-1 rounded-lg border bg-card p-1">
          {DASHBOARD_RANGES.map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={active === k}
              onClick={() => pick(k)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active === k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {k === "custom" ? "Kustom" : RANGE_LABEL[k]}
            </button>
          ))}
        </div>
        {resolved && (
          <span className="text-sm text-muted-foreground">
            {resolved.from === resolved.to ? formatDateID(resolved.from) : `${formatDateID(resolved.from)} – ${formatDateID(resolved.to)}`}
          </span>
        )}
      </div>

      {customOpen && (
        <div className="flex flex-wrap items-end gap-2">
          <label className="space-y-1 text-xs text-muted-foreground">
            Dari
            <Input type="date" className="h-9 w-40" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} />
          </label>
          <label className="space-y-1 text-xs text-muted-foreground">
            Sampai
            <Input type="date" className="h-9 w-40" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} />
          </label>
          <Button size="sm" onClick={apply}>
            Terapkan
          </Button>
          {error && (
            <p role="alert" className="text-xs text-destructive">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}