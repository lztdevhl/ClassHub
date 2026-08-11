"use client";

import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";

type Values = { name: string; email: string; phone: string; generalNotes: string; status: "ACTIVE" | "INACTIVE"; classId: string };
type ClassOption = { id: string; name: string };

export function StudentForm({ action, classes = [], initial, submitLabel = "Salvar aluno" }: { action: (data: FormData) => Promise<void>; classes?: ClassOption[]; initial?: Partial<Values>; submitLabel?: string }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({ defaultValues: { status: "ACTIVE", name: "", email: "", phone: "", generalNotes: "", classId: "", ...initial } });
  const field = "mt-1 block h-10 w-full border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";
  return <form onSubmit={handleSubmit(async (values) => { const data = new FormData(); Object.entries(values).forEach(([key, value]) => data.set(key, value)); await action(data); })} className="mt-6 space-y-5">
    <div><label className="field-label" htmlFor="name">Nome completo</label><input id="name" {...register("name", { required: "Nome é obrigatório.", minLength: { value: 2, message: "Informe ao menos 2 caracteres." } })} className={field} />{errors.name && <p className="mt-1 text-xs text-red-700">{errors.name.message}</p>}</div>
    <div><label className="field-label" htmlFor="classId">Turma <span className="text-[var(--muted-foreground)]">(opcional)</span></label><select id="classId" {...register("classId")} className={field}><option value="">Sem turma</option>{classes.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}</select></div>
    <div className="grid gap-5 sm:grid-cols-2"><div><label className="field-label" htmlFor="email">Email <span className="text-[var(--muted-foreground)]">(opcional)</span></label><input id="email" type="email" {...register("email")} className={field} /></div><div><label className="field-label" htmlFor="phone">Telefone <span className="text-[var(--muted-foreground)]">(opcional)</span></label><input id="phone" {...register("phone")} className={field} /></div></div>
    <div><label className="field-label" htmlFor="generalNotes">Observações gerais</label><textarea id="generalNotes" rows={5} {...register("generalNotes")} className="mt-1 block w-full border border-zinc-300 bg-white px-3 py-2 text-sm" /></div>
    <div><label className="field-label" htmlFor="status">Status</label><select id="status" {...register("status")} className={`${field} sm:w-56`}><option value="ACTIVE">Ativo</option><option value="INACTIVE">Inativo</option></select></div>
    <div className="flex justify-end border-t border-zinc-200 pt-5"><Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Salvando..." : submitLabel}</Button></div>
  </form>;
}
