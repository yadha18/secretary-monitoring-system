import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

import { USER_ROLES } from "@/lib/constants";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 200 },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: USER_ROLES, default: "admin", required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, collection: "users" }
);

userSchema.index({ email: 1 }, { unique: true });

export type UserDoc = InferSchemaType<typeof userSchema>;

export const User: Model<UserDoc> =
  (mongoose.models.User as Model<UserDoc>) || mongoose.model<UserDoc>("User", userSchema);
