import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default function Page() {
  return (
    <>
      <PageHeader title="Pengaturan" />
      <Card>
        <CardContent className="pt-5 text-sm text-muted-foreground">Pengaturan masih dalam tahap development.</CardContent>
      </Card>
    </>
  );
}
