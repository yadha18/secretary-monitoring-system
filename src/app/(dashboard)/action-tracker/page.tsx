import { ActionTrackerPage } from "@/components/action-tracker/action-tracker-page";
import { PageHeader } from "@/components/layout/page-header";

export const metadata = { title: "Action Tracker | Secretary Monitoring System" };

export default function Page() {
  return (
    <>
      <PageHeader title="Action Tracker" description="Catat dan pantau tindak lanjut hasil rapat dan instruksi." />
      <ActionTrackerPage />
    </>
  );
}
