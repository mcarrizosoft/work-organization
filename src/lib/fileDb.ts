import { Redis } from "@upstash/redis";
import type { UserData, UserIndex } from "./types";

const redis = Redis.fromEnv();

export async function readAllUsers(): Promise<UserIndex[]> {
    const data = await redis.get<UserIndex[]>("users_index");
    return data ?? [];
}

export async function writeAllUsers(users: UserIndex[]): Promise<void> {
    await redis.set("users_index", users);
}

export async function readUser(userId: string): Promise<UserData | null> {
    const data = await redis.get<UserData>(`user:${userId}`);
    return data ?? null;
}

export async function writeUser(data: UserData): Promise<void> {
    await redis.set(`user:${data.id}`, data);
}
