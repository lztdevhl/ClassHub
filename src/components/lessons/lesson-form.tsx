"use client";

import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";

type Values = { studentId: string; lessonDate: string; attendanceStatus: "PRESENT" | "ABSENT"; content: string; activity: string; activityCompleted: "true" | "false"; notes: string; nextSteps: string };
type StudentOption = { id: string; name: string };

export function LessonForm({ action, students, initial, submitLabel = "Salvar aula" }: { action: (data: FormData) => Promise<void>; students: StudentOption[]; initial?: Partial<Values>; submitLabel?: string }) {
  const today = new Date().toISOString().slice(0, 10);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({ defaultValues: { studentId: "", lessonDate: today, attendanceStatus: "PRESENT", content: "", activity: "", activityCompleted: "false", notes: "", nextSteps: "", ...initial } });
  const field = "mt-1 block w-full border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";
  return <form onSubmit={handleSubmit(async (values) => { const data = new FormData(); Object.entries(values).forEach(([key, value]) => data.set(key, value)); await action(data); })} className="mt-6 space-y-5">
    <div className="grid gap-5 sm:grid-cols-2"><div><label className="text-sm font-medium" htmlFor="studentId">Aluno</label><select id="studentId" {...register("studentId", { required: "Selecione um aluno." })} className={`${field} h-10 py-0`}><option value="">Selecione...</option>{students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>{errors.studentId && <p className="mt-1 text-xs text-red-700">{errors.studentId.message}</p>}</div><div><label className="text-sm font-medium" htmlFor="lessonDate">Data da aula</label><input id="lessonDate" type="date" {...register("lessonDate", { required: "Informe a data da aula." })} className={`${field} h-10 py-0`} /></div></div>
    <div className="grid gap-5 sm:grid-cols-2"><div><label className="text-sm font-medium" htmlFor="attendanceStatus">Presença</label><select id="attendanceStatus" {...register("attendanceStatus")} className={`${field} h-10 py-0`}><option value="PRESENT">Presente</option><option value="ABSENT">Falta</option></select></div><div><label className="text-sm font-medium" htmlFor="activityCompleted">Status da atividade</label><select id="activityCompleted" {...register("activityCompleted")} className={`${field} h-10 py-0`}><option value="false">Pendente</option><option value="true">Concluída</option></select></div></div>
    <div><label className="text-sm font-medium" htmlFor="content">Conteúdo trabalhado</label><textarea id="content" rows={3} {...register("content")} placeholder="Simple Present, revisão de vocabulário..." className={field} /></div>
    <div><label className="text-sm font-medium" htmlFor="activity">Atividade realizada</label><textarea id="activity" rows={3} {...register("activity")} placeholder="Exercícios das páginas 20 a 22." className={field} /></div>
    <div className="grid gap-5 sm:grid-cols-2"><div><label className="text-sm font-medium" htmlFor="notes">Observações</label><textarea id="notes" rows={4} {...register("notes")} className={field} /></div><div><label className="text-sm font-medium" htmlFor="nextSteps">Próximos passos</label><textarea id="nextSteps" rows={4} {...register("nextSteps")} className={field} /></div></div>
    <div className="flex justify-end border-t border-zinc-200 pt-5"><Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Salvando..." : submitLabel}</Button></div>
  </form>;
}
