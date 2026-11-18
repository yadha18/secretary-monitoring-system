"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { Paperclip } from "lucide-react";
import { DocStatusBadge, PriorityBadge } from "@/components/shared/badges";
import { ConfirmDelete } from "@/components/shared/confirm-delete";
import { DataTable } from "@/components/shared/data-table";
import { DateRangeFilter, FilterSelect, ListToolbar } from "@/components/shared/list-toolbar";
import { RowActions } from "@/components/shared/row-actions";
import { useResourceList } from "@/hooks/use-resource-list";
import { ApiError, apiFetch } from "@/lib/api-client";
import { DOC_STATUSES, INCOMING_DOC_TYPES, PRIORITIES } from "@/lib/constants";
import { formatDateID } from "@/lib/date";
import type { IncomingDocumentDto } from "@/types";
import { IncomingDetail } from "./incoming-detail";
import { IncomingForm } from "./incoming-form";

const ENDPOINT = "/api/incoming-documents";
const FILTER_KEYS = ["documentType", "priority", "status", "receivedFrom", "receivedTo", "vpFrom", "vpTo", "signedFrom", "signedTo"];
const DEFAULT_SORT = { id: "receivedDate", desc: true };

export function IncomingPage() {
  const list = useResourceList<IncomingDocumentDto>({ endpoint: ENDPOINT, defaultSort: DEFAULT_SORT, filterKeys: FILTER_KEYS });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<IncomingDocumentDto | null>(null);
  const [viewing, setViewing] = useState<IncomingDocumentDto | null>(null);
  const [deleting, setDeleting] = useState<IncomingDocumentDto | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const columns = useMemo<ColumnDef<IncomingDocumentDto, unknown>[]>(
    () => [
      { id: "documentNumber", header: "Nomor Dokumen", cell: ({ row }) => <span className="font-medium">{row.original.documentNumber}</span> },
      { id: "receivedDate", header: "Tanggal Terima", cell: ({ row }) => formatDateID(row.original.receivedDate) },
      { id: "documentType", header: "Jenis", cell: ({ row }) => row.original.documentType },
      { id: "documentDate", header: "Tanggal Dokumen", cell: ({ row }) => formatDateID(row.original.documentDate) },
      { id: "priority", header: "Prioritas", cell: ({ row }) => <PriorityBadge value={row.original.priority} /> },
      { id: "sender", header: "Pengirim", enableSorting: false, cell: ({ row }) => row.original.sender || "-" },
      { id: "subject", header: "Perihal", enableSorting: false, cell: ({ row }) => <div className="max-w-72 whitespace-normal">{row.original.subject || "-"}</div> },
      { id: "status", header: "Status", cell: ({ row }) => <DocStatusBadge value={row.original.status} /> },
      { id: "submittedToVPDate", header: "Naik ke VP", cell: ({ row }) => formatDateID(row.original.submittedToVPDate) },
      { id: "signedDate", header: "Tanda Tangan", cell: ({ row }) => formatDateID(row.original.signedDate) },
      { id: "file", header: "Scan", enableSorting: false, cell: ({ row }) => (row.original.file ? <Paperclip className="size-4 text-secondary" aria-label="Ada file" /> : "-") },
      { id: "notes", header: "Catatan", enableSorting: false, cell: ({ row }) => <div className="max-w-48 whitespace-normal">{row.original.notes || "-"}</div> },
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
      toast.success("Dokumen masuk dihapus.");
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
        searchPlaceholder="Cari nomor dokumen, pengirim, perihal..."
        addLabel="Tambah"
        onAdd={() => {
          setEditing(null);
          setFormOpen(true);
        }}
        onReset={list.reset}
        canReset={list.hasActiveFilters}
        exportUrl={list.exportUrl}
      >
        <FilterSelect label="Semua Jenis" value={f.documentType ?? ""} onChange={(v) => list.setFilter("documentType", v)} options={INCOMING_DOC_TYPES} />
        <FilterSelect label="Semua Prioritas" value={f.priority ?? ""} onChange={(v) => list.setFilter("priority", v)} options={PRIORITIES} />
        <FilterSelect label="Semua Status" value={f.status ?? ""} onChange={(v) => list.setFilter("status", v)} options={DOC_STATUSES} />
        <DateRangeFilter label="Tgl Terima" from={f.receivedFrom ?? ""} to={f.receivedTo ?? ""} onFrom={(v) => list.setFilter("receivedFrom", v)} onTo={(v) => list.setFilter("receivedTo", v)} />
        <DateRangeFilter label="Naik ke VP" from={f.vpFrom ?? ""} to={f.vpTo ?? ""} onFrom={(v) => list.setFilter("vpFrom", v)} onTo={(v) => list.setFilter("vpTo", v)} />
        <DateRangeFilter label="Tanda Tangan" from={f.signedFrom ?? ""} to={f.signedTo ?? ""} onFrom={(v) => list.setFilter("signedFrom", v)} onTo={(v) => list.setFilter("signedTo", v)} />
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
        emptyTitle="Belum ada dokumen masuk"
        emptyHint='Klik "Tambah" untuk mencatat dokumen masuk pertama.'
        filtered={list.hasActiveFilters}
      />

      <IncomingForm open={formOpen} onOpenChange={setFormOpen} item={editing} onSaved={list.reload} />
      <IncomingDetail
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
        title="Hapus Dokumen Masuk?"
        description={`Dokumen ${deleting?.documentNumber ?? ""} akan dihapus permanen dan tidak dapat dikembalikan.`}
        loading={deleteBusy}
        onConfirm={confirmDelete}
      />
    </>
  );
}
