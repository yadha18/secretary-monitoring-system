"use client";

import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { fileUrl } from "@/lib/file-upload";
import type { FileModule } from "@/lib/file-rules";
import type { FileDto } from "@/types";

export function FilePreviewDialog({
  open,
  onOpenChange,
  module,
  id,
  file,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  module: FileModule;
  id: string;
  file: FileDto;
}) {
  const src = fileUrl(module, id, "inline");
  const isPdf = file.mimeType === "application/pdf";
  const isImage = file.mimeType.startsWith("image/");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[90vh] max-w-4xl flex-col">
        <DialogHeader className="pr-6">
          <DialogTitle className="truncate">{file.fileName}</DialogTitle>
          <DialogDescription>Pratinjau hasil scan dokumen.</DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-auto rounded-md border bg-muted/30">
          {isPdf && <iframe key={src} src={src} title={file.fileName} className="h-full w-full" />}
          {isImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt={file.fileName} className="mx-auto max-h-full max-w-full object-contain" />
          )}
          {!isPdf && !isImage && (
            <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center text-sm text-muted-foreground">
              Pratinjau tidak tersedia untuk jenis file ini.
              <Button asChild>
                <a href={fileUrl(module, id, "attachment")}>
                  <Download /> Unduh file
                </a>
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}