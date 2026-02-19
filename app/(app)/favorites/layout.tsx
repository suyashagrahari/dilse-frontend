import type { Metadata } from "next";
import { buildMeta } from "@/lib/seo";

export const metadata: Metadata = buildMeta({
  title: "Your Favorites | Saved Gift Templates",
  description: "Access your favorite gift templates quickly. Browse and manage your saved templates.",
  robots: { index: false, follow: false },
});

export default function FavoritesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
