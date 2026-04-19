"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
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
import { Pencil, Trash2, Clock, Tag, ArrowRight, CalendarDays, AlertTriangle } from "lucide-react";
import { TagsInput } from "@/components/ui/tags-input";
import { isOverdue } from "@/lib/taskUtils";
import type { Task, TaskPriority, TaskStatus } from "@/lib/types";

interface TaskSheetProps {
    task: Task | null;
    open: boolean;
    onClose: () => void;
    onUpdate: (taskId: string, updates: Partial<Task>) => Promise<void>;
    onDelete: (taskId: string) => Promise<void>;
    allTags?: string[];
}

const priorityConfig: Record<TaskPriority, { label: string; stripe: string; badge: string }> = {
    low: { label: "Low", stripe: "bg-slate-500", badge: "bg-slate-500/15 text-slate-400 border-slate-500/25" },
    medium: { label: "Medium", stripe: "bg-amber-500", badge: "bg-amber-500/15 text-amber-400 border-amber-500/25" },
    high: { label: "High", stripe: "bg-red-500", badge: "bg-red-500/15 text-red-400 border-red-500/25" },
};

const statusConfig: Record<TaskStatus, { label: string; className: string }> = {
    backlog: { label: "Backlog", className: "bg-slate-500/15 text-slate-400 border-slate-500/25" },
    in_progress: { label: "In Progress", className: "bg-blue-500/15 text-blue-400 border-blue-500/25" },
    in_review: { label: "In Review", className: "bg-amber-500/15 text-amber-400 border-amber-500/25" },
    done: { label: "Done", className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" },
};

export function TaskSheet({ task, open, onClose, onUpdate, onDelete, allTags = [] }: TaskSheetProps) {
    const [editing, setEditing] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState<TaskPriority>("medium");
    const [status, setStatus] = useState<TaskStatus>("backlog");
    const [tags, setTags] = useState<string[]>([]);
    const [dueDate, setDueDate] = useState("");
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    function startEditing() {
        if (!task) return;
        setTitle(task.title);
        setDescription(task.description);
        setPriority(task.priority);
        setStatus(task.status);
        setTags(task.tags);
        setDueDate(task.dueDate ? task.dueDate.slice(0, 10) : "");
        setEditing(true);
    }

    function handleClose() {
        onClose();
        setEditing(false);
    }

    async function handleSave() {
        if (!task) return;
        setSaving(true);
        await onUpdate(task.id, { title, description, priority, status, tags, dueDate: dueDate || undefined });
        setSaving(false);
        setEditing(false);
    }

    async function handleDelete() {
        if (!task) return;
        setDeleting(true);
        await onDelete(task.id);
        setDeleting(false);
        handleClose();
    }

    if (!task) return null;

    const pc = priorityConfig[task.priority];
    const sc = statusConfig[task.status];
    const overdue = isOverdue(task);

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
            <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
                {/* Priority stripe */}
                <div className={`h-1 w-full ${pc.stripe}`} />

                <div className="px-6 pt-5 pb-6">
                    <DialogHeader className="mb-5">
                        <div className="flex items-start justify-between gap-3">
                            <DialogTitle className="text-base font-semibold leading-snug text-foreground flex-1">
                                {editing ? "Edit Task" : task.title}
                            </DialogTitle>
                            {!editing && (
                                <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                                    {overdue && (
                                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full border bg-red-500/15 text-red-400 border-red-500/25 flex items-center gap-1">
                                            <AlertTriangle className="h-3 w-3" /> Overdue
                                        </span>
                                    )}
                                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${pc.badge}`}>
                                        {pc.label}
                                    </span>
                                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${sc.className}`}>
                                        {sc.label}
                                    </span>
                                </div>
                            )}
                        </div>
                    </DialogHeader>

                    {editing ? (
                        /* ── Edit mode ── */
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="edit-title" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Title</Label>
                                <Input
                                    id="edit-title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="edit-desc" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Description</Label>
                                <Textarea
                                    id="edit-desc"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={4}
                                    placeholder="What needs to be done?"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</Label>
                                    <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                                        <SelectTrigger>
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
                                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Priority</Label>
                                    <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                                        <SelectTrigger>
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

                            <div className="space-y-1.5">
                                <Label htmlFor="edit-tags" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tags</Label>
                                <TagsInput value={tags} onChange={setTags} suggestions={allTags} />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="edit-due" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Due Date</Label>
                                <Input
                                    id="edit-due"
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-2 pt-1">
                                <Button variant="outline" onClick={() => setEditing(false)} className="flex-1">
                                    Cancel
                                </Button>
                                <Button onClick={handleSave} disabled={saving || !title.trim()} className="flex-1 shadow-sm shadow-primary/20">
                                    {saving ? "Saving..." : "Save Changes"}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        /* ── View mode ── */
                        <div className="space-y-5">
                            {task.description && (
                                <div>
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Description</p>
                                    <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">{task.description}</p>
                                </div>
                            )}

                            {task.tags.length > 0 && (
                                <div>
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                                        <Tag className="h-3 w-3" /> Tags
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {task.tags.map((tag) => (
                                            <span key={tag} className="text-[11px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-medium">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="rounded-lg bg-muted/40 border border-border p-3 space-y-1.5">
                                {task.dueDate && (
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <CalendarDays className={`h-3 w-3 shrink-0 ${overdue ? "text-red-400" : ""}`} />
                                        <span>Due date</span>
                                        <span className={`ml-auto font-medium ${overdue ? "text-red-400" : "text-foreground/70"}`}>
                                            {new Date(task.dueDate).toLocaleDateString()}
                                            {overdue && " · Overdue"}
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3 shrink-0" />
                                    <span>Created</span>
                                    <span className="ml-auto font-medium text-foreground/70">
                                        {new Date(task.createdAt).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <ArrowRight className="h-3 w-3 shrink-0" />
                                    <span>Updated</span>
                                    <span className="ml-auto font-medium text-foreground/70">
                                        {new Date(task.updatedAt).toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-1">
                                <Button variant="outline" onClick={startEditing} className="flex-1 gap-1.5">
                                    <Pencil className="h-3.5 w-3.5" /> Edit
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger
                                        className="inline-flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-md text-sm font-medium bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive hover:text-white transition-colors h-9 px-4 py-2 disabled:opacity-50"
                                        disabled={deleting}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" /> Delete
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Delete task?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. The task &quot;{task.title}&quot; will be permanently deleted.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
