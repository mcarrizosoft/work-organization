import { NextRequest, NextResponse } from "next/server";
import { readUser, writeUser } from "@/lib/fileDb";
import { verifyToken } from "@/lib/auth";

async function getUserId(request: NextRequest): Promise<string | null> {
    const token = request.cookies.get("token")?.value;
    if (!token) return null;
    const result = await verifyToken(token);
    return result?.userId ?? null;
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ taskId: string }> }
) {
    const userId = await getUserId(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { taskId } = await params;

    try {
        const updates = await request.json();
        const user = await readUser(userId);
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const idx = user.tasks.findIndex((t) => t.id === taskId);
        if (idx === -1) return NextResponse.json({ error: "Task not found" }, { status: 404 });

        user.tasks[idx] = {
            ...user.tasks[idx],
            ...updates,
            id: taskId,
            updatedAt: new Date().toISOString(),
        };

        await writeUser(user);
        return NextResponse.json(user.tasks[idx]);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ taskId: string }> }
) {
    const userId = await getUserId(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { taskId } = await params;

    try {
        const user = await readUser(userId);
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const before = user.tasks.length;
        user.tasks = user.tasks.filter((t) => t.id !== taskId);

        if (user.tasks.length === before) {
            return NextResponse.json({ error: "Task not found" }, { status: 404 });
        }

        await writeUser(user);
        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
