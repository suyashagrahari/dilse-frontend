"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.13 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

const steps = [
  { num: '01', icon: 'calendar', title: 'Choose Your Occasion', desc: "Pick from birthdays, weddings, Holi, Eid, Valentine's Day and more festive occasions.", tag: 'STEP ONE' },
  { num: '02', icon: 'edit', title: 'Customize Your Page', desc: 'Add photos, music, heartfelt messages, and a live countdown timer to make it truly special.', tag: 'STEP TWO' },
  { num: '03', icon: 'share', title: 'Share the Surprise', desc: 'Publish your page and send the magical link to loved ones — ready in under 2 minutes.', tag: 'STEP THREE' },
];

function StepIcon({ type, stroke = '#c9a84c' }: { type: string; stroke?: string }) {
  const common = { width: 28, height: 28, viewBox: '0 0 24 24', fill: 'none', stroke, strokeWidth: 1.85, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  if (type === 'calendar') return (
    <svg {...common}>
      <rect x="4" y="5" width="16" height="15" rx="2.2" />
      <path d="M8 3v4M16 3v4M4 10h16" />
      <circle cx="9" cy="14.2" r="0.9" fill={stroke} stroke="none" />
      <circle cx="12.5" cy="14.2" r="0.9" fill={stroke} stroke="none" />
      <circle cx="16" cy="14.2" r="0.9" fill={stroke} stroke="none" />
    </svg>
  );
  if (type === 'edit') return (
    <svg {...common}>
      <path d="M4 20h4.2l9.9-9.9a2 2 0 0 0 0-2.8l-1.4-1.4a2 2 0 0 0-2.8 0L4 15.8V20z" />
      <path d="M12.5 7.5l4 4" />
      <path d="M14 20h6" />
    </svg>
  );
  return (
    <svg {...common}>
      <circle cx="6.2" cy="12" r="2" />
      <circle cx="17.8" cy="6" r="2" />
      <circle cx="17.8" cy="18" r="2" />
      <path d="M8 11.2l7.8-4.1M8 12.8l7.8 4.1" />
    </svg>
  );
}

const OCC = [
  { e: '🎂', l: 'Birthday', on: true }, { e: '💍', l: 'Wedding' },
  { e: '🎨', l: 'Holi' }, { e: '🌙', l: 'Eid' },
  { e: '💛', l: 'Valentine' }, { e: '🎉', l: 'Anniversary' },
];
const CUSTOM = [
  { i: '📷', l: 'Photos', v: '6 added' },
  { i: '🎵', l: 'Music', v: 'Perfect — Ed Sheeran' },
  { i: '✍️', l: 'Message', v: 'Written with love' },
  { i: '⏳', l: 'Countdown', v: '12d 04h 22m' },
];

const phoneHeaderStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg,#3d0c11,#5a1620)', padding: '32px 16px 14px', flexShrink: 0,
};

/* Screen 1 — Choose occasion */
function OccasionScreen() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#faf3ee', display: 'flex', flexDirection: 'column' }}>
      <div style={phoneHeaderStyle}>
        <div style={{ fontSize: 9, letterSpacing: '2px', color: 'rgba(201,168,76,0.9)', fontWeight: 700 }}>NEW PAGE</div>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: '#f7eee5', marginTop: 3 }}>Choose an occasion</div>
      </div>
      <div style={{ flex: 1, padding: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, alignContent: 'start' }}>
        {OCC.map((o, i) => (
          <motion.div key={o.l}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.06, duration: 0.32 }}
            style={{
              background: o.on ? 'linear-gradient(135deg,#3d0c11,#5a1620)' : '#fff',
              border: `1.5px solid ${o.on ? '#c9a84c' : 'rgba(61,12,17,0.1)'}`,
              borderRadius: 12, padding: '14px 8px', textAlign: 'center', position: 'relative',
              boxShadow: o.on ? '0 8px 20px rgba(61,12,17,0.25)' : '0 3px 10px rgba(61,12,17,0.06)'
            }}>
            {o.on && <div style={{ position: 'absolute', top: 6, right: 6, width: 15, height: 15, borderRadius: '50%', background: '#c9a84c', color: '#3d0c11', fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</div>}
            <div style={{ fontSize: 24, marginBottom: 5 }}>{o.e}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: o.on ? '#f7eee5' : '#4a2828' }}>{o.l}</div>
          </motion.div>
        ))}
      </div>
      <div style={{ padding: '0 14px 18px', flexShrink: 0 }}>
        <div style={{ background: '#3d0c11', color: '#f5ede6', textAlign: 'center', padding: '12px', borderRadius: 10, fontSize: 12, fontWeight: 700, letterSpacing: '1px' }}>CONTINUE →</div>
      </div>
    </div>
  );
}

/* Screen 2 — Customize */
function CustomizeScreen() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#faf3ee', display: 'flex', flexDirection: 'column' }}>
      <div style={phoneHeaderStyle}>
        <div style={{ fontSize: 9, letterSpacing: '2px', color: 'rgba(201,168,76,0.9)', fontWeight: 700 }}>EDITOR</div>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: '#f7eee5', marginTop: 3 }}>Customize your page</div>
      </div>
      {/* mini preview */}
      <div style={{ margin: 14, borderRadius: 12, overflow: 'hidden', background: 'linear-gradient(160deg,#3d0c11,#5a1620,#2a0a0e)', padding: '18px 12px', textAlign: 'center', flexShrink: 0, border: '1px solid rgba(201,168,76,0.3)' }}>
        <div style={{ fontSize: 8, letterSpacing: '2px', color: 'rgba(201,168,76,0.9)', fontWeight: 700 }}>HAPPY BIRTHDAY</div>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#c9a84c,#a8823a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, margin: '8px auto 6px' }}>🎂</div>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 700, color: '#f7eee5' }}>Dearest Priya</div>
      </div>
      <div style={{ flex: 1, padding: '0 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {CUSTOM.map((c, i) => (
          <motion.div key={c.l}
            initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.12 + i * 0.08, duration: 0.32 }}
            style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '1px solid rgba(61,12,17,0.08)', borderRadius: 10, padding: '10px 12px', boxShadow: '0 3px 10px rgba(61,12,17,0.05)' }}>
            <span style={{ fontSize: 16 }}>{c.i}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: '#4a2828' }}>{c.l}</div>
              <div style={{ fontSize: 9.5, color: '#9a7070', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.v}</div>
            </div>
            <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#c9a84c', color: '#3d0c11', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</span>
          </motion.div>
        ))}
      </div>
      <div style={{ padding: 14, flexShrink: 0 }}>
        <div style={{ background: '#3d0c11', color: '#f5ede6', textAlign: 'center', padding: '12px', borderRadius: 10, fontSize: 12, fontWeight: 700, letterSpacing: '1px' }}>PREVIEW & PUBLISH</div>
      </div>
    </div>
  );
}

/* Screen 3 — Share */
function ShareScreen() {
  const shares = [
    { l: 'WhatsApp', bg: '#25D366', e: '💬' },
    { l: 'Instagram', bg: 'linear-gradient(135deg,#feda75,#d62976,#4f5bd5)', e: '📸' },
    { l: 'Copy link', bg: '#3d0c11', e: '🔗' },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(170deg,#faf3ee,#f0e0d0)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ ...phoneHeaderStyle, textAlign: 'center', paddingBottom: 18 }}>
        <div style={{ fontSize: 30 }}>🎉</div>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: '#f7eee5', marginTop: 4 }}>Your page is live!</div>
      </div>
      {/* preview thumb */}
      <div style={{ margin: '16px 16px 8px', borderRadius: 12, overflow: 'hidden', background: 'linear-gradient(160deg,#3d0c11,#5a1620)', padding: '20px 12px', textAlign: 'center', border: '2px solid #c9a84c', boxShadow: '0 12px 28px rgba(61,12,17,0.25)', flexShrink: 0 }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#c9a84c,#a8823a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, margin: '0 auto 8px' }}>🎂</div>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: '#f7eee5' }}>Dearest Priya</div>
        <div style={{ fontSize: 9, color: 'rgba(245,237,230,0.6)', marginTop: 3 }}>Wishing you a year as bright as you ✨</div>
      </div>
      {/* URL pill */}
      <div style={{ margin: '4px 16px 12px', background: '#fff', border: '1px solid rgba(201,168,76,0.5)', borderRadius: 999, padding: '9px 14px', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        <span style={{ fontSize: 11 }}>🔒</span>
        <span style={{ fontSize: 10.5, color: '#7a5555', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>subhsandesh.in/priya-bday</span>
        <span style={{ fontSize: 9, fontWeight: 800, color: '#c9a84c' }}>COPY</span>
      </div>
      {/* share buttons */}
      <div style={{ flex: 1, padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 9 }}>
        {shares.map((s, i) => (
          <motion.div key={s.l}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.1, duration: 0.32 }}
            style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '1px solid rgba(61,12,17,0.08)', borderRadius: 12, padding: '11px 13px', boxShadow: '0 3px 10px rgba(61,12,17,0.05)' }}>
            <span style={{ width: 30, height: 30, borderRadius: '50%', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{s.e}</span>
            <span style={{ flex: 1, fontSize: 12.5, fontWeight: 700, color: '#4a2828' }}>{s.l}</span>
            <span style={{ fontSize: 13, color: '#c9a84c' }}>→</span>
          </motion.div>
        ))}
      </div>
      <div style={{ padding: '10px 16px 18px', textAlign: 'center', flexShrink: 0 }}>
        <span style={{ fontSize: 10, color: '#9a7070', fontStyle: 'italic' }}>Already shared with 24 loved ones 💛</span>
      </div>
    </div>
  );
}

const SCREENS = [OccasionScreen, CustomizeScreen, ShareScreen];

export default function HowItWorksSection() {
  const router = useRouter();
  const [active, setActive] = useState(0);
  const [restart, setRestart] = useState(0);
  const ActiveScreen = SCREENS[active];

  useEffect(() => {
    const id = setInterval(() => setActive((p) => (p + 1) % 3), 4200);
    return () => clearInterval(id);
  }, [restart]);

  const pick = useCallback((i: number) => {
    setActive(i);
    setRestart((r) => r + 1);
  }, []);

  return (
    <section className="hiw-section" style={{ background: '#f5ede6', padding: '120px 0 110px', position: 'relative', overflow: 'hidden' }}>
      {/* Top rule */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,transparent,#c9a84c 25%,#3d0c11 50%,#c9a84c 75%,transparent)' }} />

      {/* Background diagonal pattern */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.025, backgroundImage: 'repeating-linear-gradient(45deg,#3d0c11 0,#3d0c11 1px,transparent 0,transparent 50%)', backgroundSize: '28px 28px', pointerEvents: 'none' }} />

      {/* Floating rosettes */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="akehan3.svg" aria-hidden="true" style={{ position: 'absolute', top: '6%', left: '3%', width: 68, opacity: 0.10, animation: 'spinSlow 24s linear infinite' }} alt="" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="akehan3.svg" aria-hidden="true" style={{ position: 'absolute', bottom: '10%', right: '4%', width: 54, opacity: 0.09, animation: 'spinSlow 30s linear infinite reverse' }} alt="" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="akehan3.svg" aria-hidden="true" style={{ position: 'absolute', top: '45%', right: '2%', width: 38, opacity: 0.07 }} alt="" />

      <div className="hiw-inner" style={{ maxWidth: 1120, margin: '0 auto', padding: '0 44px', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
          variants={stagger} style={{ textAlign: 'center', marginBottom: 64 }}>

          <motion.div variants={fadeUp} style={{ marginBottom: 26 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              border: '1.5px solid rgba(61,12,17,0.22)', padding: '7px 24px',
              fontSize: 10, fontWeight: 700, letterSpacing: '3px', color: '#6b4545',
              background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(8px)'
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#c9a84c', display: 'inline-block' }} />
              HOW IT WORKS
            </span>
          </motion.div>

          <motion.h2 variants={fadeUp}
            style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(30px,4.8vw,58px)', fontWeight: 700, color: '#2a0a0e', letterSpacing: '-1.5px', lineHeight: 1.08, marginBottom: 10 }}>
            Create your celebration page<br />in just{' '}
            <em style={{ color: '#c9a84c', fontStyle: 'italic' }}>3 simple steps</em>
          </motion.h2>

          <motion.div variants={fadeUp} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginTop: 22 }}>
            <div style={{ width: 80, height: 1, background: 'linear-gradient(to right,transparent,rgba(61,12,17,0.3))' }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="akehan3.svg" aria-hidden="true" style={{ width: 20, height: 20, opacity: 0.35 }} alt="" />
            <div style={{ width: 80, height: 1, background: 'linear-gradient(to left,transparent,rgba(61,12,17,0.3))' }} />
          </motion.div>
        </motion.div>

        {/* Body: cycling phone (left) + vertical step cards (right) */}
        <motion.div className="hiw-body" initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={stagger}>

          {/* Phone */}
          <motion.div className="hiw-phone-col"
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } }
            }}>
            <div style={{
              width: 300, maxWidth: '100%', height: 600, borderRadius: 40, background: '#241014',
              border: '9px solid #241014', boxShadow: '0 40px 80px rgba(61,12,17,0.32), 0 0 0 1px rgba(201,168,76,0.28)',
              overflow: 'hidden', position: 'relative', margin: '0 auto'
            }}>
              <AnimatePresence mode="wait">
                <motion.div key={active}
                  initial={{ opacity: 0, x: 26 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -26 }}
                  transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                  style={{ position: 'absolute', inset: 0 }}>
                  <ActiveScreen />
                </motion.div>
              </AnimatePresence>
              {/* notch */}
              <div style={{ position: 'absolute', top: 6, left: '50%', transform: 'translateX(-50%)', width: 92, height: 20, borderRadius: 12, background: '#241014', zIndex: 10 }} />
              {/* dot indicator */}
              <div style={{ position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6, zIndex: 10 }}>
                {steps.map((_, i) => (
                  <span key={i} style={{ width: i === active ? 16 : 6, height: 6, borderRadius: 4, background: i === active ? '#c9a84c' : 'rgba(255,255,255,0.35)', transition: 'all 0.3s' }} />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Step cards */}
          <div className="hiw-cards">
            {steps.map((s, i) => {
              const on = i === active;
              return (
                <motion.div key={s.num}
                  onClick={() => pick(i)}
                  variants={{
                    hidden: { opacity: 0, x: 40 },
                    visible: { opacity: 1, x: 0, transition: { duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } }
                  }}
                  style={{
                    background: '#fff',
                    border: `1.5px solid ${on ? 'rgba(201,168,76,0.75)' : 'rgba(61,12,17,0.08)'}`,
                    borderRadius: 16, padding: '26px 26px 26px 30px', position: 'relative',
                    display: 'flex', alignItems: 'center', gap: 20, minHeight: 172,
                    boxShadow: on ? '0 26px 54px rgba(61,12,17,0.16)' : '0 6px 22px rgba(61,12,17,0.06)',
                    opacity: on ? 1 : 0.62, cursor: 'pointer',
                    transform: on ? 'translateX(8px)' : 'translateX(0)',
                    transition: 'all 0.4s cubic-bezier(0.22,1,0.36,1)', overflow: 'hidden'
                  }}>

                  {/* top/left accent */}
                  <div style={{ position: 'absolute', left: 0, top: on ? '16%' : '50%', bottom: on ? '16%' : '50%', width: 4, borderRadius: 4, background: 'linear-gradient(#c9a84c,#a8823a)', opacity: on ? 1 : 0, transition: 'all 0.4s' }} />

                  {/* number watermark */}
                  <div style={{ position: 'absolute', top: 10, right: 18, fontFamily: "'Playfair Display',serif", fontSize: 64, fontWeight: 700, color: 'rgba(61,12,17,0.05)', lineHeight: 1, userSelect: 'none', pointerEvents: 'none' }}>{s.num}</div>

                  {/* icon circle */}
                  <div style={{ position: 'relative', width: 72, height: 72, flexShrink: 0 }}>
                    {on && <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid rgba(201,168,76,0.35)', animation: 'pulseSlow 3s ease-in-out infinite' }} />}
                    <div style={{
                      position: 'absolute', inset: 5, borderRadius: '50%', background: '#3d0c11',
                      border: `2px solid ${on ? '#c9a84c' : 'rgba(201,168,76,0.4)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 8px 22px rgba(61,12,17,0.3)', transition: 'border-color 0.4s'
                    }}>
                      <StepIcon type={s.icon} />
                    </div>
                  </div>

                  {/* text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '2.5px', color: '#c9a84c', marginBottom: 6 }}>
                      {on ? '▶ SHOWN ON PHONE' : s.tag}
                    </div>
                    <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: '#2a0a0e', margin: '0 0 6px', lineHeight: 1.2 }}>{s.title}</h3>
                    <p style={{ fontSize: 13, color: '#7a5555', lineHeight: 1.65, margin: 0 }}>{s.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* CTA strip */}
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.65, delay: 0.2, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          style={{ textAlign: 'center', marginTop: 64 }}>
          <motion.button className="hiw-cta-btn"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            whileHover={{ scale: 1.04, backgroundColor: '#2a0809' } as any}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push('/templates')}
            style={{
              background: '#3d0c11', color: '#f5ede6', border: 'none',
              padding: '18px 44px', fontSize: 11, fontWeight: 700, letterSpacing: '2px',
              cursor: 'pointer', borderRadius: 4,
              boxShadow: '0 8px 28px rgba(61,12,17,0.25)', transition: 'background-color 0.22s',
              display: 'inline-flex', alignItems: 'center', gap: 10
            }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 20h4l10-10a2.1 2.1 0 0 0 0-3l-1-1a2.1 2.1 0 0 0-3 0L4 16v4z" />
              <path d="M13 7l4 4" />
            </svg>
            START CREATING NOW
          </motion.button>
          <p style={{ marginTop: 14, fontSize: 12, color: '#b09090', letterSpacing: '0.3px' }}>
            No design skills needed &nbsp;•&nbsp; Ready in under 2 minutes
          </p>
        </motion.div>
      </div>

      {/* Bottom rule */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,transparent,#c9a84c 25%,#3d0c11 50%,#c9a84c 75%,transparent)' }} />

      <style>{`
        .hiw-body {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 56px;
          align-items: center;
          max-width: 900px;
          margin: 0 auto;
        }
        .hiw-cards { display: flex; flex-direction: column; gap: 18px; }
        @media (max-width: 860px) {
          .hiw-body { grid-template-columns: 1fr; gap: 40px; max-width: 380px; }
        }
      `}</style>
    </section>
  );
}
