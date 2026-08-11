export function Feedback({ success, error }: { success?: string; error?: string }) {
  if (!success && !error) return null;
  return <div role="status" className={`rounded-md border px-4 py-3 text-sm ${error ? "border-[var(--danger)]/15 bg-[var(--danger-soft)] text-[var(--danger)]" : "border-[var(--success)]/15 bg-[var(--success-soft)] text-[var(--success)]"}`}>{error ?? success}</div>;
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return <div className="border-y border-[var(--border-subtle)] bg-white px-5 py-12 text-center"><h2 className="text-sm font-semibold text-[var(--foreground)]">{title}</h2><p className="mt-1.5 text-sm text-[var(--muted)]">{description}</p></div>;
}
