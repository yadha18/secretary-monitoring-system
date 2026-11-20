import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import {
  ACTION_PROGRESS,
  ACTION_STATUSES,
  ALLOWED_FILE_EXTENSIONS,
  AMS_DOC_TYPES,
  DEPARTMENTS,
  DOC_STATUSES,
  INCOMING_DOC_TYPES,
  MAX_FILE_SIZE,
  PRIORITIES,
} from "@/lib/constants";

export const metadata = { title: "Pengaturan" };

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 border-b py-2.5 last:border-b-0 sm:grid-cols-[220px_1fr] sm:gap-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}

function Chips({ items }: { items: readonly (string | number)[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((i) => (
        <Badge key={i} variant="outline">
          {i}
        </Badge>
      ))}
    </div>
  );
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <dl>{children}</dl>
      </CardContent>
    </Card>
  );
}

export default async function Page() {
  const session = await auth();
  const user = session?.user;
  // Hanya status terkonfigurasi (ya/tidak); nilai rahasia tidak pernah ditampilkan.
  const configured = {
    "Database (MongoDB)": !!process.env.MONGODB_URI,
    "Penyimpanan file (Vercel Blob)": !!process.env.BLOB_READ_WRITE_TOKEN,
    "Pembersihan terjadwal (Cron)": !!process.env.CRON_SECRET,
  };

  return (
    <>
      <PageHeader title="Pengaturan" description="Informasi akun dan konfigurasi aplikasi." />
      <div className="grid gap-4">
        <Section title="Profil Akun">
          <Row label="Nama">{user?.name ?? "-"}</Row>
          <Row label="Email">{user?.email ?? "-"}</Row>
          <Row label="Peran">
            <Badge>Administrator</Badge>
          </Row>
          <Row label="Masa berlaku sesi">8 jam sejak login</Row>
        </Section>

        <Section
          title="Keamanan"
          description="Akun administrator dikelola lewat environment variable, bukan database."
        >
          <Row label="Mengganti password">
            Jalankan <code className="rounded bg-muted px-1.5 py-0.5 text-xs">npm run hash-password -- &quot;passwordBaru&quot;</code>, tempel
            hasilnya ke <code className="rounded bg-muted px-1.5 py-0.5 text-xs">ADMIN_PASSWORD_HASH_B64</code> di Vercel, lalu redeploy.
          </Row>
          <Row label="Perlindungan login">Maksimal 8 percobaan per 15 menit untuk setiap kombinasi IP dan email.</Row>
        </Section>

        <Section title="Status Konfigurasi" description="Hanya menunjukkan apakah variabel sudah diisi.">
          {Object.entries(configured).map(([k, ok]) => (
            <Row key={k} label={k}>
              <Badge variant={ok ? "green" : "red"}>{ok ? "Terkonfigurasi" : "Belum diisi"}</Badge>
            </Row>
          ))}
        </Section>

        <Section title="Batas Sistem">
          <Row label="Ukuran file maksimal">{MAX_FILE_SIZE / 1024 / 1024} MB per dokumen</Row>
          <Row label="Format file">
            <Chips items={ALLOWED_FILE_EXTENSIONS} />
          </Row>
          <Row label="Zona waktu">WIB (Asia/Jakarta); minggu dimulai hari Senin</Row>
          <Row label="Ekspor">CSV dan Excel, maksimal 10.000 baris per ekspor</Row>
        </Section>

        <Section title="Daftar Pilihan" description="Pilihan dropdown bersifat tetap sesuai ketentuan dan tidak dapat diubah dari aplikasi.">
          <Row label="Divisi/Unit"><Chips items={DEPARTMENTS} /></Row>
          <Row label="Prioritas"><Chips items={PRIORITIES} /></Row>
          <Row label="Status Action Tracker"><Chips items={ACTION_STATUSES} /></Row>
          <Row label="Progress (%)"><Chips items={ACTION_PROGRESS} /></Row>
          <Row label="Jenis Dokumen AMS"><Chips items={AMS_DOC_TYPES} /></Row>
          <Row label="Jenis Dokumen Masuk"><Chips items={INCOMING_DOC_TYPES} /></Row>
          <Row label="Status Dokumen"><Chips items={DOC_STATUSES} /></Row>
        </Section>
      </div>
    </>
  );
}