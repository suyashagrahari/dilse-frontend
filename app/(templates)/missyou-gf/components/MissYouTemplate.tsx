"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { MissYouData } from "./types";
import { NIGHT, FONT_HEADING, tintAccent } from "./theme";
import Starfield from "./Starfield";
import EnvelopeCover from "./EnvelopeCover";
import LetterSection from "./LetterSection";
import DistanceWidget from "./DistanceWidget";
import MemoryTimeline from "./MemoryTimeline";
import QuizCards from "./QuizCards";
import ScratchSecret from "./ScratchSecret";
import OpenWhenGrid from "./OpenWhenGrid";
import FinaleHug from "./FinaleHug";
import BackgroundMusic from "./BackgroundMusic";
import BottomNav, { type SectionId } from "./BottomNav";

interface Props {
  data: MissYouData;
  mode: "preview" | "live";
  shareId?: string;
  hasPassword?: boolean;
}

const ORDER: SectionId[] = ["cover", "letter", "distance", "memories", "secret", "openwhen", "finale"];

export default function MissYouTemplate({ data, mode }: Props) {
  const reduce = useReducedMotion();
  const [opened, setOpened] = useState(false);
  const [active, setActive] = useState<SectionId>("letter");
  const accent = tintAccent(data.accentTint);
  const refs = useRef<Record<string, HTMLElement | null>>({});
  const petName = data.petName?.trim() || data.recipientName?.trim() || "you";

  // scroll-spy — track which section is in view for the nav
  useEffect(() => {
    if (!opened) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (vis) setActive(vis.target.getAttribute("data-sec") as SectionId);
      },
      { threshold: [0.4, 0.6], rootMargin: "-10% 0px -40% 0px" },
    );
    ORDER.slice(1).forEach((id) => { const el = refs.current[id]; if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, [opened]);

  const go = (id: SectionId) => {
    if (id === "cover") { window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); return; }
    refs.current[id]?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };

  const setRef = (id: SectionId) => (el: HTMLElement | null) => { refs.current[id] = el; };

  const sectionStyle: React.CSSProperties = {
    minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center",
    padding: "64px 20px 96px", position: "relative", zIndex: 2, scrollMarginTop: 0,
  };

  const Reveal = ({ children }: { children: React.ReactNode }) => (
    <motion.div
      initial={{ opacity: 0, y: reduce ? 0 : 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: reduce ? 0.2 : 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{ width: "100%" }}
    >
      {children}
    </motion.div>
  );

  return (
    <div style={{ position: "relative", minHeight: "100dvh", background: NIGHT.gradient, overflowX: "clip" }}>
      {/* single h1 for the page (visually hidden) */}
      <h1 style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap", border: 0, padding: 0, margin: -1 }}>
        A miss-you letter for {petName}
      </h1>

      {/* fixed ambient starfield behind everything */}
      <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0 }}>
        <Starfield active={opened} tint={accent} />
      </div>

      {/* Envelope cover overlay (until opened) */}
      {!opened && <EnvelopeCover data={data} accent={accent} onOpen={() => setOpened(true)} />}

      {opened && (
        <>
          {/* SubhSandesh brand — top-right on the shared page; doubles as create-your-own */}
          {mode === "live" && (
            <Link href="/templates" aria-label="SubhSandesh — create your own"
              style={{ position: "fixed", top: 12, right: 12, zIndex: 46, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, textDecoration: "none" }}>
              <span style={{ width: 38, height: 38, borderRadius: 11, overflow: "hidden", background: "rgba(27,24,48,.85)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", border: `1px solid ${NIGHT.hairline}`, display: "grid", placeItems: "center", boxShadow: "0 6px 18px -6px rgba(108,92,231,.5)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.webp" alt="SubhSandesh" width={30} height={30} style={{ objectFit: "contain" }} />
              </span>
              <span style={{ fontFamily: FONT_HEADING, fontSize: 8, fontWeight: 700, color: NIGHT.mutedNight, letterSpacing: ".04em", opacity: 0.85, lineHeight: 1 }}>SubhSandesh</span>
            </Link>
          )}

          <BackgroundMusic url={data.backgroundMusic} offerOpen={opened} />

          <main>
            <section data-sec="letter" ref={setRef("letter")} style={sectionStyle}>
              <Reveal><LetterSection data={data} active={opened} /></Reveal>
            </section>
            <section data-sec="distance" ref={setRef("distance")} style={sectionStyle}>
              <Reveal><DistanceWidget data={data} /></Reveal>
            </section>
            <section data-sec="memories" ref={setRef("memories")} style={sectionStyle}>
              <Reveal><div style={{ width: "100%" }}><MemoryTimeline data={data} /><QuizCards data={data} /></div></Reveal>
            </section>
            <section data-sec="secret" ref={setRef("secret")} style={sectionStyle}>
              <Reveal><ScratchSecret data={data} /></Reveal>
            </section>
            <section data-sec="openwhen" ref={setRef("openwhen")} style={sectionStyle}>
              <Reveal><OpenWhenGrid data={data} /></Reveal>
            </section>
            <section data-sec="finale" ref={setRef("finale")} style={sectionStyle}>
              <Reveal><FinaleHug data={data} mode={mode} /></Reveal>
            </section>
          </main>

          <BottomNav active={active} onGo={go} accent={accent} />
        </>
      )}
    </div>
  );
}
