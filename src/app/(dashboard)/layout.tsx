import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { auth } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login"); // lapis kedua selain proxy

  return <AppShell user={{ name: session.user.name, email: session.user.email }}>{children}</AppShell>;
}
