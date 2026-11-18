"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { FormSheet } from "@/components/shared/form-sheet";
import { Field, Options } from "@/components/shared/form-fields";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ApiError, apiFetch } from "@/lib/api-client";
import { ACTION_PROGRESS, ACTION_STATUSES, DEPARTMENTS, PRIORITIES } from "@/lib/constants";
import { actionTrackerSchema, type ActionTrackerFormValues } from "@/lib/validations/action-tracker";
import type { ActionTrackerDto } from "@/types";

const EMPTY: ActionTrackerFormValues = {
  number: "",
  meetingDate: "",
  agenda: "",
  actionItem: "",
  pic: "",
  department: "" as never,
  priority: "Normal",
  startDate: "",
  deadline: "",
  status: "On Progress",
  progress: 0,
};

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  item: ActionTrackerDto | null;
  onSaved: () => void;
};

export function ActionTrackerForm({ open, onOpenChange, item, onSaved }: Props) {
  const [saving, setSaving] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ActionTrackerFormValues>({ resolver: zodResolver(actionTrackerSchema), defaultValues: EMPTY });

  useEffect(() => {
    if (!open) return;
    reset(
      item
        ? {
            number: item.number,
            meetingDate: item.meetingDate,
            agenda: item.agenda,
            actionItem: item.actionItem,
            pic: item.pic,
            department: item.department,
            priority: item.priority,
            startDate: item.startDate,
            deadline: item.deadline,
            status: item.status,
            progress: item.progress,
          }
        : EMPTY
    );
  }, [open, item, reset]);

  // Jaga konsistensi status ↔ progress saat user mengubah salah satunya.
  const status = watch("status");
  function onStatusChange(next: string) {
    if (next === "Done") setValue("progress", 100, { shouldValidate: true });
    else if (Number(watch("progress")) === 100) setValue("progress", 50, { shouldValidate: true });
  }

  async function onSubmit(values: ActionTrackerFormValues) {
    setSaving(true);
    try {
      await apiFetch(item ? `/api/action-trackers/${item.id}` : "/api/action-trackers", {
        method: item ? "PATCH" : "POST",
        json: values,
      });
      toast.success(item ? "Action Item diperbarui." : "Action Item ditambahkan.");
      onOpenChange(false);
      onSaved();
    } catch (err) {
      if (err instanceof ApiError && err.fields) {
        for (const [k, msg] of Object.entries(err.fields)) setError(k as keyof ActionTrackerFormValues, { message: msg });
      }
      toast.error(err instanceof ApiError ? err.message : "Gagal menyimpan data.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={item ? "Edit Action Item" : "Tambah Action Item"}
      description="Field bertanda * wajib diisi."
      formId="action-tracker-form"
      saving={saving}
    >
      <form id="action-tracker-form" onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4 sm:grid-cols-2">
        <Field label="No." htmlFor="number" required error={errors.number?.message} hint="Nomor unik, input manual.">
          <Input id="number" {...register("number")} />
        </Field>
        <Field label="Tanggal Rapat/Instruksi" htmlFor="meetingDate" required error={errors.meetingDate?.message}>
          <Input id="meetingDate" type="date" {...register("meetingDate")} />
        </Field>
        <Field label="Agenda/Kegiatan" htmlFor="agenda" required error={errors.agenda?.message} className="sm:col-span-2">
          <Input id="agenda" {...register("agenda")} />
        </Field>
        <Field label="Action Item / Tindak Lanjut" htmlFor="actionItem" required error={errors.actionItem?.message} className="sm:col-span-2">
          <Textarea id="actionItem" rows={3} {...register("actionItem")} />
        </Field>
        <Field label="PIC" htmlFor="pic" required error={errors.pic?.message} hint="Satu orang penanggung jawab.">
          <Input id="pic" {...register("pic")} />
        </Field>
        <Field label="Divisi/Unit" htmlFor="department" required error={errors.department?.message}>
          <Select id="department" {...register("department")}>
            <Options values={DEPARTMENTS} placeholder="Pilih divisi/unit" />
          </Select>
        </Field>
        <Field label="Prioritas" htmlFor="priority" required error={errors.priority?.message}>
          <Select id="priority" {...register("priority")}>
            <Options values={PRIORITIES} />
          </Select>
        </Field>
        <div />
        <Field label="Tanggal Mulai" htmlFor="startDate" required error={errors.startDate?.message}>
          <Input id="startDate" type="date" {...register("startDate")} />
        </Field>
        <Field label="Deadline" htmlFor="deadline" required error={errors.deadline?.message}>
          <Input id="deadline" type="date" {...register("deadline")} />
        </Field>
        <Field label="Status" htmlFor="status" required error={errors.status?.message}>
          <Select id="status" {...register("status", { onChange: (e) => onStatusChange(e.target.value) })}>
            <Options values={ACTION_STATUSES} />
          </Select>
        </Field>
        <Field label="Progress (%)" htmlFor="progress" required error={errors.progress?.message}>
          <Select id="progress" {...register("progress", { setValueAs: (v) => Number(v) })} disabled={status === "Done"}>
            <Options values={ACTION_PROGRESS} />
          </Select>
        </Field>
      </form>
    </FormSheet>
  );
}
