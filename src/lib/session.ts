import { cookies } from "next/headers";
import { verifyToken } from "./auth";

export async function getUserIdFromCookies(): Promise<string | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;
    const result = await verifyToken(token);
    return result?.userId ?? null;
}
