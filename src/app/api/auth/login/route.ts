import { NextRequest, NextResponse } from "next/server";
import { readAllUsers } from "@/lib/fileDb";
import { verifyPassword, signToken } from "@/lib/auth";

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
        const user = users.find(
            (u) => u.id === username.toLowerCase().trim()
        );

        if (!user) {
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401 }
            );
        }

        const valid = await verifyPassword(password, user.passwordHash);
        if (!valid) {
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401 }
            );
        }

        const token = await signToken(user.id);

        const response = NextResponse.json({ ok: true, userId: user.id, name: user.name });
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
