import type { Task, TaskPriority, SortOption } from "./types";

export function isOverdue(task: Task): boolean {
    if (!task.dueDate || task.status === "done") return false;
    return new Date(task.dueDate) < new Date();
}

const priorityWeight: Record<TaskPriority, number> = { high: 3, medium: 2, low: 1 };

export function sortTasks(tasks: Task[], sort: SortOption): Task[] {
    if (sort === "none") return tasks;
    return [...tasks].sort((a, b) => {
        if (sort === "priority") return priorityWeight[b.priority] - priorityWeight[a.priority];
        if (sort === "dueDate") {
            if (!a.dueDate && !b.dueDate) return 0;
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        if (sort === "updatedAt") return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        return 0;
    });
}

export function filterTasks(
    tasks: Task[],
    search: string,
    priority: string,
    status: string,
    tag: string
): Task[] {
    return tasks.filter((t) => {
        if (search && !t.title.toLowerCase().includes(search.toLowerCase()) &&
            !t.description.toLowerCase().includes(search.toLowerCase())) return false;
        if (priority !== "all" && t.priority !== priority) return false;
        if (status !== "all" && t.status !== status) return false;
        if (tag && !t.tags.includes(tag)) return false;
        return true;
    });
}

export function getAllTags(tasks: Task[]): string[] {
    const set = new Set<string>();
    tasks.forEach((t) => t.tags.forEach((tag) => set.add(tag)));
    return Array.from(set).sort();
}
