import { connectDB } from "@/lib/mongodb";
import { parseDateOnly } from "@/lib/date";
import { AppError } from "@/lib/errors";
import { EXPORT_MAX_ROWS, buildSort, combine, dateRangeFilter, pageMeta, searchFilter } from "@/lib/query";
import type { IncomingDocumentInput, IncomingDocumentListQuery } from "@/lib/validations/incoming-document";
import { IncomingDocument } from "@/models/IncomingDocument";
import type { IncomingDocumentDto, Paginated } from "@/types";
import { deleteFileOf } from "./file.service";
import { toIncomingDocumentDto } from "./serializers";

const SORTABLE = {
  documentNumber: "documentNumber",
  receivedDate: "receivedDate",
  documentDate: "documentDate",
  documentType: "documentType",
  priority: "priority",
  status: "status",
  submittedToVPDate: "submittedToVPDate",
  signedDate: "signedDate",
  updatedAt: "updatedAt",
} as const;

function buildFilter(q: IncomingDocumentListQuery) {
  return combine(
    searchFilter(q.q, ["documentNumber", "sender", "subject"]),
    q.documentType && { documentType: q.documentType },
    q.priority && { priority: q.priority },
    q.status && { status: q.status },
    dateRangeFilter("receivedDate", q.receivedFrom, q.receivedTo),
    dateRangeFilter("submittedToVPDate", q.vpFrom, q.vpTo),
    dateRangeFilter("signedDate", q.signedFrom, q.signedTo)
  );
}

const sortOf = (q: IncomingDocumentListQuery) =>
  buildSort(q.sort, q.order, SORTABLE, { field: "receivedDate", order: "desc" });

export async function listIncomingDocuments(q: IncomingDocumentListQuery): Promise<Paginated<IncomingDocumentDto>> {
  const filter = buildFilter(q);
  const sort = sortOf(q); // validasi sebelum menyentuh database
  await connectDB();
  const [rows, total] = await Promise.all([
    IncomingDocument.find(filter)
      .sort(sort)
      .skip((q.page - 1) * q.pageSize)
      .limit(q.pageSize)
      .lean(),
    IncomingDocument.countDocuments(filter),
  ]);
  return { data: rows.map(toIncomingDocumentDto), meta: pageMeta(q.page, q.pageSize, total) };
}

export async function exportIncomingDocuments(q: IncomingDocumentListQuery): Promise<IncomingDocumentDto[]> {
  const filter = buildFilter(q);
  const sort = sortOf(q);
  await connectDB();
  const rows = await IncomingDocument.find(filter).sort(sort).limit(EXPORT_MAX_ROWS).lean();
  return rows.map(toIncomingDocumentDto);
}

export async function getIncomingDocument(id: string): Promise<IncomingDocumentDto> {
  await connectDB();
  const doc = await IncomingDocument.findById(id).lean();
  if (!doc) throw new AppError("NOT_FOUND", "Dokumen masuk tidak ditemukan.");
  return toIncomingDocumentDto(doc);
}

const optDate = (v: string) => (v ? parseDateOnly(v) : undefined);

function toDocData(i: IncomingDocumentInput) {
  return {
    documentNumber: i.documentNumber,
    receivedDate: parseDateOnly(i.receivedDate),
    documentType: i.documentType,
    documentDate: optDate(i.documentDate),
    priority: i.priority,
    sender: i.sender || undefined,
    subject: i.subject || undefined,
    status: i.status,
    submittedToVPDate: optDate(i.submittedToVPDate),
    signedDate: optDate(i.signedDate),
    notes: i.notes || undefined,
  };
}

export async function createIncomingDocument(input: IncomingDocumentInput): Promise<IncomingDocumentDto> {
  await connectDB();
  const doc = await IncomingDocument.create(toDocData(input));
  return toIncomingDocumentDto(doc.toObject());
}

export async function updateIncomingDocument(id: string, input: IncomingDocumentInput): Promise<IncomingDocumentDto> {
  await connectDB();
  const doc = await IncomingDocument.findById(id);
  if (!doc) throw new AppError("NOT_FOUND", "Dokumen masuk tidak ditemukan.");
  doc.set(toDocData(input));
  await doc.save();
  return toIncomingDocumentDto(doc.toObject());
}

/** Catatan: penghapusan file Blob terkait ditambahkan pada Tahap 5. */
export async function deleteIncomingDocument(id: string): Promise<void> {
  await connectDB();
  const res = await IncomingDocument.findByIdAndDelete(id).lean();
  if (!res) throw new AppError("NOT_FOUND", "Dokumen masuk tidak ditemukan.");
  await deleteFileOf(res.file)
}
