import { getCurrentUser } from "@/lib/auth/session";

export async function GET() { const user = await getCurrentUser(); if (!user) return new Response("Não autorizado", { status: 401 }); const csv = "nome,turma,email,telefone,observacoes,status\r\n"; return new Response(`\uFEFF${csv}`, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=edutrack-modelo-alunos.csv" } }); }
