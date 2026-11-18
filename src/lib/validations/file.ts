import { z } from "zod";

import { FILE_MODULES } from "@/lib/file-rules";
import { idParam } from "./common";

export const attachFileSchema = z.object({
  pathname: z.string().min(1).max(500),
  fileName: z.string().trim().min(1, "Nama file wajib ada.").max(255),
});

export const fileQuerySchema = z.object({
  module: z.enum(FILE_MODULES),
  id: idParam,
  disposition: z.enum(["inline", "attachment"]).default("inline"),
});
