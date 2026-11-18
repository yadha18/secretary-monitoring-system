import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const rateLimitSchema = new Schema(
  {
    key: { type: String, required: true },
    count: { type: Number, required: true, default: 0 },
    expiresAt: { type: Date, required: true },
  },
  { collection: "rate_limits" }
);

rateLimitSchema.index({ key: 1 }, { unique: true });
rateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL

export type RateLimitDoc = InferSchemaType<typeof rateLimitSchema>;

export const RateLimit: Model<RateLimitDoc> =
  (mongoose.models.RateLimit as Model<RateLimitDoc>) ||
  mongoose.model<RateLimitDoc>("RateLimit", rateLimitSchema);
