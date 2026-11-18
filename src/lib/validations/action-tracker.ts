import { z } from "zod";

import { ACTION_PROGRESS, ACTION_STATUSES, DEPARTMENTS, PRIORITIES } from "@/lib/constants";
import { dateStr, listQueryBase, requiredDate, requiredText } from "./common";

const progressSchema = z.union([z.literal(0), z.literal(50), z.literal(100)], {
  error: "Progress harus 0%, 50%, atau 100%.",
});

export const actionTrackerSchema = z
  .object({
    number: requiredText("No.", 50),
    meetingDate: requiredDate("Tanggal Rapat/Instruksi wajib diisi."),
    agenda: requiredText("Agenda/Kegiatan", 500),
    actionItem: requiredText("Action Item", 2000),
    pic: requiredText("PIC", 100).refine(
      (v) => !/[,;/&\n]|\s(dan|and)\s/i.test(v),
      "PIC hanya boleh satu orang."
    ),
    department: z.enum(DEPARTMENTS, { error: "Divisi/Unit wajib dipilih." }),
    priority: z.enum(PRIORITIES, { error: "Prioritas wajib dipilih." }),
    startDate: requiredDate("Tanggal Mulai wajib diisi."),
    deadline: requiredDate("Deadline wajib diisi."),
    status: z.enum(ACTION_STATUSES, { error: "Status wajib dipilih." }),
    progress: progressSchema,
  })
  .superRefine((v, ctx) => {
    if (v.startDate && v.deadline && v.deadline < v.startDate) {
      ctx.addIssue({ code: "custom", path: ["deadline"], message: "Deadline tidak boleh lebih awal dari Tanggal Mulai." });
    }
    if (v.status === "Done" && v.progress !== 100) {
      ctx.addIssue({ code: "custom", path: ["progress"], message: "Status Done harus memiliki progress 100%." });
    }
    if (v.status === "On Progress" && v.progress === 100) {
      ctx.addIssue({ code: "custom", path: ["progress"], message: "Status On Progress tidak boleh 100%." });
    }
  });

export type ActionTrackerInput = z.infer<typeof actionTrackerSchema>;
export type ActionTrackerFormValues = z.input<typeof actionTrackerSchema>;

export const actionTrackerListSchema = listQueryBase.extend({
  department: z.enum(DEPARTMENTS).optional(),
  priority: z.enum(PRIORITIES).optional(),
  status: z.enum(ACTION_STATUSES).optional(),
  progress: z.coerce
    .number()
    .refine((v) => (ACTION_PROGRESS as readonly number[]).includes(v))
    .optional(),
  deadlineFrom: dateStr.optional(),
  deadlineTo: dateStr.optional(),
  overdue: z.enum(["true"]).optional(),
});

export type ActionTrackerListQuery = z.infer<typeof actionTrackerListSchema>;
