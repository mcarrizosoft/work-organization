"use client";

import type { Task, TaskPriority, TaskStatus } from "@/lib/types";
import { formatDistanceToNow } from "@/lib/dateUtils";
import { isOverdue } from "@/lib/taskUtils";
import { AlertTriangle, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

const priorityConfig: Record<TaskPriority, { label: string; className: string }> = {
    low: { label: "Low", className: "bg-slate-500/15 text-slate-400 border-slate-500/20" },
    medium: { label: "Medium", className: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
    high: { label: "High", className: "bg-red-500/15 text-red-400 border-red-500/20" },
};

const statusConfig: Record<TaskStatus, { label: string; dot: string }> = {
    backlog: { label: "Backlog", dot: "bg-slate-400" },
    in_progress: { label: "In Progress", dot: "bg-blue-400" },
    in_review: { label: "In Review", dot: "bg-amber-400" },
    done: { label: "Done", dot: "bg-emerald-400" },
};

interface TaskListViewProps {
    tasks: Task[];
    onTaskClick: (task: Task) => void;
}

export function TaskListView({ tasks, onTaskClick }: TaskListViewProps) {
    if (tasks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
                <p className="text-sm">No tasks match the current filters.</p>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-border overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[1fr_100px_110px_120px_100px] gap-3 px-4 py-2.5 border-b border-border bg-muted/30 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <span>Task</span>
                <span>Priority</span>
                <span>Status</span>
                <span>Due Date</span>
                <span className="text-right">Updated</span>
            </div>

            {/* Rows */}
            {tasks.map((task, i) => {
                const pc = priorityConfig[task.priority];
                const sc = statusConfig[task.status];
                const overdue = isOverdue(task);

                return (
                    <div
                        key={task.id}
                        onClick={() => onTaskClick(task)}
                        className={cn(
                            "grid grid-cols-[1fr_100px_110px_120px_100px] gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-muted/30",
                            i !== tasks.length - 1 && "border-b border-border/60",
                            overdue && "bg-red-500/3"
                        )}
                    >
                        {/* Title + tags */}
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                {overdue && <AlertTriangle className="h-3.5 w-3.5 text-red-400 shrink-0" />}
                                <p className={cn("text-sm font-medium truncate", overdue ? "text-red-400" : "text-foreground")}>
                                    {task.title}
                                </p>
                            </div>
                            {task.tags.length > 0 && (
                                <div className="flex gap-1 mt-1 flex-wrap">
                                    {task.tags.map((tag) => (
                                        <span key={tag} className="text-[10px] px-1.5 py-0 rounded bg-muted text-muted-foreground font-medium">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Priority */}
                        <div className="flex items-center">
                            <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded-full border", pc.className)}>
                                {pc.label}
                            </span>
                        </div>

                        {/* Status */}
                        <div className="flex items-center gap-1.5">
                            <div className={cn("h-1.5 w-1.5 rounded-full shrink-0", sc.dot)} />
                            <span className="text-xs text-muted-foreground">{sc.label}</span>
                        </div>

                        {/* Due date */}
                        <div className="flex items-center gap-1.5">
                            {task.dueDate ? (
                                <>
                                    <CalendarDays className={cn("h-3 w-3 shrink-0", overdue ? "text-red-400" : "text-muted-foreground")} />
                                    <span className={cn("text-xs", overdue ? "text-red-400 font-medium" : "text-muted-foreground")}>
                                        {new Date(task.dueDate).toLocaleDateString()}
                                    </span>
                                </>
                            ) : (
                                <span className="text-xs text-muted-foreground/40">—</span>
                            )}
                        </div>

                        {/* Updated */}
                        <div className="flex items-center justify-end">
                            <span className="text-xs text-muted-foreground">{formatDistanceToNow(task.updatedAt)}</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
