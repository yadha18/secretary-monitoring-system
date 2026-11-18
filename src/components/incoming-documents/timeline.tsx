import { Check, Circle } from "lucide-react";

import { formatDateID } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { IncomingDocumentDto } from "@/types";

/** Tahap dihitung dari data yang tersedia (tanggal dan status). */
export function buildTimeline(d: IncomingDocumentDto) {
  return [
    { label: "Dokumen diterima", done: !!d.receivedDate, date: d.receivedDate },
    { label: "Dokumen dalam proses", done: d.status !== "Belum dimulai", date: "" },
    { label: "Dokumen naik ke VP", done: !!d.submittedToVPDate, date: d.submittedToVPDate },
    { label: "Dokumen ditandatangani", done: !!d.signedDate, date: d.signedDate },
    { label: "Dokumen selesai", done: d.status === "Selesai", date: "" },
  ];
}

export function DocumentTimeline({ doc }: { doc: IncomingDocumentDto }) {
  const steps = buildTimeline(doc);
  return (
    <ol className="space-y-0">
      {steps.map((s, i) => (
        <li key={s.label} className="relative flex gap-3 pb-5 last:pb-0">
          {i < steps.length - 1 && (
            <span className={cn("absolute left-[11px] top-6 h-full w-0.5", s.done ? "bg-success" : "bg-border")} aria-hidden />
          )}
          <span
            className={cn(
              "relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full border-2",
              s.done ? "border-success bg-success text-white" : "border-border bg-card text-muted-foreground"
            )}
          >
            {s.done ? <Check className="size-3.5" /> : <Circle className="size-2" />}
          </span>
          <div>
            <p className={cn("text-sm font-medium", !s.done && "text-muted-foreground")}>{s.label}</p>
            <p className="text-xs text-muted-foreground">
              {s.date ? formatDateID(s.date) : s.done ? "Tanggal tidak dicatat" : "Belum tercapai"}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
