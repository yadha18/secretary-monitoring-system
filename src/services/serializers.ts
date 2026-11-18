import { formatDateOnly, isOverdue } from "@/lib/date";
import type { ActionTrackerDto, AmsDocumentDto, FileDto, IncomingDocumentDto } from "@/types";

type AnyDoc = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

const iso = (d: unknown) => (d ? new Date(d as Date).toISOString() : "");

function fileDto(f: AnyDoc | null | undefined): FileDto | null {
  if (!f?.fileUrl) return null;
  return {
    fileName: f.fileName,
    // fileUrl: f.fileUrl,
    // blobPathname: f.blobPathname,
    mimeType: f.mimeType,
    fileSize: f.fileSize,
    uploadedAt: iso(f.uploadedAt),
  };
}

export function toActionTrackerDto(d: AnyDoc): ActionTrackerDto {
  return {
    id: String(d._id),
    number: d.number,
    meetingDate: formatDateOnly(d.meetingDate),
    agenda: d.agenda,
    actionItem: d.actionItem,
    pic: d.pic,
    department: d.department,
    priority: d.priority,
    startDate: formatDateOnly(d.startDate),
    deadline: formatDateOnly(d.deadline),
    status: d.status,
    progress: d.progress,
    lastUpdated: iso(d.lastUpdated),
    isOverdue: isOverdue(d.deadline, d.status === "Done"),
    createdAt: iso(d.createdAt),
    updatedAt: iso(d.updatedAt),
  };
}

export function toAmsDocumentDto(d: AnyDoc): AmsDocumentDto {
  return {
    id: String(d._id),
    documentNumber: d.documentNumber,
    receivedDate: formatDateOnly(d.receivedDate),
    documentType: d.documentType,
    priority: d.priority,
    documentDate: formatDateOnly(d.documentDate),
    sender: d.sender ?? "",
    recipient: d.recipient ?? "",
    cc: d.cc ?? "",
    position: d.position ?? "",
    status: d.status,
    needsFollowUp: d.needsFollowUp ?? "",
    followUpDescription: d.followUpDescription ?? "",
    followUpDueDate: formatDateOnly(d.followUpDueDate),
    followUpStatus: d.followUpStatus ?? "Belum dimulai",
    isOverdue: isOverdue(d.followUpDueDate, d.followUpStatus === "Selesai"),
    file: fileDto(d.file),
    createdAt: iso(d.createdAt),
    updatedAt: iso(d.updatedAt),
  };
}

export function toIncomingDocumentDto(d: AnyDoc): IncomingDocumentDto {
  return {
    id: String(d._id),
    documentNumber: d.documentNumber,
    receivedDate: formatDateOnly(d.receivedDate),
    documentType: d.documentType,
    documentDate: formatDateOnly(d.documentDate),
    priority: d.priority,
    sender: d.sender ?? "",
    subject: d.subject ?? "",
    status: d.status,
    submittedToVPDate: formatDateOnly(d.submittedToVPDate),
    signedDate: formatDateOnly(d.signedDate),
    notes: d.notes ?? "",
    file: fileDto(d.file),
    createdAt: iso(d.createdAt),
    updatedAt: iso(d.updatedAt),
  };
}
