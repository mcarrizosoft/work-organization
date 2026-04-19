import bcryptjs from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
    return bcryptjs.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
    password: string,
    hash: string
): Promise<boolean> {
    return bcryptjs.compare(password, hash);
}

function getJwtSecret(): Uint8Array {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET environment variable is not set");
    return new TextEncoder().encode(secret);
}

export async function signToken(userId: string): Promise<string> {
    return new SignJWT({ sub: userId })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("8h")
        .sign(getJwtSecret());
}

export async function verifyToken(
    token: string
): Promise<{ userId: string } | null> {
    try {
        const { payload } = await jwtVerify(token, getJwtSecret());
        return { userId: payload.sub as string };
    } catch {
        return null;
    }
}
