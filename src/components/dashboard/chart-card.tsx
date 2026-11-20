"use client";

import { useState } from "react";
import { BarChart3, Table2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type TableView = { columns: string[]; rows: (string | number)[][] };

/** Kartu grafik: judul, grafik, dan tombol "Tabel" sebagai alternatif non-visual. */
export function ChartCard({
  title,
  description,
  table,
  empty,
  className,
  children,
}: {
  title: string;
  description?: string;
  table?: TableView;
  empty?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const [showTable, setShowTable] = useState(false);

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader className="flex-row items-start justify-between gap-2 pb-3">
        <div className="space-y-1">
          <CardTitle className="text-sm">{title}</CardTitle>
          {description && <CardDescription className="text-xs">{description}</CardDescription>}
        </div>
        {table && !empty && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 shrink-0 px-2 text-xs"
            onClick={() => setShowTable((v) => !v)}
            aria-pressed={showTable}
          >
            {showTable ? <BarChart3 /> : <Table2 />} {showTable ? "Grafik" : "Tabel"}
          </Button>
        )}
      </CardHeader>
      <CardContent className="flex-1">
        {empty ? (
          <div className="flex h-48 items-center justify-center text-center text-sm text-muted-foreground">
            Belum ada data pada periode ini.
          </div>
        ) : showTable && table ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  {table.columns.map((c) => (
                    <th key={c} scope="col" className="py-1.5 pr-3 font-medium">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((r, i) => (
                  <tr key={i} className="border-b last:border-0">
                    {r.map((v, j) => (
                      <td key={j} className="py-1.5 pr-3">
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}