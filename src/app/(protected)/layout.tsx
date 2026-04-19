"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [inProgressCount, setInProgressCount] = useState(0);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            {/* Sidebar */}
            <div className={[
                "shrink-0 transition-all duration-200 overflow-hidden",
                sidebarOpen ? "w-64" : "w-0",
            ].join(" ")}>
                <Sidebar inProgressCount={inProgressCount} />
            </div>

            <main className="flex-1 overflow-y-auto min-w-0">
                {/* Toggle button — always visible */}
                <div className="sticky top-0 z-10 flex items-center gap-3 px-4 pt-4 pb-0">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
                        onClick={() => setSidebarOpen((v) => !v)}
                        title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
                    >
                        {sidebarOpen
                            ? <PanelLeftClose className="h-4 w-4" />
                            : <PanelLeftOpen className="h-4 w-4" />
                        }
                    </Button>
                </div>
                <div className="p-4 lg:p-7">
                    {children}
                </div>
            </main>
        </div>
    );
}
