"use client";

import { useRef, useState } from "react";
import { Download, Eye, FileText, Loader2, Replace, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDelete } from "@/components/shared/confirm-delete";
import { FilePreviewDialog } from "@/components/shared/file-preview-dialog";
import { Button } from "@/components/ui/button";
import { formatDateID } from "@/lib/date";
import { FILE_ACCEPT, MAX_FILE_MB, formatBytes, validateFileMeta, type FileModule } from "@/lib/file-rules";
import { deleteAttachedFile, fileUrl, uploadAndAttach } from "@/lib/file-upload";
import type { FileDto } from "@/types";

/** Kelola file dokumen: lihat, unduh, ganti, hapus, atau unggah bila belum ada. */
export function FileManager({
  module,
  id,
  file,
  onChanged,
}: {
  module: FileModule;
  id: string;
  file: FileDto | null;
  onChanged: (file: FileDto | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const uploading = progress !== null;

  async function onPick(f: File | undefined) {
    if (inputRef.current) inputRef.current.value = "";
    if (!f) return;
    const problem = validateFileMeta(f);
    if (problem) return void toast.error(problem);

    setProgress(0);
    try {
      const saved = await uploadAndAttach(module, id, f, setProgress);
      toast.success(file ? "File berhasil diganti." : "File berhasil diunggah.");
      onChanged(saved);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload gagal.");
    } finally {
      setProgress(null);
    }
  }

  async function onDelete() {
    setDeleting(true);
    try {
      await deleteAttachedFile(module, id);
      toast.success("File dihapus.");
      setConfirmOpen(false);
      onChanged(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus file.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-3">
      <input ref={inputRef} type="file" accept={FILE_ACCEPT} className="hidden" onChange={(e) => onPick(e.target.files?.[0])} />

      {file ? (
        <div className="rounded-lg border p-3">
          <div className="flex items-start gap-3">
            <FileText className="mt-0.5 size-5 shrink-0 text-secondary" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{file.fileName}</p>
              <p className="text-xs text-muted-foreground">
                {formatBytes(file.fileSize)} · diunggah {formatDateID(file.uploadedAt)}
              </p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => setPreviewOpen(true)} disabled={uploading}>
              <Eye /> Lihat
            </Button>
            <Button size="sm" variant="outline" asChild>
              <a href={fileUrl(module, id, "attachment")}>
                <Download /> Unduh
              </a>
            </Button>
            <Button size="sm" variant="outline" onClick={() => inputRef.current?.click()} disabled={uploading}>
              {uploading ? <Loader2 className="animate-spin" /> : <Replace />} Ganti
            </Button>
            <Button size="sm" variant="outline" className="text-destructive" onClick={() => setConfirmOpen(true)} disabled={uploading}>
              <Trash2 /> Hapus
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-4 text-center">
          <p className="mb-3 text-sm text-muted-foreground">Belum ada file. PDF, JPG, JPEG, atau PNG, maksimal {MAX_FILE_MB} MB.</p>
          <Button size="sm" onClick={() => inputRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="animate-spin" /> : <Upload />} Unggah file
          </Button>
        </div>
      )}

      {uploading && (
        <div role="progressbar" aria-valuenow={progress ?? 0} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-secondary transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Mengunggah… {progress}%</p>
        </div>
      )}

      {file && <FilePreviewDialog open={previewOpen} onOpenChange={setPreviewOpen} module={module} id={id} file={file} />}
      <ConfirmDelete
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Hapus file?"
        description="File scan akan dihapus permanen dari penyimpanan. Data dokumen tetap ada."
        loading={deleting}
        onConfirm={onDelete}
      />
    </div>
  );
}