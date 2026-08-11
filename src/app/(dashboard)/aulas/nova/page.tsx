import { UserRound, UsersRound } from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/ui/page-header";

export default async function NewLessonChoicePage({ searchParams }: { searchParams: Promise<{ studentId?: string }> }) { const { studentId } = await searchParams; return <div className="mx-auto max-w-3xl page-stack"><PageHeader title="Registrar aula" description="Escolha como deseja criar os registros." /><div className="grid gap-4 sm:grid-cols-2"><Link href={`/aulas/nova/individual${studentId ? `?studentId=${studentId}` : ""}`} className="flat-card group p-6 hover:border-[var(--primary-light)]"><UserRound className="text-[var(--primary)]" size={22} /><h2 className="mt-4 text-lg font-semibold">Individual</h2><p className="mt-1 text-sm text-[var(--muted)]">Registre uma aula para um aluno.</p></Link><Link href="/aulas/nova/turma" className="flat-card group p-6 hover:border-[var(--primary-light)]"><UsersRound className="text-[var(--primary)]" size={22} /><h2 className="mt-4 text-lg font-semibold">Por turma</h2><p className="mt-1 text-sm text-[var(--muted)]">Registre a aula para vários alunos da mesma turma.</p></Link></div></div>; }
