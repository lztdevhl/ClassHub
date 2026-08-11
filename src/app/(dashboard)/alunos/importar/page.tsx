import { StudentImport } from "@/components/students/student-import";
import { PageHeader } from "@/components/ui/page-header";

export default function ImportStudentsPage() { return <div className="page-stack"><PageHeader title="Importar alunos" description="Valide uma planilha antes de criar qualquer registro." /><StudentImport /></div>; }
