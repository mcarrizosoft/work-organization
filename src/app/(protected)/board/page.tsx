import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import { readUser } from "@/lib/fileDb";
import { KanbanBoard } from "@/components/board/KanbanBoard";

export default async function BoardPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) redirect("/login");

    const result = await verifyToken(token);
    if (!result) redirect("/login");

    const user = await readUser(result.userId);
    const tasks = user?.tasks ?? [];

    return <KanbanBoard initialTasks={tasks} />;
}
