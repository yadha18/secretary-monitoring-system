"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Paperclip } from "lucide-react";
import { toast } from "sonner";

import { DocStatusBadge, OverdueBadge, PriorityBadge } from "@/components/shared/badges";
import { ConfirmDelete } from "@/components/shared/confirm-delete";
import { DataTable } from "@/components/shared/data-table";
import { DateRangeFilter, FilterSelect, ListToolbar } from "@/components/shared/list-toolbar";
import { RowActions } from "@/components/shared/row-actions";
import { useResourceList } from "@/hooks/use-resource-list";
import { ApiError, apiFetch } from "@/lib/api-client";
import { AMS_DOC_TYPES, DOC_STATUSES, PRIORITIES } from "@/lib/constants";
import { formatDateID } from "@/lib/date";
import type { AmsDocumentDto } from "@/types";
import { AmsDetail } from "./ams-detail";
import { AmsForm } from "./ams-form";

const ENDPOINT = "/api/ams-documents";
const FILTER_KEYS = ["documentType", "priority", "status", "followUpStatus", "receivedFrom", "receivedTo", "dueFrom", "dueTo"];
const DEFAULT_SORT = { id: "receivedDate", desc: true };

export function AmsPage() {
  const list = useResourceList<AmsDocumentDto>({ endpoint: ENDPOINT, defaultSort: DEFAULT_SORT, filterKeys: FILTER_KEYS });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AmsDocumentDto | null>(null);
  const [viewing, setViewing] = useState<AmsDocumentDto | null>(null);
  const [deleting, setDeleting] = useState<AmsDocumentDto | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const columns = useMemo<ColumnDef<AmsDocumentDto, unknown>[]>(
    () => [
      { id: "documentNumber", header: "Nomor Dokumen", cell: ({ row }) => <span className="font-medium">{row.original.documentNumber}</span> },
      { id: "receivedDate", header: "Tanggal Terima", cell: ({ row }) => formatDateID(row.original.receivedDate) },
      { id: "documentType", header: "Jenis", cell: ({ row }) => row.original.documentType },
      { id: "priority", header: "Prioritas", cell: ({ row }) => <PriorityBadge value={row.original.priority} /> },
      { id: "documentDate", header: "Tanggal Dokumen", cell: ({ row }) => formatDateID(row.original.documentDate) },
      { id: "sender", header: "Pengirim", enableSorting: false, cell: ({ row }) => row.original.sender || "-" },
      { id: "recipient", header: "Tujuan", enableSorting: false, cell: ({ row }) => <div className="max-w-56 whitespace-normal break-words">{row.original.recipient || "-"}</div> },
      { id: "status", header: "Status", cell: ({ row }) => <DocStatusBadge value={row.original.status} /> },
      { id: "needsFollowUp", header: "Need Tindak Lanjut", enableSorting: false, cell: ({ row }) => <div className="max-w-48 whitespace-normal">{row.original.needsFollowUp || "-"}</div> },
      { id: "followUpDueDate", header: "Due Date", cell: ({ row }) => formatDateID(row.original.followUpDueDate) },
      {
        id: "followUpStatus",
        header: "Status Tindak Lanjut",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            <DocStatusBadge value={row.original.followUpStatus} />
            {row.original.isOverdue && <OverdueBadge />}
          </div>
        ),
      },
      { id: "file", header: "Scan", enableSorting: false, cell: ({ row }) => (row.original.file ? <Paperclip className="size-4 text-secondary" aria-label="Ada file" /> : "-") },
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
      toast.success("Dokumen AMS dihapus.");
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
        searchPlaceholder="Cari nomor dokumen, pengirim, tujuan..."
        addLabel="Tambah"
        onAdd={() => {
          setEditing(null);
          setFormOpen(true);
        }}
        onReset={list.reset}
        canReset={list.hasActiveFilters}
        exportUrl={list.exportUrl}
      >
        <FilterSelect label="Semua Jenis" value={f.documentType ?? ""} onChange={(v) => list.setFilter("documentType", v)} options={AMS_DOC_TYPES} />
        <FilterSelect label="Semua Prioritas" value={f.priority ?? ""} onChange={(v) => list.setFilter("priority", v)} options={PRIORITIES} />
        <FilterSelect label="Semua Status" value={f.status ?? ""} onChange={(v) => list.setFilter("status", v)} options={DOC_STATUSES} />
        <FilterSelect label="Semua Status Tindak Lanjut" value={f.followUpStatus ?? ""} onChange={(v) => list.setFilter("followUpStatus", v)} options={DOC_STATUSES} />
        <DateRangeFilter label="Tgl Terima" from={f.receivedFrom ?? ""} to={f.receivedTo ?? ""} onFrom={(v) => list.setFilter("receivedFrom", v)} onTo={(v) => list.setFilter("receivedTo", v)} />
        <DateRangeFilter label="Due Date" from={f.dueFrom ?? ""} to={f.dueTo ?? ""} onFrom={(v) => list.setFilter("dueFrom", v)} onTo={(v) => list.setFilter("dueTo", v)} />
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
        emptyTitle="Belum ada dokumen AMS"
        emptyHint='Klik "Tambah" untuk mencatat dokumen AMS pertama.'
        filtered={list.hasActiveFilters}
      />

      <AmsForm open={formOpen} onOpenChange={setFormOpen} item={editing} onSaved={list.reload} />
      <AmsDetail
        item={viewing}
        onOpenChange={(o) => !o && setViewing(null)}
        onFileChanged={(file) => {
         setViewing((v) => (v ? { ...v, file } : v));
         list.reload();
        }}
      />
      <ConfirmDelete
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Hapus Dokumen AMS?"
        description={`Dokumen ${deleting?.documentNumber ?? ""} akan dihapus permanen dan tidak dapat dikembalikan.`}
        loading={deleteBusy}
        onConfirm={confirmDelete}
      />
    </>
  );
}
