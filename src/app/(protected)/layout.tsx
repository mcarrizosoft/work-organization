"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [inProgressCount, setInProgressCount] = useState(0);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            {/* Mobile/small screen overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar — hidden on small screens, shown as drawer when open */}
            <div className={[
                "fixed inset-y-0 left-0 z-30 transition-transform duration-200 lg:relative lg:translate-x-0 lg:z-auto",
                sidebarOpen ? "translate-x-0" : "-translate-x-full",
            ].join(" ")}>
                <Sidebar inProgressCount={inProgressCount} onClose={() => setSidebarOpen(false)} />
            </div>

            <main className="flex-1 overflow-y-auto min-w-0">
                {/* Menu toggle button — visible only when sidebar is closed on small screens */}
                <div className="sticky top-0 z-10 flex items-center gap-2 px-4 pt-4 pb-0 lg:hidden">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() => setSidebarOpen((v) => !v)}
                    >
                        {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                    </Button>
                    <span className="text-sm font-semibold text-foreground">TaskFlow</span>
                </div>
                <div className="p-4 lg:p-7">
                    {children}
                </div>
            </main>
        </div>
    );
}
