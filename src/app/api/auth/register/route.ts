import { NextRequest, NextResponse } from "next/server";
import { readAllUsers, writeUser } from "@/lib/fileDb";
import { hashPassword, signToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json(
                { error: "Username and password are required" },
                { status: 400 }
            );
        }

        const users = await readAllUsers();

        if (users.length > 0) {
            return NextResponse.json(
                { error: "Registration is closed. A user already exists." },
                { status: 403 }
            );
        }

        const id = username.toLowerCase().trim();
        const passwordHash = await hashPassword(password);

        const newUserIndex = { id, name: username.trim(), passwordHash };
        await import("@/lib/fileDb").then(({ writeAllUsers }) =>
            writeAllUsers([newUserIndex])
        );

        await writeUser({ id, name: username.trim(), tasks: [], wikiEntries: [] });

        const token = await signToken(id);

        const response = NextResponse.json({ ok: true, userId: id });
        response.cookies.set("token", token, {
            httpOnly: true,
            maxAge: 60 * 60 * 8,
            path: "/",
            sameSite: "lax",
        });

        return response;
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
