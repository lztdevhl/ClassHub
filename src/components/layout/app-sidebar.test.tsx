import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const { usePathname } = vi.hoisted(() => ({ usePathname: vi.fn() }));
vi.mock("next/navigation", () => ({ usePathname }));
import { AppSidebar } from "@/components/layout/app-sidebar";

describe("AppSidebar", () => {
  afterEach(cleanup);
  it("exposes all production modules", () => { usePathname.mockReturnValue("/dashboard"); render(<AppSidebar />); expect(screen.getByText("EduTrack")).toBeVisible(); for (const name of ["Dashboard", "Alunos", "Aulas", "Pendências", "Relatórios", "Configurações"]) expect(screen.getByRole("link", { name })).toBeVisible(); });
  it("marks nested routes as current", () => { usePathname.mockReturnValue("/alunos/abc"); render(<AppSidebar compact />); expect(screen.getByRole("link", { name: "Alunos" })).toHaveAttribute("aria-current", "page"); });
});
