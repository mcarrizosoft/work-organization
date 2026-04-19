export type TaskStatus = "backlog" | "in_progress" | "in_review" | "done";
export type TaskPriority = "low" | "medium" | "high";
export type SortOption = "none" | "priority" | "dueDate" | "updatedAt";
export type ViewMode = "kanban" | "list";

export interface Task {
    id: string;
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    tags: string[];
    dueDate?: string;
    createdAt: string;
    updatedAt: string;
}

export interface WikiEntry {
    id: string;
    title: string;
    content: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
}

export interface UserData {
    id: string;
    name: string;
    tasks: Task[];
    wikiEntries: WikiEntry[];
}

export interface UserIndex {
    id: string;
    name: string;
    passwordHash: string;
}
