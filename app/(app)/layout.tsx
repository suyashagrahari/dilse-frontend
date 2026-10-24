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
import WelcomeHost from "@/components/WelcomeHost";
import SubdomainOnboardingHost from "@/components/subdomain/SubdomainOnboardingHost";
import ToastHost from "@/components/toast/ToastHost";
import SeasonPreviewBadge from "@/components/promo/SeasonPreviewBadge";
import ImpersonationBanner from "@/components/admin/ImpersonationBanner";
import SwipeTabs from "@/components/SwipeTabs";

// The bottom nav's tabs, in its left-to-right order: on a phone or tablet a
// sideways swipe on one of these pages moves to its neighbour, and a swipe
// past Manifesto pulls in the More drawer (BottomNav listens for the event).
const MAIN_TABS = [{ href: "/templates" }, { href: "/feedback" }, { href: "/" }, { href: "/manifesto" }];

export const metadata: Metadata = buildMeta({
  title: "SubhSandesh — Digital Celebration Pages | Weddings, Birthdays & Festivals",
  description:
    "The world's celebration studio: create personalised pages for weddings, birthdays, anniversaries, Christmas, Eid, Diwali and every occasion. AI-written messages, photo galleries, music and RSVPs on one link you can share with anyone, in any country.",
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
        {/* Only the page itself moves on a swipe; the navs and hosts stay put. */}
        <SwipeTabs tabs={MAIN_TABS} media="(max-width: 1023px)" pastEnd="ss:more-swipe">
          <ErrorBoundary>{children}</ErrorBoundary>
        </SwipeTabs>
        {/* Same sheet the templates raise, so sharing a creation from the
            profile offers the QR, the photo QR and the printable card too. */}
        <ShareSheetHost />
        {/* Mounted here as well as in the templates group, because the bus is
            shared and the two layouts are siblings. Nothing in this group asks
            for feedback today — the profile's re-share opts out — but a sheet
            raised from here without that opt-out must find a host rather than
            hanging on a modal nobody renders. */}
        <FeedbackHost />
        {/* Mounted here as well, for the same reason `FeedbackHost` is: the bus
            is shared and the two layouts are siblings. No `preload` — nothing
            in this group publishes, so there is no greeting to warm for. It is
            still the host that tells the bus who is signed in, which is why it
            is not simply left out. */}
        <WelcomeHost />
        <ToastHost />
        <SubdomainOnboardingHost />
        {/* Super admins only: "Previewing as India / abroad" (see /admin/season). */}
        <SeasonPreviewBadge />
      </AppLayoutShell>
    </TemplateSearchProvider>
  );
}
