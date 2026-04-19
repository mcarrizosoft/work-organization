"use client";

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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { TagsInput } from "@/components/ui/tags-input";
import type { TaskPriority, TaskStatus } from "@/lib/types";

interface TaskDialogProps {
    open: boolean;
    onClose: () => void;
    onCreate: (data: {
        title: string;
        description: string;
        priority: TaskPriority;
        status: TaskStatus;
        tags: string[];
        dueDate?: string;
    }) => Promise<void>;
    allTags?: string[];
}

export function TaskDialog({ open, onClose, onCreate, allTags = [] }: TaskDialogProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState<TaskPriority>("medium");
    const [status, setStatus] = useState<TaskStatus>("backlog");
    const [tags, setTags] = useState<string[]>([]);
    const [dueDate, setDueDate] = useState("");
    const [saving, setSaving] = useState(false);

    function reset() {
        setTitle("");
        setDescription("");
        setPriority("medium");
        setStatus("backlog");
        setTags([]);
        setDueDate("");
    }

    async function handleCreate() {
        if (!title.trim()) return;
        setSaving(true);
        await onCreate({ title, description, priority, status, tags, dueDate: dueDate || undefined });
        setSaving(false);
        reset();
        onClose();
    }

    function handleClose() {
        reset();
        onClose();
    }

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>New Task</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-1">
                    <div className="space-y-1.5">
                        <Label htmlFor="new-title" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Title *</Label>
                        <Input
                            id="new-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Task title"
                            autoFocus
                            className="h-9"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="new-description" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Description</Label>
                        <Textarea
                            id="new-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What needs to be done?"
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</Label>
                            <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                                <SelectTrigger className="h-9">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="backlog">Backlog</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="in_review">In Review</SelectItem>
                                    <SelectItem value="done">Done</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Priority</Label>
                            <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                                <SelectTrigger className="h-9">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="new-due" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Due Date</Label>
                            <Input
                                id="new-due"
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="h-9"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tags</Label>
                            <TagsInput value={tags} onChange={setTags} suggestions={allTags} />
                        </div>
                    </div>
                </div>

                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleCreate} disabled={saving || !title.trim()} className="shadow-sm shadow-primary/20">
                        {saving ? "Creating…" : "Create Task"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
