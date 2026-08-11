import { z } from "zod";

const optionalText = (max: number) => z.string().trim().max(max).transform((value) => value || undefined);

export const lessonSchema = z.object({
  studentId: z.string().trim().min(1, "Selecione um aluno."),
  lessonDate: z.string().date("Informe a data da aula."),
  attendanceStatus: z.enum(["PRESENT", "ABSENT"]),
  content: optionalText(10000),
  activity: optionalText(10000),
  activityCompleted: z.enum(["true", "false"]).transform((value) => value === "true"),
  notes: optionalText(10000),
  nextSteps: optionalText(10000),
});

export type LessonInput = z.infer<typeof lessonSchema>;
