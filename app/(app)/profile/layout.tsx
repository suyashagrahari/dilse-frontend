import type { Metadata } from "next";
import { buildMeta } from "@/lib/seo";

export const metadata: Metadata = buildMeta({
  title: "Your Profile | Manage Creations & Settings",
  description: "View your created gift pages, shared links, password settings, and manage your account preferences.",
  robots: { index: false, follow: false },
});

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
