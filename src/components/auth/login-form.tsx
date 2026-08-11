"use client";

import { useActionState } from "react";

import { loginAction } from "@/actions/auth-actions";
import type { ActionResult } from "@/types/action-result";

type LoginFormState = ActionResult<never>;

type LoginFormViewProps = {
  state: LoginFormState;
  pending: boolean;
  formAction: (payload: FormData) => void;
};

export function LoginFormView({ state, pending, formAction }: LoginFormViewProps) {
  const emailError = state.status === "validation_error" ? state.fieldErrors.email?.[0] : undefined;
  const passwordError = state.status === "validation_error" ? state.fieldErrors.password?.[0] : undefined;
  const formMessage = "message" in state && state.status !== "validation_error" ? state.message : undefined;
  const emailValue = (state as { values?: { email?: string } }).values?.email;

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {formMessage ? <p className="text-sm text-red-700" role="alert">{formMessage}</p> : null}
      <div className="space-y-1.5">
        <label className="field-label" htmlFor="email">E-mail</label>
        <input
          aria-describedby={emailError ? "email-error" : undefined}
          aria-invalid={Boolean(emailError)}
          autoComplete="email"
          className="h-10 w-full px-3"
          defaultValue={emailValue}
          id="email"
          name="email"
          type="email"
        />
        {emailError ? <p className="text-sm text-red-700" id="email-error">{emailError}</p> : null}
      </div>
      <div className="space-y-1.5">
        <label className="field-label" htmlFor="password">Senha</label>
        <input
          aria-describedby={passwordError ? "password-error" : undefined}
          aria-invalid={Boolean(passwordError)}
          autoComplete="current-password"
          className="h-10 w-full px-3"
          id="password"
          name="password"
          type="password"
        />
        {passwordError ? <p className="text-sm text-red-700" id="password-error">{passwordError}</p> : null}
      </div>
      <button
        className="mt-2 h-9 w-full rounded-md bg-[var(--primary)] px-4 text-sm font-medium text-white outline-none hover:bg-[var(--primary-hover)] focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
        disabled={pending}
        type="submit"
      >
        {pending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, { status: "idle" });

  return <LoginFormView formAction={formAction} pending={pending} state={state} />;
}
