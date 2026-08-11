import { describe, expect, it } from "vitest";

import { buildSessionCookie } from "@/lib/auth/session-cookie";

describe("buildSessionCookie", () => {
  it("builds a secure, http-only cookie in production", () => {
    const expiresAt = new Date("2026-08-13T12:00:00.000Z");

    expect(buildSessionCookie(expiresAt, true)).toMatchObject({
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });
  });

  it("does not require HTTPS in development", () => {
    expect(buildSessionCookie(new Date("2026-08-13T12:00:00.000Z"), false)).toMatchObject({ secure: false });
  });
});
