"use client";

import "./home.css";
import CornerOrnaments from "./components/home/CornerOrnaments";
import MobileTopBar from "./components/home/MobileTopBar";
import HeroSection from "./components/home/HeroSection";
import ProblemSection from "./components/home/ProblemSection";
import HowItWorksSection from "./components/home/HowItWorksSection";
import FeaturesSection from "./components/home/FeaturesSection";
import TestimonialsSection from "./components/home/TestimonialsSection";
import CTASection from "./components/home/CTASection";
import SubhSandeshFooter from "./components/home/SubhSandeshFooter";
import ActivityToast from "@/components/home/ActivityToast";
import HydrateOnVisible from "@/components/HydrateOnVisible";
import HalloweenOfferBar from "@/components/promo/HalloweenOfferBar";
import FestivalOfferBar from "@/components/promo/FestivalOfferBar";
import SeasonPendingStrip from "@/components/promo/SeasonPendingStrip";

// ── Everything below the fold hydrates on approach ──────────────────────────
//
// The hero is the only thing a visitor sees before scrolling, but the whole
// landing hydrated as one client tree at load. Each lower section is now
// server-rendered as usual and left as static HTML until it comes within a few
// hundred pixels of the viewport — see components/HydrateOnVisible.tsx.
//
// These were `next/dynamic` imports before. That no longer buys anything: Next
// already fetches the chunks of server-rendered dynamic components at load, and
// the deferral now comes from not hydrating. Worse, dynamic is React.lazy
// underneath, and a lazy component mounted on scroll suspends for a tick and
// renders nothing — the section would collapse to 0px and shift the page. With
// static imports the swap from static HTML to live React is synchronous.
//
// `ssr` behaviour is unchanged: every section is still in the HTML, which
// matters because these sections carry most of the page's indexable copy.
export default function HomePageClient() {
  return (
    <>
      <CornerOrnaments />
      <MobileTopBar />
      {/* Real creation counts, top-right. Shows nothing invented — when there
          is no activity to report it promotes a template instead. */}
      <ActivityToast />
      {/* Lean, alternating light/dark old-design landing:
          Hero (L) → Problem (D) → How It Works (L) → Features (D) → Testimonials (L) → CTA (D) → Footer (L) */}
      <main className="app-main-shell">
        {/* The running Halloween strip, just under the navbar. Its mode comes
            from the server render (page.tsx), so it is in the first paint and
            moves nothing; home.css places it. With India and abroad wearing
            different seasons the server cannot pick, so the strip's box is
            held (SeasonPendingStrip) until the visitor's own answer lands. */}
        <SeasonPendingStrip className="hwb-home" />
        <HalloweenOfferBar source="home-banner" className="hwb-home" />
        <FestivalOfferBar kind="dandiya" source="home-banner" className="fsb-home" />
        <FestivalOfferBar kind="diwali" source="home-banner" className="fsb-home" />
        <HeroSection />
        <HydrateOnVisible><ProblemSection /></HydrateOnVisible>
        <HydrateOnVisible><HowItWorksSection /></HydrateOnVisible>
        <HydrateOnVisible><FeaturesSection /></HydrateOnVisible>
        <HydrateOnVisible><TestimonialsSection /></HydrateOnVisible>
        <HydrateOnVisible><CTASection /></HydrateOnVisible>
      </main>
      <div className="app-footer-shell">
        <HydrateOnVisible><SubhSandeshFooter /></HydrateOnVisible>
      </div>
    </>
  );
}
