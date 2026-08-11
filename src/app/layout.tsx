import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: { default: "ClassHub", template: "%s | ClassHub" },
  description: "Sistema interno para acompanhamento de alunos e aulas.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
