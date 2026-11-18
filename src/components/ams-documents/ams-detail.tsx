import { DetailSheet } from "@/components/shared/form-sheet";
import { DetailList } from "@/components/shared/detail-list";
import { DocStatusBadge, OverdueBadge, PriorityBadge } from "@/components/shared/badges";
import { FileManager } from "../shared/file-manager";
import { formatDateID } from "@/lib/date";
import { FileDto } from "@/types";
import type { AmsDocumentDto } from "@/types";

export function AmsDetail({
  item,
  onOpenChange,
  onFileChanged,
}: {
  item: AmsDocumentDto | null;
  onOpenChange: (o: boolean) => void;
  onFileChanged: (file: FileDto | null) => void;
}) {
  return (
    <DetailSheet open={!!item} onOpenChange={onOpenChange} title="Detail Dokumen AMS" description={item?.documentNumber}>
      {item && (
        <DetailList
          items={[
            { label: "Nomor Dokumen", value: item.documentNumber },
            { label: "Tanggal Terima", value: formatDateID(item.receivedDate) },
            { label: "Jenis Dokumen", value: item.documentType },
            { label: "Prioritas", value: <PriorityBadge value={item.priority} /> },
            { label: "Tanggal Dokumen", value: formatDateID(item.documentDate) },
            { label: "Pengirim", value: item.sender },
            { label: "Tujuan", value: item.recipient },
            { label: "Tembusan", value: item.cc },
            { label: "Posisi", value: item.position },
            { label: "Status", value: <DocStatusBadge value={item.status} /> },
            { label: "Need Tindak Lanjut", value: item.needsFollowUp },
            { label: "Keterangan Tindak Lanjut", value: <span className="whitespace-pre-wrap">{item.followUpDescription}</span> },
            { label: "Due Date Tindak Lanjut", value: formatDateID(item.followUpDueDate) },
            {
              label: "Status Tindak Lanjut",
              value: (
                <span className="flex flex-wrap gap-1.5">
                  <DocStatusBadge value={item.followUpStatus} />
                  {item.isOverdue && <OverdueBadge />}
                </span>
              ),
            },
            { label: "Hasil Scan Dokumen", value: item.file?.fileName ?? "Belum ada file" },
          ]}
        />
      )}
      {item && (
        <section className="mt-8">
          <h3 className="mb-3 text-sm font-semibold text-primary">Hasil Scan Dokumen</h3>
          <FileManager module="ams" id={item.id} file={item.file} onChanged={onFileChanged} />
        </section>
      )}
    </DetailSheet>
  );
}
