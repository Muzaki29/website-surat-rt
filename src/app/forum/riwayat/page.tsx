import type { Metadata } from "next";
import { ForumHistoryListPage } from "@/components/forum/ForumHistoryListPage";

export const metadata: Metadata = {
  title: "Riwayat Arsip Forum",
  description: "Log history diskusi warga RT yang sudah diarsipkan.",
};

export default function ForumRiwayatPage() {
  return <ForumHistoryListPage />;
}
