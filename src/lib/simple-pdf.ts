type PdfPage = string[];
type PdfColor = [number, number, number];
type PdfTextSegment = { value: string; color?: PdfColor };

function ascii(value: string): string { return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\x20-\x7E]/g, " "); }
function escape(value: string): string { return ascii(value).replace(/([\\()])/g, "\\$1"); }
function wrap(value: string, width = 88): string[] { const words = value.replace(/\s+/g, " ").trim().split(" "); const lines: string[] = []; let line = ""; for (const word of words) { if (!word) continue; if (`${line} ${word}`.trim().length > width) { if (line) lines.push(line); line = word; } else line = `${line} ${word}`.trim(); } if (line) lines.push(line); return lines.length ? lines : ["-"]; }

export class SimplePdf {
  private pages: PdfPage[] = [[]]; private y = 790;
  private get page() { return this.pages[this.pages.length - 1]!; }
  newPage() { this.pages.push([]); this.y = 790; }
  ensure(height: number) { if (this.y - height < 55) this.newPage(); }
  text(value: string, options: { size?: number; bold?: boolean; indent?: number; gap?: number } = {}) { const size = options.size ?? 10; const gap = options.gap ?? size + 3; const indent = options.indent ?? 48; for (const line of wrap(value, Math.max(30, Math.floor(92 - indent / 12)))) { this.ensure(gap); this.page.push(`BT /F${options.bold ? 2 : 1} ${size} Tf ${indent} ${this.y} Td (${escape(line)}) Tj ET`); this.y -= gap; } }
  textSegments(segments: PdfTextSegment[], options: { size?: number; bold?: boolean; indent?: number; gap?: number } = {}) { const size = options.size ?? 10; const gap = options.gap ?? size + 3; const indent = options.indent ?? 48; this.ensure(gap); const commands = segments.map(({ value, color }) => `${color ? `${color.join(" ")} rg ` : "0 0 0 rg "}(${escape(value)}) Tj`).join(" "); this.page.push(`q BT /F${options.bold ? 2 : 1} ${size} Tf ${indent} ${this.y} Td ${commands} ET Q`); this.y -= gap; }
  space(points = 8) { this.y -= points; }
  build(): Uint8Array { const objects: string[] = []; const pageIds: number[] = []; objects.push("<< /Type /Catalog /Pages 2 0 R >>"); objects.push(""); objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"); objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>"); for (const commands of this.pages) { const contentId = objects.length + 1; const stream = commands.join("\n"); objects.push(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`); const pageId = objects.length + 1; objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>`); pageIds.push(pageId); } objects[1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`; let output = "%PDF-1.4\n"; const offsets = [0]; objects.forEach((obj, i) => { offsets.push(output.length); output += `${i + 1} 0 obj\n${obj}\nendobj\n`; }); const xref = output.length; output += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`; for (let i = 1; i <= objects.length; i++) output += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`; output += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`; return new TextEncoder().encode(output); }
}
