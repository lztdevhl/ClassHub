import { Readable } from "node:stream";

import ExcelJS from "exceljs";

export const MAX_IMPORT_BYTES = 2 * 1024 * 1024;
export const MAX_IMPORT_ROWS = 500;
const allowedHeaders = new Set(["nome", "turma", "email", "telefone", "observacoes", "status"]);

export type ImportedStudentRow = { row: number; name: string; className: string; email: string; phone: string; generalNotes: string; status: "ACTIVE" | "INACTIVE" };

function text(value: ExcelJS.CellValue): string {
  if (value == null) return "";
  if (typeof value === "object" && "text" in value) return String(value.text).trim();
  if (typeof value === "object" && "result" in value) return String(value.result ?? "").trim();
  return String(value).trim();
}

export async function parseStudentSpreadsheet(file: File): Promise<{ rows: ImportedStudentRow[]; errors: string[] }> {
  if (file.size === 0) return { rows: [], errors: ["O arquivo está vazio."] };
  if (file.size > MAX_IMPORT_BYTES) return { rows: [], errors: ["O arquivo deve ter no máximo 2 MB."] };
  const extension = file.name.toLowerCase().split(".").pop();
  if (extension !== "xlsx" && extension !== "csv") return { rows: [], errors: ["Envie um arquivo .xlsx ou .csv."] };
  const buffer = Buffer.from(await file.arrayBuffer());
  const workbook = new ExcelJS.Workbook();
  if (extension === "xlsx") await workbook.xlsx.load(buffer as never);
  else await workbook.csv.read(Readable.from(buffer));
  const sheet = workbook.worksheets[0];
  if (!sheet) return { rows: [], errors: ["A planilha não possui uma aba válida."] };
  const headers = new Map<string, number>();
  sheet.getRow(1).eachCell((cell, column) => { const header = text(cell.value).toLowerCase(); if (header) headers.set(header, column); });
  if (!headers.has("nome")) return { rows: [], errors: ["A coluna obrigatória 'nome' não foi encontrada."] };
  const unknown = [...headers.keys()].filter((header) => !allowedHeaders.has(header));
  if (unknown.length) return { rows: [], errors: [`Colunas não reconhecidas: ${unknown.join(", ")}.`] };
  const rows: ImportedStudentRow[] = []; const errors: string[] = [];
  for (let index = 2; index <= sheet.rowCount; index += 1) {
    if (rows.length >= MAX_IMPORT_ROWS) { errors.push(`O limite de ${MAX_IMPORT_ROWS} registros foi excedido.`); break; }
    const row = sheet.getRow(index);
    const value = (header: string) => { const column = headers.get(header); return column ? text(row.getCell(column).value) : ""; };
    const name = value("nome"); const className = value("turma"); const email = value("email").toLowerCase(); const phone = value("telefone"); const generalNotes = value("observacoes"); const rawStatus = value("status").toLowerCase();
    if (![name, className, email, phone, generalNotes, rawStatus].some(Boolean)) continue;
    if (name.length < 2 || name.length > 150) { errors.push(`Linha ${index}: informe um nome válido.`); continue; }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { errors.push(`Linha ${index}: email inválido.`); continue; }
    if (className.length > 120 || phone.length > 30 || generalNotes.length > 5000) { errors.push(`Linha ${index}: um campo excede o tamanho permitido.`); continue; }
    if (rawStatus && !["ativo", "ativa", "inativo", "inativa", "active", "inactive"].includes(rawStatus)) { errors.push(`Linha ${index}: status inválido.`); continue; }
    rows.push({ row: index, name, className, email, phone, generalNotes, status: ["inativo", "inativa", "inactive"].includes(rawStatus) ? "INACTIVE" : "ACTIVE" });
  }
  if (!rows.length && !errors.length) errors.push("Nenhum aluno foi encontrado na planilha.");
  return { rows, errors };
}
