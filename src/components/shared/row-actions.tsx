import { Eye, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export function RowActions({
  onView,
  onEdit,
  onDelete,
}: {
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex gap-1">
      <Button variant="ghost" size="icon" className="size-8" onClick={onView} aria-label="Detail" title="Detail">
        <Eye />
      </Button>
      <Button variant="ghost" size="icon" className="size-8" onClick={onEdit} aria-label="Edit" title="Edit">
        <Pencil />
      </Button>
      <Button variant="ghost" size="icon" className="size-8 text-destructive hover:text-destructive" onClick={onDelete} aria-label="Hapus" title="Hapus">
        <Trash2 />
      </Button>
    </div>
  );
}
