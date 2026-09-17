"use client";

import "./home.css";
import dynamic from "next/dynamic";
import CornerOrnaments from "./components/home/CornerOrnaments";
import MobileTopBar from "./components/home/MobileTopBar";
import HeroSection from "./components/home/HeroSection";
import ActivityToast from "@/components/home/ActivityToast";

// ── Everything below the fold is code-split ─────────────────────────────────
//
// The hero is the only thing a visitor sees before scrolling, but the whole
// landing hydrated as one client bundle: ~2.2s of script evaluation and 7s+ of
// main-thread work before the browser could get on with painting. Splitting the
// lower sections into their own chunks keeps that work off the critical path,
// which is what the LCP element (the hero <h1>) was queued behind.
//
// `ssr` stays on — the default — so every section is still server-rendered into
// the HTML. This changes WHEN their JavaScript loads, not whether crawlers and
// no-JS visitors see the content, which matters because these sections carry
// most of the page's indexable copy.
const ProblemSection = dynamic(() => import("./components/home/ProblemSection"));
const HowItWorksSection = dynamic(() => import("./components/home/HowItWorksSection"));
const FeaturesSection = dynamic(() => import("./components/home/FeaturesSection"));
const TestimonialsSection = dynamic(() => import("./components/home/TestimonialsSection"));
const CTASection = dynamic(() => import("./components/home/CTASection"));
const SubhSandeshFooter = dynamic(() => import("./components/home/SubhSandeshFooter"));

export default function HomePage() {
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
        <HeroSection />
        <ProblemSection />
        <HowItWorksSection />
        <FeaturesSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <div className="app-footer-shell">
        <SubhSandeshFooter />
      </div>
    </>
  );
}
