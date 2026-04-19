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
    return NextResponse.json(user?.wikiEntries ?? []);
}

export async function POST(request: NextRequest) {
    const userId = await getUserId(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { title, content, tags } = await request.json();

        if (!title?.trim()) {
            return NextResponse.json({ error: "Title is required" }, { status: 400 });
        }

        const user = await readUser(userId);
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const now = new Date().toISOString();
        const entry = {
            id: crypto.randomUUID(),
            title: title.trim(),
            content: content ?? "",
            tags: Array.isArray(tags) ? tags : [],
            createdAt: now,
            updatedAt: now,
        };

        user.wikiEntries.push(entry);
        await writeUser(user);

        return NextResponse.json(entry, { status: 201 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
