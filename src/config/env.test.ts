import { describe, expect, it } from "vitest";

import { parseServerEnv } from "@/config/env";

const validEnv = {
  DATABASE_URL: "postgresql://app:secret@pooled.db.prisma.io:5432/classhub",
  DIRECT_URL: "postgresql://app:secret@db.prisma.io:5432/classhub",
  INITIAL_ADMIN_NAME: "Administrador",
  INITIAL_ADMIN_EMAIL: "admin@classhub.local",
  INITIAL_ADMIN_PASSWORD: "uma-senha-com-16",
  SESSION_SECRET: "12345678901234567890123456789012",
  APP_URL: "http://localhost:3000",
};

describe("parseServerEnv", () => {
  it("normalizes the initial administrator email", () => {
    expect(parseServerEnv({ ...validEnv, INITIAL_ADMIN_EMAIL: " ADMIN@CLASSHUB.LOCAL " }).INITIAL_ADMIN_EMAIL)
      .toBe("admin@classhub.local");
  });

  it("rejects a short session secret", () => {
    expect(() => parseServerEnv({ ...validEnv, SESSION_SECRET: "short" })).toThrow();
  });

  it.each([
    ["73 ASCII bytes", "a".repeat(73)],
    ["74 UTF-8 bytes", "\u00e9".repeat(37)],
  ])("rejects an initial administrator password with %s", (_description, password) => {
    expect(() => parseServerEnv({ ...validEnv, INITIAL_ADMIN_PASSWORD: password })).toThrow();
  });

  it("accepts an initial administrator password with 12 UTF-8 bytes", () => {
    expect(parseServerEnv({ ...validEnv, INITIAL_ADMIN_PASSWORD: "\u00e9".repeat(6) })
      .INITIAL_ADMIN_PASSWORD).toBe("\u00e9".repeat(6));
  });
});
