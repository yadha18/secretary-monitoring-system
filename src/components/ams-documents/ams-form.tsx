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
import { FilePicker } from "@/components/shared/file-picker";
import { uploadAndAttach } from "@/lib/file-upload";
import { ApiError, apiFetch } from "@/lib/api-client";
import { AMS_DOC_TYPES, DOC_STATUSES, PRIORITIES } from "@/lib/constants";
import { amsDocumentSchema, type AmsDocumentFormValues } from "@/lib/validations/ams-document";
import type { AmsDocumentDto } from "@/types";

const EMPTY: AmsDocumentFormValues = {
  documentNumber: "",
  receivedDate: "",
  documentType: "" as never,
  priority: "Normal",
  documentDate: "",
  sender: "",
  recipient: "",
  cc: "",
  position: "",
  status: "Belum dimulai",
  needsFollowUp: "",
  followUpDescription: "",
  followUpDueDate: "",
  followUpStatus: "Belum dimulai",
};

type Props = { open: boolean; onOpenChange: (o: boolean) => void; item: AmsDocumentDto | null; onSaved: () => void };

export function AmsForm({ open, onOpenChange, item, onSaved }: Props) {
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<AmsDocumentFormValues>({ resolver: zodResolver(amsDocumentSchema), defaultValues: EMPTY });

  useEffect(() => {
    if (!open) return;
    setFile(null);
    setFileError(null);
    reset(
      item
        ? {
            documentNumber: item.documentNumber,
            receivedDate: item.receivedDate,
            documentType: item.documentType,
            priority: item.priority,
            documentDate: item.documentDate,
            sender: item.sender,
            recipient: item.recipient,
            cc: item.cc,
            position: item.position,
            status: item.status,
            needsFollowUp: item.needsFollowUp,
            followUpDescription: item.followUpDescription,
            followUpDueDate: item.followUpDueDate,
            followUpStatus: item.followUpStatus,
          }
        : EMPTY
    );
  }, [open, item, reset]);

  async function onSubmit(values: AmsDocumentFormValues) {
    setSaving(true);
    try {
      const res = await apiFetch<{ data: { id: string } }>(item ? `/api/ams-documents/${item.id}` : "/api/ams-documents", {
         method: item ? "PATCH" : "POST",
         json: values,
       });
      toast.success(item ? "Dokumen AMS diperbarui." : "Dokumen AMS ditambahkan.");
      if (file) {
        try {
          await uploadAndAttach("ams", res.data.id, file);
        } catch (err) {
          toast.warning(`Data tersimpan, tetapi file gagal diunggah: ${err instanceof Error ? err.message : "kesalahan"}. Unggah ulang dari halaman detail.`);
        }
      }
      onOpenChange(false);
      onSaved();
    } catch (err) {
      if (err instanceof ApiError && err.fields) {
        for (const [k, msg] of Object.entries(err.fields)) setError(k as keyof AmsDocumentFormValues, { message: msg });
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
      title={item ? "Edit Dokumen AMS" : "Tambah Dokumen AMS"}
      description="Field bertanda * wajib diisi. Hasil scan dapat diunggah di bagian bawah form."
      formId="ams-form"
      saving={saving}
    >
      <form id="ams-form" onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4 sm:grid-cols-2">
        <Field label="Nomor Dokumen" htmlFor="documentNumber" required error={errors.documentNumber?.message} className="sm:col-span-2">
          <Input id="documentNumber" {...register("documentNumber")} />
        </Field>
        <Field label="Tanggal Terima" htmlFor="receivedDate" required error={errors.receivedDate?.message}>
          <Input id="receivedDate" type="date" {...register("receivedDate")} />
        </Field>
        <Field label="Tanggal Dokumen" htmlFor="documentDate" error={errors.documentDate?.message}>
          <Input id="documentDate" type="date" {...register("documentDate")} />
        </Field>
        <Field label="Jenis Dokumen" htmlFor="documentType" required error={errors.documentType?.message}>
          <Select id="documentType" {...register("documentType")}>
            <Options values={AMS_DOC_TYPES} placeholder="Pilih jenis dokumen" />
          </Select>
        </Field>
        <Field label="Prioritas" htmlFor="priority" required error={errors.priority?.message}>
          <Select id="priority" {...register("priority")}>
            <Options values={PRIORITIES} />
          </Select>
        </Field>
        <Field label="Pengirim" htmlFor="sender" error={errors.sender?.message} hint="Satu alamat email." className="sm:col-span-2">
          <Input id="sender" type="email" {...register("sender")} />
        </Field>
        <Field label="Tujuan" htmlFor="recipient" error={errors.recipient?.message} hint="Boleh beberapa email, pisahkan dengan koma." className="sm:col-span-2">
          <Input id="recipient" {...register("recipient")} />
        </Field>
        <Field label="Tembusan" htmlFor="cc" error={errors.cc?.message} hint="Boleh beberapa email, pisahkan dengan koma." className="sm:col-span-2">
          <Input id="cc" {...register("cc")} />
        </Field>
        <Field label="Posisi" htmlFor="position" error={errors.position?.message}>
          <Input id="position" {...register("position")} />
        </Field>
        <Field label="Status" htmlFor="status" required error={errors.status?.message}>
          <Select id="status" {...register("status")}>
            <Options values={DOC_STATUSES} />
          </Select>
        </Field>

        <div className="sm:col-span-2 border-t pt-4 text-sm font-semibold text-primary">Tindak Lanjut</div>
        <Field label="Need Tindak Lanjut" htmlFor="needsFollowUp" error={errors.needsFollowUp?.message} className="sm:col-span-2">
          <Input id="needsFollowUp" {...register("needsFollowUp")} />
        </Field>
        <Field label="Keterangan Tindak Lanjut" htmlFor="followUpDescription" error={errors.followUpDescription?.message} className="sm:col-span-2">
          <Textarea id="followUpDescription" rows={3} {...register("followUpDescription")} />
        </Field>
        <Field label="Due Date Tindak Lanjut" htmlFor="followUpDueDate" error={errors.followUpDueDate?.message}>
          <Input id="followUpDueDate" type="date" {...register("followUpDueDate")} />
        </Field>
        <Field label="Status Tindak Lanjut" htmlFor="followUpStatus" required error={errors.followUpStatus?.message}>
          <Select id="followUpStatus" {...register("followUpStatus")}>
            <Options values={DOC_STATUSES} />
          </Select>
        </Field>
        <div className="space-y-1.5 sm:col-span-2">
          <span className="text-sm font-medium">Hasil Scan Dokumen</span>
          <FilePicker file={file} onChange={setFile} existingName={item?.file?.fileName} disabled={saving} error={fileError} onError={setFileError} />
        </div>
      </form>
    </FormSheet>
  );
}
