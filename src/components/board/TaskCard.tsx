"use client";

import { Draggable } from "@hello-pangea/dnd";
import type { Task } from "@/lib/types";
import { formatDistanceToNow } from "@/lib/dateUtils";
import { isOverdue } from "@/lib/taskUtils";
import { CalendarDays, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const priorityConfig = {
    low: { label: "Low", badge: "bg-slate-500/15 text-slate-400 border-slate-500/20", stripe: "bg-slate-500" },
    medium: { label: "Medium", badge: "bg-amber-500/15 text-amber-400 border-amber-500/20", stripe: "bg-amber-500" },
    high: { label: "High", badge: "bg-red-500/15 text-red-400 border-red-500/20", stripe: "bg-red-500" },
};

interface TaskCardProps {
    task: Task;
    index: number;
    onClick: (task: Task) => void;
}

export function TaskCard({ task, index, onClick }: TaskCardProps) {
    const priority = priorityConfig[task.priority];
    const overdue = isOverdue(task);

    return (
        <Draggable draggableId={task.id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={snapshot.isDragging ? "opacity-90 rotate-1 scale-105" : ""}
                >
                    <div
                        onClick={() => onClick(task)}
                        className={cn(
                            "group mb-2 cursor-pointer rounded-xl border bg-card transition-all duration-200 select-none overflow-hidden",
                            overdue
                                ? "border-red-500/30 hover:border-red-500/60 hover:shadow-lg hover:shadow-red-500/5"
                                : "border-border hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
                        )}
                    >
                        {/* Priority stripe */}
                        <div className={cn("h-0.5 w-full opacity-70", priority.stripe)} />

                        <div className="px-3.5 pt-3 pb-3">
                            <p className={cn(
                                "text-sm font-medium leading-snug mb-2 group-hover:text-primary transition-colors",
                                overdue ? "text-red-400" : "text-foreground"
                            )}>
                                {task.title}
                            </p>

                            {task.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-2.5">
                                    {task.tags.map((tag) => (
                                        <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground font-medium">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className="flex items-center justify-between gap-2">
                                <span className={cn("text-[11px] px-2 py-0.5 rounded-full border font-medium", priority.badge)}>
                                    {priority.label}
                                </span>

                                <div className="flex items-center gap-2 ml-auto">
                                    {task.dueDate && (
                                        <span className={cn(
                                            "flex items-center gap-1 text-[10px] font-medium",
                                            overdue ? "text-red-400" : "text-muted-foreground/70"
                                        )}>
                                            {overdue
                                                ? <AlertTriangle className="h-3 w-3" />
                                                : <CalendarDays className="h-3 w-3" />
                                            }
                                            {new Date(task.dueDate).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" })}
                                        </span>
                                    )}
                                    {!task.dueDate && (
                                        <span className="text-[10px] text-muted-foreground/50">
                                            {formatDistanceToNow(task.updatedAt)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Draggable>
    );
}
