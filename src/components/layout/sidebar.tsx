"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { ClipboardList, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./nav-items";

type Props = { user: { name?: string | null; email?: string | null }; onNavigate?: () => void };

export function SidebarContent({ user, onNavigate }: Props) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-primary text-primary-foreground">
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-white/15">
          <ClipboardList className="size-5" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold">Secretary</p>
          <p className="text-xs text-white/70">Monitoring System</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active ? "bg-white/15 font-medium" : "text-white/80 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-white/15 p-4">
        <div className="min-w-0 text-sm">
          <p className="truncate font-medium">{user.name}</p>
          <p className="truncate text-xs text-white/70">{user.email}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-white hover:bg-white/10 hover:text-white"
          onClick={() => signOut({ redirectTo: "/login" })}
        >
          <LogOut /> Keluar
        </Button>
      </div>
    </div>
  );
}
