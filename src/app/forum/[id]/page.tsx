import type { Metadata } from "next";
import { ForumChatPage } from "@/components/forum/ForumChatPage";

export const metadata: Metadata = {
  title: "Diskusi Forum",
};

export default async function ForumThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ForumChatPage threadId={id} />;
}
