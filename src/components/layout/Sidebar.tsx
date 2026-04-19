"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Kanban, BookOpen, LogOut, Loader2, AlertTriangle } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isOverdue } from "@/lib/taskUtils";
import type { Task } from "@/lib/types";

interface UserInfo {
    id: string;
    name: string;
}

interface SidebarProps {
    inProgressCount?: number;
}

export function Sidebar({ inProgressCount = 0 }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<UserInfo | null>(null);
    const [overdueCount, setOverdueCount] = useState(0);

    useEffect(() => {
        fetch("/api/auth/me")
            .then((r) => r.json())
            .then((data) => { if (data.id) setUser(data); })
            .catch(() => { });

        fetch("/api/tasks")
            .then((r) => r.json())
            .then((tasks: Task[]) => {
                if (Array.isArray(tasks)) {
                    setOverdueCount(tasks.filter(isOverdue).length);
                }
            })
            .catch(() => { });
    }, []);

    async function handleLogout() {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
        router.refresh();
    }

    const navItems = [
        { href: "/board", label: "Board", icon: Kanban },
        { href: "/wiki", label: "Wiki", icon: BookOpen },
    ];

    return (
        <aside className="flex h-screen w-64 flex-col border-r border-border bg-sidebar">
            {/* Logo area */}
            <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/30">
                    <Kanban className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                    <h1 className="text-sm font-bold tracking-tight text-foreground leading-none">
                        TaskFlow
                    </h1>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Team workspace</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-0.5">
                <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                    Navigation
                </p>
                {navItems.map(({ href, label, icon: Icon }) => {
                    const active = pathname.startsWith(href);
                    return (
                        <Link key={href} href={href}>
                            <div
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                                    active
                                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                )}
                            >
                                <Icon className="h-4 w-4 shrink-0" />
                                <span>{label}</span>
                                {href === "/board" && (
                                    <div className="ml-auto flex items-center gap-1">
                                        {overdueCount > 0 && (
                                            <span className={cn(
                                                "flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                                                active
                                                    ? "bg-red-500/30 text-red-200"
                                                    : "bg-red-500/15 text-red-400"
                                            )}>
                                                <AlertTriangle className="h-2.5 w-2.5" />
                                                {overdueCount}
                                            </span>
                                        )}
                                        {inProgressCount > 0 && (
                                            <span className={cn(
                                                "text-[11px] font-semibold px-1.5 py-0.5 rounded-full",
                                                active
                                                    ? "bg-primary-foreground/20 text-primary-foreground"
                                                    : "bg-primary/15 text-primary"
                                            )}>
                                                {inProgressCount}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </Link>
                    );
                })}
            </nav>

            {/* User section */}
            <div className="border-t border-border px-3 py-3">
                <div className="flex items-center gap-3 rounded-lg px-2 py-2">
                    <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="text-xs bg-primary/15 text-primary font-semibold">
                            {user ? user.name.slice(0, 2).toUpperCase() : <Loader2 className="h-3 w-3 animate-spin" />}
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{user?.name ?? "..."}</p>
                        <p className="truncate text-[11px] text-muted-foreground">@{user?.id}</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={handleLogout}
                        title="Logout"
                    >
                        <LogOut className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>
        </aside>
    );
}

