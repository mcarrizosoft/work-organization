"use client";

import { Droppable } from "@hello-pangea/dnd";
import type { Task, TaskStatus } from "@/lib/types";
import { TaskCard } from "./TaskCard";

const columnConfig: Record<TaskStatus, { label: string; dot: string; dimDot: string }> = {
    backlog: { label: "Backlog", dot: "bg-slate-400", dimDot: "bg-slate-400/20" },
    in_progress: { label: "In Progress", dot: "bg-blue-400", dimDot: "bg-blue-400/15" },
    in_review: { label: "In Review", dot: "bg-amber-400", dimDot: "bg-amber-400/15" },
    done: { label: "Done", dot: "bg-emerald-400", dimDot: "bg-emerald-400/15" },
};

interface KanbanColumnProps {
    status: TaskStatus;
    tasks: Task[];
    onCardClick: (task: Task) => void;
}

export function KanbanColumn({ status, tasks, onCardClick }: KanbanColumnProps) {
    const config = columnConfig[status];

    return (
        <div className="flex flex-col w-72 shrink-0">
            <div className="flex items-center gap-2.5 mb-3 px-1">
                <div className={`h-2 w-2 rounded-full ${config.dot}`} />
                <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {config.label}
                </h2>
                <span className={`ml-auto text-[11px] font-semibold leading-none px-2 py-1 rounded-full ${config.dimDot} text-foreground/70`}>
                    {tasks.length}
                </span>
            </div>

            <Droppable droppableId={status}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 min-h-24 rounded-xl p-2 transition-all duration-200 ${snapshot.isDraggingOver
                                ? "bg-primary/8 ring-1 ring-primary/20"
                                : "bg-muted/20"
                            }`}
                    >
                        {tasks.map((task, index) => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                index={index}
                                onClick={onCardClick}
                            />
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </div>
    );
}
