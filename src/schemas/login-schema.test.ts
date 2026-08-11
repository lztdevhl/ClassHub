import { describe, expect, it } from "vitest";

import { loginSchema } from "@/schemas/login-schema";

describe("loginSchema", () => {
  it("normalizes a valid email", () => {
    expect(loginSchema.parse({ email: " ADMIN@CLASSHUB.LOCAL ", password: "senha" }).email)
      .toBe("admin@classhub.local");
  });

  it("returns the public email message for an invalid email", () => {
    const result = loginSchema.safeParse({ email: "invalid", password: "senha" });

    expect(result.error?.flatten().fieldErrors.email).toContain("Informe um e-mail válido.");
  });

  it("requires a password without describing the password policy", () => {
    const result = loginSchema.safeParse({ email: "admin@classhub.local", password: "" });

    expect(result.error?.flatten().fieldErrors.password).toEqual(["Informe sua senha."]);
  });
});
