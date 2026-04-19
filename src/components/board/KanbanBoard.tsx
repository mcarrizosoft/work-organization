"use client";

import { useState, useCallback, useEffect } from "react";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import type { Task, TaskStatus, TaskPriority, SortOption, ViewMode } from "@/lib/types";
import { filterTasks, sortTasks, getAllTags } from "@/lib/taskUtils";
import { KanbanColumn } from "./KanbanColumn";
import { TaskSheet } from "./TaskSheet";
import { TaskDialog } from "./TaskDialog";
import { TaskListView } from "./TaskListView";
import { BoardFilters } from "./BoardFilters";
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";

const COLUMNS: TaskStatus[] = ["backlog", "in_progress", "in_review", "done"];

interface KanbanBoardProps {
    initialTasks: Task[];
    onInProgressChange?: (count: number) => void;
}

export function KanbanBoard({ initialTasks, onInProgressChange }: KanbanBoardProps) {
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);

    // Filters
    const [search, setSearch] = useState("");
    const [filterPriority, setFilterPriority] = useState<TaskPriority | "all">("all");
    const [filterStatus, setFilterStatus] = useState<TaskStatus | "all">("all");
    const [filterTag, setFilterTag] = useState("");
    const [sort, setSort] = useState<SortOption>("none");
    const [viewMode, setViewMode] = useState<ViewMode>("kanban");

    const allTags = getAllTags(tasks);
    const filtered = sortTasks(filterTasks(tasks, search, filterPriority, filterStatus, filterTag), sort);

    // Quick-add shortcut: press N to open new task dialog
    useEffect(() => {
        function onKeyDown(e: KeyboardEvent) {
            const tag = (e.target as HTMLElement).tagName;
            if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
            if (e.key === "n" || e.key === "N") {
                e.preventDefault();
                setDialogOpen(true);
            }
        }
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, []);

    function notifyInProgress(updatedTasks: Task[]) {
        const count = updatedTasks.filter((t) => t.status === "in_progress").length;
        onInProgressChange?.(count);
    }

    const handleDragEnd = useCallback(
        async (result: DropResult) => {
            if (!result.destination) return;
            const sourceStatus = result.source.droppableId as TaskStatus;
            const destStatus = result.destination.droppableId as TaskStatus;
            if (sourceStatus === destStatus && result.source.index === result.destination.index) return;

            const taskId = result.draggableId;
            const updated = tasks.map((t) =>
                t.id === taskId ? { ...t, status: destStatus, updatedAt: new Date().toISOString() } : t
            );
            setTasks(updated);
            notifyInProgress(updated);

            try {
                await fetch(`/api/tasks/${taskId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: destStatus }),
                });
            } catch {
                setTasks(tasks);
                notifyInProgress(tasks);
            }
        },
        [tasks]
    );

    async function handleCreate(data: {
        title: string; description: string; priority: Task["priority"];
        status: TaskStatus; tags: string[]; dueDate?: string;
    }) {
        const res = await fetch("/api/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (res.ok) {
            const newTask: Task = await res.json();
            const updated = [...tasks, newTask];
            setTasks(updated);
            notifyInProgress(updated);
        }
    }

    async function handleUpdate(taskId: string, updates: Partial<Task>) {
        const res = await fetch(`/api/tasks/${taskId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates),
        });
        if (res.ok) {
            const updatedTask: Task = await res.json();
            const updated = tasks.map((t) => (t.id === taskId ? updatedTask : t));
            setTasks(updated);
            setSelectedTask(updatedTask);
            notifyInProgress(updated);
        }
    }

    async function handleDelete(taskId: string) {
        const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
        if (res.ok) {
            const updated = tasks.filter((t) => t.id !== taskId);
            setTasks(updated);
            notifyInProgress(updated);
        }
    }

    function openTaskSheet(task: Task) {
        setSelectedTask(task);
        setSheetOpen(true);
    }

    function handleExport() {
        window.location.href = "/api/tasks/export";
    }

    const overdueCount = tasks.filter((t) => t.status !== "done" && t.dueDate && new Date(t.dueDate) < new Date()).length;

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-xl font-bold text-foreground">Board</h1>
                    <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-sm text-muted-foreground">{tasks.length} task{tasks.length !== 1 ? "s" : ""}</p>
                        {overdueCount > 0 && (
                            <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-full bg-red-500/15 text-red-400">
                                {overdueCount} overdue
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5 text-muted-foreground hover:text-foreground" title="Export CSV">
                        <Download className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Export</span>
                    </Button>
                    <Button onClick={() => setDialogOpen(true)} size="sm" className="gap-1.5 shadow-sm shadow-primary/20">
                        <Plus className="h-4 w-4" />
                        New Task
                        <kbd className="hidden sm:inline-flex items-center rounded border border-primary-foreground/20 bg-primary-foreground/10 px-1 text-[10px] font-mono">N</kbd>
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <BoardFilters
                search={search} onSearchChange={setSearch}
                filterPriority={filterPriority} onFilterPriority={setFilterPriority}
                filterStatus={filterStatus} onFilterStatus={setFilterStatus}
                filterTag={filterTag} onFilterTag={setFilterTag}
                sort={sort} onSort={setSort}
                viewMode={viewMode} onViewMode={setViewMode}
                allTags={allTags}
                activeCount={filtered.length}
                totalCount={tasks.length}
            />

            {/* Content */}
            {viewMode === "kanban" ? (
                <DragDropContext onDragEnd={handleDragEnd}>
                    <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
                        {COLUMNS.map((status) => (
                            <KanbanColumn
                                key={status}
                                status={status}
                                tasks={filtered.filter((t) => t.status === status)}
                                onCardClick={openTaskSheet}
                            />
                        ))}
                    </div>
                </DragDropContext>
            ) : (
                <TaskListView tasks={filtered} onTaskClick={openTaskSheet} />
            )}

            <TaskSheet
                task={selectedTask}
                open={sheetOpen}
                onClose={() => { setSheetOpen(false); setSelectedTask(null); }}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                allTags={allTags}
            />

            <TaskDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onCreate={handleCreate}
                allTags={allTags}
            />
        </div>
    );
}
