import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";

import { PrismaClient } from "../src/generated/prisma/client";
import { parseSeedAdmin } from "../src/lib/seed-env";

const admin = parseSeedAdmin(process.env);
const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL ou DIRECT_URL deve estar configurada para executar o seed.");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const students = [
  { id: "demo-ana", name: "Ana Beatriz Lima", email: "ana@example.com", phone: "(11) 99911-2233", status: "ACTIVE" as const, generalNotes: "Foco em conversação e confiança oral." },
  { id: "demo-bruno", name: "Bruno Martins", email: "bruno@example.com", phone: "(11) 98822-3344", status: "ACTIVE" as const, generalNotes: "Preparação para entrevista profissional." },
  { id: "demo-carla", name: "Carla Souza", email: "carla@example.com", phone: "(11) 97733-4455", status: "ACTIVE" as const, generalNotes: "Reforço escolar e gramática." },
  { id: "demo-diego", name: "Diego Ferreira", email: "diego@example.com", phone: "(11) 96644-5566", status: "ACTIVE" as const, generalNotes: "Inglês para viagens." },
  { id: "demo-elisa", name: "Elisa Nogueira", email: "elisa@example.com", phone: "(11) 95555-6677", status: "INACTIVE" as const, generalNotes: "Aluno arquivado para demonstrar preservação de histórico." },
];

const lessonTemplates = [
  [0, 0, "PRESENT", "Simple Present e rotina", "Exercícios 1 a 8", false], [1, 1, "PRESENT", "Vocabulário de entrevistas", "Simulação de entrevista", true], [2, 2, "ABSENT", "Revisão de tempos verbais", "Lista de revisão", false],
  [3, 3, "PRESENT", "Vocabulário de aeroporto", "Diálogo de check-in", true], [4, 5, "PRESENT", "Reading comprehension", "Questões do texto", true], [0, 7, "PRESENT", "Present Continuous", "Descrição de imagens", true],
  [1, 9, "ABSENT", "Business vocabulary", "Email profissional", false], [2, 11, "PRESENT", "Past Simple", "Produção de texto", false], [3, 13, "PRESENT", "Hotel and reservations", "Role-play de reserva", true],
  [4, 15, "PRESENT", "Listening practice", "Resumo do áudio", true], [0, 18, "PRESENT", "Adverbs of frequency", "Rotina semanal", true], [1, 20, "PRESENT", "Elevator pitch", "Gravação de apresentação", false],
  [2, 23, "PRESENT", "Irregular verbs", "Tabela de verbos", true], [3, 26, "ABSENT", "Directions", "Mapa e instruções", false], [4, 29, "PRESENT", "Vocabulary review", "Quiz de revisão", true],
  [0, 32, "PRESENT", "Conversation practice", "Debate guiado", true], [1, 35, "PRESENT", "Interview questions", "Respostas comentadas", true], [2, 40, "ABSENT", "Text interpretation", "Atividade de leitura", false],
] as const;

async function main() {
  const passwordHash = await bcrypt.hash(admin.password, 12);
  await prisma.user.upsert({ where: { email: admin.email }, create: { name: admin.name, email: admin.email, passwordHash, settings: { create: {} } }, update: { name: admin.name, passwordHash } });
  for (const student of students) await prisma.student.upsert({ where: { id: student.id }, create: student, update: student });
  const now = new Date();
  for (const [index, template] of lessonTemplates.entries()) { const [studentIndex, daysAgo, attendanceStatus, content, activity, activityCompleted] = template; const lessonDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - daysAgo)); const id = `demo-lesson-${String(index + 1).padStart(2, "0")}`; await prisma.lesson.upsert({ where: { id }, create: { id, studentId: students[studentIndex]!.id, lessonDate, attendanceStatus, content, activity, activityCompleted, notes: attendanceStatus === "ABSENT" ? "Ausência registrada e conteúdo enviado." : "Boa participação durante a aula.", nextSteps: activityCompleted ? "Avançar para o próximo tópico." : "Revisar a atividade pendente na próxima aula." }, update: { lessonDate, attendanceStatus, content, activity, activityCompleted } }); }
  console.info(`ClassHub preparado com administrador, ${students.length} alunos e ${lessonTemplates.length} aulas.`);
}

main().catch((error: unknown) => { console.error(error); process.exitCode = 1; }).finally(async () => prisma.$disconnect());
