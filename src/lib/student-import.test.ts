import { File } from "node:buffer";

import ExcelJS from "exceljs";
import { describe, expect, it } from "vitest";

import { parseStudentSpreadsheet } from "@/lib/student-import";

describe("student spreadsheet import", () => {
  it("parses valid CSV rows and skips empty rows", async () => {
    const file = new File(["nome,turma,email\nAna Lima,9B,ana@example.com\n,,\n"], "alunos.csv", { type: "text/csv" });
    const result = await parseStudentSpreadsheet(file as unknown as globalThis.File);
    expect(result.errors).toEqual([]);
    expect(result.rows).toEqual([expect.objectContaining({ name: "Ana Lima", className: "9B", email: "ana@example.com" })]);
  });

  it("parses XLSX without executing cell content", async () => {
    const workbook = new ExcelJS.Workbook(); const sheet = workbook.addWorksheet("Alunos");
    sheet.addRow(["nome", "turma"]); sheet.addRow(["Bruno Martins", "9A"]);
    const bytes = await workbook.xlsx.writeBuffer();
    const file = new File([bytes as BlobPart], "alunos.xlsx");
    const result = await parseStudentSpreadsheet(file as unknown as globalThis.File);
    expect(result.rows[0]).toEqual(expect.objectContaining({ name: "Bruno Martins", className: "9A" }));
  });

  it("rejects missing required columns and unsupported files", async () => {
    const wrongColumns = new File(["email\na@example.com"], "alunos.csv");
    expect((await parseStudentSpreadsheet(wrongColumns as unknown as globalThis.File)).errors[0]).toContain("nome");
    const wrongType = new File(["x"], "alunos.txt");
    expect((await parseStudentSpreadsheet(wrongType as unknown as globalThis.File)).errors[0]).toContain(".xlsx");
  });
});
