"use client";

import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";

/** Drawer form: header + isi scrollable + footer tombol. `formId` menghubungkan tombol submit ke <form>. */
export function FormSheet({
  open,
  onOpenChange,
  title,
  description,
  formId,
  saving,
  children,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  description?: string;
  formId: string;
  saving: boolean;
  children: React.ReactNode;
}) {
  return (
    <Sheet open={open} onOpenChange={(o) => !saving && onOpenChange(o)}>
      <SheetContent title={title} description={description}>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        <div className="flex justify-end gap-2 border-t px-6 py-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Batal
          </Button>
          <Button type="submit" form={formId} disabled={saving}>
            {saving && <Loader2 className="animate-spin" />}
            {saving ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function DetailSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent title={title} description={description}>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
