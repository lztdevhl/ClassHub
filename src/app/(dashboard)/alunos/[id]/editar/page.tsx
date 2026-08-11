import { notFound } from "next/navigation";

import { updateStudent } from "@/actions/student-actions";
import { StudentForm } from "@/components/students/student-form";
import { Feedback } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";
import { prisma } from "@/lib/prisma";

export default async function EditStudentPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) { const [{ id }, { error }] = await Promise.all([params, searchParams]); const [student, classes] = await Promise.all([prisma.student.findUnique({ where: { id } }), prisma.classGroup.findMany({ where: { OR: [{ status: "ACTIVE" }, { students: { some: { id } } }] }, orderBy: { name: "asc" }, select: { id: true, name: true } })]); if (!student) notFound(); return <div className="mx-auto max-w-3xl"><PageHeader title={`Editar ${student.name}`} /><Feedback error={error} /><StudentForm action={updateStudent.bind(null, id)} classes={classes} submitLabel="Salvar alterações" initial={{ name: student.name, email: student.email ?? "", phone: student.phone ?? "", generalNotes: student.generalNotes ?? "", status: student.status, classId: student.classId ?? "" }} /></div>; }
