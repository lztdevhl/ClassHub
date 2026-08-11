import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { requireCurrentUser } from "@/lib/auth/session";

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await requireCurrentUser();
  const safeUser = { id: user.id, name: user.name, email: user.email };
  return <div className="min-h-screen bg-[var(--background)]"><div className="fixed inset-y-0 left-0 z-30 hidden lg:block"><AppSidebar collapsible /></div><div className="dashboard-content"><AppHeader user={safeUser} /><main className="mx-auto w-full max-w-[1440px] px-4 py-7 sm:px-6 sm:py-8 lg:px-8 xl:px-10">{children}</main></div></div>;
}
