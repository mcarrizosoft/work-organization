"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import type { WikiEntry } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { WikiEditor } from "@/components/wiki/WikiEditor";

const ReactMarkdown = dynamic(() => import("react-markdown"), { ssr: false });

interface WikiDetailClientProps {
    entry: WikiEntry;
}

export function WikiDetailClient({ entry: initialEntry }: WikiDetailClientProps) {
    const router = useRouter();
    const [entry, setEntry] = useState(initialEntry);
    const [editOpen, setEditOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    async function handleEdit(title: string, content: string, tags: string[]) {
        const res = await fetch(`/api/wiki/${entry.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, content, tags }),
        });
        if (res.ok) {
            const updated: WikiEntry = await res.json();
            setEntry(updated);
        }
    }

    async function handleDelete() {
        setDeleting(true);
        const res = await fetch(`/api/wiki/${entry.id}`, { method: "DELETE" });
        if (res.ok) {
            router.push("/wiki");
        } else {
            setDeleting(false);
        }
    }

    return (
        <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push("/wiki")}
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-xl font-semibold flex-1 truncate">{entry.title}</h1>
                <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
                    <Pencil className="h-3.5 w-3.5 mr-1" />
                    Edit
                </Button>
                <AlertDialog>
                    <AlertDialogTrigger
                        className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md text-xs font-medium bg-destructive text-white shadow-xs hover:bg-destructive/90 h-8 px-3 py-1 disabled:opacity-50"
                        disabled={deleting}
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete entry?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. &quot;{entry.title}&quot; will be permanently deleted.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>

            <div className="text-xs text-muted-foreground mb-3">
                Last updated: {new Date(entry.updatedAt).toLocaleString()}
            </div>

            {entry.tags && entry.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-5">
                    {entry.tags.map((tag) => (
                        <span key={tag} className="text-[11px] px-2 py-0.5 rounded-full border border-border bg-muted text-muted-foreground font-medium">
                            #{tag}
                        </span>
                    ))}
                </div>
            )}

            <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{entry.content}</ReactMarkdown>
            </div>

            <WikiEditor
                open={editOpen}
                onClose={() => setEditOpen(false)}
                onSave={handleEdit}
                initialTitle={entry.title}
                initialContent={entry.content}
                initialTags={entry.tags ?? []}
                mode="edit"
            />
        </div>
    );
}
