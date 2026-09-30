"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { templateList } from "@/data/template-registry";
import TrendingShowcase from "./TrendingShowcase";

const STATS = [
  { n: "50K+", l: "Pages Created" },
  { n: `${Math.floor(templateList.length / 10) * 10}+`, l: "Templates" },
  { n: "4.9★", l: "Loved Rating" },
];

export default function HeroSection() {
  const router = useRouter();

  const goTemplates = useCallback(() => router.push("/templates"), [router]);
  return (
    <section id="hero" className="hero-section" style={{
      background: '#f5ede6', minHeight: 'min(100vh, 900px)', display: 'flex', alignItems: 'center',
      paddingTop: 112, paddingBottom: 56, position: 'relative', overflow: 'hidden', width: '100%'
    }}>
      {/* Subtle radial glow */}
      <div style={{ position: 'absolute', top: '18%', right: '12%', width: 560, height: 560, borderRadius: '50%', background: 'radial-gradient(circle,rgba(201,168,76,0.08) 0%,transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '12%', left: '4%', width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle,rgba(61,12,17,0.04) 0%,transparent 70%)', pointerEvents: 'none' }} />

      <div className="hero-inner" style={{ maxWidth: 1320, margin: '0 auto', padding: '0 44px', position: 'relative', zIndex: 1, width: '100%', minWidth: 0, boxSizing: 'border-box' }}>
        <div className="hero-grid">

          {/* LEFT: Text Panel */}
          <div className="hero-copy-pane">
            <motion.div className="hero-kicker" initial={false} style={{ marginBottom: 22 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                border: '1.5px solid rgba(61,12,17,0.18)', padding: '7px 18px', borderRadius: 999,
                fontSize: 11, fontWeight: 600, letterSpacing: '2.5px', color: '#6b4545',
                background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(8px)'
              }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#c9a84c', display: 'inline-block', animation: 'shimmer 2s infinite' }} />
                INDIA&apos;S #1 CELEBRATION STUDIO
              </span>
            </motion.div>

            {/* Static (no entrance animation) — this is the mobile LCP element, so
                it paints immediately at full opacity instead of fading in after a
                delay. Font is the self-hosted, preloaded next/font Playfair. */}
            <h1 className="hero-title"
              style={{
                fontFamily: "var(--font-playfair),'Playfair Display',serif",
                fontSize: 'clamp(34px,4.2vw,60px)', fontWeight: 600,
                color: '#2a0a0e', lineHeight: 1.08, letterSpacing: '-1.6px', marginBottom: 14, textWrap: 'balance'
              }}>
              Every Wish Becomes a<br />
              <em style={{ color: '#8a6a1c', fontStyle: 'italic' }}>Beautiful</em>{' '}
              <span style={{ position: 'relative', display: 'inline-block' }}>
                Memory
                <motion.div
                  initial={false}
                  style={{
                    position: 'absolute', bottom: -4, left: 0, right: 0, height: 3,
                    background: 'linear-gradient(90deg,#c9a84c,rgba(201,168,76,0.2))',
                    transformOrigin: 'left'
                  }} />
              </span>
            </h1>

            <motion.p className="hero-desc"
              initial={false}
              style={{ fontSize: 15, color: '#6b4545', maxWidth: 430, lineHeight: 1.68, marginBottom: 22 }}>
              Design a stunning celebration page in minutes — photos, music, heartfelt messages &amp; a live countdown, all on one link you share with everyone you love.
            </motion.p>

            {/* Stats strip */}
            <motion.div
              initial={false}
              className="hero-stats"
              style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 26 }}>
              {STATS.map((s, i) => (
                <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                  <div>
                    <div style={{ fontFamily: "var(--font-playfair),'Playfair Display',serif", fontSize: 24, fontWeight: 700, color: '#2a0a0e', lineHeight: 1 }}>{s.n}</div>
                    <div style={{ fontSize: 10.5, color: '#7d5a5a', letterSpacing: '0.5px', marginTop: 3 }}>{s.l}</div>
                  </div>
                  {i < STATS.length - 1 && (
                    <div style={{ width: 1, height: 30, background: 'rgba(61,12,17,0.15)' }} />
                  )}
                </div>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={false}
              className="hero-btns"
              style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 18 }}>
              <motion.button
                whileHover={{ scale: 1.03, backgroundColor: '#2a0809' }}
                whileTap={{ scale: 0.97 }}
                onClick={goTemplates}
                style={{ background: '#3d0c11', color: '#f5ede6', border: 'none', padding: '15px 30px', fontSize: 11, fontWeight: 700, letterSpacing: '1.6px', cursor: 'pointer', transition: 'background-color 0.22s', borderRadius: 4 }}>
                🎉 CREATE YOUR PAGE
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={goTemplates}
                style={{ background: 'transparent', color: '#2a0a0e', border: '1.5px solid rgba(61,12,17,0.35)', padding: '15px 26px', fontSize: 11, fontWeight: 700, letterSpacing: '1.6px', cursor: 'pointer', borderRadius: 4, backdropFilter: 'blur(4px)' }}>
                👀 VIEW DEMO
              </motion.button>
            </motion.div>

            <motion.p className="hero-note"
              initial={false}
              style={{ fontSize: 12, color: '#7d5a5a', letterSpacing: '0.3px' }}>
              No design skills needed &nbsp;•&nbsp; Ready in under 2 minutes
            </motion.p>
          </div>

          {/* RIGHT: the five most-created templates, live from the gallery ranking */}
          <div className="hero-laptop-wrap" style={{ position: 'relative', width: '100%', minWidth: 0 }}>
            <TrendingShowcase />
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 1100px) {
          .hero-grid { grid-template-columns: 0.8fr 1.2fr !important; gap: 52px !important; }
        }
        .hero-pills{scrollbar-width:none;-ms-overflow-style:none;scroll-snap-type:x proximity;}
        .hero-pills::-webkit-scrollbar{display:none;}
        .hero-pills button{scroll-snap-align:center;}
        @media (max-width: 768px) {
          .hero-inner { padding: 0 20px !important; }
          .hero-grid { grid-template-columns: 1fr !important; gap: 28px !important; }
          .hero-copy-pane { text-align: center; }
          .hero-copy-pane .hero-stats { justify-content: center; }
          .hero-copy-pane .hero-btns { justify-content: center; }
          .hero-copy-pane .hero-desc { margin-left: auto; margin-right: auto; }
          .hero-copy-pane .hero-kicker { justify-content: center; display: flex; }
          .hero-laptop-wrap { max-width: 480px; margin: 0 auto; }
          /* keep the landscape template fully visible instead of cropping its sides */
          .hero-preview-canvas { height: auto !important; aspect-ratio: 3 / 2; }
          .hero-pills { justify-content: flex-start !important; padding-left: 2px; padding-right: 2px; }
        }
        @media (max-width: 480px) {
          .hero-inner { padding: 0 16px !important; }
          .hero-preview-canvas { aspect-ratio: 4 / 3; }
        }
      `}</style>
    </section>
  );
}
