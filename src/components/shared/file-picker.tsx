"use client";

import { useRef } from "react";
import { FileText, Paperclip, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FILE_ACCEPT, MAX_FILE_MB, formatBytes, validateFileMeta } from "@/lib/file-rules";

/** Pemilih file untuk form. File baru diunggah setelah data dokumen berhasil disimpan. */
export function FilePicker({
  file,
  onChange,
  existingName,
  disabled,
  error,
  onError,
}: {
  file: File | null;
  onChange: (f: File | null) => void;
  existingName?: string | null;
  disabled?: boolean;
  error?: string | null;
  onError: (msg: string | null) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);

  function pick(f: File | undefined) {
    if (!f) return;
    const problem = validateFileMeta(f);
    onError(problem);
    onChange(problem ? null : f);
    if (ref.current) ref.current.value = "";
  }

  return (
    <div className="space-y-1.5">
      <input
        ref={ref}
        id="scan-file"
        type="file"
        accept={FILE_ACCEPT}
        className="hidden"
        disabled={disabled}
        onChange={(e) => pick(e.target.files?.[0])}
      />
      {file ? (
        <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm">
          <FileText className="size-4 shrink-0 text-muted-foreground" />
          <span className="min-w-0 flex-1 truncate">{file.name}</span>
          <span className="shrink-0 text-xs text-muted-foreground">{formatBytes(file.size)}</span>
          <Button type="button" variant="ghost" size="icon" className="size-7" disabled={disabled} onClick={() => onChange(null)} aria-label="Batalkan pilihan file">
            <X />
          </Button>
        </div>
      ) : (
        <Button type="button" variant="outline" disabled={disabled} onClick={() => ref.current?.click()}>
          <Paperclip /> {existingName ? "Ganti file" : "Pilih file"}
        </Button>
      )}
      {existingName && !file && <p className="text-xs text-muted-foreground">File saat ini: {existingName}</p>}
      <p className="text-xs text-muted-foreground">PDF, JPG, JPEG, atau PNG. Maksimal {MAX_FILE_MB} MB.</p>
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}