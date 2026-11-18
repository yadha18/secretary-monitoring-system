"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { DialogOverlay } from "./dialog";

const Sheet = DialogPrimitive.Root;

function SheetContent({
  className,
  children,
  title,
  description,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & { title: string; description?: string }) {
  return (
    <DialogPrimitive.Portal>
      <DialogOverlay />
      <DialogPrimitive.Content
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-card shadow-xl sm:max-w-xl",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right",
          className
        )}
        {...props}
      >
        <div className="flex items-start justify-between gap-4 border-b px-6 py-4">
          <div>
            <DialogPrimitive.Title className="text-lg font-semibold text-primary">{title}</DialogPrimitive.Title>
            <DialogPrimitive.Description className="text-sm text-muted-foreground">
              {description ?? " "}
            </DialogPrimitive.Description>
          </div>
          <DialogPrimitive.Close className="rounded-sm opacity-70 hover:opacity-100" aria-label="Tutup">
            <X className="size-5" />
          </DialogPrimitive.Close>
        </div>
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export { Sheet, SheetContent };
