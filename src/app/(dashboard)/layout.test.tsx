import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const { appHeader, requireCurrentUser } = vi.hoisted(() => ({
  requireCurrentUser: vi.fn(),
  appHeader: vi.fn(({ user }: { user: { id: string; name: string; email: string } }) => <div data-testid="header">{user.name}:{user.email}</div>),
}));

vi.mock("@/lib/auth/session", () => ({ requireCurrentUser }));
vi.mock("@/components/layout/app-header", () => ({ AppHeader: appHeader }));
vi.mock("@/components/layout/app-sidebar", () => ({ AppSidebar: () => <aside /> }));

import DashboardLayout from "@/app/(dashboard)/layout";

describe("DashboardLayout", () => {
  it("requires the current user and passes only safe user data to the header", async () => {
    requireCurrentUser.mockResolvedValue({ id: "user-1", name: "Ana Lima", email: "ana@edutrack.local", passwordHash: "secret" });

    render(await DashboardLayout({ children: <p>Conteúdo</p> }));

    expect(requireCurrentUser).toHaveBeenCalledOnce();
    expect(appHeader).toHaveBeenCalledWith({ user: { id: "user-1", name: "Ana Lima", email: "ana@edutrack.local" } }, undefined);
    expect(screen.getByTestId("header")).toHaveTextContent("Ana Lima:ana@edutrack.local");
  });
});
