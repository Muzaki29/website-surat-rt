import type { Metadata } from "next";
import { ForumThreadPage } from "@/components/forum/ForumThreadPage";

export const metadata: Metadata = {
  title: "Diskusi Forum",
};

export default async function ForumThreadRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ForumThreadPage threadId={id} />;
}
