import { describe, expect, it } from "vitest";

import { parseSeedAdmin } from "@/lib/seed-env";

describe("parseSeedAdmin", () => {
  it("returns normalized administrator data", () => {
    expect(parseSeedAdmin({
      INITIAL_ADMIN_NAME: " Administrador ",
      INITIAL_ADMIN_EMAIL: " ADMIN@EDUTRACK.LOCAL ",
      INITIAL_ADMIN_PASSWORD: "uma-senha-com-16",
    })).toEqual({
      name: "Administrador",
      email: "admin@edutrack.local",
      password: "uma-senha-com-16",
    });
  });

  it("accepts the minimum 12-byte password", () => {
    expect(parseSeedAdmin({
      INITIAL_ADMIN_NAME: "Administrador",
      INITIAL_ADMIN_EMAIL: "admin@edutrack.local",
      INITIAL_ADMIN_PASSWORD: "123456789012",
    }).password).toBe("123456789012");
  });

  it.each([
    ["73 ASCII bytes", "a".repeat(73)],
    ["74 UTF-8 bytes", "é".repeat(37)],
  ])("rejects a password with %s", (_description, password) => {
    expect(() => parseSeedAdmin({
      INITIAL_ADMIN_NAME: "Administrador",
      INITIAL_ADMIN_EMAIL: "admin@edutrack.local",
      INITIAL_ADMIN_PASSWORD: password,
    })).toThrow();
  });
});
