"use client";

import Link from "next/link";
import type { WikiEntry } from "@/lib/types";
import { formatDistanceToNow } from "@/lib/dateUtils";
import { BookOpen, ChevronRight } from "lucide-react";

interface WikiCardProps {
    entry: WikiEntry;
}

export function WikiCard({ entry }: WikiCardProps) {
    return (
        <Link href={`/wiki/${entry.id}`}>
            <div className="group flex items-start gap-3.5 rounded-xl border border-border bg-card p-4 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 cursor-pointer">
                <div className="shrink-0 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/15 transition-colors">
                    <BookOpen className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                        {entry.title}
                    </p>
                    {entry.tags && entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                            {entry.tags.map((tag) => (
                                <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground font-medium">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Updated {formatDistanceToNow(entry.updatedAt)}
                    </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary/60 transition-colors mt-0.5 shrink-0" />
            </div>
        </Link>
    );
}
