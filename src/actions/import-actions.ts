"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { parseStudentSpreadsheet, type ImportedStudentRow } from "@/lib/student-import";

export type ImportPreviewState = { status: "idle" | "error" | "preview" | "success"; message?: string; rows?: Array<ImportedStudentRow & { classId?: string; issue?: string; valid: boolean }>; newClasses?: string[] };
const confirmedRowsSchema = z.array(z.object({ row: z.number().int().positive(), name: z.string().trim().min(2).max(150), className: z.string().trim().max(120), email: z.union([z.literal(""), z.string().trim().email().max(254)]), phone: z.string().trim().max(30), generalNotes: z.string().trim().max(5000), status: z.enum(["ACTIVE", "INACTIVE"]) })).max(500);

export async function previewStudentImport(_: ImportPreviewState, formData: FormData): Promise<ImportPreviewState> {
  await requireCurrentUser();
  const file = formData.get("file");
  if (!(file instanceof File)) return { status: "error", message: "Selecione uma planilha." };
  const parsed = await parseStudentSpreadsheet(file);
  if (!parsed.rows.length) return { status: "error", message: parsed.errors.join(" ") };
  const [classes, students] = await Promise.all([prisma.classGroup.findMany({ select: { id: true, name: true } }), prisma.student.findMany({ select: { name: true, email: true } })]);
  const classMap = new Map(classes.map((group) => [group.name.toLocaleLowerCase("pt-BR"), group]));
  const emails = new Set(students.flatMap((student) => student.email ? [student.email.toLowerCase()] : []));
  const names = new Set(students.map((student) => student.name.toLocaleLowerCase("pt-BR")));
  const newClasses = new Set<string>();
  const rows = parsed.rows.map((row) => { const group = row.className ? classMap.get(row.className.toLocaleLowerCase("pt-BR")) : undefined; if (row.className && !group) newClasses.add(row.className); const normalizedName = row.name.toLocaleLowerCase("pt-BR"); const duplicate = row.email ? emails.has(row.email) : names.has(normalizedName); if (!duplicate) { names.add(normalizedName); if (row.email) emails.add(row.email); } return { ...row, classId: group?.id, valid: !duplicate, issue: duplicate ? "Possível duplicidade; este registro será ignorado." : row.className && !group ? `Turma ${row.className} não encontrada.` : undefined }; });
  return { status: "preview", message: parsed.errors.length ? parsed.errors.join(" ") : undefined, rows, newClasses: [...newClasses] };
}

export async function confirmStudentImport(_: ImportPreviewState, formData: FormData): Promise<ImportPreviewState> {
  await requireCurrentUser();
  let rawRows: unknown;
  try { rawRows = JSON.parse(String(formData.get("rows"))); } catch { return { status: "error", message: "A prévia expirou. Envie a planilha novamente." }; }
  const validated = confirmedRowsSchema.safeParse(rawRows);
  if (!validated.success) return { status: "error", message: "A prévia contém dados inválidos. Envie a planilha novamente." };
  const rows: ImportedStudentRow[] = validated.data;
  const createClasses = formData.get("createClasses") === "yes";
  const result = await prisma.$transaction(async (tx) => {
    const [classes, existing] = await Promise.all([tx.classGroup.findMany(), tx.student.findMany({ select: { name: true, email: true } })]);
    const classMap = new Map(classes.map((group) => [group.name.toLocaleLowerCase("pt-BR"), group.id]));
    const missingNames = [...new Set(rows.map((row) => row.className).filter((name) => name && !classMap.has(name.toLocaleLowerCase("pt-BR"))))];
    if (missingNames.length && !createClasses) return { imported: 0, skipped: rows.length, missing: true };
    for (const name of missingNames) { const group = await tx.classGroup.create({ data: { name } }); classMap.set(name.toLocaleLowerCase("pt-BR"), group.id); }
    const emails = new Set(existing.flatMap((student) => student.email ? [student.email.toLowerCase()] : [])); const names = new Set(existing.map((student) => student.name.toLocaleLowerCase("pt-BR")));
    const safe = rows.filter((row) => row.name?.trim().length >= 2 && !(row.email ? emails.has(row.email.toLowerCase()) : names.has(row.name.toLocaleLowerCase("pt-BR"))));
    if (safe.length) await tx.student.createMany({ data: safe.map((row) => ({ name: row.name.trim(), email: row.email || null, phone: row.phone || null, generalNotes: row.generalNotes || null, status: row.status, classId: row.className ? classMap.get(row.className.toLocaleLowerCase("pt-BR")) : null })) });
    return { imported: safe.length, skipped: rows.length - safe.length, missing: false };
  });
  if (result.missing) return { status: "error", message: "Existem turmas não cadastradas. Confirme a criação delas para continuar." };
  revalidatePath("/alunos"); revalidatePath("/turmas"); revalidatePath("/dashboard");
  return { status: "success", message: `${result.imported} alunos importados. ${result.skipped ? `${result.skipped} registros ignorados por segurança.` : ""}` };
}
