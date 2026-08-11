import Link from "next/link";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate, percent } from "@/lib/format";
import { prisma } from "@/lib/prisma";

import styles from "./page.module.css";

type MetricProps = {
  label: string;
  value: string | number;
  detail?: string;
  emphasis?: "primary" | "warning";
};

function Metric({ label, value, detail, emphasis }: MetricProps) {
  return (
    <div className={`${styles.metric} ${emphasis ? styles[emphasis] : ""}`}>
      <p className={styles.metricLabel}>{label}</p>
      <p className={styles.metricValue}>{value}</p>
      {detail && <p className={styles.metricDetail}>{detail}</p>}
    </div>
  );
}

function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className={styles.sectionHeader}>
      <h2>{title}</h2>
      <Link href={href}>Ver todas</Link>
    </div>
  );
}

export default async function DashboardPage() {
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const monthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  const [activeStudents, totalLessons, monthLessons, monthPresent, monthAbsent, pending, recent, recentPending] = await Promise.all([
    prisma.student.count({ where: { status: "ACTIVE" } }),
    prisma.lesson.count(),
    prisma.lesson.count({ where: { lessonDate: { gte: monthStart, lt: monthEnd } } }),
    prisma.lesson.count({ where: { lessonDate: { gte: monthStart, lt: monthEnd }, attendanceStatus: "PRESENT" } }),
    prisma.lesson.count({ where: { lessonDate: { gte: monthStart, lt: monthEnd }, attendanceStatus: "ABSENT" } }),
    prisma.lesson.count({ where: { activityCompleted: false } }),
    prisma.lesson.findMany({ take: 5, orderBy: [{ lessonDate: "desc" }, { createdAt: "desc" }], include: { student: { select: { id: true, name: true } } } }),
    prisma.lesson.findMany({ take: 5, where: { activityCompleted: false }, orderBy: { lessonDate: "desc" }, include: { student: { select: { id: true, name: true } } } }),
  ]);

  return (
    <div className={styles.dashboard}>
      <header className={styles.pageHeader}>
        <div>
          <h1>Dashboard</h1>
          <p>Resumo do acompanhamento dos seus alunos.</p>
        </div>
        <div className={styles.actions}>
          <Button asChild variant="outline"><Link href="/alunos/novo">Novo aluno</Link></Button>
          <Button asChild><Link href="/aulas/nova">Nova aula</Link></Button>
        </div>
      </header>

      <section aria-label="Indicadores" className={styles.metrics}>
        <Metric label="Alunos ativos" value={activeStudents} />
        <Metric label="Total de aulas" value={totalLessons} />
        <Metric label="Aulas neste mês" value={monthLessons} />
        <Metric label="Presença no mês" value={`${percent(monthPresent, monthPresent + monthAbsent)}%`} detail={`${monthPresent} presenças · ${monthAbsent} faltas`} emphasis="primary" />
        <Metric label="Presenças no mês" value={monthPresent} />
        <Metric label="Faltas no mês" value={monthAbsent} />
        <Metric label="Atividades pendentes" value={pending} emphasis="warning" />
      </section>

      <section className={styles.section}>
        <SectionHeader title="Aulas recentes" href="/aulas" />
        {recent.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Nenhuma aula registrada.</p>
            <span>Registre a primeira aula para alimentar o dashboard.</span>
          </div>
        ) : (
          <div className={styles.tableShell}>
            <table className={styles.table}>
              <thead><tr><th>Aluno</th><th>Data</th><th>Presença</th><th>Conteúdo</th><th>Atividade</th></tr></thead>
              <tbody>
                {recent.map((lesson) => (
                  <tr key={lesson.id}>
                    <td className={styles.studentName}><Link href={`/alunos/${lesson.student.id}`}>{lesson.student.name}</Link></td>
                    <td>{formatDate(lesson.lessonDate)}</td>
                    <td><StatusBadge tone={lesson.attendanceStatus === "PRESENT" ? "green" : "red"}>{lesson.attendanceStatus === "PRESENT" ? "Presente" : "Falta"}</StatusBadge></td>
                    <td><span className={styles.truncate}>{lesson.content || "—"}</span></td>
                    <td><StatusBadge tone={lesson.activityCompleted ? "green" : "amber"}>{lesson.activityCompleted ? "Concluída" : "Pendente"}</StatusBadge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className={styles.section}>
        <SectionHeader title="Pendências recentes" href="/pendencias" />
        <div className={styles.pendingList}>
          {recentPending.length === 0 ? (
            <p className={styles.pendingEmpty}>Nenhuma pendência recente.</p>
          ) : recentPending.map((item) => (
            <article key={item.id} className={styles.pendingItem}>
              <div className={styles.pendingTopline}>
                <Link href={`/alunos/${item.student.id}`}>{item.student.name}</Link>
                <time dateTime={item.lessonDate.toISOString()}>{formatDate(item.lessonDate)}</time>
              </div>
              <p className={styles.activity}>{item.activity || "Atividade sem descrição"}</p>
              {item.nextSteps && <p className={styles.nextStep}><span>Próximo passo:</span> {item.nextSteps}</p>}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
