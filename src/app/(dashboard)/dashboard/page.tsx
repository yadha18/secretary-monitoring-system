import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth();
  return (
    <>
      <PageHeader title="Dashboard" description={`Selamat datang, ${session?.user?.name ?? ""}.`} />
      <Card>
        <CardContent className="pt-5 text-sm text-muted-foreground">
          Ringkasan dan grafik monitoring dibangun pada Tahap 6.
        </CardContent>
      </Card>
    </>
  );
}
