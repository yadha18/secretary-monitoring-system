import { Schema } from "mongoose";

export interface FileMeta {
  fileName: string;
  fileUrl: string;
  blobPathname: string;
  mimeType: string;
  fileSize: number;
  uploadedAt: Date;
}

/** Subdocument metadata file (tanpa _id). */
export const fileSchema = new Schema<FileMeta>(
  {
    fileName: { type: String, required: true, trim: true },
    fileUrl: { type: String, required: true },
    blobPathname: { type: String, required: true },
    mimeType: { type: String, required: true },
    fileSize: { type: Number, required: true, min: 0 },
    uploadedAt: { type: Date, required: true, default: Date.now },
  },
  { _id: false }
);

/** Collation untuk unique index tanpa membedakan huruf besar/kecil. */
export const CASE_INSENSITIVE = { locale: "en", strength: 2 } as const;
