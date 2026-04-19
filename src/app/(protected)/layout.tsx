"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [inProgressCount, setInProgressCount] = useState(0);

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <Sidebar inProgressCount={inProgressCount} />
            <main className="flex-1 overflow-y-auto">
                <div className="p-7">
                    {children}
                </div>
            </main>
        </div>
    );
}
