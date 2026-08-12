import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AppHeader } from "@/components/layout/app-header";

const { usePathname } = vi.hoisted(() => ({ usePathname: vi.fn(() => "/") }));

vi.mock("next/navigation", () => ({ usePathname }));
vi.mock("@/actions/auth-actions", () => ({ logoutAction: vi.fn() }));

describe("AppHeader", () => {
  afterEach(cleanup);
  it("exposes the user menu, disabled settings and logout", () => {
    render(<AppHeader user={{ id: "user-1", name: "Ana Lima", email: "ana@edutrack.local" }} />);

    const trigger = screen.getByRole("button", { name: /ana lima.*ana@edutrack.local/i });
    fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false });

    expect(screen.getByText("Configurações")).toHaveAttribute("data-disabled");
    expect(screen.getByRole("menuitem", { name: "Sair" })).toBeVisible();
  });

  it("opens and closes the mobile dialog with Escape and a navigation item", async () => {
    render(<AppHeader user={{ id: "user-1", name: "Ana Lima", email: "ana@edutrack.local" }} />);

    const openButton = screen.getByRole("button", { name: "Abrir menu" });
    openButton.focus();
    fireEvent.click(openButton);
    expect(screen.getByRole("dialog", { name: "Menu principal" })).toHaveAttribute("aria-modal", "true");

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "Menu principal" })).not.toBeInTheDocument();
    await waitFor(() => expect(openButton).toHaveFocus());

    fireEvent.click(openButton);
    fireEvent.click(screen.getByRole("link", { name: "Dashboard" }));
    expect(screen.queryByRole("dialog", { name: "Menu principal" })).not.toBeInTheDocument();
  });
});
