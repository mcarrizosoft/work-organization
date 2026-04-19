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
    { params }: { params: Promise<{ entryId: string }> }
) {
    const userId = await getUserId(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { entryId } = await params;

    try {
        const updates = await request.json();
        const user = await readUser(userId);
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const idx = user.wikiEntries.findIndex((e) => e.id === entryId);
        if (idx === -1) return NextResponse.json({ error: "Entry not found" }, { status: 404 });

        user.wikiEntries[idx] = {
            ...user.wikiEntries[idx],
            ...updates,
            id: entryId,
            updatedAt: new Date().toISOString(),
        };

        await writeUser(user);
        return NextResponse.json(user.wikiEntries[idx]);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ entryId: string }> }
) {
    const userId = await getUserId(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { entryId } = await params;

    try {
        const user = await readUser(userId);
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const before = user.wikiEntries.length;
        user.wikiEntries = user.wikiEntries.filter((e) => e.id !== entryId);

        if (user.wikiEntries.length === before) {
            return NextResponse.json({ error: "Entry not found" }, { status: 404 });
        }

        await writeUser(user);
        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
