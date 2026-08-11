"use client";

import { Button } from "@/components/ui/button";

export function ConfirmAction({ action, message, label, variant = "ghost" }: { action: () => Promise<void>; message: string; label: string; variant?: "ghost" | "outline" }) { return <form action={action} onSubmit={(event) => { if (!window.confirm(message)) event.preventDefault(); }}><Button type="submit" variant={variant}>{label}</Button></form>; }
