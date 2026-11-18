/**
 * Membuat/menyinkronkan seluruh index MongoDB sesuai schema, sekaligus menguji koneksi.
 * Jalankan: npm run db:sync   (butuh MONGODB_URI di .env.local)
 */
import mongoose from "mongoose";

import { ActionTracker, AmsDocument, IncomingDocument, RateLimit, User } from "../src/models";

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI belum diatur (.env.local).");

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10_000 });
  console.log(`Terhubung ke database: ${mongoose.connection.name}`);

  for (const model of [User, ActionTracker, AmsDocument, IncomingDocument, RateLimit]) {
    await model.syncIndexes();
    const indexes = await model.collection.indexes();
    console.log(`✓ ${model.collection.name}: ${indexes.length} index`);
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
