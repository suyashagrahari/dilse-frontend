import type { Metadata } from "next";
import NavMount from "@/components/NavMount";
import { WebsiteJsonLd } from "@/components/JsonLd";
import { buildMeta } from "@/lib/seo";
import { TemplateSearchProvider } from "@/components/TemplateSearchProvider";
import GlobalEffects from "@/components/GlobalEffects";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import AppLayoutShell from "./AppLayoutShell";

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
      <AppLayoutShell>
        <WebsiteJsonLd />
        <GlobalEffects />
        <NavMount />
        <ErrorBoundary>{children}</ErrorBoundary>
      </AppLayoutShell>
    </TemplateSearchProvider>
  );
}
