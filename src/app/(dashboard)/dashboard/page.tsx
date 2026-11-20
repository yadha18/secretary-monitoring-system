import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { PageHeader } from "@/components/layout/page-header";

export const metadata = { title: "Dashboard | Secretary Monitoring System" };

export default function Page() {
   return (
     <>
      <PageHeader title="Dashboard" description="Ringkasan aktivitas sekretaris: Action Tracker, Dokumen AMS, dan Dokumen Masuk." />
      <DashboardPage />
     </>
   );
 }