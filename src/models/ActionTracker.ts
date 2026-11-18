import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

import { ACTION_PROGRESS, ACTION_STATUSES, DEPARTMENTS, PRIORITIES } from "@/lib/constants";
import { CASE_INSENSITIVE } from "./_shared";

const actionTrackerSchema = new Schema(
  {
    number: { type: String, required: true, trim: true, maxlength: 50 },
    meetingDate: { type: Date, required: true },
    agenda: { type: String, required: true, trim: true, maxlength: 500 },
    actionItem: { type: String, required: true, trim: true, maxlength: 2000 },
    pic: { type: String, required: true, trim: true, maxlength: 100 },
    department: { type: String, enum: DEPARTMENTS, required: true },
    priority: { type: String, enum: PRIORITIES, required: true, default: "Normal" },
    startDate: { type: Date },
    deadline: { type: Date },
    status: { type: String, enum: ACTION_STATUSES, required: true, default: "On Progress" },
    progress: { type: Number, enum: ACTION_PROGRESS, required: true, default: 0 },
    lastUpdated: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true, collection: "action_trackers" }
);

// Konsistensi data (lapis kedua setelah Zod).
actionTrackerSchema.pre("validate", function () {
  if (this.status === "Done" && this.progress !== 100) {
    this.invalidate("progress", "Status Done harus memiliki progress 100%.");
  }
  if (this.status === "On Progress" && this.progress === 100) {
    this.invalidate("progress", "Status On Progress tidak boleh memiliki progress 100%.");
  }
  if (this.startDate && this.deadline && this.deadline < this.startDate) {
    this.invalidate("deadline", "Deadline tidak boleh lebih awal dari Tanggal Mulai.");
  }
});

// lastUpdated otomatis setiap simpan.
actionTrackerSchema.pre("save", function () {
  this.lastUpdated = new Date();
});

actionTrackerSchema.index({ number: 1 }, { unique: true, collation: CASE_INSENSITIVE });
actionTrackerSchema.index({ department: 1, status: 1 });
actionTrackerSchema.index({ priority: 1, deadline: 1 });
actionTrackerSchema.index({ status: 1, deadline: 1 });
actionTrackerSchema.index({ meetingDate: -1 });
actionTrackerSchema.index({ progress: 1 });
actionTrackerSchema.index({ pic: 1 });
actionTrackerSchema.index({ updatedAt: -1 });

export type ActionTrackerDoc = InferSchemaType<typeof actionTrackerSchema>;

export const ActionTracker: Model<ActionTrackerDoc> =
  (mongoose.models.ActionTracker as Model<ActionTrackerDoc>) ||
  mongoose.model<ActionTrackerDoc>("ActionTracker", actionTrackerSchema);
