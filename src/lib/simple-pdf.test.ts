import { describe, expect, it } from "vitest";
import { SimplePdf } from "@/lib/simple-pdf";

describe("SimplePdf", () => {
  it("creates a valid multipage PDF header and trailer", () => { const pdf = new SimplePdf(); for (let i = 0; i < 120; i++) pdf.text(`Registro ${i}: conteudo da aula e proximos passos.`); const output = new TextDecoder().decode(pdf.build()); expect(output.startsWith("%PDF-1.4")).toBe(true); expect(output).toContain("/Count 3"); expect(output.endsWith("%%EOF")).toBe(true); });

  it("colors only the requested text segment", () => {
    const pdf = new SimplePdf();
    pdf.textSegments([{ value: "Atividade: " }, { value: "Pendente", color: [0.72, 0.08, 0.12] }], { size: 9 });
    const output = new TextDecoder().decode(pdf.build());
    expect(output).toContain("0 0 0 rg (Atividade: ) Tj 0.72 0.08 0.12 rg (Pendente) Tj");
  });
});
