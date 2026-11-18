"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

import { ActionStatusBadge, OverdueBadge, PriorityBadge } from "@/components/shared/badges";
import { ConfirmDelete } from "@/components/shared/confirm-delete";
import { DataTable } from "@/components/shared/data-table";
import { DateRangeFilter, FilterSelect, ListToolbar } from "@/components/shared/list-toolbar";
import { RowActions } from "@/components/shared/row-actions";
import { Badge } from "@/components/ui/badge";
import { useResourceList } from "@/hooks/use-resource-list";
import { ApiError, apiFetch } from "@/lib/api-client";
import { ACTION_PROGRESS, ACTION_STATUSES, DEPARTMENTS, PRIORITIES } from "@/lib/constants";
import { formatDateID } from "@/lib/date";
import type { ActionTrackerDto } from "@/types";
import { ActionTrackerDetail } from "./action-tracker-detail";
import { ActionTrackerForm } from "./action-tracker-form";

const ENDPOINT = "/api/action-trackers";
const FILTER_KEYS = ["department", "priority", "status", "progress", "deadlineFrom", "deadlineTo"];
const DEFAULT_SORT = { id: "meetingDate", desc: true };

export function ActionTrackerPage() {
  const list = useResourceList<ActionTrackerDto>({ endpoint: ENDPOINT, defaultSort: DEFAULT_SORT, filterKeys: FILTER_KEYS });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ActionTrackerDto | null>(null);
  const [viewing, setViewing] = useState<ActionTrackerDto | null>(null);
  const [deleting, setDeleting] = useState<ActionTrackerDto | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const columns = useMemo<ColumnDef<ActionTrackerDto, unknown>[]>(
    () => [
      { id: "number", accessorKey: "number", header: "No.", cell: ({ row }) => <span className="font-medium">{row.original.number}</span> },
      { id: "meetingDate", header: "Tanggal Rapat/Instruksi", cell: ({ row }) => formatDateID(row.original.meetingDate) },
      { id: "agenda", header: "Agenda/Kegiatan", enableSorting: false, cell: ({ row }) => <div className="max-w-64 whitespace-normal">{row.original.agenda}</div> },
      { id: "actionItem", header: "Action Item / Tindak Lanjut", enableSorting: false, cell: ({ row }) => <div className="max-w-80 whitespace-normal">{row.original.actionItem}</div> },
      { id: "pic", header: "PIC", enableSorting: false, cell: ({ row }) => row.original.pic },
      { id: "department", header: "Divisi/Unit", cell: ({ row }) => row.original.department },
      { id: "priority", header: "Prioritas", cell: ({ row }) => <PriorityBadge value={row.original.priority} /> },
      { id: "startDate", header: "Tanggal Mulai", cell: ({ row }) => formatDateID(row.original.startDate) },
      { id: "deadline", header: "Deadline", cell: ({ row }) => formatDateID(row.original.deadline) },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            <ActionStatusBadge value={row.original.status} />
            {row.original.isOverdue && <OverdueBadge />}
          </div>
        ),
      },
      { id: "progress", header: "Progress (%)", cell: ({ row }) => <Badge variant="outline">{row.original.progress}%</Badge> },
      { id: "lastUpdated", header: "Update Terakhir", cell: ({ row }) => formatDateID(row.original.lastUpdated) },
      {
        id: "actions",
        header: "Aksi",
        enableSorting: false,
        cell: ({ row }) => (
          <RowActions
            onView={() => setViewing(row.original)}
            onEdit={() => {
              setEditing(row.original);
              setFormOpen(true);
            }}
            onDelete={() => setDeleting(row.original)}
          />
        ),
      },
    ],
    []
  );

  async function confirmDelete() {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await apiFetch(`${ENDPOINT}/${deleting.id}`, { method: "DELETE" });
      toast.success("Action Item dihapus.");
      setDeleting(null);
      list.reload();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal menghapus data.");
    } finally {
      setDeleteBusy(false);
    }
  }

  const f = list.filters;

  return (
    <>
      <ListToolbar
        search={list.qInput}
        onSearch={list.setQInput}
        searchPlaceholder="Cari nomor, agenda, action item, PIC..."
        addLabel="Tambah"
        onAdd={() => {
          setEditing(null);
          setFormOpen(true);
        }}
        onReset={list.reset}
        canReset={list.hasActiveFilters}
        exportUrl={list.exportUrl}
      >
        <FilterSelect label="Semua Divisi" value={f.department ?? ""} onChange={(v) => list.setFilter("department", v)} options={DEPARTMENTS} />
        <FilterSelect label="Semua Prioritas" value={f.priority ?? ""} onChange={(v) => list.setFilter("priority", v)} options={PRIORITIES} />
        <FilterSelect label="Semua Status" value={f.status ?? ""} onChange={(v) => list.setFilter("status", v)} options={ACTION_STATUSES} />
        <FilterSelect label="Semua Progress" value={f.progress ?? ""} onChange={(v) => list.setFilter("progress", v)} options={ACTION_PROGRESS} />
        <DateRangeFilter label="Deadline" from={f.deadlineFrom ?? ""} to={f.deadlineTo ?? ""} onFrom={(v) => list.setFilter("deadlineFrom", v)} onTo={(v) => list.setFilter("deadlineTo", v)} />
      </ListToolbar>

      <DataTable
        columns={columns}
        data={list.items}
        meta={list.meta}
        loading={list.loading}
        error={list.error}
        onRetry={list.reload}
        sort={list.sort}
        onSortChange={list.setSort}
        onPageChange={list.setPage}
        onPageSizeChange={list.setPageSize}
        pageSize={list.pageSize}
        emptyTitle="Belum ada Action Item"
        emptyHint='Klik "Tambah" untuk mencatat hasil rapat atau instruksi pertama.'
        filtered={list.hasActiveFilters}
      />

      <ActionTrackerForm open={formOpen} onOpenChange={setFormOpen} item={editing} onSaved={list.reload} />
      <ActionTrackerDetail item={viewing} onOpenChange={(o) => !o && setViewing(null)} />
      <ConfirmDelete
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Hapus Action Item?"
        description={`Action Item ${deleting?.number ?? ""} akan dihapus permanen dan tidak dapat dikembalikan.`}
        loading={deleteBusy}
        onConfirm={confirmDelete}
      />
    </>
  );
}
