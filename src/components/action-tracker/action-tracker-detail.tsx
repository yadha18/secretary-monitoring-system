import { DetailSheet } from "@/components/shared/form-sheet";
import { DetailList } from "@/components/shared/detail-list";
import { ActionStatusBadge, OverdueBadge, PriorityBadge } from "@/components/shared/badges";
import { formatDateID } from "@/lib/date";
import type { ActionTrackerDto } from "@/types";

export function ActionTrackerDetail({
  item,
  onOpenChange,
}: {
  item: ActionTrackerDto | null;
  onOpenChange: (o: boolean) => void;
}) {
  return (
    <DetailSheet open={!!item} onOpenChange={onOpenChange} title="Detail Action Item" description={item?.number}>
      {item && (
        <DetailList
          items={[
            { label: "No.", value: item.number },
            { label: "Tanggal Rapat/Instruksi", value: formatDateID(item.meetingDate) },
            { label: "Agenda/Kegiatan", value: item.agenda },
            { label: "Action Item / Tindak Lanjut", value: <span className="whitespace-pre-wrap">{item.actionItem}</span> },
            { label: "PIC", value: item.pic },
            { label: "Divisi/Unit", value: item.department },
            { label: "Prioritas", value: <PriorityBadge value={item.priority} /> },
            { label: "Tanggal Mulai", value: formatDateID(item.startDate) },
            { label: "Deadline", value: formatDateID(item.deadline) },
            {
              label: "Status",
              value: (
                <span className="flex flex-wrap gap-1.5">
                  <ActionStatusBadge value={item.status} />
                  {item.isOverdue && <OverdueBadge />}
                </span>
              ),
            },
            { label: "Progress (%)", value: `${item.progress}%` },
            { label: "Update Terakhir", value: formatDateID(item.lastUpdated) },
          ]}
        />
      )}
    </DetailSheet>
  );
}
