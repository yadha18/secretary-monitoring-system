import { PageHeader } from "@/components/layout/page-header";
import { IncomingPage } from "@/components/incoming-documents/incoming-page";

export const metadata = { title: "Dokumen Masuk | Secretary Monitoring System" };

export default function Page() {
  return (
    <>
      <PageHeader title="Dokumen Masuk" description="Catat surat dan dokumen masuk beserta perjalanan hingga ditandatangani." />
      <IncomingPage />
    </>
  );
}
