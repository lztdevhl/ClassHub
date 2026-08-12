import { Search } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { EmptyState, Feedback } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate, percent } from "@/lib/format";
import { prisma } from "@/lib/prisma";

type Params = { q?: string; status?: string; success?: string };

export default async function StudentsPage({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams; const q = params.q?.trim() ?? ""; const status = params.status ?? "all";
  const students = await prisma.student.findMany({ where: { name: q ? { contains: q, mode: "insensitive" } : undefined, status: status === "active" ? "ACTIVE" : status === "inactive" ? "INACTIVE" : undefined }, orderBy: { name: "asc" }, include: { lessons: { select: { lessonDate: true, attendanceStatus: true, activityCompleted: true } } } });
  return <div className="page-stack"><PageHeader title="Alunos" description="Acompanhe presença, pendências e histórico por aluno." actions={<><Button asChild variant="outline"><Link href="/alunos/importar">Importar planilha</Link></Button><Button asChild><Link href="/alunos/novo">Novo aluno</Link></Button></>} />
    <Feedback success={params.success} />
    <form className="filter-toolbar sm:grid-cols-[minmax(280px,1fr)_180px_auto]"><div className="relative"><Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" size={16} /><input name="q" defaultValue={q} placeholder="Pesquisar aluno" className="pl-9" /></div><select name="status" defaultValue={status} aria-label="Status"><option value="all">Todos</option><option value="active">Ativos</option><option value="inactive">Inativos</option></select><Button type="submit" variant="outline">Filtrar</Button></form>
    {students.length === 0 ? <EmptyState title="Nenhum aluno encontrado" description={q ? "Tente ajustar os filtros." : "Cadastre o primeiro aluno para começar."} /> : <div className="table-shell"><table className="data-table min-w-[920px]"><thead><tr><th>Nome</th><th>Aulas</th><th>Presenças</th><th>Faltas</th><th>Frequência</th><th>Pendências</th><th>Última aula</th><th>Status</th></tr></thead><tbody>{students.map((student) => { const present = student.lessons.filter((l) => l.attendanceStatus === "PRESENT").length; const pending = student.lessons.filter((l) => l.activityCompleted === false).length; const last = student.lessons.reduce<Date | null>((latest, l) => !latest || l.lessonDate > latest ? l.lessonDate : latest, null); return <tr key={student.id}><td className="primary-cell"><Link href={`/alunos/${student.id}`}>{student.name}</Link></td><td className="tabular-nums">{student.lessons.length}</td><td className="tabular-nums">{present}</td><td className="tabular-nums">{student.lessons.length - present}</td><td className="tabular-nums">{percent(present, student.lessons.length)}%</td><td className="tabular-nums">{pending}</td><td className="secondary-cell">{last ? formatDate(last) : "—"}</td><td><StatusBadge tone={student.status === "ACTIVE" ? "green" : "gray"}>{student.status === "ACTIVE" ? "Ativo" : "Inativo"}</StatusBadge></td></tr>; })}</tbody></table></div>}
  </div>;
}
