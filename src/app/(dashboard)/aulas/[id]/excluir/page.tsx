import Link from "next/link";
import { notFound } from "next/navigation";

import { deleteLesson } from "@/actions/lesson-actions";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export default async function DeleteLessonPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; const lesson = await prisma.lesson.findUnique({ where: { id }, include: { student: { select: { name: true, id: true } } } }); if (!lesson) notFound(); return <div className="mx-auto max-w-xl"><PageHeader eyebrow="Confirmação" title="Excluir aula?" description={`Aula de ${lesson.student.name}, registrada em ${formatDate(lesson.lessonDate)}. Esta ação não pode ser desfeita.`} /><div className="mt-6 flex justify-end gap-3 border border-red-200 bg-red-50 p-5"><Button asChild variant="outline"><Link href={`/alunos/${lesson.student.id}`}>Cancelar</Link></Button><form action={deleteLesson.bind(null, id)}><input type="hidden" name="confirmed" value="yes" /><Button type="submit">Confirmar exclusão</Button></form></div></div>; }
