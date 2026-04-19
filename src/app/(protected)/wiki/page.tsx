import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import { readUser } from "@/lib/fileDb";
import { WikiList } from "@/components/wiki/WikiList";

export default async function WikiPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) redirect("/login");

    const result = await verifyToken(token);
    if (!result) redirect("/login");

    const user = await readUser(result.userId);
    const entries = user?.wikiEntries ?? [];

    // Sort newest first
    const sorted = [...entries].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    return <WikiList initialEntries={sorted} />;
}
