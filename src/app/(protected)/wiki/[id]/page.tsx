import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import { readUser } from "@/lib/fileDb";
import { WikiDetailClient } from "@/components/wiki/WikiDetailClient";

interface Props {
    params: Promise<{ id: string }>;
}

export default async function WikiEntryPage({ params }: Props) {
    const { id } = await params;

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) redirect("/login");

    const result = await verifyToken(token);
    if (!result) redirect("/login");

    const user = await readUser(result.userId);
    const entry = user?.wikiEntries.find((e) => e.id === id);

    if (!entry) notFound();

    return <WikiDetailClient entry={entry} />;
}
