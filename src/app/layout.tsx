import type { Metadata } from "next";

import "./globals.css";
const themeScript = `(() => {
  try {
    const savedTheme = localStorage.getItem("classhub-theme");
    const theme = savedTheme === "light" || savedTheme === "dark"
      ? savedTheme
      : (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  } catch {}
})();`;

export const metadata: Metadata = {
  title: { default: "EduTrack", template: "%s | EduTrack" },
  description: "Sistema interno para acompanhamento de alunos e aulas.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body><script dangerouslySetInnerHTML={{ __html: themeScript }} />{children}</body>
    </html>
  );
}
