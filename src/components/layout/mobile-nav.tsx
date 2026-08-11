"use client";

import { Menu } from "lucide-react";
import { useState } from "react";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  return <div className="lg:hidden"><Sheet open={open} onOpenChange={setOpen}><SheetTrigger asChild><Button aria-label="Abrir menu" variant="ghost" className="w-9 px-0"><Menu aria-hidden="true" size={19} /></Button></SheetTrigger><SheetContent aria-describedby="mobile-menu-description" className="w-[260px] p-0"><SheetTitle className="sr-only">Menu principal</SheetTitle><SheetDescription id="mobile-menu-description" className="sr-only">Navegação do ClassHub.</SheetDescription><AppSidebar onNavigate={() => setOpen(false)} /></SheetContent></Sheet></div>;
}
