"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { authDependencies, loginThrottleRepository } from "@/lib/auth/dependencies";
import { getLoginFingerprint } from "@/lib/auth/login-fingerprint";
import { endCurrentSession, startUserSession } from "@/lib/auth/session";
import { loginSchema } from "@/schemas/login-schema";
import { authenticate } from "@/services/auth-service";
import { consumeLoginAttempt, resetLoginAttempts } from "@/services/login-throttle-service";
import type { ActionResult } from "@/types/action-result";

type LoginActionState = ActionResult<never>;

export async function loginAction(_: LoginActionState, formData: FormData): Promise<LoginActionState> {
  const email = formData.get("email");
  const password = formData.get("password");
  const parsed = loginSchema.safeParse({
    email: typeof email === "string" ? email : "",
    password: typeof password === "string" ? password : "",
  });

  if (!parsed.success) {
    return {
      status: "validation_error",
      message: "Revise os campos.",
      fieldErrors: parsed.error.flatten().fieldErrors,
      values: typeof email === "string" ? { email: email.trim().toLowerCase() } : undefined,
    };
  }

  try {
    const fingerprint = getLoginFingerprint(await headers(), authDependencies.sessionSecret);
    const throttle = await consumeLoginAttempt(fingerprint, loginThrottleRepository, authDependencies.now);
    if (!throttle.allowed) return { status: "unauthorized", message: "E-mail ou senha inválidos.", values: { email: parsed.data.email } };
    const result = await authenticate(parsed.data, authDependencies);

    if (!result.ok) {
      return {
        status: "unauthorized",
        message: "E-mail ou senha inválidos.",
        values: { email: parsed.data.email },
      };
    }

    await resetLoginAttempts(fingerprint, loginThrottleRepository);
    await startUserSession(result.user.id);
  } catch (error) {
    const errorId = crypto.randomUUID();
    console.error("Login failed", { errorId, error });
    return {
      status: "internal_error",
      message: "Não foi possível acessar o sistema. Tente novamente.",
      errorId,
      values: { email: parsed.data.email },
    };
  }

  redirect("/");
}

export async function logoutAction(): Promise<never> {
  await endCurrentSession();
  redirect("/login");
}
