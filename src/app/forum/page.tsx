import type { Metadata } from "next";
import { ForumListPage } from "@/components/forum/ForumListPage";

export const metadata: Metadata = {
  title: "Forum Diskusi",
  description: "Forum diskusi warga RT 005 RW 002 Kampung Makasar — artikel aktif 14 hari lalu diarsipkan.",
};

export default function ForumPage() {
  return <ForumListPage />;
}
