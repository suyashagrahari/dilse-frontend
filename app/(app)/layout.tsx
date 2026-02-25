import type { Metadata } from "next";
import BottomNav from "@/components/BottomNav";
import DesktopNav from "@/components/DesktopNav";
import { WebsiteJsonLd } from "@/components/JsonLd";
import { buildMeta } from "@/lib/seo";
import { TemplateSearchProvider } from "@/components/TemplateSearchProvider";
import GlobalEffects from "@/components/GlobalEffects";

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
    <TemplateSearchProvider>
      <div className="pb-24 md:pb-0">
        <WebsiteJsonLd />
        <GlobalEffects />
        <DesktopNav />
        {children}
        <BottomNav />
      </div>
    </TemplateSearchProvider>
  );
}
