import type { Metadata } from "next";
import NavMount from "@/components/NavMount";
import { WebsiteJsonLd } from "@/components/JsonLd";
import { buildMeta } from "@/lib/seo";
import { TemplateSearchProvider } from "@/components/TemplateSearchProvider";
import GlobalEffects from "@/components/GlobalEffects";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import AppLayoutShell from "./AppLayoutShell";
import AppSplash from "@/components/AppSplash";
import { ShareSheetHost } from "@/components/share/ShareSheetHost";

export const metadata: Metadata = buildMeta({
  title: "SubhSandesh — Digital Celebration Pages | Weddings, Birthdays & Festivals",
  description:
    "Create stunning personalised celebration pages for weddings, birthdays, Holi, Eid, and every Indian occasion. AI-powered messages, photo galleries, music playlists, and more.",
});

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TemplateSearchProvider>
      <AppSplash />
      <AppLayoutShell>
        <WebsiteJsonLd />
        <GlobalEffects />
        <NavMount />
        <ErrorBoundary>{children}</ErrorBoundary>
        {/* Same sheet the templates raise, so sharing a creation from the
            profile offers the QR, the photo QR and the printable card too. */}
        <ShareSheetHost />
      </AppLayoutShell>
    </TemplateSearchProvider>
  );
}
