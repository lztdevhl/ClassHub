import { describe, expect, it } from "vitest";
import { formatDate, parseDateOnly, percent, toDateInput } from "@/lib/format";

describe("date-only helpers", () => { it("round-trips lesson dates without timezone drift", () => { const date = parseDateOnly("2026-08-07"); expect(formatDate(date)).toBe("07/08/2026"); expect(toDateInput(date)).toBe("2026-08-07"); }); it("calculates safe percentages", () => { expect(percent(3, 4)).toBe(75); expect(percent(0, 0)).toBe(0); }); });
