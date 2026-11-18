import { DetailSheet } from "@/components/shared/form-sheet";
import { DetailList } from "@/components/shared/detail-list";
import { DocStatusBadge, PriorityBadge } from "@/components/shared/badges";
import { FileManager } from "@/components/shared/file-manager";
import { formatDateID } from "@/lib/date";
import type { FileDto } from "@/types";
import type { IncomingDocumentDto } from "@/types";
import { DocumentTimeline } from "./timeline";

export function IncomingDetail({
  item,
  onOpenChange,
  onFileChanged,
}: {
  item: IncomingDocumentDto | null;
  onOpenChange: (o: boolean) => void;
  onFileChanged: (file: FileDto | null) => void;
}) {
  return (
    <DetailSheet open={!!item} onOpenChange={onOpenChange} title="Detail Dokumen Masuk" description={item?.documentNumber}>
      {item && (
        <div className="space-y-8">
          <section>
            <h3 className="mb-3 text-sm font-semibold text-primary">Perjalanan Dokumen</h3>
            <DocumentTimeline doc={item} />
          </section>
          <section>
            <h3 className="mb-3 text-sm font-semibold text-primary">Informasi Dokumen</h3>
            <DetailList
              items={[
                { label: "Nomor Dokumen", value: item.documentNumber },
                { label: "Tanggal Terima", value: formatDateID(item.receivedDate) },
                { label: "Jenis Dokumen", value: item.documentType },
                { label: "Tanggal Dokumen", value: formatDateID(item.documentDate) },
                { label: "Prioritas", value: <PriorityBadge value={item.priority} /> },
                { label: "Status", value: <DocStatusBadge value={item.status} /> },
                { label: "Pengirim", value: item.sender },
                { label: "Perihal", value: <span className="whitespace-pre-wrap">{item.subject}</span> },
                { label: "Tanggal Naik ke VP", value: formatDateID(item.submittedToVPDate) },
                { label: "Tanggal Tanda Tangan", value: formatDateID(item.signedDate) },
                { label: "Catatan", value: item.notes },
              ]}
            />
          </section>
           <section>
            <h3 className="mb-3 text-sm font-semibold text-primary">Scan Dokumen</h3>
            <FileManager module="incoming" id={item.id} file={item.file} onChanged={onFileChanged} />
          </section>
        </div>
      )}
    </DetailSheet>
  );
}
