import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

import { Toaster } from "sonner";

import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Secretary Monitoring System",
  description: "Sistem pencatatan dan monitoring administrasi sekretaris",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={cn(GeistSans.variable, GeistMono.variable, "font-sans", geist.variable)}>
      <body className="min-h-screen font-sans">{children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
