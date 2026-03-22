"use client";

import { motion } from "framer-motion";
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
  { num: '01', icon: 'calendar', title: 'Choose Your Occasion', desc: "Pick from birthdays, weddings, Holi, Eid, Valentine's Day and more festive occasions.", tag: 'STEP ONE', delay: 0, fromX: -60 },
  { num: '02', icon: 'edit', title: 'Customize Your Page', desc: 'Add photos, music, heartfelt messages, and a live countdown timer to make it truly special.', tag: 'STEP TWO', delay: 0.14, fromX: 0 },
  { num: '03', icon: 'share', title: 'Share the Surprise', desc: 'Publish your page and send the magical link to loved ones — ready in under 2 minutes.', tag: 'STEP THREE', delay: 0.28, fromX: 60 },
];

function StepIcon({ type }: { type: string }) {
  const common = { width: 31, height: 31, viewBox: '0 0 24 24', fill: 'none', stroke: '#c9a84c', strokeWidth: 1.85, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  if (type === 'calendar') return (
    <svg {...common}>
      <rect x="4" y="5" width="16" height="15" rx="2.2" />
      <path d="M8 3v4M16 3v4M4 10h16" />
      <circle cx="9" cy="14.2" r="0.9" fill="#c9a84c" stroke="none" />
      <circle cx="12.5" cy="14.2" r="0.9" fill="#c9a84c" stroke="none" />
      <circle cx="16" cy="14.2" r="0.9" fill="#c9a84c" stroke="none" />
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

export default function HowItWorksSection() {
  const router = useRouter();

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
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="akehan3.svg" aria-hidden="true" style={{ position: 'absolute', bottom: '35%', left: '2%', width: 42, opacity: 0.07 }} alt="" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="akehan3.svg" aria-hidden="true" style={{ position: 'absolute', top: '18%', left: '44%', width: 28, opacity: 0.06 }} alt="" />

      <div className="hiw-inner" style={{ maxWidth: 1120, margin: '0 auto', padding: '0 44px', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
          variants={stagger} style={{ textAlign: 'center', marginBottom: 80 }}>

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

          {/* Ornamental divider */}
          <motion.div variants={fadeUp} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginTop: 22 }}>
            <div style={{ width: 80, height: 1, background: 'linear-gradient(to right,transparent,rgba(61,12,17,0.3))' }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="akehan3.svg" aria-hidden="true" style={{ width: 20, height: 20, opacity: 0.35 }} alt="" />
            <div style={{ width: 80, height: 1, background: 'linear-gradient(to left,transparent,rgba(61,12,17,0.3))' }} />
          </motion.div>
        </motion.div>

        {/* Steps grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 32, position: 'relative' }}
          className="hiw-grid">

          {/* Connecting dotted path */}
          <div className="hiw-path" style={{
            position: 'absolute', top: 72, left: '19%', right: '19%', height: 2, zIndex: 0,
            background: 'repeating-linear-gradient(90deg,rgba(201,168,76,0.55) 0,rgba(201,168,76,0.55) 6px,transparent 6px,transparent 14px)'
          }} />
          {/* Arrow chevrons */}
          {[38, 62].map(pct => (
            <div key={pct} className="hiw-arrow" style={{ position: 'absolute', top: 64, left: `${pct}%`, zIndex: 1, width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(201,168,76,0.7)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
          ))}

          {steps.map((s) => (
            <motion.div key={s.num}
              initial={{ opacity: 0, y: 56, x: s.fromX }}
              whileInView={{ opacity: 1, y: 0, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.72, delay: s.delay, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              whileHover={{ y: -10, boxShadow: '0 32px 64px rgba(61,12,17,0.14),0 0 0 1.5px rgba(201,168,76,0.4)' } as any}
              style={{
                background: '#fff', border: '1.5px solid rgba(61,12,17,0.08)', borderRadius: 8,
                padding: '0 0 34px', textAlign: 'center', position: 'relative', zIndex: 1,
                boxShadow: '0 6px 28px rgba(61,12,17,0.07)',
                transition: 'all 0.38s cubic-bezier(0.22,1,0.36,1)', overflow: 'hidden'
              }}>

              {/* Top accent band */}
              <div style={{ height: 5, background: 'linear-gradient(90deg,#3d0c11,#c9a84c,#3d0c11)', marginBottom: 36 }} />

              {/* Step tag */}
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '2.5px', color: '#c9a84c', marginBottom: 18, opacity: 0.85 }}>{s.tag}</div>

              {/* Icon circle */}
              <div style={{ position: 'relative', width: 88, height: 88, margin: '0 auto 22px' }}>
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid rgba(201,168,76,0.2)', animation: 'pulseSlow 3s ease-in-out infinite' }} />
                <div style={{
                  position: 'absolute', inset: 6, borderRadius: '50%',
                  background: '#3d0c11', border: '2px solid rgba(201,168,76,0.5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(61,12,17,0.3),inset 0 1px 0 rgba(201,168,76,0.15)'
                }}>
                  <StepIcon type={s.icon} />
                </div>
              </div>

              {/* Large step number watermark */}
              <div style={{
                position: 'absolute', top: 44, right: 22,
                fontFamily: "'Playfair Display',serif", fontSize: 72, fontWeight: 700,
                color: 'rgba(61,12,17,0.04)', lineHeight: 1, userSelect: 'none', pointerEvents: 'none'
              }}>{s.num}</div>

              <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 21, fontWeight: 700, color: '#2a0a0e', marginBottom: 12, lineHeight: 1.2, padding: '0 28px' }}>{s.title}</h3>
              <p style={{ fontSize: 13.5, color: '#7a5555', lineHeight: 1.76, padding: '0 28px', margin: 0 }}>{s.desc}</p>

              {/* Bottom gold shimmer */}
              <div style={{ position: 'absolute', bottom: 0, left: '20%', right: '20%', height: 2, background: 'linear-gradient(90deg,transparent,rgba(201,168,76,0.6),transparent)', borderRadius: 2 }} />

              {/* Corner brackets */}
              <div style={{ position: 'absolute', top: 12, left: 12, width: 14, height: 14, borderTop: '1.5px solid rgba(201,168,76,0.4)', borderLeft: '1.5px solid rgba(201,168,76,0.4)' }} />
              <div style={{ position: 'absolute', top: 12, right: 12, width: 14, height: 14, borderTop: '1.5px solid rgba(201,168,76,0.4)', borderRight: '1.5px solid rgba(201,168,76,0.4)' }} />
            </motion.div>
          ))}
        </div>

        {/* CTA strip */}
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.65, delay: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
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
        @media (max-width: 768px) {
          .hiw-grid { grid-template-columns: 1fr !important; }
          .hiw-path, .hiw-arrow { display: none !important; }
        }
      `}</style>
    </section>
  );
}
