"use client";

import { motion } from "framer-motion";

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
  { icon: 'chat', label: 'Plain WhatsApp messages', desc: 'A "Happy Birthday!" lost in a sea of notifications.', rot: -2.5, delay: 0 },
  { icon: 'doc', label: 'Generic greeting cards', desc: 'Mass-printed with no personal touch or memory.', rot: 1.8, delay: 0.13 },
  { icon: 'thumb', label: 'Social media comments', desc: '"HBD!!" on a public wall, forgotten within hours.', rot: -1.4, delay: 0.26 },
];

function ProblemIcon({ type }: { type: string }) {
  const base = { width: 30, height: 30, viewBox: '0 0 24 24', fill: 'none', stroke: '#6b4545', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  if (type === 'chat') return (
    <svg {...base}>
      <path d="M5 6.5A3.5 3.5 0 0 1 8.5 3h7A3.5 3.5 0 0 1 19 6.5v5A3.5 3.5 0 0 1 15.5 15H9l-4 4v-4.5A3.5 3.5 0 0 1 1.5 11V6.5A3.5 3.5 0 0 1 5 3" />
      <circle cx="9" cy="9" r="0.8" fill="#6b4545" stroke="none" />
      <circle cx="12" cy="9" r="0.8" fill="#6b4545" stroke="none" />
      <circle cx="15" cy="9" r="0.8" fill="#6b4545" stroke="none" />
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

export default function ProblemSection() {
  return (
    <section className="problem-section" style={{ background: '#faf3ee', padding: '120px 0 100px', position: 'relative', overflow: 'hidden' }}>
      {/* Top gold–maroon rule */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,transparent,#c9a84c 25%,#3d0c11 50%,#c9a84c 75%,transparent)' }} />

      {/* Floating rosettes */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="akehan3.svg" aria-hidden="true" style={{ position: 'absolute', top: '8%', left: '3%', width: 64, opacity: 0.11, animation: 'spinSlow 22s linear infinite' }} alt="" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="akehan3.svg" aria-hidden="true" style={{ position: 'absolute', bottom: '12%', right: '4%', width: 52, opacity: 0.10, animation: 'spinSlow 28s linear infinite reverse' }} alt="" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="akehan3.svg" aria-hidden="true" style={{ position: 'absolute', top: '44%', right: '2%', width: 36, opacity: 0.08 }} alt="" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="akehan3.svg" aria-hidden="true" style={{ position: 'absolute', bottom: '30%', left: '2%', width: 40, opacity: 0.08 }} alt="" />

      <div style={{ maxWidth: 940, margin: '0 auto', padding: '0 44px', position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger}>

          {/* Badge */}
          <motion.div variants={fadeUp} style={{ marginBottom: 26 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              border: '1.5px solid rgba(61,12,17,0.22)', padding: '7px 24px',
              fontSize: 10, fontWeight: 700, letterSpacing: '3px', color: '#6b4545',
              background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(8px)'
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#c9a84c', display: 'inline-block' }} />
              THE PROBLEM
            </span>
          </motion.div>

          <motion.h2 variants={fadeUp}
            style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(30px,4.8vw,58px)', fontWeight: 700, color: '#2a0a0e', lineHeight: 1.08, letterSpacing: '-1.5px', marginBottom: 10 }}>
            Celebrations deserve more than<br />
            <em style={{ color: '#c9a84c', fontStyle: 'italic' }}>just a simple message.</em>
          </motion.h2>

          {/* Ornamental divider */}
          <motion.div variants={fadeUp} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, margin: '22px auto 28px' }}>
            <div style={{ width: 72, height: 1, background: 'linear-gradient(to right,transparent,rgba(201,168,76,0.7))' }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="akehan3.svg" aria-hidden="true" style={{ width: 20, height: 20, opacity: 0.5, filter: GOLD_FILTER }} alt="" />
            <div style={{ width: 72, height: 1, background: 'linear-gradient(to left,transparent,rgba(201,168,76,0.7))' }} />
          </motion.div>

          <motion.p variants={fadeUp} style={{ fontSize: 15.5, color: '#7a5555', lineHeight: 1.82, marginBottom: 56, maxWidth: 460, margin: '0 auto 56px', fontStyle: 'italic' }}>
            Today most people still send wishes through these…
          </motion.p>

          {/* Problem Cards */}
          <motion.div className="problem-cards-wrap" variants={stagger} style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 60 }}>
            {items.map((p) => (
              <motion.div className="problem-card" key={p.label}
                variants={{
                  hidden: { opacity: 0, y: 60, rotate: p.rot * 2 },
                  visible: { opacity: 1, y: 0, rotate: p.rot, transition: { duration: 0.7, delay: p.delay, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } }
                }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                whileHover={{ y: -10, rotate: 0, scale: 1.04, boxShadow: '0 28px 60px rgba(61,12,17,0.16)' } as any}
                style={{
                  background: '#fff', border: '1.5px solid rgba(61,12,17,0.1)', borderRadius: 6,
                  padding: '36px 28px 28px', width: 250, position: 'relative',
                  boxShadow: '0 8px 28px rgba(61,12,17,0.09)',
                  transition: 'all 0.38s cubic-bezier(0.22,1,0.36,1)', cursor: 'default',
                  transformOrigin: 'bottom center'
                }}>

                {/* Rejected stamp */}
                <div style={{
                  position: 'absolute', top: -13, right: -13, width: 30, height: 30, borderRadius: '50%',
                  background: '#3d0c11', border: '2.5px solid #faf3ee',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, color: '#c9a84c', fontWeight: 800, zIndex: 2,
                  boxShadow: '0 4px 12px rgba(61,12,17,0.35)'
                }}>✕</div>

                {/* Icon circle */}
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: 'linear-gradient(135deg,rgba(61,12,17,0.06) 0%,rgba(201,168,76,0.09) 100%)',
                  border: '1.5px solid rgba(61,12,17,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 18px'
                }}>
                  <ProblemIcon type={p.icon} />
                </div>

                {/* Label with strikethrough */}
                <div style={{ position: 'relative', marginBottom: 12, display: 'inline-block', width: '100%' }}>
                  <span className="problem-card-title" style={{ fontSize: 13.1, color: '#4a2828', fontWeight: 700, lineHeight: 1.3, display: 'block', whiteSpace: 'nowrap' }}>{p.label}</span>
                  <motion.div
                    initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }}
                    transition={{ delay: 0.55 + p.delay, duration: 0.65, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                    style={{
                      position: 'absolute', top: '52%', left: 0, right: 0, height: 2,
                      background: 'linear-gradient(90deg,#3d0c11,rgba(61,12,17,0.5))',
                      transformOrigin: 'left', borderRadius: 2
                    }} />
                </div>

                <p style={{ fontSize: 11.5, color: '#9a7070', lineHeight: 1.65, margin: 0 }}>{p.desc}</p>

                {/* Bottom gold rule */}
                <div style={{
                  position: 'absolute', bottom: 0, left: '20%', right: '20%', height: 2,
                  background: 'linear-gradient(90deg,transparent,rgba(201,168,76,0.55),transparent)', borderRadius: 2
                }} />
              </motion.div>
            ))}
          </motion.div>

          {/* Closing statement */}
          <motion.div variants={fadeUp} style={{ position: 'relative', display: 'inline-block', maxWidth: 600, margin: '0 auto' }}>
            <div style={{ position: 'absolute', top: -8, left: -8, width: 18, height: 18, borderTop: '2px solid #c9a84c', borderLeft: '2px solid #c9a84c' }} />
            <div style={{ position: 'absolute', top: -8, right: -8, width: 18, height: 18, borderTop: '2px solid #c9a84c', borderRight: '2px solid #c9a84c' }} />
            <div style={{ position: 'absolute', bottom: -8, left: -8, width: 18, height: 18, borderBottom: '2px solid #c9a84c', borderLeft: '2px solid #c9a84c' }} />
            <div style={{ position: 'absolute', bottom: -8, right: -8, width: 18, height: 18, borderBottom: '2px solid #c9a84c', borderRight: '2px solid #c9a84c' }} />
            <div style={{
              background: 'linear-gradient(135deg,rgba(201,168,76,0.07) 0%,rgba(61,12,17,0.04) 100%)',
              border: '1px solid rgba(201,168,76,0.28)', padding: '26px 40px'
            }}>
              <p style={{ fontSize: 17, color: '#6b4545', lineHeight: 1.82, fontStyle: 'italic', margin: 0 }}>
                But special moments deserve something{' '}
                <strong style={{ color: '#2a0a0e', fontStyle: 'normal' }}>personal, emotional,<br />and unforgettable.</strong>
              </p>
            </div>
          </motion.div>

        </motion.div>
      </div>

      {/* Bottom rule */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,transparent,#c9a84c 25%,#3d0c11 50%,#c9a84c 75%,transparent)' }} />
    </section>
  );
}
