import { createClass } from "@/actions/class-actions";
import { ClassForm } from "@/components/classes/class-form";
import { Feedback } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";

export default async function NewClassPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) { const { error } = await searchParams; return <div className="mx-auto max-w-3xl"><PageHeader title="Nova turma" description="Crie uma turma para organizar alunos e registros." /><Feedback error={error} /><ClassForm action={createClass} /></div>; }
