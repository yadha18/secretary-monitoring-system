import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

import { DOC_STATUSES, INCOMING_DOC_TYPES, PRIORITIES } from "@/lib/constants";
import { CASE_INSENSITIVE, fileSchema } from "./_shared";

const incomingDocumentSchema = new Schema(
  {
    documentNumber: { type: String, required: true, trim: true, maxlength: 100 },
    receivedDate: { type: Date },
    documentType: { type: String, enum: INCOMING_DOC_TYPES, required: true },
    documentDate: { type: Date },
    priority: { type: String, enum: PRIORITIES, required: true, default: "Normal" },
    sender: { type: String, trim: true, maxlength: 200 },
    subject: { type: String, trim: true, maxlength: 2000 },
    status: { type: String, enum: DOC_STATUSES, required: true, default: "Belum dimulai" },
    submittedToVPDate: { type: Date }, // boleh kosong
    signedDate: { type: Date }, // boleh kosong
    file: { type: fileSchema, default: undefined },
    notes: { type: String, trim: true, maxlength: 1000 },
  },
  { timestamps: true, collection: "incoming_documents" }
);

incomingDocumentSchema.pre("validate", function () {
  if (this.submittedToVPDate && this.receivedDate && this.submittedToVPDate < this.receivedDate) {
    this.invalidate("submittedToVPDate", "Tanggal naik ke VP tidak boleh lebih awal dari tanggal terima.");
  }
  if (this.signedDate && this.submittedToVPDate && this.signedDate < this.submittedToVPDate) {
    this.invalidate("signedDate", "Tanggal tanda tangan tidak boleh lebih awal dari tanggal naik ke VP.");
  }
});

incomingDocumentSchema.index({ documentNumber: 1 }, { unique: true, collation: CASE_INSENSITIVE });
incomingDocumentSchema.index({ receivedDate: -1 });
incomingDocumentSchema.index({ documentType: 1, status: 1 });
incomingDocumentSchema.index({ submittedToVPDate: 1 });
incomingDocumentSchema.index({ signedDate: 1 });
incomingDocumentSchema.index({ updatedAt: -1 });

export type IncomingDocumentDoc = InferSchemaType<typeof incomingDocumentSchema>;

export const IncomingDocument: Model<IncomingDocumentDoc> =
  (mongoose.models.IncomingDocument as Model<IncomingDocumentDoc>) ||
  mongoose.model<IncomingDocumentDoc>("IncomingDocument", incomingDocumentSchema);
