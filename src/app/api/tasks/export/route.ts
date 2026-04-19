import { NextRequest, NextResponse } from "next/server";
import { readUser } from "@/lib/fileDb";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
    const token = request.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const result = await verifyToken(token);
    if (!result) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await readUser(result.userId);
    const tasks = user?.tasks ?? [];

    const headers = ["ID", "Title", "Description", "Status", "Priority", "Tags", "Due Date", "Created At", "Updated At"];
    const rows = tasks.map((t) => [
        t.id,
        `"${t.title.replace(/"/g, '""')}"`,
        `"${(t.description ?? "").replace(/"/g, '""')}"`,
        t.status,
        t.priority,
        `"${t.tags.join(", ")}"`,
        t.dueDate ?? "",
        t.createdAt,
        t.updatedAt,
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    return new NextResponse(csv, {
        headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="tasks-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
    });
}
