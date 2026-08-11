"use client";

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownMenuGroup = DropdownMenuPrimitive.Group;
export const DropdownMenuLabel = DropdownMenuPrimitive.Label;
export const DropdownMenuSeparator = DropdownMenuPrimitive.Separator;

export function DropdownMenuContent({ className, sideOffset = 8, ...props }: ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return <DropdownMenuPrimitive.Portal><DropdownMenuPrimitive.Content sideOffset={sideOffset} className={cn("dropdown-content z-50 min-w-52 rounded-xl border border-[var(--border)] bg-white p-1.5 shadow-[0_10px_30px_rgb(15_23_42/0.12)] focus:outline-none", className)} {...props} /></DropdownMenuPrimitive.Portal>;
}

export function DropdownMenuItem({ className, ...props }: ComponentProps<typeof DropdownMenuPrimitive.Item>) {
  return <DropdownMenuPrimitive.Item className={cn("flex cursor-default select-none items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--muted)] outline-none transition-colors duration-150 ease-out data-[highlighted]:bg-[var(--surface-blue-soft)] data-[highlighted]:text-[var(--foreground)] data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className)} {...props} />;
}
