import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: { default: "EduTrack", template: "%s | EduTrack" },
  description: "Sistema interno para acompanhamento de alunos e aulas.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
