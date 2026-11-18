import type { ActionTrackerDto, AmsDocumentDto, IncomingDocumentDto } from "@/types";
import { dateCell, type ExportColumn } from "./export.service";

export const actionTrackerColumns: ExportColumn<ActionTrackerDto>[] = [
  { header: "No.", width: 14, value: (r) => r.number },
  { header: "Tanggal Rapat/Instruksi", value: (r) => dateCell(r.meetingDate) },
  { header: "Agenda/Kegiatan", width: 36, value: (r) => r.agenda },
  { header: "Action Item / Tindak Lanjut", width: 48, value: (r) => r.actionItem },
  { header: "PIC", value: (r) => r.pic },
  { header: "Divisi/Unit", value: (r) => r.department },
  { header: "Prioritas", width: 12, value: (r) => r.priority },
  { header: "Tanggal Mulai", value: (r) => dateCell(r.startDate) },
  { header: "Deadline", value: (r) => dateCell(r.deadline) },
  { header: "Status", width: 14, value: (r) => r.status },
  { header: "Overdue", width: 10, value: (r) => (r.isOverdue ? "Ya" : "Tidak") },
  { header: "Progress (%)", width: 12, value: (r) => r.progress },
  { header: "Update Terakhir", value: (r) => dateCell(r.lastUpdated.slice(0, 10)) },
];

export const amsDocumentColumns: ExportColumn<AmsDocumentDto>[] = [
  { header: "Nomor Dokumen", width: 26, value: (r) => r.documentNumber },
  { header: "Tanggal Terima", value: (r) => dateCell(r.receivedDate) },
  { header: "Jenis Dokumen", value: (r) => r.documentType },
  { header: "Prioritas", width: 12, value: (r) => r.priority },
  { header: "Tanggal Dokumen", value: (r) => dateCell(r.documentDate) },
  { header: "Pengirim", width: 28, value: (r) => r.sender },
  { header: "Tujuan", width: 32, value: (r) => r.recipient },
  { header: "Tembusan", width: 32, value: (r) => r.cc },
  { header: "Posisi", value: (r) => r.position },
  { header: "Status", value: (r) => r.status },
  { header: "Need Tindak Lanjut", width: 28, value: (r) => r.needsFollowUp },
  { header: "Keterangan Tindak Lanjut", width: 40, value: (r) => r.followUpDescription },
  { header: "Due Date Tindak Lanjut", value: (r) => dateCell(r.followUpDueDate) },
  { header: "Status Tindak Lanjut", value: (r) => r.followUpStatus },
  { header: "Overdue", width: 10, value: (r) => (r.isOverdue ? "Ya" : "Tidak") },
  { header: "Hasil Scan Dokumen", width: 28, value: (r) => r.file?.fileName ?? "" },
];

export const incomingDocumentColumns: ExportColumn<IncomingDocumentDto>[] = [
  { header: "Nomor Dokumen", width: 26, value: (r) => r.documentNumber },
  { header: "Tanggal Terima", value: (r) => dateCell(r.receivedDate) },
  { header: "Jenis Dokumen", value: (r) => r.documentType },
  { header: "Tanggal Dokumen", value: (r) => dateCell(r.documentDate) },
  { header: "Prioritas", width: 12, value: (r) => r.priority },
  { header: "Pengirim", width: 28, value: (r) => r.sender },
  { header: "Perihal", width: 44, value: (r) => r.subject },
  { header: "Status", value: (r) => r.status },
  { header: "Tanggal Naik ke VP", value: (r) => dateCell(r.submittedToVPDate) },
  { header: "Tanggal Tanda Tangan", value: (r) => dateCell(r.signedDate) },
  { header: "Scan Dokumen", width: 28, value: (r) => r.file?.fileName ?? "" },
  { header: "Catatan", width: 32, value: (r) => r.notes },
];
