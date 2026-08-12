"use client";

import { BookOpen, ClipboardList, FileText, LayoutDashboard, PanelLeftClose, PanelLeftOpen, Settings, Users, UsersRound, type LucideIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";

import classHubLogo from "@/assets/logo-classhub.png";
import { navigationItems, type NavigationItem } from "@/config/navigation";
import { cn } from "@/lib/utils";

const SIDEBAR_STORAGE_KEY = "classhub-sidebar-collapsed";
const SIDEBAR_CHANGE_EVENT = "classhub-sidebar-change";
const icons: Record<NavigationItem["icon"], LucideIcon> = { "layout-dashboard": LayoutDashboard, users: Users, "users-round": UsersRound, "book-open": BookOpen, clipboard: ClipboardList, "file-text": FileText, settings: Settings };

function subscribeToSidebarPreference(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(SIDEBAR_CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(SIDEBAR_CHANGE_EVENT, callback);
  };
}

function getSidebarPreference() {
  return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true";
}

export function AppSidebar({ collapsible = false, onNavigate }: { collapsible?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const savedCollapsed = useSyncExternalStore(subscribeToSidebarPreference, getSidebarPreference, () => false);
  const collapsed = collapsible && savedCollapsed;

  useEffect(() => {
    if (!collapsible) return;
    document.documentElement.dataset.sidebarCollapsed = String(collapsed);
    return () => { delete document.documentElement.dataset.sidebarCollapsed; };
  }, [collapsed, collapsible]);

  function toggleSidebar() {
    const next = !collapsed;
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
    document.documentElement.dataset.sidebarCollapsed = String(next);
    window.dispatchEvent(new Event(SIDEBAR_CHANGE_EVENT));
  }

  return <aside aria-label="Navegação principal" className={cn("flex h-full flex-col border-r border-[var(--border)] bg-white px-3 py-4 transition-[width] duration-200 ease-out", collapsed && collapsible ? "w-[72px]" : "w-[260px]")}>
    <div className={cn("mb-6 flex h-9 items-center", collapsed && collapsible ? "justify-center" : "justify-between")}>
      <Link href="/dashboard" aria-label="EduTrack, visão geral" className={cn("flex h-9 min-w-0 items-center rounded-lg text-[15px] font-semibold tracking-[-0.02em] text-[var(--foreground)] transition-colors duration-150 ease-out hover:bg-[var(--surface-blue-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]", collapsed && collapsible ? "justify-center px-1" : "gap-2.5 px-2")}><Image src={classHubLogo} alt="" width={28} height={28} priority unoptimized className="size-7 shrink-0 rounded-lg" /><span className={cn("overflow-hidden whitespace-nowrap transition-[width,opacity] duration-150 ease-out", collapsed && collapsible ? "w-0 opacity-0" : "w-[92px] opacity-100")}>EduTrack</span></Link>
      {collapsible && !collapsed && <button type="button" onClick={toggleSidebar} aria-label="Recolher sidebar" title="Recolher sidebar" className="grid size-8 shrink-0 place-items-center rounded-md text-[var(--muted-foreground)] transition-colors duration-150 ease-out hover:bg-[var(--surface-blue-hover)] hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"><PanelLeftClose aria-hidden="true" size={17} strokeWidth={1.75} /></button>}
    </div>
    <nav aria-label="Módulos"><ul className="space-y-0.5">{navigationItems.map((item, index) => { const Icon = icons[item.icon]; const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`)); return <li key={item.href} className={cn(index === navigationItems.length - 1 && "mt-3 border-t border-[var(--border-subtle)] pt-3")}><Link href={item.href} onClick={onNavigate} aria-current={active ? "page" : undefined} aria-label={collapsed && collapsible ? item.label : undefined} className={cn("group relative flex h-9 items-center rounded-lg text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]", collapsed && collapsible ? "justify-center px-0" : "gap-3 px-2.5", active ? "bg-[var(--primary-soft)] text-[var(--primary)]" : "text-[var(--muted)] hover:bg-[var(--surface-blue-soft)] hover:text-[var(--foreground)]")}><Icon aria-hidden="true" className="shrink-0" size={17} strokeWidth={1.75} /><span className={cn("overflow-hidden whitespace-nowrap transition-[width,opacity] duration-150 ease-out", collapsed && collapsible ? "w-0 opacity-0" : "w-[150px] opacity-100")}>{item.label}</span>{collapsed && collapsible && <span role="tooltip" className="sidebar-tooltip">{item.label}</span>}</Link></li>; })}</ul></nav>
    {collapsible && collapsed && <button type="button" onClick={toggleSidebar} aria-label="Expandir sidebar" className="group relative mt-auto grid size-8 place-items-center self-center rounded-md text-[var(--muted-foreground)] transition-colors duration-150 ease-out hover:bg-[var(--surface-blue-hover)] hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"><PanelLeftOpen aria-hidden="true" size={17} strokeWidth={1.75} /><span role="tooltip" className="sidebar-tooltip">Expandir sidebar</span></button>}
  </aside>;
}
