export function StatCard({ label, value, detail }: { label: string; value: string | number; detail?: string }) {
  return <div className="metric-cell"><p className="text-[12px] font-medium text-[var(--muted)]">{label}</p><p className="mt-2 text-[26px] font-semibold leading-none tracking-[-0.03em] tabular-nums text-[var(--foreground)]">{value}</p>{detail && <p className="mt-2 text-xs text-[var(--muted-foreground)]">{detail}</p>}</div>;
}
