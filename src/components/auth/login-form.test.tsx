import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/actions/auth-actions", () => ({ loginAction: vi.fn() }));

import { LoginFormView } from "@/components/auth/login-form";

afterEach(cleanup);

describe("LoginFormView", () => {
  it("renders accessible fields and validation feedback", () => {
    render(
      <LoginFormView
        state={{
          status: "validation_error",
          message: "Revise os campos.",
          fieldErrors: { email: ["Informe um e-mail válido."] },
        }}
        pending={false}
        formAction={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("E-mail")).toHaveAttribute("autocomplete", "email");
    expect(screen.getByLabelText("Senha")).toHaveAttribute("autocomplete", "current-password");
    expect(screen.getByRole("button", { name: "Entrar" })).toBeEnabled();
    expect(screen.getByText("Informe um e-mail válido.")).toBeVisible();
  });

  it("shows the pending state", () => {
    render(<LoginFormView state={{ status: "idle" }} pending formAction={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Entrando..." })).toBeDisabled();
  });

  it("preserves only the normalized e-mail after a recoverable error", () => {
    render(
      <LoginFormView
        state={{
          status: "unauthorized",
          message: "E-mail ou senha inválidos.",
          values: { email: "admin@classhub.local" },
        }}
        pending={false}
        formAction={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("E-mail")).toHaveValue("admin@classhub.local");
    expect(screen.getByLabelText("Senha")).toHaveValue("");
  });
});
