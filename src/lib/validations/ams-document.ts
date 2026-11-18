import { z } from "zod";

import { AMS_DOC_TYPES, DOC_STATUSES, PRIORITIES } from "@/lib/constants";
import {
  dateStr,
  isEmailList,
  listQueryBase,
  optionalDate,
  optionalText,
  requiredDate,
  requiredText,
} from "./common";

const singleEmail = z.union([z.literal(""), z.email("Format email tidak valid.")]).optional().default("");
const emailList = (label: string) =>
  z
    .string()
    .trim()
    .max(1000)
    .refine((v) => v === "" || isEmailList(v), `${label}: format email tidak valid (pisahkan dengan koma).`)
    .optional()
    .default("");

export const amsDocumentSchema = z
  .object({
    documentNumber: requiredText("Nomor Dokumen", 100),
    receivedDate: requiredDate("Tanggal Terima wajib diisi."),
    documentType: z.enum(AMS_DOC_TYPES, { error: "Jenis Dokumen wajib dipilih." }),
    priority: z.enum(PRIORITIES, { error: "Prioritas wajib dipilih." }),
    documentDate: optionalDate,
    sender: singleEmail,
    recipient: emailList("Tujuan"),
    cc: emailList("Tembusan"),
    position: optionalText(200),
    status: z.enum(DOC_STATUSES, { error: "Status wajib dipilih." }),
    needsFollowUp: optionalText(500),
    followUpDescription: optionalText(3000),
    followUpDueDate: optionalDate,
    followUpStatus: z.enum(DOC_STATUSES, { error: "Status Tindak Lanjut wajib dipilih." }),
  })
  .superRefine((v, ctx) => {
    if (v.followUpDueDate && v.receivedDate && v.followUpDueDate < v.receivedDate) {
      ctx.addIssue({
        code: "custom",
        path: ["followUpDueDate"],
        message: "Due Date tidak boleh lebih awal dari Tanggal Terima.",
      });
    }
  });

export type AmsDocumentInput = z.infer<typeof amsDocumentSchema>;
export type AmsDocumentFormValues = z.input<typeof amsDocumentSchema>;

export const amsDocumentListSchema = listQueryBase.extend({
  documentType: z.enum(AMS_DOC_TYPES).optional(),
  priority: z.enum(PRIORITIES).optional(),
  status: z.enum(DOC_STATUSES).optional(),
  followUpStatus: z.enum(DOC_STATUSES).optional(),
  receivedFrom: dateStr.optional(),
  receivedTo: dateStr.optional(),
  dueFrom: dateStr.optional(),
  dueTo: dateStr.optional(),
  overdue: z.enum(["true"]).optional(),
});

export type AmsDocumentListQuery = z.infer<typeof amsDocumentListSchema>;
