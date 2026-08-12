import { describe, expect, it } from "vitest";

import { parseServerEnv } from "@/config/env";

const validEnv = {
  DATABASE_URL: "postgresql://app:secret@pooled.db.prisma.io:5432/edutrack",
  SESSION_SECRET: "12345678901234567890123456789012",
  NODE_ENV: "test",
};

describe("parseServerEnv", () => {
  it("accepts only the variables required by the application runtime", () => {
    expect(parseServerEnv(validEnv)).toEqual(validEnv);
  });

  it("rejects a short session secret", () => {
    expect(() => parseServerEnv({ ...validEnv, SESSION_SECRET: "short" })).toThrow();
  });

  it("rejects a non-PostgreSQL database URL", () => {
    expect(() => parseServerEnv({ ...validEnv, DATABASE_URL: "https://example.com" })).toThrow();
  });
});
