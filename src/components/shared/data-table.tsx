"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Inbox, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { PAGE_SIZES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { PageMeta } from "@/types";

type Props<T> = {
  columns: ColumnDef<T, unknown>[];
  data: T[];
  meta: PageMeta | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  sort: { id: string; desc: boolean } | null;
  onSortChange: (s: { id: string; desc: boolean } | null) => void;
  onPageChange: (p: number) => void;
  onPageSizeChange: (n: number) => void;
  pageSize: number;
  emptyTitle: string;
  emptyHint?: string;
  filtered?: boolean;
};

export function DataTable<T>({
  columns,
  data,
  meta,
  loading,
  error,
  onRetry,
  sort,
  onSortChange,
  onPageChange,
  onPageSizeChange,
  pageSize,
  emptyTitle,
  emptyHint,
  filtered,
}: Props<T>) {
  const sorting: SortingState = sort ? [{ id: sort.id, desc: sort.desc }] : [];

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    enableSortingRemoval: false,
    onSortingChange: (updater) => {
      const next = typeof updater === "function" ? updater(sorting) : updater;
      onSortChange(next[0] ? { id: next[0].id, desc: next[0].desc } : null);
    },
    getCoreRowModel: getCoreRowModel(),
  });

  const colCount = columns.length;
  const from = meta && meta.total > 0 ? (meta.page - 1) * meta.pageSize + 1 : 0;
  const to = meta ? Math.min(meta.page * meta.pageSize, meta.total) : 0;

  return (
    <div className="rounded-xl border bg-card">
      {/* Scroll horizontal untuk layar kecil */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-max text-sm">
          <thead className="bg-muted/60">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => {
                  const canSort = h.column.getCanSort();
                  const dir = h.column.getIsSorted();
                  return (
                    <th
                      key={h.id}
                      scope="col"
                      className="whitespace-nowrap px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                    >
                      {h.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 hover:text-foreground"
                          onClick={h.column.getToggleSortingHandler()}
                        >
                          {flexRender(h.column.columnDef.header, h.getContext())}
                          {dir === "asc" ? (
                            <ArrowUp className="size-3" />
                          ) : dir === "desc" ? (
                            <ArrowDown className="size-3" />
                          ) : (
                            <ArrowUpDown className="size-3 opacity-40" />
                          )}
                        </button>
                      ) : (
                        flexRender(h.column.columnDef.header, h.getContext())
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={`s${i}`} className="border-t">
                  {Array.from({ length: colCount }).map((__, j) => (
                    <td key={j} className="px-3 py-3">
                      <Skeleton className="h-4 w-full min-w-12" />
                    </td>
                  ))}
                </tr>
              ))}

            {!loading &&
              !error &&
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-t hover:bg-muted/40">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className={cn("px-3 py-2.5 align-top")}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {error && !loading && (
        <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
          <TriangleAlert className="size-8 text-destructive" />
          <p className="font-medium">Gagal memuat data</p>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" size="sm" onClick={onRetry}>
            Coba lagi
          </Button>
        </div>
      )}

      {!error && !loading && data.length === 0 && (
        <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
          <Inbox className="size-8 text-muted-foreground" />
          <p className="font-medium">{filtered ? "Tidak ada data yang cocok" : emptyTitle}</p>
          <p className="text-sm text-muted-foreground">
            {filtered ? "Ubah atau reset filter pencarian Anda." : emptyHint}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3 border-t px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-muted-foreground">
          <span>Baris per halaman</span>
          <Select
            className="h-8 w-20"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            aria-label="Baris per halaman"
          >
            {PAGE_SIZES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground">
            {meta ? `${from}–${to} dari ${meta.total}` : "—"}
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              disabled={!meta || meta.page <= 1 || loading}
              onClick={() => onPageChange((meta?.page ?? 1) - 1)}
              aria-label="Halaman sebelumnya"
            >
              <ChevronLeft />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              disabled={!meta || meta.page >= meta.totalPages || loading}
              onClick={() => onPageChange((meta?.page ?? 1) + 1)}
              aria-label="Halaman berikutnya"
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
