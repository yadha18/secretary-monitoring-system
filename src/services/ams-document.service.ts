import { connectDB } from "@/lib/mongodb";
import { parseDateOnly, todayDateOnly } from "@/lib/date";
import { AppError } from "@/lib/errors";
import {
  EXPORT_MAX_ROWS,
  buildSort,
  combine,
  dateRangeFilter,
  pageMeta,
  searchFilter,
} from "@/lib/query";
import type {
  AmsDocumentInput,
  AmsDocumentListQuery,
} from "@/lib/validations/ams-document";
import { normalizeEmailList } from "@/lib/validations/common";
import { AmsDocument } from "@/models/AmsDocument";
import type { AmsDocumentDto, Paginated } from "@/types";
import { toAmsDocumentDto } from "./serializers";
import { deleteFileOf } from "./file.service";

const SORTABLE = {
  documentNumber: "documentNumber",
  receivedDate: "receivedDate",
  documentDate: "documentDate",
  documentType: "documentType",
  priority: "priority",
  status: "status",
  followUpDueDate: "followUpDueDate",
  followUpStatus: "followUpStatus",
  updatedAt: "updatedAt",
} as const;

function buildFilter(q: AmsDocumentListQuery) {
  return combine(
    searchFilter(q.q, ["documentNumber", "sender", "recipient"]),
    q.documentType && { documentType: q.documentType },
    q.priority && { priority: q.priority },
    q.status && { status: q.status },
    q.followUpStatus && { followUpStatus: q.followUpStatus },
    dateRangeFilter("receivedDate", q.receivedFrom, q.receivedTo),
    dateRangeFilter("followUpDueDate", q.dueFrom, q.dueTo),
    q.overdue && {
      followUpStatus: { $ne: "Selesai" },
      followUpDueDate: { $lt: todayDateOnly() },
    },
  );
}

const sortOf = (q: AmsDocumentListQuery) =>
  buildSort(q.sort, q.order, SORTABLE, {
    field: "receivedDate",
    order: "desc",
  });

export async function listAmsDocuments(
  q: AmsDocumentListQuery,
): Promise<Paginated<AmsDocumentDto>> {
  const filter = buildFilter(q);
  const sort = sortOf(q); // validasi sebelum menyentuh database
  await connectDB();
  const [rows, total] = await Promise.all([
    AmsDocument.find(filter)
      .sort(sort)
      .skip((q.page - 1) * q.pageSize)
      .limit(q.pageSize)
      .lean(),
    AmsDocument.countDocuments(filter),
  ]);
  return {
    data: rows.map(toAmsDocumentDto),
    meta: pageMeta(q.page, q.pageSize, total),
  };
}

export async function exportAmsDocuments(
  q: AmsDocumentListQuery,
): Promise<AmsDocumentDto[]> {
  const filter = buildFilter(q);
  const sort = sortOf(q);
  await connectDB();
  const rows = await AmsDocument.find(filter)
    .sort(sort)
    .limit(EXPORT_MAX_ROWS)
    .lean();
  return rows.map(toAmsDocumentDto);
}

export async function getAmsDocument(id: string): Promise<AmsDocumentDto> {
  await connectDB();
  const doc = await AmsDocument.findById(id).lean();
  if (!doc) throw new AppError("NOT_FOUND", "Dokumen AMS tidak ditemukan.");
  return toAmsDocumentDto(doc);
}

const optDate = (v: string) => (v ? parseDateOnly(v) : undefined);

function toDocData(i: AmsDocumentInput) {
  return {
    documentNumber: i.documentNumber,
    receivedDate: parseDateOnly(i.receivedDate),
    documentType: i.documentType,
    priority: i.priority,
    documentDate: optDate(i.documentDate),
    sender: i.sender || undefined,
    recipient: normalizeEmailList(i.recipient) || undefined,
    cc: normalizeEmailList(i.cc) || undefined,
    position: i.position || undefined,
    status: i.status,
    needsFollowUp: i.needsFollowUp || undefined,
    followUpDescription: i.followUpDescription || undefined,
    followUpDueDate: optDate(i.followUpDueDate),
    followUpStatus: i.followUpStatus,
  };
}

export async function createAmsDocument(
  input: AmsDocumentInput,
): Promise<AmsDocumentDto> {
  await connectDB();
  const doc = await AmsDocument.create(toDocData(input));
  return toAmsDocumentDto(doc.toObject());
}

export async function updateAmsDocument(
  id: string,
  input: AmsDocumentInput,
): Promise<AmsDocumentDto> {
  await connectDB();
  const doc = await AmsDocument.findById(id);
  if (!doc) throw new AppError("NOT_FOUND", "Dokumen AMS tidak ditemukan.");
  doc.set(toDocData(input));
  await doc.save();
  return toAmsDocumentDto(doc.toObject());
}

/** Catatan: penghapusan file Blob terkait ditambahkan pada Tahap 5. */
export async function deleteAmsDocument(id: string): Promise<void> {
  await connectDB();
  const res = await AmsDocument.findByIdAndDelete(id).lean();
  if (!res) throw new AppError("NOT_FOUND", "Dokumen AMS tidak ditemukan.");
  await deleteFileOf(res.file);
}
