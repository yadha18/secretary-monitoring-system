"use client";

import { Bar, BarChart, CartesianGrid, Cell, LabelList, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { CountItem } from "@/types";
import { AXIS, fmtNumber } from "./colors";

/** Tick sumbu-X yang memecah label panjang menjadi maksimal 2 baris. */
function WrapTick({ x, y, payload }: { x?: number; y?: number; payload?: { value: string } }) {
  const parts = String(payload?.value ?? "").split(" ");
  const lines = parts.length > 1 ? [parts[0], parts.slice(1).join(" ")] : parts;
  return (
    <text textAnchor="middle" fill={AXIS.tick} fontSize={12}>
      {lines.map((l, i) => (
        <tspan key={i} x={x} y={(y ?? 0) + 18 + i * 14}>
          {l}
        </tspan>
      ))}
    </text>
  );
}

const tooltipStyle = {
  contentStyle: { borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 12, boxShadow: "0 2px 8px rgba(0,0,0,.08)" },
  cursor: { fill: "rgba(100,116,139,.08)" },
};

/** Donut + daftar berlabel (nama, jumlah, persen) agar identitas tidak bergantung pada warna saja. */
export function DonutWithLegend({ data, colors }: { data: CountItem[]; colors: Record<string, string> }) {
  const total = data.reduce((a, b) => a + b.value, 0);
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="relative size-40 shrink-0" role="img" aria-label={`Distribusi: ${data.map((d) => `${d.name} ${d.value}`).join(", ")}`}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data.filter((d) => d.value > 0)}
              dataKey="value"
              nameKey="name"
              innerRadius={48}
              outerRadius={74}
              paddingAngle={2}
              stroke="#FFFFFF"
              strokeWidth={2}
              isAnimationActive={false}
            >
              {data
                .filter((d) => d.value > 0)
                .map((d) => (
                  <Cell key={d.name} fill={colors[d.name] ?? "#94A3B8"} />
                ))}
            </Pie>
            <Tooltip {...tooltipStyle} formatter={(v, n) => [fmtNumber(Number(v)), String(n)]} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold leading-none">{fmtNumber(total)}</span>
          <span className="text-xs text-muted-foreground">total</span>
        </div>
      </div>
      <ul className="w-full space-y-2 text-sm">
        {data.map((d) => (
          <li key={d.name} className="flex items-center gap-2">
            <span className="size-2.5 shrink-0 rounded-full" style={{ background: colors[d.name] ?? "#94A3B8" }} aria-hidden />
            <span className="flex-1 whitespace-nowrap">{d.name}</span>
            <span className="font-medium tabular-nums">{fmtNumber(d.value)}</span>
            <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">
              {total ? Math.round((d.value / total) * 100) : 0}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Batang horizontal satu seri; warna per kategori; nilai ditulis di ujung batang. */
export function HorizontalBars({ data, colors, height = 160 }: { data: CountItem[]; colors: Record<string, string>; height?: number }) {
  return (
    <div style={{ height }} role="img" aria-label={`Jumlah: ${data.map((d) => `${d.name} ${d.value}`).join(", ")}`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 32, top: 4, bottom: 4 }}>
          <CartesianGrid horizontal={false} stroke={AXIS.grid} strokeDasharray="3 3" />
          <XAxis type="number" allowDecimals={false} tick={{ fill: AXIS.tick, fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="name" width={84} tick={{ fill: AXIS.tick, fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip {...tooltipStyle} formatter={(v) => [fmtNumber(Number(v)), "Jumlah"]} />
          <Bar dataKey="value" barSize={18} radius={[0, 4, 4, 0]} isAnimationActive={false}>
            {data.map((d) => (
              <Cell key={d.name} fill={colors[d.name] ?? "#2563EB"} />
            ))}
            <LabelList dataKey="value" position="right" fill="#1E293B" fontSize={12} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Batang vertikal satu seri (mis. per bulan / per kelompok deadline). */
export function VerticalBars({
  data,
  xKey,
  color,
  colors,
  height = 220,
  interval = "preserveStartEnd",
  tickSize = 12,
}: {
  data: Record<string, string | number>[];
  xKey: string;
  color?: string;
  colors?: Record<string, string>;
  height?: number;
  interval?: number | "preserveStartEnd";
  tickSize?: number;
}) {
  return (
    <div style={{ height }} role="img" aria-label={`Grafik batang: ${data.map((d) => `${d[xKey]} ${d.value}`).join(", ")}`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: -12, right: 8, top: 16, bottom: 4 }}>
          <CartesianGrid vertical={false} stroke={AXIS.grid} strokeDasharray="3 3" />
          <XAxis dataKey={xKey} tick={{ fill: AXIS.tick, fontSize: tickSize }} axisLine={false} tickLine={false} interval={interval} />
          <YAxis allowDecimals={false} tick={{ fill: AXIS.tick, fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip {...tooltipStyle} formatter={(v) => [fmtNumber(Number(v)), "Jumlah"]} />
          <Bar dataKey="value" barSize={28} radius={[4, 4, 0, 0]} isAnimationActive={false}>
            {data.map((d, i) => (
              <Cell key={i} fill={(colors && colors[String(d[xKey])]) || color || "#2563EB"} />
            ))}
            <LabelList dataKey="value" position="top" fill="#1E293B" fontSize={12} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Batang dikelompokkan, 2 seri berlegenda (AMS vs Dokumen Masuk). */
export function GroupedBars({
  data,
  xKey,
  series,
  height = 240,
}: {
  data: Record<string, string | number>[];
  xKey: string;
  series: { key: string; label: string; color: string }[];
  height?: number;
}) {
  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-4 text-xs">
        {series.map((s) => (
          <span key={s.key} className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm" style={{ background: s.color }} aria-hidden /> {s.label}
          </span>
        ))}
      </div>
      <div style={{ height }} role="img" aria-label={`Grafik batang: ${data.map((d) => `${d[xKey]} ${series.map((s) => `${s.label} ${d[s.key]}`).join(" ")}`).join("; ")}`}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: -12, right: 8, top: 8, bottom: 4 }} barGap={2}>
            <CartesianGrid vertical={false} stroke={AXIS.grid} strokeDasharray="3 3" />
            <XAxis dataKey={xKey} tick={<WrapTick />} axisLine={false} tickLine={false} interval={0} height={60} />
            <YAxis allowDecimals={false} tick={{ fill: AXIS.tick, fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip {...tooltipStyle} formatter={(v, n) => [fmtNumber(Number(v)), String(n)]} />
            {series.map((s) => (
              <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color} barSize={20} radius={[4, 4, 0, 0]} stroke="#FFFFFF" strokeWidth={0} isAnimationActive={false} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}