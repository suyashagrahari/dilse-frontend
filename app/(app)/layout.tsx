import type { Metadata } from "next";
import BottomNav from "@/components/BottomNav";
import { WebsiteJsonLd } from "@/components/JsonLd";
import { buildMeta } from "@/lib/seo";

export const metadata: Metadata = buildMeta({
  title: "Gifts - Make Every Moment Special | Personalized Gift Pages",
  description:
    "Create stunning personalized gift pages for birthdays, Valentine's Day, anniversaries, and more. Design, customize, and share beautiful surprises with a unique link.",
});

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="pb-24">
      <WebsiteJsonLd />
      {children}
      <BottomNav />
    </div>
  );
}
