"use client";

import Link from "next/link";
import { useActionState } from "react";

import { confirmStudentImport, previewStudentImport, type ImportPreviewState } from "@/actions/import-actions";
import { Button } from "@/components/ui/button";

const initial: ImportPreviewState = { status: "idle" };

export function StudentImport() {
  const [preview, previewAction, previewPending] = useActionState(previewStudentImport, initial);
  const [result, confirmAction, confirmPending] = useActionState(confirmStudentImport, initial);
  const validRows = preview.rows?.filter((row) => row.valid) ?? [];
  const serializedRows = validRows.map((row) => ({ row: row.row, name: row.name, className: row.className, email: row.email, phone: row.phone, generalNotes: row.generalNotes, status: row.status }));
  return <div className="space-y-6">
    <form action={previewAction} className="settings-card space-y-4"><div><label htmlFor="file" className="field-label">Arquivo .xlsx ou .csv</label><input id="file" name="file" type="file" required accept=".xlsx,.csv" className="mt-1.5 block w-full px-3 py-2" /></div><div className="flex flex-wrap gap-2"><Button type="submit" disabled={previewPending}>{previewPending ? "Validando..." : "Validar planilha"}</Button><Button asChild variant="outline"><Link href="/alunos/importar/modelo">Baixar modelo</Link></Button></div></form>
    {preview.status === "error" && <p role="alert" className="text-sm text-[var(--danger)]">{preview.message}</p>}
    {result.message && <p role="status" className={`text-sm ${result.status === "success" ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>{result.message}</p>}
    {preview.status === "preview" && <section className="space-y-4"><div><h2 className="section-heading">Prévia</h2><p className="text-sm text-[var(--muted)]">{validRows.length} alunos válidos · {(preview.rows?.length ?? 0) - validRows.length} registros com atenção</p>{preview.message && <p className="mt-1 text-sm text-[var(--warning)]">{preview.message}</p>}</div><div className="table-shell"><table className="data-table"><thead><tr><th>Linha</th><th>Nome</th><th>Turma</th><th>Status</th></tr></thead><tbody>{preview.rows?.map((row) => <tr key={row.row}><td>{row.row}</td><td className="primary-cell">{row.name}</td><td>{row.className || "—"}</td><td className={row.valid ? "text-[var(--success)]" : "text-[var(--warning)]"}>{row.issue || "Válido"}</td></tr>)}</tbody></table></div><form action={confirmAction} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><input type="hidden" name="rows" value={JSON.stringify(serializedRows)} />{Boolean(preview.newClasses?.length) ? <label className="flex items-start gap-2 text-sm"><input type="checkbox" name="createClasses" value="yes" className="mt-1" /><span>Criar durante a importação: <strong>{preview.newClasses?.join(", ")}</strong></span></label> : <span />}<Button type="submit" disabled={confirmPending || validRows.length === 0}>{confirmPending ? "Importando..." : `Importar ${validRows.length} alunos`}</Button></form></section>}
  </div>;
}
