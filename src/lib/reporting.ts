import { parseDateOnly, percent } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export type ReportParams = { classId?: string; studentId?: string; from?: string; to?: string; attendance?: string; activity?: string };

export async function getReportData(params: ReportParams) {
  const lessons = await prisma.lesson.findMany({ where: { studentId: params.studentId || undefined, OR: params.classId ? [{ classId: params.classId }, { classId: null, student: { classId: params.classId } }] : undefined, lessonDate: params.from || params.to ? { gte: params.from ? parseDateOnly(params.from) : undefined, lte: params.to ? parseDateOnly(params.to) : undefined } : undefined, attendanceStatus: params.attendance === "PRESENT" || params.attendance === "ABSENT" ? params.attendance : undefined, activityCompleted: params.activity === "true" ? true : params.activity === "false" ? false : undefined }, orderBy: [{ lessonDate: "desc" }, { createdAt: "desc" }], include: { student: { select: { id: true, name: true } } } });
  const present = lessons.filter((lesson) => lesson.attendanceStatus === "PRESENT").length;
  const completed = lessons.filter((lesson) => lesson.activityCompleted === true).length;
  return { lessons, summary: { total: lessons.length, present, absent: lessons.length - present, attendancePercent: percent(present, lessons.length), completed, pending: lessons.filter((lesson) => lesson.activityCompleted === false).length } };
}
