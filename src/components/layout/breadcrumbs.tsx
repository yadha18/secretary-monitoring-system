"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

import { NAV_ITEMS } from "./nav-items";

export function Breadcrumbs() {
  const pathname = usePathname();
  const current = NAV_ITEMS.find((i) => pathname === i.href || pathname.startsWith(`${i.href}/`));
  const isDetail = current && pathname !== current.href;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <Link href="/dashboard" className="hover:text-foreground" aria-label="Beranda">
        <Home className="size-4" />
      </Link>
      {current && (
        <>
          <ChevronRight className="size-4" />
          {isDetail ? (
            <Link href={current.href} className="hover:text-foreground">
              {current.label}
            </Link>
          ) : (
            <span className="font-medium text-foreground">{current.label}</span>
          )}
        </>
      )}
      {isDetail && (
        <>
          <ChevronRight className="size-4" />
          <span className="font-medium text-foreground">Detail</span>
        </>
      )}
    </nav>
  );
}
