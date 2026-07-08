"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.13 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

const GOLD_FILTER = "brightness(0) saturate(100%) invert(70%) sepia(48%) saturate(760%) hue-rotate(2deg) brightness(95%) contrast(110%)";

const items = [
  { icon: 'chat', label: 'Plain WhatsApp messages', desc: 'A "Happy Birthday!" lost in a sea of group notifications.' },
  { icon: 'doc', label: 'Generic greeting cards', desc: 'Mass-forwarded e-cards with no personal touch or memory.' },
  { icon: 'thumb', label: 'Social media comments', desc: '"HBD!!" on a public wall, forgotten within hours.' },
];

const CAPTIONS = [
  "…one of 40+ forgettable messages, gone by evening.",
  "…the same template everyone forwards, signed by no one.",
  "…a public comment buried under a hundred others.",
];

// ── Chat data for the WhatsApp screen ──
const CHAT = [
  { side: 'in', name: 'Rahul Uncle', color: '#4ea1b0', text: 'Happy Birthday beta! 🎂🎂', time: '9:15' },
  { side: 'in', name: 'Neha Aunty', color: '#c07ab0', text: 'HBD!! Many many happy returns 🎉', time: '9:16' },
  { side: 'in', name: 'Amit', color: '#d0913f', text: 'Happy bday bro 🎈', time: '9:20' },
  { side: 'out', name: '', color: '', text: 'Thank you everyone 🙏😊', time: '9:45' },
  { side: 'in', name: 'Priya', color: '#9b8ad0', text: 'Happpyyy birthdayyy 🥳', time: '10:02' },
];

// ── Comments for the Instagram screen ──
const IG = [
  { u: 'rahul_92', t: 'HBD!! 🎉🎉' },
  { u: 'neha.k', t: 'happy bdayyy ✨' },
  { u: 'amit_gpt', t: '🎂🎂🎂' },
  { u: 'sneha.p', t: 'many many happy returns 🥳' },
  { u: 'the_arjun', t: 'party kab? 🎈' },
];

function ProblemIcon({ type }: { type: string }) {
  const base = { width: 26, height: 26, viewBox: '0 0 24 24', fill: 'none', stroke: 'rgba(245,237,230,0.82)', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  if (type === 'chat') return (
    <svg {...base}>
      <path d="M5 6.5A3.5 3.5 0 0 1 8.5 3h7A3.5 3.5 0 0 1 19 6.5v5A3.5 3.5 0 0 1 15.5 15H9l-4 4v-4.5A3.5 3.5 0 0 1 1.5 11V6.5A3.5 3.5 0 0 1 5 3" />
      <circle cx="9" cy="9" r="0.8" fill="rgba(245,237,230,0.82)" stroke="none" />
      <circle cx="12" cy="9" r="0.8" fill="rgba(245,237,230,0.82)" stroke="none" />
      <circle cx="15" cy="9" r="0.8" fill="rgba(245,237,230,0.82)" stroke="none" />
    </svg>
  );
  if (type === 'doc') return (
    <svg {...base}>
      <path d="M8 3h6l4 4v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 0 2-2z" />
      <path d="M14 3v5h5" />
      <path d="M9.5 13h5" />
      <path d="M9.5 16h5" />
    </svg>
  );
  return (
    <svg {...base}>
      <path d="M9.5 10.5V20H6.8a2.3 2.3 0 0 1-2.3-2.3v-4.9a2.3 2.3 0 0 1 2.3-2.3h2.7z" />
      <path d="M9.5 10.5l3-6.2a2.2 2.2 0 0 1 4.2 1v2.8h2.1a1.8 1.8 0 0 1 1.8 2.1l-1.1 7.1A3 3 0 0 1 16.5 20H9.5" />
    </svg>
  );
}

/* ─── Phone screen 0: WhatsApp group chat ─── */
function WhatsAppScreen() {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: '#0b141a' }}>
      {/* header */}
      <div style={{ background: '#075E54', padding: '30px 12px 10px', display: 'flex', alignItems: 'center', gap: 9, flexShrink: 0 }}>
        <span style={{ color: '#fff', fontSize: 18, lineHeight: 1 }}>‹</span>
        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#c9a84c,#a8823a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>👨‍👩‍👧</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: '#fff', fontSize: 13.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Family Group</div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10 }}>Rahul, Neha, Amit, Priya…</div>
        </div>
        <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>📹</span>
        <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 15 }}>⋮</span>
      </div>
      {/* chat */}
      <div style={{ flex: 1, padding: '14px 10px 10px', display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden' }}>
        <div style={{ alignSelf: 'center', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', fontSize: 9, padding: '3px 12px', borderRadius: 10, marginBottom: 2 }}>TODAY</div>
        {CHAT.map((m, i) => {
          const out = m.side === 'out';
          return (
            <motion.div key={i}
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.12 + i * 0.1, duration: 0.32 }}
              style={{
                alignSelf: out ? 'flex-end' : 'flex-start', maxWidth: '82%',
                background: out ? '#075E54' : '#1f2c34', color: '#e9edef',
                borderRadius: out ? '10px 10px 2px 10px' : '10px 10px 10px 2px',
                padding: '6px 9px 5px', boxShadow: '0 1px 1px rgba(0,0,0,0.3)'
              }}>
              {!out && m.name && <div style={{ fontSize: 10.5, fontWeight: 700, color: m.color, marginBottom: 1 }}>{m.name}</div>}
              <div style={{ fontSize: 12.5, lineHeight: 1.35 }}>{m.text}</div>
              <div style={{ fontSize: 8.5, color: 'rgba(233,237,239,0.5)', textAlign: 'right', marginTop: 1 }}>
                {m.time}{out && <span style={{ color: '#53bdeb', marginLeft: 3 }}>✓✓</span>}
              </div>
            </motion.div>
          );
        })}
      </div>
      {/* input */}
      <div style={{ background: '#1f2c34', padding: '8px 10px 14px', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <div style={{ flex: 1, background: '#2a3942', borderRadius: 20, padding: '8px 12px', color: 'rgba(233,237,239,0.4)', fontSize: 11.5 }}>Message</div>
        <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#075E54', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🎤</div>
      </div>
    </div>
  );
}

/* ─── Phone screen 1: generic forwarded e-card ─── */
function GreetingCardScreen() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#141b21', display: 'flex', flexDirection: 'column' }}>
      {/* fake mail/forward header */}
      <div style={{ padding: '30px 14px 12px', background: '#1f2c34', flexShrink: 0 }}>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>Forwarded • 4 times</div>
        <div style={{ fontSize: 12.5, color: '#e9edef', fontWeight: 600, marginTop: 2 }}>Happy_Birthday_Card.jpg</div>
      </div>
      {/* the generic card */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <div style={{
          width: '100%', borderRadius: 12, overflow: 'hidden', position: 'relative',
          background: 'linear-gradient(160deg,#f6d5e0 0%,#fcefc7 55%,#cfe8f7 100%)',
          border: '4px solid #fff', boxShadow: '0 16px 34px rgba(0,0,0,0.4)', padding: '30px 18px 26px', textAlign: 'center'
        }}>
          <div style={{ fontSize: 30, marginBottom: 6 }}>🎈🎂🎈</div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 25, fontWeight: 700, color: '#c05b7e', lineHeight: 1.05 }}>Happy<br />Birthday!</div>
          <div style={{ width: 60, height: 1, background: 'rgba(0,0,0,0.15)', margin: '12px auto' }} />
          <div style={{ fontSize: 10.5, color: '#6d5b52', lineHeight: 1.6, fontStyle: 'italic' }}>Wishing you all the best<br />on your special day.</div>
          <div style={{ fontSize: 9, color: 'rgba(0,0,0,0.35)', marginTop: 14 }}>— Free eCards Online · #4821</div>
        </div>
      </div>
      <div style={{ padding: '0 16px 18px', flexShrink: 0 }}>
        <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>Sent to 12 other people today</div>
      </div>
    </div>
  );
}

/* ─── Phone screen 2: Instagram comments ─── */
function InstagramScreen() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#fff', display: 'flex', flexDirection: 'column' }}>
      {/* header */}
      <div style={{ padding: '30px 12px 8px', display: 'flex', alignItems: 'center', gap: 9, borderBottom: '1px solid #efefef', flexShrink: 0 }}>
        <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#feda75,#d62976,#4f5bd5)', padding: 2 }}>
          <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#c9a84c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, border: '2px solid #fff' }}>🎉</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: '#262626' }}>priya_23</div>
          <div style={{ fontSize: 9.5, color: '#8e8e8e' }}>2h · Mumbai</div>
        </div>
        <span style={{ color: '#262626', fontSize: 15 }}>⋯</span>
      </div>
      {/* photo */}
      <div style={{ height: 128, background: 'linear-gradient(135deg,#3d0c11,#a13540)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, flexShrink: 0 }}>🎂</div>
      {/* actions */}
      <div style={{ padding: '8px 12px 2px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <span style={{ fontSize: 17 }}>❤️</span>
        <span style={{ fontSize: 16 }}>💬</span>
        <span style={{ fontSize: 16 }}>✈️</span>
        <span style={{ marginLeft: 'auto', fontSize: 15 }}>🔖</span>
      </div>
      <div style={{ padding: '0 12px 4px', fontSize: 11.5, fontWeight: 700, color: '#262626', flexShrink: 0 }}>1,284 likes</div>
      {/* comments */}
      <div style={{ flex: 1, padding: '2px 12px 8px', display: 'flex', flexDirection: 'column', gap: 7, overflow: 'hidden' }}>
        {IG.map((c, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.12 + i * 0.09, duration: 0.3 }}
            style={{ fontSize: 11.5, lineHeight: 1.4, color: '#262626' }}>
            <span style={{ fontWeight: 700 }}>{c.u}</span> <span style={{ color: '#3a3a3a' }}>{c.t}</span>
          </motion.div>
        ))}
      </div>
      {/* comment box */}
      <div style={{ padding: '8px 12px 14px', borderTop: '1px solid #efefef', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <span style={{ fontSize: 15 }}>😊</span>
        <div style={{ flex: 1, fontSize: 11.5, color: '#c7c7c7' }}>Add a comment…</div>
        <span style={{ fontSize: 11.5, fontWeight: 700, color: '#b7cdf0' }}>Post</span>
      </div>
    </div>
  );
}

const SCREENS = [WhatsAppScreen, GreetingCardScreen, InstagramScreen];

export default function ProblemSection() {
  const [active, setActive] = useState(0);
  const [restart, setRestart] = useState(0);
  const ActiveScreen = SCREENS[active];

  useEffect(() => {
    const id = setInterval(() => setActive((p) => (p + 1) % 3), 4000);
    return () => clearInterval(id);
  }, [restart]);

  const pick = useCallback((i: number) => {
    setActive(i);
    setRestart((r) => r + 1);
  }, []);

  return (
    <section className="problem-section" style={{ background: 'linear-gradient(170deg,#120306 0%,#1c0508 45%,#220709 75%,#120306 100%)', padding: '120px 0 100px', position: 'relative', overflow: 'hidden' }}>
      {/* Top gold–maroon rule */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,transparent,#c9a84c 25%,#f5ede6 50%,#c9a84c 75%,transparent)' }} />

      {/* Soft radial glow */}
      <div style={{ position: 'absolute', top: '12%', left: '50%', transform: 'translateX(-50%)', width: 620, height: 620, borderRadius: '50%', background: 'radial-gradient(circle,rgba(201,168,76,0.08) 0%,transparent 68%)', pointerEvents: 'none' }} />

      {/* Floating rosettes */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="akehan3.svg" aria-hidden="true" style={{ position: 'absolute', top: '8%', left: '3%', width: 64, opacity: 0.16, filter: GOLD_FILTER, animation: 'spinSlow 22s linear infinite' }} alt="" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="akehan3.svg" aria-hidden="true" style={{ position: 'absolute', bottom: '12%', right: '4%', width: 52, opacity: 0.14, filter: GOLD_FILTER, animation: 'spinSlow 28s linear infinite reverse' }} alt="" />

      <div style={{ maxWidth: 1040, margin: '0 auto', padding: '0 44px', position: 'relative', zIndex: 1 }}>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger}>

          {/* Header (centered) */}
          <div style={{ textAlign: 'center' }}>
            <motion.div variants={fadeUp} style={{ marginBottom: 26 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                border: '1.5px solid rgba(201,168,76,0.4)', padding: '7px 24px',
                fontSize: 10, fontWeight: 700, letterSpacing: '3px', color: '#c9a84c',
                background: 'rgba(201,168,76,0.06)', backdropFilter: 'blur(8px)'
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#c9a84c', display: 'inline-block' }} />
                THE PROBLEM
              </span>
            </motion.div>

            <motion.h2 variants={fadeUp}
              style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(30px,4.8vw,58px)', fontWeight: 700, color: '#f7eee5', lineHeight: 1.08, letterSpacing: '-1.5px', marginBottom: 10 }}>
              Celebrations deserve more than<br />
              <em style={{ color: '#c9a84c', fontStyle: 'italic' }}>just a simple message.</em>
            </motion.h2>

            <motion.div variants={fadeUp} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, margin: '22px auto 24px' }}>
              <div style={{ width: 72, height: 1, background: 'linear-gradient(to right,transparent,rgba(201,168,76,0.7))' }} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="akehan3.svg" aria-hidden="true" style={{ width: 20, height: 20, opacity: 0.7, filter: GOLD_FILTER }} alt="" />
              <div style={{ width: 72, height: 1, background: 'linear-gradient(to left,transparent,rgba(201,168,76,0.7))' }} />
            </motion.div>

            <motion.p variants={fadeUp} style={{ fontSize: 15.5, color: 'rgba(245,237,230,0.6)', lineHeight: 1.82, maxWidth: 460, margin: '0 auto 56px', fontStyle: 'italic' }}>
              Today most people still send wishes through these…
            </motion.p>
          </div>

          {/* Body: cycling phone (left) + vertical cards (right) */}
          <div className="prob-body">

            {/* Phone with cycling screens */}
            <motion.div className="prob-phone-col"
              variants={{
                hidden: { opacity: 0, y: 40 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } }
              }}>
              <div className="prob-phone" style={{
                width: 300, maxWidth: '100%', height: 600, borderRadius: 40,
                background: 'linear-gradient(135deg,#2a2a2e,#141416)',
                border: '9px solid #0c0c0e',
                boxShadow: '0 40px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(201,168,76,0.35), inset 0 0 0 2px rgba(255,255,255,0.06)',
                overflow: 'hidden', position: 'relative', margin: '0 auto'
              }}>
                {/* screens */}
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
                {/* notch (above screens) */}
                <div style={{ position: 'absolute', top: 6, left: '50%', transform: 'translateX(-50%)', width: 92, height: 20, borderRadius: 12, background: '#241014', zIndex: 10 }} />
                {/* dot indicator */}
                <div style={{ position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6, zIndex: 10 }}>
                  {items.map((_, i) => (
                    <span key={i} style={{ width: i === active ? 16 : 6, height: 6, borderRadius: 4, background: i === active ? '#c9a84c' : 'rgba(255,255,255,0.3)', transition: 'all 0.3s' }} />
                  ))}
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.p key={active}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  style={{ textAlign: 'center', fontSize: 11.5, color: 'rgba(245,237,230,0.5)', fontStyle: 'italic', marginTop: 16, minHeight: 18 }}>
                  {CAPTIONS[active]}
                </motion.p>
              </AnimatePresence>
            </motion.div>

            {/* Vertical cards (synced with phone) */}
            <motion.div className="problem-cards-wrap" variants={stagger} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {items.map((p, i) => {
                const on = i === active;
                return (
                  <motion.div className="problem-card" key={p.label}
                    onClick={() => pick(i)}
                    variants={{
                      hidden: { opacity: 0, x: 40 },
                      visible: { opacity: 1, x: 0, transition: { duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } }
                    }}
                    style={{
                      background: on
                        ? 'linear-gradient(155deg,rgba(201,168,76,0.14) 0%,rgba(255,255,255,0.03) 100%)'
                        : 'linear-gradient(155deg,rgba(255,255,255,0.05) 0%,rgba(255,255,255,0.015) 100%)',
                      border: `1.5px solid ${on ? 'rgba(201,168,76,0.75)' : 'rgba(201,168,76,0.16)'}`,
                      borderRadius: 16, padding: '30px 26px 30px 30px', position: 'relative',
                      display: 'flex', alignItems: 'center', gap: 20, minHeight: 172,
                      boxShadow: on ? '0 24px 52px rgba(0,0,0,0.5)' : '0 12px 30px rgba(0,0,0,0.3)',
                      backdropFilter: 'blur(6px)', opacity: on ? 1 : 0.55, cursor: 'pointer',
                      transform: on ? 'translateX(8px)' : 'translateX(0)',
                      transition: 'all 0.4s cubic-bezier(0.22,1,0.36,1)'
                    }}>

                    {/* active left accent bar */}
                    <div style={{ position: 'absolute', left: 0, top: on ? '18%' : '50%', bottom: on ? '18%' : '50%', width: 3, borderRadius: 3, background: 'linear-gradient(#c9a84c,#a8823a)', opacity: on ? 1 : 0, transition: 'all 0.4s' }} />

                    {/* Rejected stamp */}
                    <div style={{
                      position: 'absolute', top: -11, right: -11, width: 28, height: 28, borderRadius: '50%',
                      background: '#c9a84c', border: '2.5px solid #1c0508',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, color: '#1c0508', fontWeight: 800, zIndex: 2,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                    }}>✕</div>

                    {/* Icon circle */}
                    <div style={{
                      width: 66, height: 66, borderRadius: '50%', flexShrink: 0,
                      background: on ? 'linear-gradient(135deg,rgba(201,168,76,0.22),rgba(255,255,255,0.04))' : 'linear-gradient(135deg,rgba(201,168,76,0.1),rgba(255,255,255,0.03))',
                      border: `1.5px solid ${on ? 'rgba(201,168,76,0.5)' : 'rgba(201,168,76,0.2)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.4s'
                    }}>
                      <ProblemIcon type={p.icon} />
                    </div>

                    {/* Text */}
                    <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                      {on && <div style={{ fontSize: 9, letterSpacing: '2px', color: '#c9a84c', fontWeight: 700, marginBottom: 6 }}>▶ SHOWN ON PHONE</div>}
                      <div style={{ position: 'relative', display: 'inline-block', marginBottom: 7 }}>
                        <span className="problem-card-title" style={{ fontSize: 17, color: '#f2e6da', fontWeight: 700, lineHeight: 1.3, display: 'block' }}>{p.label}</span>
                        <motion.div
                          initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }}
                          transition={{ delay: 0.55 + i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                          style={{
                            position: 'absolute', top: '52%', left: 0, right: 0, height: 2,
                            background: 'linear-gradient(90deg,#c9a84c,rgba(201,168,76,0.4))',
                            transformOrigin: 'left', borderRadius: 2
                          }} />
                      </div>
                      <p style={{ fontSize: 13, color: 'rgba(245,237,230,0.58)', lineHeight: 1.6, margin: 0 }}>{p.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          {/* Closing statement */}
          <div style={{ textAlign: 'center', marginTop: 64 }}>
            <motion.div variants={fadeUp} style={{ position: 'relative', display: 'inline-block', maxWidth: 600, margin: '0 auto' }}>
              <div style={{ position: 'absolute', top: -8, left: -8, width: 18, height: 18, borderTop: '2px solid #c9a84c', borderLeft: '2px solid #c9a84c' }} />
              <div style={{ position: 'absolute', top: -8, right: -8, width: 18, height: 18, borderTop: '2px solid #c9a84c', borderRight: '2px solid #c9a84c' }} />
              <div style={{ position: 'absolute', bottom: -8, left: -8, width: 18, height: 18, borderBottom: '2px solid #c9a84c', borderLeft: '2px solid #c9a84c' }} />
              <div style={{ position: 'absolute', bottom: -8, right: -8, width: 18, height: 18, borderBottom: '2px solid #c9a84c', borderRight: '2px solid #c9a84c' }} />
              <div style={{
                background: 'linear-gradient(135deg,rgba(201,168,76,0.1) 0%,rgba(255,255,255,0.03) 100%)',
                border: '1px solid rgba(201,168,76,0.32)', padding: '26px 40px'
              }}>
                <p style={{ fontSize: 17, color: 'rgba(245,237,230,0.72)', lineHeight: 1.82, fontStyle: 'italic', margin: 0 }}>
                  But special moments deserve something{' '}
                  <strong style={{ color: '#f7eee5', fontStyle: 'normal' }}>personal, emotional,<br />and unforgettable.</strong>
                </p>
              </div>
            </motion.div>
          </div>

        </motion.div>
      </div>

      {/* Bottom rule */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,transparent,#c9a84c 25%,#f5ede6 50%,#c9a84c 75%,transparent)' }} />

      <style>{`
        .prob-body {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 56px;
          align-items: center;
          max-width: 900px;
          margin: 0 auto;
        }
        @media (max-width: 860px) {
          .prob-body {
            grid-template-columns: 1fr;
            gap: 44px;
            max-width: 360px;
          }
        }
      `}</style>
    </section>
  );
}
