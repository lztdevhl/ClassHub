import { describe, expect, it } from "vitest";
import { SimplePdf } from "@/lib/simple-pdf";

describe("SimplePdf", () => { it("creates a valid multipage PDF header and trailer", () => { const pdf = new SimplePdf(); for (let i = 0; i < 120; i++) pdf.text(`Registro ${i}: conteudo da aula e proximos passos.`); const output = new TextDecoder().decode(pdf.build()); expect(output.startsWith("%PDF-1.4")).toBe(true); expect(output).toContain("/Count 3"); expect(output.endsWith("%%EOF")).toBe(true); }); });
