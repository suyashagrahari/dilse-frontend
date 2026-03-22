"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { PHONE_DEMO_TABS, DEMO_STATS } from "./data";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.13 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

const DEMO_FEATURES = [
  { icon: 'ai', title: 'AI-Generated Messages', desc: 'Heartfelt wishes crafted in seconds' },
  { icon: 'lock', title: 'Password Protected', desc: 'Your private moments, truly private' },
  { icon: 'phone', title: 'WhatsApp Sharing', desc: 'One-tap share with family & friends' },
  { icon: 'globe', title: 'Unique Public URL', desc: 'A beautiful link for every occasion' },
];

function DemoIcon({ type, size = 16, color = '#c9a84c', strokeW = 1.9 }: { type: string; size?: number; color?: string; strokeW?: number }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: strokeW, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  if (type === 'ring') return <svg {...common}><circle cx="12" cy="15.5" r="4.7" /><path d="M12 4l2.5 3h-5L12 4z" /></svg>;
  if (type === 'cake') return <svg {...common}><path d="M5 10h14v9H5z" /><path d="M8 10V7m4 3V7m4 3V7" /><path d="M4 14h16" /></svg>;
  if (type === 'moon') return <svg {...common}><path d="M20 14.2A8 8 0 1 1 10 4a6.5 6.5 0 0 0 10 10.2z" /></svg>;
  if (type === 'pin') return <svg {...common}><path d="M12 21s6-6 6-11a6 6 0 1 0-12 0c0 5 6 11 6 11z" /><circle cx="12" cy="10" r="2" /></svg>;
  if (type === 'music') return <svg {...common}><path d="M9 18V7l10-2v11" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="16" r="2" /></svg>;
  if (type === 'blessing' || type === 'dua') return <svg {...common}><path d="M12 4v5" /><path d="M8.5 7h7" /><path d="M6 14c1.4 3.4 3.2 5 6 5s4.6-1.6 6-5" /></svg>;
  if (type === 'gallery') return <svg {...common}><rect x="3.5" y="5" width="17" height="14" rx="2" /><circle cx="9" cy="10" r="1.3" /><path d="M6.5 16l3.8-3 2.7 2.2 2.6-2.1 2 2.9" /></svg>;
  if (type === 'share') return <svg {...common}><circle cx="6.2" cy="12" r="2" /><circle cx="17.8" cy="6" r="2" /><circle cx="17.8" cy="18" r="2" /><path d="M8 11.2l7.8-4.1M8 12.8l7.8 4.1" /></svg>;
  if (type === 'ai') return <svg {...common}><rect x="4" y="4" width="16" height="16" rx="4" /><path d="M8 12h8M8 9h5M8 15h4" /></svg>;
  if (type === 'lock') return <svg {...common}><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>;
  if (type === 'phone') return <svg {...common}><rect x="7" y="2.8" width="10" height="18.4" rx="2.2" /><path d="M11 6h2M10 17h4" /></svg>;
  if (type === 'globe') return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3a14 14 0 0 1 0 18" /><path d="M12 3a14 14 0 0 0 0 18" /></svg>;
  if (type === 'celebrate') return <svg {...common}><path d="M8 7l5 5M13 7l-5 5" /><path d="M4 19l6-2 8-8-4-4-8 8-2 6z" /></svg>;
  return <svg {...common}><circle cx="12" cy="12" r="8" /></svg>;
}

export default function PhoneDemoSection() {
  const [active, setActive] = useState(0);
  const router = useRouter();
  const tab = PHONE_DEMO_TABS[active];

  useEffect(() => {
    const t = setInterval(() => setActive(p => (p + 1) % PHONE_DEMO_TABS.length), 4200);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="pd-section" style={{
      minHeight: '100vh', background: '#f5ede6',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden', padding: '80px 24px'
    }}>
      {/* Scattered stars */}
      {[
        { top: '8%', left: '12%', size: 22, opacity: 0.18 },
        { top: '18%', right: '8%', size: 16, opacity: 0.14 },
        { top: '42%', left: '3%', size: 28, opacity: 0.12 },
        { bottom: '22%', left: '8%', size: 18, opacity: 0.16 },
        { top: '6%', right: '25%', size: 20, opacity: 0.15 },
        { bottom: '15%', right: '6%', size: 26, opacity: 0.14 },
      ].map((s, i) => (
        <div key={i} style={{ position: 'absolute', ...s as object, pointerEvents: 'none' }}>
          <svg width={s.size} height={s.size} viewBox="0 0 24 24">
            <path d="M12 2 L13.5 9 L20 8 L15 13 L18 20 L12 16 L6 20 L9 13 L4 8 L10.5 9 Z" fill="none" stroke="#8b2635" strokeWidth="1.2" opacity={s.opacity * 6} />
          </svg>
        </div>
      ))}

      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,transparent,#c9a84c 25%,#c9a84c 75%,transparent)', opacity: 0.7 }} />

      {/* Header */}
      <motion.div className="pd-header" initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={stagger}
        style={{ textAlign: 'center', marginBottom: 52, position: 'relative', zIndex: 1, maxWidth: 640 }}>
        <motion.span variants={fadeUp} style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 20px', borderRadius: 24,
          border: '1px solid rgba(61,12,17,0.22)', color: '#3d0c11', fontSize: 11, fontWeight: 700,
          letterSpacing: '0.15em', textTransform: 'uppercase', background: 'rgba(61,12,17,0.06)', marginBottom: 18,
        }}>
          <svg width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3" fill="#c9a84c" /></svg>
          Live Preview
          <svg width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3" fill="#c9a84c" /></svg>
        </motion.span>
        <motion.h2 variants={fadeUp} style={{
          fontFamily: "'Playfair Display',serif", fontSize: 'clamp(28px,4vw,52px)', fontWeight: 700,
          color: '#1a0507', lineHeight: 1.1, letterSpacing: '-1.5px', marginBottom: 16,
        }}>
          See it in action —<br />
          <em style={{ color: '#c9a84c', fontStyle: 'italic' }}>beautiful pages</em> for every occasion
        </motion.h2>
        <motion.p variants={fadeUp} style={{ fontSize: 15, color: '#7a5050', lineHeight: 1.8, maxWidth: 460, margin: '0 auto' }}>
          Real celebration pages made with SubhSandesh — each one an emotional masterpiece shared with love across India.
        </motion.p>
      </motion.div>

      {/* 3-column grid */}
      <div style={{ maxWidth: 1100, width: '100%', position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 32, alignItems: 'start' }}
        className="pd-grid">

        {/* Left — Tab selectors */}
        <motion.div className="pd-left" initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={stagger}
          style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {PHONE_DEMO_TABS.map((t, i) => (
            <motion.button key={t.id} variants={fadeUp} onClick={() => setActive(i)}
              whileHover={{ x: 5 }} whileTap={{ scale: 0.98 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '15px 18px',
                cursor: 'pointer', textAlign: 'left', outline: 'none',
                background: active === i ? '#fff' : 'rgba(255,255,255,0.5)',
                border: `1.5px solid ${active === i ? '#c9a84c' : 'rgba(61,12,17,0.12)'}`,
                borderRadius: 14,
                boxShadow: active === i ? '0 4px 24px rgba(201,168,76,0.18)' : '0 1px 6px rgba(0,0,0,0.04)',
                transition: 'all 0.3s',
              }}>
              <div style={{
                width: 44, height: 44, borderRadius: 13, flexShrink: 0,
                background: active === i ? '#3d0c11' : 'rgba(61,12,17,0.07)',
                border: `1px solid ${active === i ? '#3d0c11' : 'rgba(61,12,17,0.12)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s',
              }}>
                <DemoIcon type={t.tabIcon} size={20} color={active === i ? '#c9a84c' : '#6b4545'} strokeW={1.8} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: active === i ? '#1a0507' : '#5a3535', marginBottom: 3, transition: 'color 0.3s' }}>
                  {t.tabLabel} Celebration Page
                </div>
                <div style={{ fontSize: 11, color: '#9a7070', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {t.items[0].text}
                </div>
              </div>
              {active === i && (
                <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  style={{ width: 7, height: 7, borderRadius: '50%', background: '#c9a84c', flexShrink: 0 }} />
              )}
            </motion.button>
          ))}

          {/* Currently viewing card */}
          <motion.div variants={fadeUp} style={{
            marginTop: 6, padding: '18px 20px', borderRadius: 14, position: 'relative',
            background: '#fff', border: '1px solid rgba(201,168,76,0.3)',
            boxShadow: '0 2px 16px rgba(61,12,17,0.07)',
          }}>
            <div style={{ position: 'absolute', top: 8, left: 8, width: 12, height: 12, borderTop: '2px solid #c9a84c', borderLeft: '2px solid #c9a84c' }} />
            <div style={{ position: 'absolute', top: 8, right: 8, width: 12, height: 12, borderTop: '2px solid #c9a84c', borderRight: '2px solid #c9a84c' }} />
            <div style={{ fontSize: 10, color: '#c9a84c', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 700 }}>Currently Showing</div>
            <AnimatePresence mode="wait">
              <motion.div key={tab.id + '-info'} initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -7 }} transition={{ duration: 0.3 }}>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, color: '#1a0507', fontWeight: 700, marginBottom: 5 }}>
                  {tab.name.replace('\n', ' ')}
                </div>
                <div style={{ fontSize: 13, color: '#c9a84c', letterSpacing: '0.04em', fontWeight: 600 }}>{tab.subtitle}</div>
                <div style={{ fontSize: 11, color: '#9a7070', marginTop: 4 }}>{tab.meta}</div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </motion.div>

        {/* Center — Phone mockup */}
        <motion.div className="pd-center" initial={{ opacity: 0, y: 44, scale: 0.95 }} whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-60px' }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>

          <div className="pd-outer-ring" style={{ position: 'absolute', inset: -8, borderRadius: 64, border: '1.5px solid rgba(201,168,76,0.4)', pointerEvents: 'none' }} />
          <div className="pd-outer-ring" style={{ position: 'absolute', inset: -4, borderRadius: 60, border: '1px solid rgba(201,168,76,0.18)', pointerEvents: 'none' }} />

          {/* Phone body */}
          <div className="pd-phone-body" style={{
            width: 306, height: 626, background: '#080808', borderRadius: 56,
            border: '7px solid #1a1a1a',
            boxShadow: '0 0 0 1px rgba(201,168,76,0.25),0 48px 100px rgba(0,0,0,0.35),0 16px 40px rgba(61,12,17,0.18)',
            overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative',
          }}>
            <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(201,168,76,0.7),transparent)', zIndex: 30 }} />

            {/* Status bar */}
            <div style={{ height: 50, background: '#0a0203', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative' }}>
              <div style={{ width: 100, height: 28, background: '#000', borderRadius: 18, position: 'absolute' }} />
              <div style={{ position: 'absolute', right: 20, fontSize: 9, color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>9:41</div>
            </div>

            {/* Screen */}
            <div style={{ flex: 1, overflow: 'hidden', position: 'relative', background: tab.bg, transition: 'background 0.5s ease' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 60, background: 'linear-gradient(180deg,rgba(201,168,76,0.07),transparent)', pointerEvents: 'none' }} />

              {/* Nav tabs */}
              <div style={{ display: 'flex', gap: 4, padding: '10px 10px 0', position: 'relative', zIndex: 2 }}>
                {PHONE_DEMO_TABS.map((t, i) => (
                  <button key={t.id} onClick={() => setActive(i)} style={{
                    flex: 1, padding: '7px 2px', borderRadius: 24, border: 'none', cursor: 'pointer',
                    fontSize: 9, fontWeight: 700, transition: 'all 0.28s',
                    background: active === i ? 'rgba(201,168,76,0.22)' : 'rgba(255,255,255,0.07)',
                    color: active === i ? '#c9a84c' : 'rgba(255,255,255,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3,
                  }}>
                    <DemoIcon type={t.tabIcon} size={12} color={active === i ? '#c9a84c' : 'rgba(255,255,255,0.45)'} strokeW={1.9} />
                    <span>{t.tabLabel}</span>
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div key={tab.id}
                  initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -28 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                  style={{ padding: '14px 14px 18px', position: 'relative', zIndex: 2 }}>
                  <div style={{ textAlign: 'center', marginBottom: 14 }}>
                    <div style={{ width: 74, height: 74, borderRadius: '50%', border: '2px solid rgba(201,168,76,0.55)', margin: '0 auto 10px', overflow: 'hidden', background: 'rgba(201,168,76,0.1)', boxShadow: '0 0 24px rgba(201,168,76,0.18)' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={tab.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    </div>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 700, color: '#f5ede6', lineHeight: 1.25, marginBottom: 4 }}>
                      {tab.name.split('\n').map((l, li) => <div key={li}>{l}</div>)}
                    </div>
                    <div style={{ fontSize: 12, color: '#c9a84c', fontWeight: 600, letterSpacing: '0.05em' }}>{tab.subtitle}</div>
                    <div style={{ fontSize: 10, color: 'rgba(245,237,230,0.38)', marginTop: 4 }}>{tab.meta}</div>
                  </div>
                  <div style={{ width: 38, height: 1, background: 'rgba(201,168,76,0.5)', margin: '0 auto 12px' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {tab.items.map((item, ii) => (
                      <div key={ii} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: '8px 11px', fontSize: 10.5, color: 'rgba(245,237,230,0.75)', border: '1px solid rgba(201,168,76,0.1)', display: 'flex', alignItems: 'center', gap: 7 }}>
                        <DemoIcon type={item.icon} size={11} color="#c9a84c" strokeW={2} />
                        <span>{item.text}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 7, marginTop: 12 }}>
                    {tab.pills.map(p => (
                      <div key={p.label} style={{ flex: 1, background: 'rgba(201,168,76,0.14)', borderRadius: 20, padding: '7px', textAlign: 'center', fontSize: 10, color: '#c9a84c', border: '1px solid rgba(201,168,76,0.28)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                        <DemoIcon type={p.icon} size={11} color="#c9a84c" strokeW={2} />
                        <span>{p.label}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Home bar */}
            <div style={{ height: 34, background: '#0a0203', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <div style={{ width: 100, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2 }} />
            </div>
          </div>

          {/* Floating badge */}
          <AnimatePresence mode="wait">
            <motion.div className="pd-badge" key={tab.id + '-badge'}
              initial={{ opacity: 0, y: 20, scale: 0.85 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 14, scale: 0.92 }}
              transition={{ duration: 0.52, delay: 0.18, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
              style={{
                position: 'absolute', bottom: -18, right: -18,
                background: '#fff', padding: '12px 14px',
                boxShadow: '0 12px 48px rgba(61,12,17,0.15),0 0 0 1px rgba(201,168,76,0.25)',
                borderRadius: 16, zIndex: 20, textAlign: 'center', width: 132,
                border: '1px solid rgba(201,168,76,0.22)',
              }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(61,12,17,0.06)', border: '1px solid rgba(61,12,17,0.1)' }}>
                <DemoIcon type={tab.badge.icon} size={18} color="#3d0c11" strokeW={2} />
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#3d0c11', marginBottom: 3 }}>{tab.badge.title}</div>
              <div style={{ fontSize: 10.5, color: '#9a7070', lineHeight: 1.4 }}>{tab.badge.sub}</div>
            </motion.div>
          </AnimatePresence>

          {/* Dot nav */}
          <div style={{ position: 'absolute', bottom: -40, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 7, alignItems: 'center' }}>
            {PHONE_DEMO_TABS.map((_, di) => (
              <motion.button key={di} onClick={() => setActive(di)}
                animate={{ width: di === active ? 24 : 7, background: di === active ? '#c9a84c' : 'rgba(61,12,17,0.2)' }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                style={{ height: 7, borderRadius: 4, border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }} />
            ))}
          </div>
        </motion.div>

        {/* Right — Feature highlights + CTA */}
        <motion.div className="pd-right" initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={stagger}
          style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {DEMO_FEATURES.map((f, i) => (
            <motion.div key={i} variants={fadeUp}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              whileHover={{ x: -5, boxShadow: '0 6px 28px rgba(61,12,17,0.1)', borderColor: 'rgba(201,168,76,0.4)' } as any}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 18px',
                borderRadius: 14, background: '#fff',
                border: '1px solid rgba(61,12,17,0.09)',
                boxShadow: '0 2px 10px rgba(61,12,17,0.05)',
                cursor: 'default', transition: 'all 0.3s ease',
              }}>
              <div style={{ width: 40, height: 40, borderRadius: 11, flexShrink: 0, background: '#3d0c11', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DemoIcon type={f.icon} size={18} color="#c9a84c" strokeW={2} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1a0507', marginBottom: 3 }}>{f.title}</div>
                <div style={{ fontSize: 11.5, color: '#9a7070', lineHeight: 1.5 }}>{f.desc}</div>
              </div>
            </motion.div>
          ))}

          <div style={{ height: 1, background: 'rgba(61,12,17,0.1)', margin: '4px 0' }} />

          <motion.div variants={fadeUp}>
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: '0 20px 56px rgba(61,12,17,0.3)' }} whileTap={{ scale: 0.97 }}
              onClick={() => router.push('/templates')}
              style={{ width: '100%', padding: '15px 28px', background: '#3d0c11', color: '#f5ede6', borderRadius: 14, fontWeight: 800, fontSize: 13, border: 'none', cursor: 'pointer', letterSpacing: '0.07em', boxShadow: '0 10px 32px rgba(61,12,17,0.22)' }}>
              CREATE YOUR PAGE — FREE
            </motion.button>
            <div style={{ textAlign: 'center', marginTop: 10, fontSize: 11, color: '#9a7070' }}>
              No credit card required · Ready in 2 minutes
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Stats bar */}
      <motion.div className="pd-stats-bar" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.7, delay: 0.35 }}
        style={{
          display: 'flex', maxWidth: 760, width: '100%', marginTop: 70, position: 'relative', zIndex: 1,
          background: '#fff', border: '1px solid rgba(201,168,76,0.28)', borderRadius: 20, overflow: 'hidden',
          boxShadow: '0 4px 32px rgba(61,12,17,0.08)',
        }}>
        {DEMO_STATS.map((s, i) => (
          <div key={i} style={{
            flex: 1, textAlign: 'center', padding: '22px 16px',
            borderRight: i < DEMO_STATS.length - 1 ? '1px solid rgba(61,12,17,0.08)' : 'none',
          }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(18px,2.5vw,26px)', fontWeight: 700, color: '#3d0c11', lineHeight: 1, marginBottom: 6 }}>{s.num}</div>
            <div style={{ fontSize: 11, color: '#9a7070', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </motion.div>

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg,#c9a84c,#a8823a 50%,#c9a84c)' }} />

      <style>{`
        @media (max-width: 900px) {
          .pd-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
