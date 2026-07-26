"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { SHOWCASE_ITEMS } from "./data";

const STATS = [
  { n: "50K+", l: "Pages Created" },
  { n: `${SHOWCASE_ITEMS.length}+`, l: "Templates" },
  { n: "4.9★", l: "Loved Rating" },
];

/* Real template screenshots that cycle inside the single desktop mockup —
   the same images the old desktop showed, one per occasion. */
type Preview = {
  id: string;
  pill: string;
  slug: string;
  img: string;
  href: string;
  footer: string;
};

const PREVIEWS: Preview[] = [
  { id: "holi", pill: "Holi", slug: "holi", img: "/homePage/holi.webp", href: "/holi", footer: "RANG BARSE" },
  { id: "eid", pill: "Eid", slug: "eid-mubarak", img: "/homePage/eid.webp", href: "/eid-mubarak", footer: "EID CELEBRATION" },
  { id: "wedding", pill: "Wedding", slug: "wedding", img: "/homePage/wedding.webp", href: "/wedding-shaadi", footer: "SHAADI CELEBRATION" },
  { id: "anniversary", pill: "Anniversary", slug: "anniversary", img: "/homePage/anniversary.webp", href: "/anniversary-gf", footer: "SILVER JUBILEE" },
  { id: "birthday", pill: "Birthday", slug: "birthday", img: "/homePage/happyBirthday.webp", href: "/birthday-gf", footer: "BIRTHDAY BASH" },
  { id: "valentine", pill: "Valentine", slug: "valentine", img: "/homePage/valentine.webp", href: "/valentine-gf", footer: "VALENTINE'S DAY" },
  { id: "love", pill: "Love", slug: "love", img: "/homePage/loveyou.webp", href: "/love-gf", footer: "DIL SE" },
];

const TOT = PREVIEWS.length;

export default function HeroSection() {
  const [active, setActive] = useState(2); // start on Wedding (matches reference)
  const [restart, setRestart] = useState(0);
  const [paused, setPaused] = useState(false);
  // LCP fix: on the very first paint (SSR + pre-hydration) the hero image must
  // render at full opacity, NOT framer-motion's initial opacity:0 — otherwise
  // the LCP element stays invisible until the JS bundle hydrates. We skip the
  // enter animation for the first mount only, then enable fades for slide changes.
  const [firstPaint, setFirstPaint] = useState(true);
  const router = useRouter();
  const p = PREVIEWS[active];

  useEffect(() => {
    setFirstPaint(false);
  }, []);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setActive((i) => (i + 1) % TOT), 4200);
    return () => clearInterval(t);
  }, [restart, paused]);

  const goTemplates = useCallback(() => router.push("/templates"), [router]);
  const select = useCallback((i: number) => {
    setActive(i);
    setRestart((r) => r + 1);
  }, []);

  return (
    <section id="hero" className="hero-section" style={{
      background: '#f5ede6', minHeight: '100vh', display: 'flex', alignItems: 'center',
      paddingTop: 96, paddingBottom: 60, position: 'relative', overflow: 'hidden', width: '100%'
    }}>
      {/* Subtle radial glow */}
      <div style={{ position: 'absolute', top: '18%', right: '12%', width: 560, height: 560, borderRadius: '50%', background: 'radial-gradient(circle,rgba(201,168,76,0.08) 0%,transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '12%', left: '4%', width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle,rgba(61,12,17,0.04) 0%,transparent 70%)', pointerEvents: 'none' }} />

      <div className="hero-inner" style={{ maxWidth: 1320, margin: '0 auto', padding: '0 44px', position: 'relative', zIndex: 1, width: '100%', minWidth: 0, boxSizing: 'border-box' }}>
        <div className="hero-grid">

          {/* LEFT: Text Panel */}
          <div className="hero-copy-pane">
            <motion.div className="hero-kicker" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.1 }} style={{ marginBottom: 22 }}>
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

            <motion.h1 className="hero-title"
              initial={{ opacity: 0, y: 36 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.88, delay: 0.25, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
              style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: 'clamp(34px,4.2vw,60px)', fontWeight: 600,
                color: '#2a0a0e', lineHeight: 1.08, letterSpacing: '-1.6px', marginBottom: 14, textWrap: 'balance'
              }}>
              Every Wish Becomes a<br />
              <em style={{ color: '#c9a84c', fontStyle: 'italic' }}>Beautiful</em>{' '}
              <span style={{ position: 'relative', display: 'inline-block' }}>
                Memory
                <motion.div
                  initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                  transition={{ delay: 1.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                  style={{
                    position: 'absolute', bottom: -4, left: 0, right: 0, height: 3,
                    background: 'linear-gradient(90deg,#c9a84c,rgba(201,168,76,0.2))',
                    transformOrigin: 'left'
                  }} />
              </span>
            </motion.h1>

            <motion.p className="hero-desc"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.5 }}
              style={{ fontSize: 15, color: '#6b4545', maxWidth: 430, lineHeight: 1.68, marginBottom: 22 }}>
              Design a stunning celebration page in minutes — photos, music, heartfelt messages &amp; a live countdown, all on one link you share with everyone you love.
            </motion.p>

            {/* Stats strip */}
            <motion.div
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.65 }}
              className="hero-stats"
              style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 26 }}>
              {STATS.map((s, i) => (
                <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                  <div>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, color: '#2a0a0e', lineHeight: 1 }}>{s.n}</div>
                    <div style={{ fontSize: 10.5, color: '#9a7070', letterSpacing: '0.5px', marginTop: 3 }}>{s.l}</div>
                  </div>
                  {i < STATS.length - 1 && (
                    <div style={{ width: 1, height: 30, background: 'rgba(61,12,17,0.15)' }} />
                  )}
                </div>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.8 }}
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
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.5 }}
              style={{ fontSize: 12, color: '#b09090', letterSpacing: '0.3px' }}>
              No design skills needed &nbsp;•&nbsp; Ready in under 2 minutes
            </motion.p>
          </div>

          {/* RIGHT: single desktop mockup with a live, cycling template preview */}
          <motion.div className="hero-laptop-wrap"
            initial={{ opacity: 0, y: 44 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
            style={{ position: 'relative', width: '100%', minWidth: 0 }}
            onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>

            {/* Browser window */}
            <div
              style={{
                position: 'relative', zIndex: 1, borderRadius: 16, overflow: 'hidden',
                background: '#faf6ef', border: '1px solid rgba(61,12,17,0.12)',
              }}>

              {/* Chrome bar */}
              <div style={{ height: 46, flexShrink: 0, background: '#efe7db', display: 'flex', alignItems: 'center', padding: '0 16px', borderBottom: '1px solid rgba(61,12,17,0.08)' }}>
                <div style={{ display: 'flex', gap: 7, marginRight: 16 }}>
                  {['#f96f5d', '#f5bf4f', '#52c45a'].map((cc) => (
                    <div key={cc} style={{ width: 11, height: 11, borderRadius: '50%', background: cc }} />
                  ))}
                </div>
                <div style={{ flex: 1, maxWidth: 340, height: 28, borderRadius: 8, background: '#fbf7f1', border: '1px solid rgba(61,12,17,0.08)', display: 'flex', alignItems: 'center', padding: '0 12px', gap: 7, margin: '0 auto' }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#4d8f6f" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                  <span style={{ fontSize: 11.5, color: '#7a6a58', fontFamily: 'Inter,system-ui,sans-serif' }}>
                    yourname.subhsandesh.in/<AnimatePresence mode="wait"><motion.span key={p.slug} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} style={{ color: '#3d0c11', fontWeight: 600 }}>{p.slug}</motion.span></AnimatePresence>
                  </span>
                </div>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9a8a78" strokeWidth="1.8" style={{ marginLeft: 16 }}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" /></svg>
              </div>

              {/* Live preview canvas — real template screenshot */}
              <div className="hero-preview-canvas" onClick={() => router.push(p.href)}
                style={{ position: 'relative', height: 384, overflow: 'hidden', background: '#150507', cursor: 'pointer' }}>

                {/* template image */}
                <AnimatePresence mode="wait">
                  <motion.div key={p.id}
                    initial={firstPaint ? false : { opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                    style={{ position: 'absolute', inset: 0 }}>
                    <Image src={p.img} alt={p.pill + " celebration template"} fill className="object-cover" sizes="(max-width:768px) 100vw, 620px" priority={active === 2} />
                  </motion.div>
                </AnimatePresence>

                {/* bottom gradient for footer legibility */}
                <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(12,3,5,0.82) 0%,rgba(12,3,5,0.15) 26%,transparent 46%)', pointerEvents: 'none' }} />

                {/* footer row */}
                <div style={{ position: 'absolute', left: 22, right: 22, bottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <AnimatePresence mode="wait">
                    <motion.span key={p.footer} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
                      style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.12em', color: '#e9c97a', fontFamily: 'Inter,system-ui,sans-serif' }}>✦ {p.footer}</motion.span>
                  </AnimatePresence>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 10.5, color: 'rgba(245,237,230,0.72)', fontStyle: 'italic', fontFamily: "'Playfair Display',serif" }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#52c45a', display: 'inline-block' }} />Live Preview Ready
                  </span>
                </div>

                {/* regenerate loading bar (re-runs each switch) */}
                <motion.div key={'bar' + active} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.4, ease: 'easeOut' }}
                  style={{ position: 'absolute', left: 0, bottom: 0, height: 3, width: 120, transformOrigin: 'left', background: 'linear-gradient(90deg,#c9a84c,#a8823a)' }} />
              </div>
            </div>

            {/* Occasion pills — single row */}
            <div className="hero-pills" style={{ display: 'flex', flexWrap: 'nowrap', justifyContent: 'center', gap: 7, marginTop: 24, overflowX: 'auto', paddingBottom: 2 }}>
              {PREVIEWS.map((pv, i) => {
                const on = i === active;
                return (
                  <button key={pv.id} type="button" onClick={() => select(i)}
                    style={{
                      padding: '8px 15px', borderRadius: 999, cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap',
                      fontSize: 12.5, fontWeight: on ? 700 : 600, letterSpacing: '0.01em',
                      fontFamily: 'Inter,system-ui,sans-serif',
                      border: on ? '1px solid #241014' : '1px solid rgba(61,12,17,0.16)',
                      background: on ? '#241014' : '#fdfaf4',
                      color: on ? '#f5ede6' : '#6b4545',
                      transition: 'background 0.25s, color 0.25s, border-color 0.25s',
                    }}>{pv.pill}</button>
                );
              })}
            </div>

            {/* dots */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 2, marginTop: 12 }}>
              {PREVIEWS.map((_, i) => (
                // 24×24 hit area (a11y touch-target min) wrapping a small visual dot
                <button key={i} type="button" aria-label={`Template ${i + 1}`} aria-current={i === active} onClick={() => select(i)}
                  style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', padding: 0, background: 'transparent', cursor: 'pointer' }}>
                  <span aria-hidden style={{ width: i === active ? 22 : 7, height: 7, borderRadius: 4, display: 'block', background: i === active ? '#3d0c11' : 'rgba(61,12,17,0.2)', transition: 'all 0.35s' }} />
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
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
