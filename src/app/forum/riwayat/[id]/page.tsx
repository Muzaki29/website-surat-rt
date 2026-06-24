import type { Metadata } from "next";
import { ForumHistoryDetailPage } from "@/components/forum/ForumHistoryDetailPage";

export const metadata: Metadata = {
  title: "Arsip Forum",
};

export default async function ForumRiwayatDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ForumHistoryDetailPage logId={id} />;
}
