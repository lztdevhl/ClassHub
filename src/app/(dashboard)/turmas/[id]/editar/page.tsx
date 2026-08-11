import { notFound } from "next/navigation";

import { updateClass } from "@/actions/class-actions";
import { ClassForm } from "@/components/classes/class-form";
import { Feedback } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";
import { prisma } from "@/lib/prisma";

export default async function EditClassPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) { const [{ id }, { error }] = await Promise.all([params, searchParams]); const group = await prisma.classGroup.findUnique({ where: { id } }); if (!group) notFound(); return <div className="mx-auto max-w-3xl"><PageHeader title={`Editar ${group.name}`} /><Feedback error={error} /><ClassForm action={updateClass.bind(null, id)} initial={group} submitLabel="Salvar alterações" /></div>; }
