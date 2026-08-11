"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;
export const SheetTitle = DialogPrimitive.Title;
export const SheetDescription = DialogPrimitive.Description;

export function SheetContent({ className, children, ...props }: ComponentProps<typeof DialogPrimitive.Content>) {
  return <DialogPrimitive.Portal><DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[var(--foreground)]/20" /><DialogPrimitive.Content aria-modal="true" className={cn("fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white p-4 shadow-[0_16px_40px_rgb(26_31_54/0.16)] focus:outline-none", className)} {...props}>{children}<DialogPrimitive.Close aria-label="Fechar menu" className="absolute right-3 top-3 rounded p-2 text-[var(--muted)] hover:bg-[var(--surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"><X aria-hidden="true" size={18} /></DialogPrimitive.Close></DialogPrimitive.Content></DialogPrimitive.Portal>;
}
