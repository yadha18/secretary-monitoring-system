import Link from "next/link";
import { FileText, Inbox, ListChecks, Pencil, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ActivityItem } from "@/types";

const MODULE = {
  "action-tracker": { label: "Action Tracker", href: "/action-tracker", icon: ListChecks },
  ams: { label: "Dokumen AMS", href: "/ams-documents", icon: FileText },
  incoming: { label: "Dokumen Masuk", href: "/incoming-documents", icon: Inbox },
} as const;

const KIND_TEXT = {
  "action-tracker": { created: "Action Tracker baru dibuat", updated: "Action Tracker diperbarui" },
  ams: { created: "Dokumen AMS baru dicatat", updated: "Dokumen AMS diperbarui" },
  incoming: { created: "Dokumen Masuk baru dicatat", updated: "Dokumen Masuk diperbarui" },
} as const;

const dtf = new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: false });

export function RecentActivities({ items }: { items: ActivityItem[] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Aktivitas Terbaru</CardTitle>
        <CardDescription className="text-xs">Perubahan data pada periode terpilih (waktu WIB).</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Belum ada aktivitas pada periode ini.</p>
        ) : (
          <ul className="divide-y">
            {items.map((a) => {
              const m = MODULE[a.module];
              const Icon = a.kind === "created" ? Plus : Pencil;
              return (
                <li key={`${a.module}-${a.id}-${a.at}`} className="flex items-start gap-3 py-2.5">
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">
                      <span className="font-medium">{KIND_TEXT[a.module][a.kind]}</span>
                    </p>
                    <p className="truncate text-sm">
                      <Link href={m.href} className="font-medium text-secondary hover:underline">
                        {a.title}
                      </Link>
                      {a.description && <span className="text-muted-foreground"> · {a.description}</span>}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <Badge variant={a.kind === "created" ? "green" : "blue"}>{a.kind === "created" ? "Baru" : "Diperbarui"}</Badge>
                    <time className="text-xs text-muted-foreground" dateTime={a.at}>
                      {dtf.format(new Date(a.at))}
                    </time>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}