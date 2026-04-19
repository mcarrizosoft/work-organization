"use client";

import { useState } from "react";
import type { WikiEntry } from "@/lib/types";
import { WikiCard } from "./WikiCard";
import { WikiEditor } from "./WikiEditor";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface WikiListProps {
    initialEntries: WikiEntry[];
}

function getAllWikiTags(entries: WikiEntry[]): string[] {
    const set = new Set<string>();
    entries.forEach((e) => e.tags?.forEach((t) => set.add(t)));
    return Array.from(set).sort();
}

export function WikiList({ initialEntries }: WikiListProps) {
    const [entries, setEntries] = useState<WikiEntry[]>(initialEntries);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [filterTag, setFilterTag] = useState("");

    const allTags = getAllWikiTags(entries);
    const filtered = filterTag ? entries.filter((e) => e.tags?.includes(filterTag)) : entries;

    async function handleCreate(title: string, content: string, tags: string[]) {
        const res = await fetch("/api/wiki", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, content, tags }),
        });
        if (res.ok) {
            const entry: WikiEntry = await res.json();
            setEntries([entry, ...entries]);
        }
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-xl font-bold text-foreground">Wiki</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {filtered.length === entries.length
                            ? `${entries.length} entr${entries.length !== 1 ? "ies" : "y"}`
                            : `${filtered.length} of ${entries.length} entries`}
                    </p>
                </div>
                <Button onClick={() => setDialogOpen(true)} size="sm" className="gap-1.5 shadow-sm shadow-primary/20">
                    <Plus className="h-4 w-4" />
                    New Entry
                </Button>
            </div>

            {/* Tag filter */}
            {allTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                    {allTags.map((tag) => (
                        <button
                            key={tag}
                            onClick={() => setFilterTag(filterTag === tag ? "" : tag)}
                            className={cn(
                                "text-[11px] px-2.5 py-1 rounded-full border font-medium transition-all",
                                filterTag === tag
                                    ? "bg-primary/20 text-primary border-primary/40"
                                    : "bg-muted/50 text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
                            )}
                        >
                            #{tag}
                        </button>
                    ))}
                    {filterTag && (
                        <button
                            onClick={() => setFilterTag("")}
                            className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-full border border-border text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X className="h-3 w-3" /> Clear
                        </button>
                    )}
                </div>
            )}

            {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
                    <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="font-medium text-foreground">
                        {entries.length === 0 ? "No wiki entries yet" : "No entries match this filter"}
                    </p>
                    {entries.length === 0 && (
                        <>
                            <p className="text-sm text-muted-foreground">Create your first entry to get started.</p>
                            <Button onClick={() => setDialogOpen(true)} size="sm" className="mt-2 gap-1.5">
                                <Plus className="h-4 w-4" />
                                New Entry
                            </Button>
                        </>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filtered.map((entry) => (
                        <WikiCard key={entry.id} entry={entry} />
                    ))}
                </div>
            )}

            <WikiEditor
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onSave={handleCreate}
                allTags={allTags}
                mode="create"
            />
        </div>
    );
}
