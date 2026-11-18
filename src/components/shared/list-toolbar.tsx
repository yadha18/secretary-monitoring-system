"use client";

import { Download, Plus, RotateCcw, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly (string | number)[];
}) {
  return (
    <Select className="h-9 w-auto min-w-36" aria-label={label} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">{label}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {typeof o === "number" ? `${o}%` : o}
        </option>
      ))}
    </Select>
  );
}

export function DateRangeFilter({
  label,
  from,
  to,
  onFrom,
  onTo,
}: {
  label: string;
  from: string;
  to: string;
  onFrom: (v: string) => void;
  onTo: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className="whitespace-nowrap">{label}</span>
      <Input type="date" className="h-9 w-36" aria-label={`${label} dari`} value={from} max={to || undefined} onChange={(e) => onFrom(e.target.value)} />
      <span>–</span>
      <Input type="date" className="h-9 w-36" aria-label={`${label} sampai`} value={to} min={from || undefined} onChange={(e) => onTo(e.target.value)} />
    </div>
  );
}

type Props = {
  search: string;
  onSearch: (v: string) => void;
  searchPlaceholder: string;
  onAdd: () => void;
  addLabel: string;
  onReset: () => void;
  canReset: boolean;
  exportUrl: (f: "csv" | "xlsx") => string;
  children?: React.ReactNode; // filter controls
};

export function ListToolbar({
  search,
  onSearch,
  searchPlaceholder,
  onAdd,
  addLabel,
  onReset,
  canReset,
  exportUrl,
  children,
}: Props) {
  return (
    <div className="mb-4 space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            aria-label="Pencarian"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <a href={exportUrl("csv")} download>
              <Download /> CSV
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href={exportUrl("xlsx")} download>
              <Download /> Excel
            </a>
          </Button>
          <Button onClick={onAdd}>
            <Plus /> {addLabel}
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {children}
        <Button variant="ghost" size="sm" onClick={onReset} disabled={!canReset}>
          <RotateCcw /> Reset filter
        </Button>
      </div>
    </div>
  );
}
