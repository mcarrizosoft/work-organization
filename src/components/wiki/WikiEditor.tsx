"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TagsInput } from "@/components/ui/tags-input";

// Dynamically import to avoid SSR issues
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface WikiEditorProps {
    open: boolean;
    onClose: () => void;
    onSave: (title: string, content: string, tags: string[]) => Promise<void>;
    initialTitle?: string;
    initialContent?: string;
    initialTags?: string[];
    allTags?: string[];
    mode?: "create" | "edit";
}

export function WikiEditor({
    open,
    onClose,
    onSave,
    initialTitle = "",
    initialContent = "",
    initialTags = [],
    allTags = [],
    mode = "create",
}: WikiEditorProps) {
    const [title, setTitle] = useState(initialTitle);
    const [content, setContent] = useState(initialContent);
    const [tags, setTags] = useState<string[]>(initialTags);
    const [saving, setSaving] = useState(false);

    function handleOpenChange(v: boolean) {
        if (!v) onClose();
    }

    async function handleSave() {
        if (!title.trim()) return;
        setSaving(true);
        await onSave(title, content, tags);
        setSaving(false);
        onClose();
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>{mode === "create" ? "New Wiki Entry" : "Edit Wiki Entry"}</DialogTitle>
                </DialogHeader>

                <div className="space-y-3 flex-1 overflow-y-auto">
                    <div className="space-y-1.5">
                        <Label htmlFor="wiki-title">Title *</Label>
                        <Input
                            id="wiki-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Entry title"
                            autoFocus
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label>Tags</Label>
                        <TagsInput value={tags} onChange={setTags} suggestions={allTags} placeholder="Add tags…" />
                    </div>

                    <div className="space-y-1.5">
                        <Label>Content</Label>
                        <div data-color-mode="dark">
                            <MDEditor
                                value={content}
                                onChange={(v) => setContent(v ?? "")}
                                height={300}
                                preview="edit"
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave} disabled={saving || !title.trim()} className="shadow-sm shadow-primary/20">
                        {saving ? "Saving…" : mode === "create" ? "Create" : "Save Changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
