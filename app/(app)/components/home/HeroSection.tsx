"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";

const SHOWCASE_ROUTES: Record<string, string> = {
  holi: '/holi',
  eid: '/eid-mubarak',
  birthday: '/birthday',
  anniversary: '/templates',
  wedding: '/wedding-shaadi',
  family: '/templates',
};
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { SHOWCASE_ITEMS } from "./data";

const STATS = [
  { n: '10K+', l: 'Pages Created' },
  { n: '6', l: 'Occasions' },
  { n: '∞', l: 'Memories Made' },
];

const TOT = SHOWCASE_ITEMS.length;
const CW = 136;
const GAP = 10;
const STEP = CW + GAP;
const HALF = 3;

function getCardSize(off: number) {
  const a = Math.abs(off);
  if (a === 0) return { w: 150, h: 194, op: 1, y: -16 };
  if (a === 1) return { w: 122, h: 160, op: 0.84, y: 0 };
  if (a === 2) return { w: 100, h: 132, op: 0.60, y: 0 };
  return { w: 82, h: 108, op: 0.32, y: 0 };
}

export default function HeroSection() {
  const [active, setActive] = useState(0);
  const router = useRouter();
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const didSwipeRef = useRef(false);
  const tab = useMemo(() => SHOWCASE_ITEMS[active], [active]);
  const tagLabels = useMemo(
    () => SHOWCASE_ITEMS.map((s) => s.tag.charAt(0) + s.tag.slice(1).toLowerCase()),
    []
  );

  useEffect(() => {
    const t = setInterval(() => setActive(p => (p + 1) % TOT), 3200);
    return () => clearInterval(t);
  }, []);

  const carouselCards = useMemo(
    () =>
      Array.from({ length: HALF * 2 + 2 }, (_, i) => {
        const offset = i - HALF;
        const absPos = active + offset;
        const itemIdx = ((absPos % TOT) + TOT) % TOT;
        return { key: `sl-${offset}`, item: SHOWCASE_ITEMS[itemIdx], offset };
      }),
    [active]
  );

  const goTemplates = useCallback(() => router.push("/templates"), [router]);
  const selectItem = useCallback((index: number) => setActive(index), []);
  const selectOffsetItem = useCallback(
    (offset: number, itemId?: string) => {
      if (didSwipeRef.current) {
        didSwipeRef.current = false;
        return;
      }
      if (offset === 0 && itemId) {
        router.push(SHOWCASE_ROUTES[itemId] || '/templates');
      } else {
        setActive((prev) => ((prev + offset) % TOT + TOT) % TOT);
      }
    },
    [router]
  );

  const onCarouselTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const t = e.touches[0];
    touchStartXRef.current = t.clientX;
    touchStartYRef.current = t.clientY;
  };

  const onCarouselTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartXRef.current == null || touchStartYRef.current == null) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartXRef.current;
    const dy = t.clientY - touchStartYRef.current;
    touchStartXRef.current = null;
    touchStartYRef.current = null;

    if (Math.abs(dx) < 34 || Math.abs(dx) < Math.abs(dy)) return;

    didSwipeRef.current = true;
    setActive((prev) => ((prev + (dx < 0 ? 1 : -1)) % TOT + TOT) % TOT);
    window.setTimeout(() => {
      didSwipeRef.current = false;
    }, 180);
  };

  const moveCarousel = useCallback((dir: "prev" | "next") => {
    setActive((prev) => ((prev + (dir === "next" ? 1 : -1)) % TOT + TOT) % TOT);
  }, []);

  return (
    <section id="hero" className="hero-section" style={{
      background: '#f5ede6', minHeight: '100vh', display: 'flex', alignItems: 'center',
      paddingTop: 96, paddingBottom: 60, position: 'relative', overflow: 'hidden', width: '100%'
    }}>
      {/* Subtle radial glow */}
      <div style={{ position: 'absolute', top: '20%', right: '15%', width: 560, height: 560, borderRadius: '50%', background: 'radial-gradient(circle,rgba(201,168,76,0.07) 0%,transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '15%', left: '5%', width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle,rgba(61,12,17,0.04) 0%,transparent 70%)', pointerEvents: 'none' }} />

      <div className="hero-inner" style={{ maxWidth: 1320, margin: '0 auto', padding: '0 44px', position: 'relative', zIndex: 1, width: '100%', minWidth: 0, boxSizing: 'border-box' }}>
        <div className="hero-grid">

          {/* LEFT: Text Panel */}
          <div className="hero-copy-pane">
            <motion.div className="hero-kicker" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.1 }} style={{ marginBottom: 22 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                border: '1.5px solid rgba(61,12,17,0.18)', padding: '7px 18px',
                fontSize: 11, fontWeight: 600, letterSpacing: '2.5px', color: '#6b4545',
                background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(8px)'
              }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#c9a84c', display: 'inline-block', animation: 'shimmer 2s infinite' }} />
                THE ART OF GIFTING
              </span>
            </motion.div>

            <motion.h1 className="hero-title"
              initial={{ opacity: 0, y: 36 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.88, delay: 0.25, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
              style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: 'clamp(38px,4.8vw,72px)', fontWeight: 600,
                color: '#2a0a0e', lineHeight: 1.06, letterSpacing: '-2px', marginBottom: 18
              }}>
              Turn Your<br />Wishes Into<br />
              <em style={{ color: '#c9a84c', fontStyle: 'italic', display: 'inline-block' }}>Beautiful</em><br />
              <span style={{ position: 'relative', display: 'inline-block' }}>
                Celebrations
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
              style={{ fontSize: 16, color: '#6b4545', maxWidth: 440, lineHeight: 1.76, marginBottom: 28 }}>
              Create stunning digital celebration pages for birthdays, weddings &amp; festivals — with photos, music and heartfelt messages.
            </motion.p>

            {/* Stats strip */}
            <motion.div
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.65 }}
              className="hero-stats"
              style={{ display: 'flex', alignItems: 'center', gap: 28, marginBottom: 32 }}>
              {STATS.map((s, i) => (
                <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
                  <div>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 700, color: '#2a0a0e', lineHeight: 1 }}>{s.n}</div>
                    <div style={{ fontSize: 10.5, color: '#9a7070', letterSpacing: '0.5px', marginTop: 3 }}>{s.l}</div>
                  </div>
                  {i < STATS.length - 1 && (
                    <div style={{ width: 1, height: 32, background: 'rgba(61,12,17,0.15)' }} />
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
                style={{ background: '#3d0c11', color: '#f5ede6', border: 'none', padding: '17px 34px', fontSize: 11.5, fontWeight: 700, letterSpacing: '1.6px', cursor: 'pointer', transition: 'background-color 0.22s', borderRadius: 4 }}>
                🎉 CREATE YOUR PAGE
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={goTemplates}
                style={{ background: 'transparent', color: '#2a0a0e', border: '1.5px solid rgba(61,12,17,0.35)', padding: '17px 28px', fontSize: 11.5, fontWeight: 700, letterSpacing: '1.6px', cursor: 'pointer', borderRadius: 4, backdropFilter: 'blur(4px)' }}>
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

          {/* RIGHT: Browser Mockup + Scroll Strip */}
          <motion.div className="hero-laptop-wrap"
            initial={{ opacity: 0, y: 44 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
            style={{ position: 'relative', width: '100%', minWidth: 0 }}>

            {/* Browser frame */}
            <div style={{
              borderRadius: 16, overflow: 'hidden',
              border: '1.5px solid rgba(61,12,17,0.18)',
              background: '#3d0c11'
            }}>
              {/* Chrome bar */}
              <div style={{ height: 42, background: '#ede0d8', display: 'flex', alignItems: 'center', padding: '0 14px', borderBottom: '1px solid rgba(61,12,17,0.1)' }}>
                <div style={{ display: 'flex', gap: 6, marginRight: 14 }}>
                  {['#f96f5d', '#f5bf4f', '#52c45a'].map(c => (
                    <div key={c} style={{ width: 11, height: 11, borderRadius: '50%', background: c, boxShadow: `0 1px 3px ${c}66` }} />
                  ))}
                </div>
                <div style={{ flex: 1, height: 26, borderRadius: 6, background: 'rgba(255,255,255,0.82)', display: 'flex', alignItems: 'center', padding: '0 10px', gap: 6 }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#6b4545" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                  <span style={{ fontSize: 10.5, color: '#7a5555' }}>subhsandesh.in/celebration</span>
                </div>
                <div style={{ marginLeft: 14, display: 'flex', gap: 8 }}>
                  {['←', '→', '↻'].map(a => <span key={a} style={{ fontSize: 11, color: '#9a7070', cursor: 'pointer' }}>{a}</span>)}
                </div>
              </div>

              {/* Page preview — CROSSFADE */}
              <div style={{ position: 'relative', height: 420, overflow: 'hidden', background: '#2a0a0e' }}>
                <AnimatePresence>
                  <motion.div
                    key={tab.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.55, ease: 'easeInOut' }}
                    style={{ position: 'absolute', inset: 0 }}>
                    <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${tab.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(145deg,rgba(42,10,14,0.82) 0%,rgba(61,12,17,0.28) 55%,rgba(20,8,10,0.72) 100%)' }} />
                    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '55%', background: 'linear-gradient(to top,rgba(20,5,8,0.95) 0%,transparent 100%)' }} />
                    <div style={{ position: 'absolute', left: 24, right: 24, top: 54, height: 1, background: 'linear-gradient(90deg,transparent 0%,rgba(201,168,76,0.65) 30%,rgba(201,168,76,0.65) 70%,transparent 100%)' }} />

                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '22px 26px', zIndex: 2 }}>
                      <motion.div
                        key={tab.id + '-tag'} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.38 }}
                        style={{
                          fontSize: 9, letterSpacing: '3px', fontWeight: 700, color: '#c9a84c', marginBottom: 9,
                          display: 'inline-flex', alignItems: 'center', gap: 7,
                          border: '1px solid rgba(201,168,76,0.45)', padding: '4px 11px',
                          background: 'rgba(201,168,76,0.12)', backdropFilter: 'blur(4px)'
                        }}>
                        ✦ {tab.tag}
                      </motion.div>
                      <motion.h3
                        key={tab.id + '-title'} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.18, duration: 0.42 }}
                        style={{
                          fontFamily: "'Playfair Display',serif",
                          fontSize: 'clamp(22px,2.6vw,34px)', fontWeight: 600, color: '#f7eee5',
                          lineHeight: 1.1, marginBottom: 6, textShadow: '0 2px 12px rgba(0,0,0,0.4)'
                        }}>
                        {tab.title}
                      </motion.h3>
                      <motion.p
                        key={tab.id + '-sub'} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        transition={{ delay: 0.28, duration: 0.38 }}
                        style={{ fontSize: 12.5, color: 'rgba(245,237,230,0.72)', marginBottom: 14, lineHeight: 1.5 }}>
                        {tab.subtitle}
                      </motion.p>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {SHOWCASE_ITEMS.map((s, i) => (
                          <button key={s.id} onClick={() => selectItem(i)}
                            style={{
                              padding: '5px 12px', borderRadius: 20, cursor: 'pointer', transition: 'all 0.22s',
                              border: `1px solid ${active === i ? 'rgba(201,168,76,0.75)' : 'rgba(255,255,255,0.2)'}`,
                              background: active === i ? 'rgba(201,168,76,0.22)' : 'rgba(255,255,255,0.07)',
                              color: active === i ? '#c9a84c' : 'rgba(255,255,255,0.58)',
                              fontSize: 9.5, fontWeight: 700, letterSpacing: '1px'
                            }}>
                            {tagLabels[i]}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Sliding Carousel */}
            <div
              style={{ position: 'relative', marginTop: 14, overflow: 'hidden', height: 226, touchAction: 'pan-y' }}
              onTouchStart={onCarouselTouchStart}
              onTouchEnd={onCarouselTouchEnd}
            >
              <button
                type="button"
                className="hero-carousel-arrow hero-carousel-arrow-left"
                onClick={() => moveCarousel("prev")}
                aria-label="Previous template"
                style={{
                  position: "absolute",
                  left: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 32,
                  height: 32,
                  borderRadius: 999,
                  border: "1px solid rgba(61,12,17,0.18)",
                  background: "rgba(245,237,230,0.88)",
                  color: "#3d0c11",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  zIndex: 20,
                  backdropFilter: "blur(4px)",
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                type="button"
                className="hero-carousel-arrow hero-carousel-arrow-right"
                onClick={() => moveCarousel("next")}
                aria-label="Next template"
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 32,
                  height: 32,
                  borderRadius: 999,
                  border: "1px solid rgba(61,12,17,0.18)",
                  background: "rgba(245,237,230,0.88)",
                  color: "#3d0c11",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  zIndex: 20,
                  backdropFilter: "blur(4px)",
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>

              {carouselCards.map(({ key, item, offset }) => {
                const sz = getCardSize(offset);
                const isC = offset === 0;
                const xPos = offset * STEP - sz.w / 2;
                return (
                  <motion.div
                    key={key}
                    animate={{ x: xPos, opacity: sz.op, y: sz.y, width: sz.w, height: sz.h }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                    onClick={() => selectOffsetItem(offset, item.id)}
                    style={{
                      position: 'absolute', left: '50%', top: isC ? 18 : 32,
                      borderRadius: 14, overflow: 'hidden', cursor: 'pointer',
                      border: isC ? '2px solid rgba(201,168,76,0.88)' : '1px solid rgba(61,12,17,0.12)',
                    }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.img} alt={item.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transform: isC ? 'scale(1.05)' : 'scale(1)', transition: 'transform 0.55s ease' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(18,5,8,0.92) 0%,rgba(18,5,8,0.08) 58%,transparent 100%)' }} />
                    <div style={{ position: 'absolute', left: 10, right: 10, bottom: 10 }}>
                      <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '1.5px', color: '#c9a84c', marginBottom: 3 }}>{item.tag}</div>
                      <div style={{
                        fontFamily: "'Playfair Display',serif",
                        fontSize: isC ? 14.5 : 12, color: '#f5ede6', lineHeight: 1.1, fontWeight: isC ? 600 : 400
                      }}>
                        {item.title.split(' ')[0]}
                      </div>
                    </div>
                    {isC && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.4 }} animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.18, duration: 0.3 }}
                        style={{
                          position: 'absolute', top: 9, right: 9, width: 9, height: 9, borderRadius: '50%',
                          background: item.accent, boxShadow: `0 0 10px ${item.accent},0 0 22px ${item.accent}88`
                        }} />
                    )}
                    {isC && (
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,transparent,rgba(201,168,76,0.8),transparent)' }} />
                    )}
                    {isC && (
                      <div style={{ position: 'absolute', top: 9, left: 9, background: 'rgba(201,168,76,0.18)', border: '1px solid rgba(201,168,76,0.5)', borderRadius: 4, padding: '2px 6px', fontSize: 7, fontWeight: 700, letterSpacing: '1.2px', color: '#c9a84c' }}>
                        OPEN →
                      </div>
                    )}
                  </motion.div>
                );
              })}

              {/* Left fade edge */}
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 56, background: 'linear-gradient(to right,#f5ede6 0%,rgba(245,237,230,0) 100%)', pointerEvents: 'none', zIndex: 10 }} />
              {/* Right fade edge */}
              <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 56, background: 'linear-gradient(to left,#f5ede6 0%,rgba(245,237,230,0) 100%)', pointerEvents: 'none', zIndex: 10 }} />
            </div>

          </motion.div>
        </div>
      </div>

      <style>{`
        .hero-carousel-arrow { display: none; }
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .hero-copy-pane { text-align: center; }
          .hero-carousel-arrow { display: inline-flex; }
        }
      `}</style>
    </section>
  );
}
