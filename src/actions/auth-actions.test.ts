import { beforeEach, describe, expect, it, vi } from "vitest";

const { authenticate, startUserSession, endCurrentSession, redirect } = vi.hoisted(() => ({
  authenticate: vi.fn(),
  startUserSession: vi.fn(),
  endCurrentSession: vi.fn(),
  redirect: vi.fn((destination: string): never => {
    throw new Error(`redirect:${destination}`);
  }),
}));
const headers = vi.hoisted(() => vi.fn());
const { consumeLoginAttempt, resetLoginAttempts } = vi.hoisted(() => ({
  consumeLoginAttempt: vi.fn().mockResolvedValue({ allowed: true }),
  resetLoginAttempts: vi.fn(),
}));

vi.mock("@/services/auth-service", () => ({ authenticate }));
vi.mock("@/lib/auth/session", () => ({ startUserSession, endCurrentSession }));
vi.mock("@/lib/auth/dependencies", () => ({ authDependencies: { sessionSecret: "x", now: () => new Date() }, loginThrottleRepository: {} }));
vi.mock("next/navigation", () => ({ redirect }));
vi.mock("next/headers", () => ({ headers }));
vi.mock("@/services/login-throttle-service", () => ({ consumeLoginAttempt, resetLoginAttempts }));

import { loginAction, logoutAction } from "@/actions/auth-actions";

const idleState = { status: "idle" } as const;

describe("auth actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    headers.mockResolvedValue(new Headers({ "x-forwarded-for": "203.0.113.1" }));
    consumeLoginAttempt.mockResolvedValue({ allowed: true });
  });

  it("returns public field errors without calling authentication for invalid input", async () => {
    const result = await loginAction(idleState, new FormData());

    expect(result).toMatchObject({
      status: "validation_error",
      fieldErrors: { email: ["Informe um e-mail válido."], password: ["Informe sua senha."] },
    });
    expect(authenticate).not.toHaveBeenCalled();
  });

  it("returns the normalized e-mail but never the password after a credential error", async () => {
    authenticate.mockResolvedValueOnce({ ok: false, reason: "invalid_credentials" });
    const formData = new FormData();
    formData.set("email", " ADMIN@EDUTRACK.LOCAL ");
    formData.set("password", "senha-secreta");

    await expect(loginAction(idleState, formData)).resolves.toEqual({
      status: "unauthorized",
      message: "E-mail ou senha inválidos.",
      values: { email: "admin@edutrack.local" },
    });
  });

  it("uses one public message for invalid credentials", async () => {
    authenticate.mockResolvedValueOnce({ ok: false, reason: "invalid_credentials" });
    const formData = new FormData();
    formData.set("email", "admin@edutrack.local");
    formData.set("password", "senha");

    await expect(loginAction(idleState, formData)).resolves.toEqual({
      status: "unauthorized",
      message: "E-mail ou senha inválidos.",
      values: { email: "admin@edutrack.local" },
    });
  });

  it("consumes the throttle before attempting bcrypt authentication", async () => {
    const order: string[] = [];
    consumeLoginAttempt.mockImplementationOnce(async () => { order.push("throttle"); return { allowed: true }; });
    authenticate.mockImplementationOnce(async () => { order.push("authenticate"); return { ok: false, reason: "invalid_credentials" }; });
    const formData = new FormData();
    formData.set("email", "admin@edutrack.local");
    formData.set("password", "senha");

    await loginAction(idleState, formData);

    expect(order).toEqual(["throttle", "authenticate"]);
  });

  it("starts a session and redirects after valid credentials", async () => {
    authenticate.mockResolvedValueOnce({ ok: true, user: { id: "user-1", name: "Admin", email: "admin@edutrack.local" } });
    const formData = new FormData();
    formData.set("email", "admin@edutrack.local");
    formData.set("password", "senha");

    await expect(loginAction(idleState, formData)).rejects.toThrow("redirect:/");
    expect(startUserSession).toHaveBeenCalledWith("user-1");
  });

  it("ends the current session and redirects to login", async () => {
    await expect(logoutAction()).rejects.toThrow("redirect:/login");
    expect(endCurrentSession).toHaveBeenCalledOnce();
  });
});
