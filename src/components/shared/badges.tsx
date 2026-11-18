import { Badge } from "@/components/ui/badge";
import type { ActionStatus, DocStatus, Priority } from "@/lib/constants";

export function PriorityBadge({ value }: { value: Priority }) {
  return <Badge variant={value === "Tinggi" ? "red" : "gray"}>{value}</Badge>;
}

export function ActionStatusBadge({ value }: { value: ActionStatus }) {
  return <Badge variant={value === "Done" ? "green" : "blue"}>{value}</Badge>;
}

const DOC_STATUS_VARIANT = {
  "Belum dimulai": "gray",
  "Dalam proses": "blue",
  Diblokir: "amber",
  Selesai: "green",
} as const;

export function DocStatusBadge({ value }: { value: DocStatus }) {
  return <Badge variant={DOC_STATUS_VARIANT[value]}>{value}</Badge>;
}

export function OverdueBadge() {
  return <Badge variant="red">Overdue</Badge>;
}
