import { z } from "zod";

import { DOC_STATUSES, INCOMING_DOC_TYPES, PRIORITIES } from "@/lib/constants";
import { dateStr, listQueryBase, optionalDate, optionalText, requiredDate, requiredText } from "./common";

export const incomingDocumentSchema = z
  .object({
    documentNumber: requiredText("Nomor Dokumen", 100),
    receivedDate: requiredDate("Tanggal Terima wajib diisi."),
    documentType: z.enum(INCOMING_DOC_TYPES, { error: "Jenis Dokumen wajib dipilih." }),
    documentDate: optionalDate,
    priority: z.enum(PRIORITIES, { error: "Prioritas wajib dipilih." }),
    sender: optionalText(200),
    subject: optionalText(2000),
    status: z.enum(DOC_STATUSES, { error: "Status wajib dipilih." }),
    submittedToVPDate: optionalDate,
    signedDate: optionalDate,
    notes: optionalText(1000),
  })
  .superRefine((v, ctx) => {
    if (v.submittedToVPDate && v.submittedToVPDate < v.receivedDate) {
      ctx.addIssue({
        code: "custom",
        path: ["submittedToVPDate"],
        message: "Tanggal naik ke VP tidak boleh lebih awal dari Tanggal Terima.",
      });
    }
    if (v.signedDate && v.submittedToVPDate && v.signedDate < v.submittedToVPDate) {
      ctx.addIssue({
        code: "custom",
        path: ["signedDate"],
        message: "Tanggal tanda tangan tidak boleh lebih awal dari tanggal naik ke VP.",
      });
    }
    if (v.signedDate && !v.submittedToVPDate) {
      ctx.addIssue({
        code: "custom",
        path: ["submittedToVPDate"],
        message: "Isi Tanggal Naik ke VP sebelum Tanggal Tanda Tangan.",
      });
    }
  });

export type IncomingDocumentInput = z.infer<typeof incomingDocumentSchema>;
export type IncomingDocumentFormValues = z.input<typeof incomingDocumentSchema>;

export const incomingDocumentListSchema = listQueryBase.extend({
  documentType: z.enum(INCOMING_DOC_TYPES).optional(),
  priority: z.enum(PRIORITIES).optional(),
  status: z.enum(DOC_STATUSES).optional(),
  receivedFrom: dateStr.optional(),
  receivedTo: dateStr.optional(),
  vpFrom: dateStr.optional(),
  vpTo: dateStr.optional(),
  signedFrom: dateStr.optional(),
  signedTo: dateStr.optional(),
});

export type IncomingDocumentListQuery = z.infer<typeof incomingDocumentListSchema>;
