export const DEPARTMENTS = ["ADKINTEL", "PSPE", "ADEV"] as const;
export const PRIORITIES = ["Normal", "Tinggi"] as const;
export const ACTION_STATUSES = ["On Progress", "Done"] as const;
export const ACTION_PROGRESS = [0, 50, 100] as const;

export const AMS_DOC_TYPES = ["Surat Keluar", "Nota Dinas"] as const;
export const INCOMING_DOC_TYPES = ["Surat Keluar", "Nota Dinas", "BAUK", "BAPS", "BAPP"] as const;
export const DOC_STATUSES = ["Belum dimulai", "Dalam proses", "Diblokir", "Selesai"] as const;

export const USER_ROLES = ["admin"] as const;

export const PAGE_SIZES = [10, 25, 50, 100] as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
export const ALLOWED_FILE_TYPES = ["application/pdf", "image/jpeg", "image/png"] as const;
export const ALLOWED_FILE_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png"] as const;

export type Department = (typeof DEPARTMENTS)[number];
export type Priority = (typeof PRIORITIES)[number];
export type ActionStatus = (typeof ACTION_STATUSES)[number];
export type AmsDocType = (typeof AMS_DOC_TYPES)[number];
export type IncomingDocType = (typeof INCOMING_DOC_TYPES)[number];
export type DocStatus = (typeof DOC_STATUSES)[number];
