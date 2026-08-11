import { cn } from "@/lib/utils";

export function StatusBadge({ tone, children }: { tone: "green" | "red" | "amber" | "gray"; children: React.ReactNode }) {
  return <span className={cn("inline-flex h-5 items-center rounded-full px-2 text-[11px] font-medium leading-none", tone === "green" && "bg-[var(--success-soft)] text-[var(--success)]", tone === "red" && "bg-[var(--danger-soft)] text-[var(--danger)]", tone === "amber" && "bg-[var(--warning-soft)] text-[var(--warning)]", tone === "gray" && "bg-[var(--surface-subtle)] text-[var(--muted)]")}>{children}</span>;
}
