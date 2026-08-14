"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

const THEME_STORAGE_KEY = "classhub-theme";
const THEME_CHANGE_EVENT = "classhub-theme-change";
type Theme = "light" | "dark";

function getCurrentTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(
    (callback) => {
      window.addEventListener(THEME_CHANGE_EVENT, callback);
      return () => window.removeEventListener(THEME_CHANGE_EVENT, callback);
    },
    getCurrentTheme,
    () => "light",
  );

  function toggleTheme() {
    const nextTheme = getCurrentTheme() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.style.colorScheme = nextTheme;
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }

  const dark = theme === "dark";
  return <button type="button" onClick={toggleTheme} aria-label={dark ? "Ativar modo claro" : "Ativar modo escuro"} title={dark ? "Modo claro" : "Modo escuro"} className="grid size-9 shrink-0 place-items-center rounded-lg text-[var(--muted)] transition-colors duration-150 ease-out hover:bg-[var(--surface-blue-soft)] hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-light)]">{dark ? <Sun aria-hidden="true" size={18} strokeWidth={1.75} /> : <Moon aria-hidden="true" size={18} strokeWidth={1.75} />}</button>;
}