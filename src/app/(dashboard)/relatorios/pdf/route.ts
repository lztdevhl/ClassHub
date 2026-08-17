import { getCurrentUser } from "@/lib/auth/session";
import { formatDate } from "@/lib/format";
import { getReportData, type ReportParams } from "@/lib/reporting";
import { SimplePdf } from "@/lib/simple-pdf";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return new Response("Não autorizado", { status: 401 });

  const url = new URL(request.url);
  const params: ReportParams = {
    classId: url.searchParams.get("classId") ?? undefined,
    studentId: url.searchParams.get("studentId") ?? undefined,
    from: url.searchParams.get("from") ?? undefined,
    to: url.searchParams.get("to") ?? undefined,
    attendance: url.searchParams.get("attendance") ?? undefined,
    activity: url.searchParams.get("activity") ?? undefined,
  };
  const report = await getReportData(params);
  const pdf = new SimplePdf();
  pdf.text("EduTrack", { size: 18, bold: true, gap: 22 });
  pdf.text("Relatorio de acompanhamento", { size: 13, bold: true, gap: 18 });
  pdf.text(`Gerado em ${new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeStyle: "short" }).format(new Date())}`);
  pdf.text([`Periodo: ${params.from || "inicio"} ate ${params.to || "hoje"}`, `Presenca: ${params.attendance || "todas"}`, `Atividade: ${params.activity === "true" ? "concluida" : params.activity === "false" ? "pendente" : "todas"}`].join(" | "), { size: 9 });
  pdf.space(10);
  pdf.text(`Resumo: ${report.summary.students} alunos | ${report.summary.present} presencas | ${report.summary.absent} faltas | ${report.summary.attendancePercent}% de presenca`, { bold: true });
  pdf.text(`Atividades: ${report.summary.completed} concluidas | ${report.summary.pending} pendentes`);
  pdf.space(12);
  for (const lesson of report.lessons) {
    pdf.ensure(115);
    pdf.text(`${formatDate(lesson.lessonDate)} - ${lesson.student.name}`, { size: 11, bold: true });
    pdf.textSegments([
      { value: `Presenca: ${lesson.attendanceStatus === "PRESENT" ? "Presente" : "Falta"} | Atividade: ` },
      { value: lesson.activityCompleted ? "Concluida" : "Pendente", color: lesson.activityCompleted ? [0.06, 0.45, 0.22] : [0.72, 0.08, 0.12] },
    ], { size: 9 });
    pdf.text(`Conteudo: ${lesson.content || "-"}`, { size: 9, indent: 56 });
    pdf.text(`Atividade: ${lesson.activity || "-"}`, { size: 9, indent: 56 });
    if (lesson.notes) pdf.text(`Observacoes: ${lesson.notes}`, { size: 9, indent: 56 });
    if (lesson.nextSteps) pdf.text(`Proximos passos: ${lesson.nextSteps}`, { size: 9, indent: 56 });
    pdf.space(8);
  }

  const bytes = pdf.build();
  return new Response(bytes.buffer as ArrayBuffer, { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="edutrack-relatorio-${new Date().toISOString().slice(0, 10)}.pdf"` } });
}
