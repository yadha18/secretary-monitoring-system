import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

import { AMS_DOC_TYPES, DOC_STATUSES, PRIORITIES } from "@/lib/constants";
import { CASE_INSENSITIVE, fileSchema } from "./_shared";

const amsDocumentSchema = new Schema(
  {
    documentNumber: { type: String, required: true, trim: true, maxlength: 100 },
    receivedDate: { type: Date },
    documentType: { type: String, enum: AMS_DOC_TYPES, required: true },
    priority: { type: String, enum: PRIORITIES, required: true, default: "Normal" },
    documentDate: { type: Date },
    sender: { type: String, trim: true, lowercase: true, maxlength: 200 }, // satu email
    recipient: { type: String, trim: true, lowercase: true, maxlength: 1000 }, // boleh beberapa email, dipisah koma
    cc: { type: String, trim: true, lowercase: true, maxlength: 1000 }, // boleh beberapa email, dipisah koma
    position: { type: String, trim: true, maxlength: 200 },
    status: { type: String, enum: DOC_STATUSES, required: true, default: "Belum dimulai" },
    needsFollowUp: { type: String, trim: true, maxlength: 500 },
    followUpDescription: { type: String, trim: true, maxlength: 3000 },
    followUpDueDate: { type: Date },
    followUpStatus: { type: String, enum: DOC_STATUSES, default: "Belum dimulai" },
    file: { type: fileSchema, default: undefined },
  },
  { timestamps: true, collection: "ams_documents" }
);

amsDocumentSchema.index({ documentNumber: 1 }, { unique: true, collation: CASE_INSENSITIVE });
amsDocumentSchema.index({ receivedDate: -1 });
amsDocumentSchema.index({ documentType: 1, status: 1 });
amsDocumentSchema.index({ followUpStatus: 1, followUpDueDate: 1 });
amsDocumentSchema.index({ sender: 1 });
amsDocumentSchema.index({ recipient: 1 });
amsDocumentSchema.index({ updatedAt: -1 });

export type AmsDocumentDoc = InferSchemaType<typeof amsDocumentSchema>;

export const AmsDocument: Model<AmsDocumentDoc> =
  (mongoose.models.AmsDocument as Model<AmsDocumentDoc>) ||
  mongoose.model<AmsDocumentDoc>("AmsDocument", amsDocumentSchema);
