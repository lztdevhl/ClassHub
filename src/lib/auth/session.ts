import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { serverEnv } from "@/config/server-env";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { authDependencies } from "@/lib/auth/dependencies";
import { buildSessionCookie } from "@/lib/auth/session-cookie";
import type { SessionUser } from "@/lib/auth/types";
import { createSession, revokeSession, validateSession } from "@/services/auth-service";

export { buildSessionCookie } from "@/lib/auth/session-cookie";

export async function getCurrentUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  return token ? validateSession(token, authDependencies) : null;
}

export async function requireCurrentUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function startUserSession(userId: string): Promise<void> {
  const session = await createSession(userId, authDependencies);
  (await cookies()).set(
    SESSION_COOKIE_NAME,
    session.token,
    buildSessionCookie(session.expiresAt, serverEnv.NODE_ENV === "production"),
  );
}

export async function endCurrentSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) await revokeSession(token, authDependencies);
  cookieStore.delete(SESSION_COOKIE_NAME);
}
