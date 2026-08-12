import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";

export const metadata = { title: "Acessar" };

export default async function LoginPage() {
  if ((await cookies()).has(SESSION_COOKIE_NAME)) {
    const { getCurrentUser } = await import("@/lib/auth/session");
    if (await getCurrentUser()) redirect("/");
  }
  return (
    <section aria-labelledby="login-title" className="w-full max-w-[420px] rounded-lg border border-[var(--border)] bg-white p-7 sm:p-8">
      <div className="flex items-center gap-2.5"><span aria-hidden="true" className="grid size-7 place-items-center rounded-md bg-[var(--primary)] text-[11px] font-semibold text-white">E</span><p className="text-[15px] font-semibold tracking-[-0.02em] text-[var(--foreground)]">EduTrack</p></div>
      <h1 className="mt-8 text-2xl font-semibold tracking-[-0.025em] text-[var(--foreground)]" id="login-title">Acessar o EduTrack</h1>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Entre com as credenciais configuradas para o sistema.</p>
      <div className="mt-6"><LoginForm /></div>
    </section>
  );
}
