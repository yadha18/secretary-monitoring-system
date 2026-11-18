import { FileText, Inbox, LayoutDashboard, ListChecks, Settings, type LucideIcon } from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon };

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/action-tracker", label: "Action Tracker", icon: ListChecks },
  { href: "/ams-documents", label: "Dokumen AMS", icon: FileText },
  { href: "/incoming-documents", label: "Dokumen Masuk", icon: Inbox },
  { href: "/settings", label: "Pengaturan", icon: Settings },
];
