import { z } from "zod";

import { MAX_CUSTOM_DAYS, DASHBOARD_RANGES } from "@/lib/date-range";
import { dateStr } from "./common";

export const dashboardQuerySchema = z
  .object({
    range: z.enum(DASHBOARD_RANGES).default("month"),
    from: dateStr.optional(),
    to: dateStr.optional(),
  })
  .superRefine((v, ctx) => {
    if (v.range !== "custom") return;
    if (!v.from) ctx.addIssue({ code: "custom", path: ["from"], message: "Tanggal awal wajib diisi." });
    if (!v.to) ctx.addIssue({ code: "custom", path: ["to"], message: "Tanggal akhir wajib diisi." });
    if (v.from && v.to) {
      if (v.from > v.to) ctx.addIssue({ code: "custom", path: ["to"], message: "Tanggal akhir tidak boleh sebelum tanggal awal." });
      else if ((Date.parse(v.to) - Date.parse(v.from)) / 86_400_000 > MAX_CUSTOM_DAYS) {
        ctx.addIssue({ code: "custom", path: ["to"], message: "Rentang kustom maksimal 5 tahun." });
      }
    }
  });

export type DashboardQuery = z.infer<typeof dashboardQuerySchema>;