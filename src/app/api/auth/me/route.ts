import { NextRequest, NextResponse } from "next/server";
import { readAllUsers } from "@/lib/fileDb";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
    const token = request.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const result = await verifyToken(token);
    if (!result) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const users = await readAllUsers();
    const user = users.find((u) => u.id === result.userId);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({ id: user.id, name: user.name });
}
