export type NavigationItem = {
  label: string;
  href: string;
  enabled: boolean;
  icon: "layout-dashboard" | "users" | "users-round" | "book-open" | "clipboard" | "file-text" | "settings";
};

export const navigationItems: NavigationItem[] = [
  { label: "Dashboard", href: "/dashboard", enabled: true, icon: "layout-dashboard" },
  { label: "Alunos", href: "/alunos", enabled: true, icon: "users" },
  { label: "Turmas", href: "/turmas", enabled: true, icon: "users-round" },
  { label: "Aulas", href: "/aulas", enabled: true, icon: "book-open" },
  { label: "Pendências", href: "/pendencias", enabled: true, icon: "clipboard" },
  { label: "Relatórios", href: "/relatorios", enabled: true, icon: "file-text" },
  { label: "Configurações", href: "/configuracoes", enabled: true, icon: "settings" },
];
