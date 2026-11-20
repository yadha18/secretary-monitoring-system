import type {
  ActionStatus,
  AmsDocType,
  Department,
  DocStatus,
  IncomingDocType,
  Priority,
} from "@/lib/constants";

export type PageMeta = { page: number; pageSize: number; total: number; totalPages: number };
export type Paginated<T> = { data: T[]; meta: PageMeta };

export type FileDto = {
  fileName: string;
  // fileUrl: string;
  // blobPathname: string;
  mimeType: string;
  fileSize: number;
  uploadedAt: string;
};

/** Semua tanggal-saja berupa "YYYY-MM-DD", "" bila kosong. */
export type ActionTrackerDto = {
  id: string;
  number: string;
  meetingDate: string;
  agenda: string;
  actionItem: string;
  pic: string;
  department: Department;
  priority: Priority;
  startDate: string;
  deadline: string;
  status: ActionStatus;
  progress: 0 | 50 | 100;
  lastUpdated: string; // ISO datetime
  isOverdue: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AmsDocumentDto = {
  id: string;
  documentNumber: string;
  receivedDate: string;
  documentType: AmsDocType;
  priority: Priority;
  documentDate: string;
  sender: string;
  recipient: string;
  cc: string;
  position: string;
  status: DocStatus;
  needsFollowUp: string;
  followUpDescription: string;
  followUpDueDate: string;
  followUpStatus: DocStatus;
  isOverdue: boolean;
  file: FileDto | null;
  createdAt: string;
  updatedAt: string;
};

export type IncomingDocumentDto = {
  id: string;
  documentNumber: string;
  receivedDate: string;
  documentType: IncomingDocType;
  documentDate: string;
  priority: Priority;
  sender: string;
  subject: string;
  status: DocStatus;
  submittedToVPDate: string;
  signedDate: string;
  notes: string;
  file: FileDto | null;
  createdAt: string;
  updatedAt: string;
};


// ---------- Dashboard ----------
export type CountItem = { name: string; value: number };
export type MonthItem = { month: string; value: number }; // month = "YYYY-MM"

export type ActivityItem = {
  id: string;
  module: "action-tracker" | "ams" | "incoming";
  kind: "created" | "updated";
  title: string; // nomor
  description: string;
  at: string; // ISO datetime
};

export type OverdueDoc = { id: string; documentNumber: string; dueDate: string; daysLate: number; status: string };

export type DashboardData = {
  range: { key: string; from: string; to: string };
  generatedAt: string;
  cards: {
    actionTotal: number;
    actionOnProgress: number;
    actionDone: number;
    actionOverdue: number;
    amsTotal: number;
    amsNeedFollowUp: number;
    incomingTotal: number;
    incomingNotDone: number;
  };
  action: {
    byStatus: CountItem[];
    byDepartment: CountItem[];
    byPriority: CountItem[];
    completionPercent: number; // Done / total
    averageProgress: number; // rata-rata kolom progress
    byDeadline: CountItem[]; // hanya yang belum Done
  };
  documents: {
    amsPerMonth: MonthItem[];
    incomingPerMonth: MonthItem[];
    statusDistribution: { name: string; ams: number; incoming: number }[];
    followUpByStatus: CountItem[]; // AMS yang punya "Need Tindak Lanjut"
    overdueCount: number;
    overdueList: OverdueDoc[];
  };
  activities: ActivityItem[];
};