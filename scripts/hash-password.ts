/**
 * Membuat nilai ADMIN_PASSWORD_HASH_B64.
 * Pakai: npm run hash-password -- "passwordAnda"
 */
import bcrypt from "bcryptjs";

const password = process.argv[2];
if (!password || password.length < 8) {
  console.error('Pakai: npm run hash-password -- "passwordAnda"   (minimal 8 karakter)');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 12);
console.log("\nSalin baris ini ke .env.local (dan ke Environment Variables Vercel):\n");
console.log(`ADMIN_PASSWORD_HASH_B64=${Buffer.from(hash).toString("base64")}\n`);
