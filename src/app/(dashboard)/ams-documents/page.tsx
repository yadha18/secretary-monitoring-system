import { AmsPage } from "@/components/ams-documents/ams-page";
import { PageHeader } from "@/components/layout/page-header";

export const metadata = { title: "Dokumen AMS | Secretary Monitoring System" };

export default function Page() {
  return (
    <>
      <PageHeader title="Dokumen AMS" description="Catat dan pantau dokumen dari aplikasi AMS beserta tindak lanjutnya." />
      <AmsPage />
    </>
  );
}
