"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { apiFetch } from "@/lib/api-client";
import type { PageMeta, Paginated } from "@/types";

type Options = {
  endpoint: string;
  defaultSort?: { id: string; desc: boolean };
  filterKeys: string[];
};

/** State list server-side: pencarian (debounce), filter, sort, pagination, reload. */
export function useResourceList<T>({ endpoint, defaultSort, filterKeys }: Options) {
  const [items, setItems] = useState<T[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(10);
  const [qInput, setQInput] = useState("");
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sort, setSortState] = useState<{ id: string; desc: boolean } | null>(defaultSort ?? null);
  const [tick, setTick] = useState(0);

  // Debounce pencarian
  useEffect(() => {
    const t = setTimeout(() => {
      setQ(qInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [qInput]);

  const filterString = JSON.stringify(filters);

  // Parameter filter/search/sort tanpa page (dipakai juga untuk export)
  const filterQuery = useMemo(() => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    for (const k of filterKeys) {
      const v = filters[k];
      if (v) p.set(k, v);
    }
    if (sort) {
      p.set("sort", sort.id);
      p.set("order", sort.desc ? "desc" : "asc");
    }
    return p.toString();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, filterString, sort, filterKeys]);

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    // Memulai fetch: status loading harus sinkron dengan perubahan query.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);

    const params = new URLSearchParams(filterQuery);
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));

    apiFetch<Paginated<T>>(`${endpoint}?${params}`, { signal: ctrl.signal })
      .then((res) => {
        setItems(res.data);
        setMeta(res.meta);
        // Halaman melebihi total (mis. setelah hapus) → mundur
        if (res.data.length === 0 && res.meta.page > 1) setPage(res.meta.totalPages);
        setLoading(false);
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        setError(err?.message ?? "Gagal memuat data.");
        setLoading(false);
      });

    return () => ctrl.abort();
  }, [endpoint, filterQuery, page, pageSize, tick]);

  const setFilter = useCallback((key: string, value: string) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  }, []);

  const setSort = useCallback((s: { id: string; desc: boolean } | null) => {
    setSortState(s ?? defaultSort ?? null);
    setPage(1);
  }, [defaultSort]);

  const setPageSize = useCallback((n: number) => {
    setPageSizeState(n);
    setPage(1);
  }, []);

  const reset = useCallback(() => {
    setQInput("");
    setQ("");
    setFilters({});
    setSortState(defaultSort ?? null);
    setPage(1);
  }, [defaultSort]);

  const hasActiveFilters = !!q || Object.values(filters).some(Boolean);

  return {
    items,
    meta,
    loading,
    error,
    qInput,
    setQInput,
    filters,
    setFilter,
    sort,
    setSort,
    page,
    setPage,
    pageSize,
    setPageSize,
    reset,
    hasActiveFilters,
    reload: () => setTick((t) => t + 1),
    exportUrl: (format: "csv" | "xlsx") => {
      const p = new URLSearchParams(filterQuery);
      p.set("format", format);
      return `${endpoint}/export?${p}`;
    },
  };
}
