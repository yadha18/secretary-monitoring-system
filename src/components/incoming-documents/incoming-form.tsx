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
import { FilePicker } from "../shared/file-picker";
import { uploadAndAttach } from "@/lib/file-upload";
import { ApiError, apiFetch } from "@/lib/api-client";
import { DOC_STATUSES, INCOMING_DOC_TYPES, PRIORITIES } from "@/lib/constants";
import { incomingDocumentSchema, type IncomingDocumentFormValues } from "@/lib/validations/incoming-document";
import type { IncomingDocumentDto } from "@/types";

const EMPTY: IncomingDocumentFormValues = {
  documentNumber: "",
  receivedDate: "",
  documentType: "" as never,
  documentDate: "",
  priority: "Normal",
  sender: "",
  subject: "",
  status: "Belum dimulai",
  submittedToVPDate: "",
  signedDate: "",
  notes: "",
};

type Props = { open: boolean; onOpenChange: (o: boolean) => void; item: IncomingDocumentDto | null; onSaved: () => void };

export function IncomingForm({ open, onOpenChange, item, onSaved }: Props) {
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<IncomingDocumentFormValues>({ resolver: zodResolver(incomingDocumentSchema), defaultValues: EMPTY });

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
            documentDate: item.documentDate,
            priority: item.priority,
            sender: item.sender,
            subject: item.subject,
            status: item.status,
            submittedToVPDate: item.submittedToVPDate,
            signedDate: item.signedDate,
            notes: item.notes,
          }
        : EMPTY
    );
  }, [open, item, reset]);

  async function onSubmit(values: IncomingDocumentFormValues) {
    setSaving(true);
    try {
      const res = await apiFetch<{ data: { id: string } }>(item ? `/api/incoming-documents/${item.id}` : "/api/incoming-documents", {
        method: item ? "PATCH" : "POST",
        json: values,
      });
      toast.success(item ? "Dokumen masuk diperbarui." : "Dokumen masuk ditambahkan.");
      if (file) {
        try {
          await uploadAndAttach("incoming", res.data.id, file);
        } catch (err) {
          toast.warning(`Data tersimpan, tetapi file gagal diunggah: ${err instanceof Error ? err.message : "kesalahan"}. Unggah ulang dari halaman detail.`);
        }
      }
      onOpenChange(false);
      onSaved();
    } catch (err) {
      if (err instanceof ApiError && err.fields) {
        for (const [k, msg] of Object.entries(err.fields)) setError(k as keyof IncomingDocumentFormValues, { message: msg });
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
      title={item ? "Edit Dokumen Masuk" : "Tambah Dokumen Masuk"}
      description="Field bertanda * wajib diisi. Upload scan tersedia pada Tahap 5."
      formId="incoming-form"
      saving={saving}
    >
      <form id="incoming-form" onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4 sm:grid-cols-2">
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
            <Options values={INCOMING_DOC_TYPES} placeholder="Pilih jenis dokumen" />
          </Select>
        </Field>
        <Field label="Prioritas" htmlFor="priority" required error={errors.priority?.message}>
          <Select id="priority" {...register("priority")}>
            <Options values={PRIORITIES} />
          </Select>
        </Field>
        <Field label="Pengirim" htmlFor="sender" error={errors.sender?.message} className="sm:col-span-2">
          <Input id="sender" {...register("sender")} />
        </Field>
        <Field label="Perihal" htmlFor="subject" error={errors.subject?.message} className="sm:col-span-2">
          <Textarea id="subject" rows={3} {...register("subject")} />
        </Field>
        <Field label="Status" htmlFor="status" required error={errors.status?.message} className="sm:col-span-2">
          <Select id="status" {...register("status")}>
            <Options values={DOC_STATUSES} />
          </Select>
        </Field>
        <Field label="Tanggal Naik ke VP" htmlFor="submittedToVPDate" error={errors.submittedToVPDate?.message} hint="Kosongkan bila belum naik ke VP.">
          <Input id="submittedToVPDate" type="date" {...register("submittedToVPDate")} />
        </Field>
        <Field label="Tanggal Tanda Tangan" htmlFor="signedDate" error={errors.signedDate?.message} hint="Kosongkan bila belum ditandatangani.">
          <Input id="signedDate" type="date" {...register("signedDate")} />
        </Field>
        <Field label="Catatan" htmlFor="notes" error={errors.notes?.message} className="sm:col-span-2">
          <Input id="notes" {...register("notes")} />
        </Field>
        <div className="space-y-1.5 sm:col-span-2">
          <span className="text-sm font-medium">Scan Dokumen</span>
          <FilePicker file={file} onChange={setFile} existingName={item?.file?.fileName} disabled={saving} error={fileError} onError={setFileError} />
        </div>
      </form>
    </FormSheet>
  );
}
