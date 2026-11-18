import type { USER_ROLES } from "@/lib/constants";

type Role = (typeof USER_ROLES)[number];

export type Resource = "action_tracker" | "ams_document" | "incoming_document" | "user" | "dashboard";
export type Verb = "read" | "create" | "update" | "delete" | "export";
export type Action = `${Resource}:${Verb}`;

/**
 * Peta role → izin. Versi awal hanya Administrator (akses penuh).
 * Untuk menambah role baru: tambahkan di USER_ROLES dan entri di sini.
 */
const PERMISSIONS: Record<Role, "*" | readonly Action[]> = {
  admin: "*",
};

export function can(role: Role, action: Action): boolean {
  const granted = PERMISSIONS[role];
  return granted === "*" || granted.includes(action);
}
