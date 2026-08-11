import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-3.5 text-sm font-medium transition-[background-color,border-color,color,box-shadow,transform] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-light)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:translate-y-px",
  { variants: { variant: { default: "bg-[var(--primary)] text-white shadow-[0_1px_2px_rgb(12_33_255/0.12)] hover:bg-[var(--primary-hover)] active:bg-[var(--primary-active)]", outline: "border border-[var(--border-strong)] bg-white text-[var(--foreground)] hover:border-[var(--primary-light)] hover:bg-[var(--surface-blue-soft)]", ghost: "text-[var(--muted)] hover:bg-[var(--surface-blue-soft)] hover:text-[var(--primary)]" } }, defaultVariants: { variant: "default" } },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants> & { asChild?: boolean };

export function Button({ asChild = false, className, variant, type = "button", ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant }), className)} {...(!asChild && { type })} {...props} />;
}

export { buttonVariants };
