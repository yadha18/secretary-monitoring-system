"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";

function safeCallback(raw: string | null): string {
  if (!raw) return "/dashboard";
  try {
    const url = new URL(raw, window.location.origin);
    if (url.origin !== window.location.origin || url.pathname === "/login") return "/dashboard";
    return url.pathname + url.search;
  } catch {
    return "/dashboard";
  }
}

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginInput) {
    setFormError(null);
    const res = await signIn("credentials", { ...values, redirect: false });

    if (!res || res.error) {
      setFormError(
        res?.code === "rate_limited"
          ? "Terlalu banyak percobaan login. Coba lagi dalam 15 menit."
          : res?.error === "Configuration"
            ? "Terjadi kesalahan server. Periksa AUTH_SECRET dan konfigurasi admin."
            : "Email atau password salah."
      );
      return;
    }

    // Hanya izinkan redirect ke path internal.
    const target = safeCallback(params.get("callbackUrl"));
    router.replace(target);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <Input id="email" type="email" autoComplete="username" placeholder="nama@perusahaan.co.id" {...register("email")} />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <Input id="password" type="password" autoComplete="current-password" {...register("password")} />
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>

      {formError && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-destructive">
          {formError}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="animate-spin" />}
        {isSubmitting ? "Memproses..." : "Masuk"}
      </Button>
    </form>
  );
}
