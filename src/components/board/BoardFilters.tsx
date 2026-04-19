"use client";

import { Search, X, SlidersHorizontal, List, LayoutGrid } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { TaskPriority, TaskStatus, SortOption, ViewMode } from "@/lib/types";
import { cn } from "@/lib/utils";

interface BoardFiltersProps {
    search: string;
    onSearchChange: (v: string) => void;
    filterPriority: TaskPriority | "all";
    onFilterPriority: (v: TaskPriority | "all") => void;
    filterStatus: TaskStatus | "all";
    onFilterStatus: (v: TaskStatus | "all") => void;
    filterTag: string;
    onFilterTag: (v: string) => void;
    sort: SortOption;
    onSort: (v: SortOption) => void;
    viewMode: ViewMode;
    onViewMode: (v: ViewMode) => void;
    allTags: string[];
    activeCount: number;
    totalCount: number;
}

const priorities: { value: TaskPriority | "all"; label: string }[] = [
    { value: "all", label: "All" },
    { value: "high", label: "High" },
    { value: "medium", label: "Med" },
    { value: "low", label: "Low" },
];

const statuses: { value: TaskStatus | "all"; label: string }[] = [
    { value: "all", label: "All" },
    { value: "backlog", label: "Backlog" },
    { value: "in_progress", label: "In Progress" },
    { value: "in_review", label: "In Review" },
    { value: "done", label: "Done" },
];

const sorts: { value: SortOption; label: string }[] = [
    { value: "none", label: "Default" },
    { value: "priority", label: "Priority" },
    { value: "dueDate", label: "Due Date" },
    { value: "updatedAt", label: "Last Updated" },
];

export function BoardFilters({
    search, onSearchChange,
    filterPriority, onFilterPriority,
    filterStatus, onFilterStatus,
    filterTag, onFilterTag,
    sort, onSort,
    viewMode, onViewMode,
    allTags,
    activeCount, totalCount,
}: BoardFiltersProps) {
    const hasActiveFilters = search || filterPriority !== "all" || filterStatus !== "all" || filterTag;

    function clearAll() {
        onSearchChange("");
        onFilterPriority("all");
        onFilterStatus("all");
        onFilterTag("");
        onSort("none");
    }

    return (
        <div className="space-y-2.5 mb-5">
            {/* Top row: search + view toggle */}
            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                    <Input
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Search tasks…"
                        className="pl-9 h-8 text-sm"
                    />
                    {search && (
                        <button onClick={() => onSearchChange("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-1 ml-auto">
                    {/* View toggle */}
                    <div className="flex items-center rounded-md border border-border bg-muted/30 p-0.5">
                        <button
                            onClick={() => onViewMode("kanban")}
                            className={cn("rounded p-1.5 transition-colors", viewMode === "kanban" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
                            title="Kanban view"
                        >
                            <LayoutGrid className="h-3.5 w-3.5" />
                        </button>
                        <button
                            onClick={() => onViewMode("list")}
                            className={cn("rounded p-1.5 transition-colors", viewMode === "list" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
                            title="List view"
                        >
                            <List className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Second row: filters + sort */}
            <div className="flex flex-wrap items-center gap-2">
                {/* Priority pills */}
                <div className="flex items-center gap-1">
                    {priorities.map((p) => (
                        <button
                            key={p.value}
                            onClick={() => onFilterPriority(p.value)}
                            className={cn(
                                "px-2.5 py-0.5 rounded-full text-[11px] font-medium border transition-colors",
                                filterPriority === p.value
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                            )}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>

                <div className="h-4 w-px bg-border" />

                {/* Status pills */}
                <div className="flex items-center gap-1 flex-wrap">
                    {statuses.map((s) => (
                        <button
                            key={s.value}
                            onClick={() => onFilterStatus(s.value)}
                            className={cn(
                                "px-2.5 py-0.5 rounded-full text-[11px] font-medium border transition-colors",
                                filterStatus === s.value
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                            )}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>

                <div className="h-4 w-px bg-border" />

                {/* Sort */}
                <div className="flex items-center gap-1.5">
                    <SlidersHorizontal className="h-3 w-3 text-muted-foreground" />
                    <select
                        value={sort}
                        onChange={(e) => onSort(e.target.value as SortOption)}
                        className="text-[11px] bg-transparent border-none outline-none text-muted-foreground cursor-pointer hover:text-foreground"
                    >
                        {sorts.map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                    </select>
                </div>

                {/* Tag filter */}
                {allTags.length > 0 && (
                    <>
                        <div className="h-4 w-px bg-border" />
                        <div className="flex flex-wrap gap-1">
                            {allTags.slice(0, 8).map((tag) => (
                                <button
                                    key={tag}
                                    onClick={() => onFilterTag(filterTag === tag ? "" : tag)}
                                    className={cn(
                                        "px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors",
                                        filterTag === tag
                                            ? "bg-primary/20 text-primary"
                                            : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                                    )}
                                >
                                    #{tag}
                                </button>
                            ))}
                        </div>
                    </>
                )}

                {/* Active count + clear */}
                <div className="ml-auto flex items-center gap-2">
                    {hasActiveFilters && (
                        <span className="text-[11px] text-muted-foreground">{activeCount}/{totalCount}</span>
                    )}
                    {hasActiveFilters && (
                        <Button variant="ghost" size="sm" onClick={clearAll} className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground">
                            <X className="h-3 w-3 mr-1" /> Clear
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
