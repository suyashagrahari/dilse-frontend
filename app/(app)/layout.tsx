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
import FeedbackHost from "@/components/FeedbackHost";
import ToastHost from "@/components/toast/ToastHost";
import ImpersonationBanner from "@/components/admin/ImpersonationBanner";

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
        {/* Renders nothing unless THIS tab holds an impersonation session.
            Mounted at the layout so it cannot be scrolled past or missed on a
            sub-page — the hazard of impersonation is forgetting you are in it. */}
        <ImpersonationBanner />
        <ErrorBoundary>{children}</ErrorBoundary>
        {/* Same sheet the templates raise, so sharing a creation from the
            profile offers the QR, the photo QR and the printable card too. */}
        <ShareSheetHost />
        {/* Mounted here as well as in the templates group, because the bus is
            shared and the two layouts are siblings. Nothing in this group asks
            for feedback today — the profile's re-share opts out — but a sheet
            raised from here without that opt-out must find a host rather than
            hanging on a modal nobody renders. */}
        <FeedbackHost />
        <ToastHost />
      </AppLayoutShell>
    </TemplateSearchProvider>
  );
}
