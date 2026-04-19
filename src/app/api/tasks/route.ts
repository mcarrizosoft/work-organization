import { NextRequest, NextResponse } from "next/server";
import { readUser, writeUser } from "@/lib/fileDb";
import { verifyToken } from "@/lib/auth";

async function getUserId(request: NextRequest): Promise<string | null> {
    const token = request.cookies.get("token")?.value;
    if (!token) return null;
    const result = await verifyToken(token);
    return result?.userId ?? null;
}

export async function GET(request: NextRequest) {
    const userId = await getUserId(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await readUser(userId);
    return NextResponse.json(user?.tasks ?? []);
}

export async function POST(request: NextRequest) {
    const userId = await getUserId(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { title, description, priority, tags, status, dueDate } = await request.json();

        if (!title?.trim()) {
            return NextResponse.json({ error: "Title is required" }, { status: 400 });
        }

        const user = await readUser(userId);
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const now = new Date().toISOString();
        const task = {
            id: crypto.randomUUID(),
            title: title.trim(),
            description: description?.trim() ?? "",
            status: status ?? "backlog",
            priority: priority ?? "medium",
            tags: Array.isArray(tags) ? tags : [],
            dueDate: dueDate ?? undefined,
            createdAt: now,
            updatedAt: now,
        };

        user.tasks.push(task);
        await writeUser(user);

        return NextResponse.json(task, { status: 201 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
