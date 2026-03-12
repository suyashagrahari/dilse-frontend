"use client";

import { motion } from "framer-motion";
import { WHY_LOVE_FEATURES } from "./data";
import { getMandalaLineEndpoint, MANDALA_ANGLES } from "./mandala";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.13 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};
const cardIn = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

const GOLD_F = 'brightness(0) saturate(100%) invert(72%) sepia(52%) saturate(700%) hue-rotate(2deg) brightness(96%) contrast(110%)';

const WL_ICONS = [
  // Heart
  <><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></>,
  // Smile
  <><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.8"/><path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none"/><line x1="9" y1="9" x2="9.01" y2="9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/><line x1="15" y1="9" x2="15.01" y2="9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></>,
  // Globe
  <><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" fill="none" stroke="currentColor" strokeWidth="1.8"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></>,
  // Chat bubble
  <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></>,
  // Lock
  <><rect x="3" y="11" width="18" height="11" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8"/><path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none"/></>,
  // Activity / pulse
  <><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/></>,
];

const OCCASIONS_MQ = ["💝 Valentine's Day","🌹 Rose Day","💍 Propose Day","🍫 Chocolate Day","🧸 Teddy Day","🤞 Promise Day","🤗 Hug Day","😘 Kiss Day","🎂 Birthday","💑 Anniversary","💌 Miss You","🌸 Get Well Soon","🙏 Thank You","🎉 New Year","👩 Mother's Day","👨 Father's Day","🤝 Friendship Day","💞 Engagement","👶 Baby Shower","🎓 Graduation","🏠 Housewarming","💼 Farewell"];
const COUNTRIES = ["🇮🇳 India","🇺🇸 USA","🇬🇧 United Kingdom","🇦🇪 UAE","🇨🇦 Canada","🇦🇺 Australia","🇸🇬 Singapore","🇩🇪 Germany","🇶🇦 Qatar","🇿🇦 South Africa","🇲🇾 Malaysia","🇫🇷 France","🇳🇿 New Zealand","🇯🇵 Japan","🇰🇼 Kuwait","🇧🇭 Bahrain","🇮🇱 Israel","🇳🇱 Netherlands","🇸🇪 Sweden","🇮🇹 Italy","🇴🇲 Oman","🇨🇭 Switzerland","🇧🇪 Belgium","🇦🇹 Austria"];

export default function WhyLoveSection() {
  const occ2 = [...OCCASIONS_MQ, ...OCCASIONS_MQ];
  const ctry2 = [...COUNTRIES, ...COUNTRIES];

  return (
    <section style={{ background: '#faf3ee', padding: '110px 0 120px', position: 'relative', overflow: 'hidden' }}>
      {/* Gold lines */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,transparent,#c9a84c 25%,#c9a84c 75%,transparent)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg,#c9a84c,#a8823a 50%,#c9a84c)' }} />

      {/* Central mandala watermark */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 540, height: 540, opacity: 0.04, pointerEvents: 'none', zIndex: 0 }}>
        <svg viewBox="0 0 200 200" fill="none" width="100%" height="100%">
          {[96, 78, 60, 44, 28].map(r => <circle key={r} cx="100" cy="100" r={r} stroke="#3d0c11" strokeWidth="0.5" />)}
          {MANDALA_ANGLES.map(a => {
            const endpoint = getMandalaLineEndpoint(a, 96);
            return <line key={a} x1="100" y1="100" x2={endpoint.x2} y2={endpoint.y2} stroke="#3d0c11" strokeWidth="0.3" />;
          })}
          {[0, 45, 90, 135].map(a => <ellipse key={a} cx="100" cy="100" rx="96" ry="24" stroke="#3d0c11" strokeWidth="0.28" transform={`rotate(${a} 100 100)`} />)}
        </svg>
      </div>

      {/* Scattered rings */}
      {[{ top: '7%', left: '14%', s: 52 }, { top: '18%', right: '13%', s: 40 }, { bottom: '18%', left: '10%', s: 46 }, { bottom: '12%', right: '11%', s: 36 }, { top: '46%', left: '3%', s: 30 }, { top: '42%', right: '4%', s: 34 }].map((d, i) => {
        const { s, ...pos } = d;
        return <div key={i} style={{ position: 'absolute', ...(pos as object), width: s, height: s, borderRadius: '50%', border: '1px solid rgba(61,12,17,0.08)', background: 'radial-gradient(circle,rgba(61,12,17,0.025),transparent)', pointerEvents: 'none', zIndex: 0 }} />;
      })}

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div className="wl-header-wrap" style={{ maxWidth: 880, margin: '0 auto', padding: '0 44px', textAlign: 'center', marginBottom: 52 }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger}>
            <motion.span variants={fadeUp} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 20px', borderRadius: 24, border: '1px solid rgba(61,12,17,0.2)', color: '#3d0c11', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', background: 'rgba(61,12,17,0.06)', marginBottom: 22 }}>
              <svg width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3" fill="#c9a84c" /></svg>
              Why the World Loves Us
              <svg width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3" fill="#c9a84c" /></svg>
            </motion.span>
            <motion.h2 variants={fadeUp} style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(30px,4.5vw,56px)', fontWeight: 700, color: '#1a0507', letterSpacing: '-1.5px', marginBottom: 16, lineHeight: 1.1 }}>
              Every emotion. Every occasion.<br /><em style={{ color: '#c9a84c', fontStyle: 'italic' }}>Every corner of the world.</em>
            </motion.h2>
            <motion.p variants={fadeUp} style={{ fontSize: 15.5, color: '#7a5050', lineHeight: 1.82, maxWidth: 600, margin: '0 auto 14px' }}>
              From Rose Day to birthdays, anniversaries to "Miss You" — SubhSandesh turns every feeling into a beautiful page that travels across the world in seconds.
            </motion.p>
            <motion.p variants={fadeUp} style={{ fontSize: 11, color: 'rgba(61,12,17,0.4)', letterSpacing: '0.18em', fontWeight: 700, textTransform: 'uppercase' }}>
              Mumbai · Manhattan · Dubai · London · Sydney · Toronto · Singapore
            </motion.p>
            <motion.div variants={fadeUp} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 20 }}>
              <div style={{ width: 64, height: 1, background: 'linear-gradient(90deg,transparent,rgba(61,12,17,0.2))' }} />
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#c9a84c"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17 5.8 21.3l2.4-7.4L2 9.4h7.6z" /></svg>
              <div style={{ width: 64, height: 1, background: 'linear-gradient(90deg,rgba(61,12,17,0.2),transparent)' }} />
            </motion.div>
          </motion.div>
        </div>

        {/* Marquee Row 1 — Occasions */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.9 }} style={{ position: 'relative', marginBottom: 0 }}>
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 120, background: 'linear-gradient(90deg,#faf3ee,transparent)', zIndex: 10, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: 120, background: 'linear-gradient(270deg,#faf3ee,transparent)', zIndex: 10, pointerEvents: 'none' }} />
          <div style={{ overflow: 'hidden', padding: '9px 0', borderTop: '1px solid rgba(61,12,17,0.07)', borderBottom: '1px solid rgba(61,12,17,0.05)', background: 'rgba(61,12,17,0.02)' }}>
            <div style={{ display: 'flex', animation: 'marquee 40s linear infinite', width: 'max-content' }}>
              {occ2.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0, marginRight: 14 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(61,12,17,0.6)', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>{s}</span>
                  <svg width="4" height="4" viewBox="0 0 4 4"><circle cx="2" cy="2" r="1.8" fill="#c9a84c" opacity="0.55" /></svg>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Marquee Row 2 — Countries (reverse, gold) */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.9, delay: 0.1 }} style={{ position: 'relative', marginBottom: 52 }}>
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 120, background: 'linear-gradient(90deg,#faf3ee,transparent)', zIndex: 10, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: 120, background: 'linear-gradient(270deg,#faf3ee,transparent)', zIndex: 10, pointerEvents: 'none' }} />
          <div style={{ overflow: 'hidden', padding: '9px 0', borderBottom: '1px solid rgba(61,12,17,0.07)', background: 'rgba(201,168,76,0.04)' }}>
            <div style={{ display: 'flex', animation: 'marquee 46s linear infinite reverse', width: 'max-content' }}>
              {ctry2.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0, marginRight: 14 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(139,100,20,0.75)', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{s}</span>
                  <svg width="4" height="4" viewBox="0 0 4 4"><circle cx="2" cy="2" r="1.8" fill="rgba(61,12,17,0.28)" /></svg>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Feature Cards */}
        <div className="wl-feat-outer" style={{ maxWidth: 1180, margin: '0 auto', padding: '0 44px' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={stagger}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, marginBottom: 52 }}
            className="wl-feat-grid">
            {WHY_LOVE_FEATURES.map((f, i) => (
              <motion.div key={f.title} variants={cardIn}>
                <div style={{
                  background: '#fff', border: '1.5px solid rgba(61,12,17,0.08)', borderRadius: 20,
                  padding: '32px 22px 26px', position: 'relative', overflow: 'hidden',
                  boxShadow: '0 2px 16px rgba(61,12,17,0.05)',
                  transition: 'border-color 0.35s,box-shadow 0.35s,transform 0.35s', cursor: 'default',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,168,76,0.6)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 18px 52px rgba(61,12,17,0.14)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-7px)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(61,12,17,0.08)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 16px rgba(61,12,17,0.05)'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,transparent,rgba(201,168,76,0.55),transparent)' }} />
                  <div style={{ position: 'absolute', bottom: 6, right: 10, fontSize: 80, fontWeight: 900, color: 'rgba(61,12,17,0.04)', fontFamily: "'Playfair Display',serif", lineHeight: 1, pointerEvents: 'none', userSelect: 'none' }}>
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="alekhancorner2.svg" aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0, width: 36, height: 36, opacity: 0.16, filter: GOLD_F, pointerEvents: 'none' }} alt="" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="alekhancorner2.svg" aria-hidden="true" style={{ position: 'absolute', top: 0, right: 0, width: 36, height: 36, opacity: 0.16, transform: 'scaleX(-1)', filter: GOLD_F, pointerEvents: 'none' }} alt="" />
                  <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'rgba(61,12,17,0.05)', border: '1.5px solid rgba(201,168,76,0.38)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, color: '#3d0c11', boxShadow: '0 0 18px rgba(201,168,76,0.1)', position: 'relative', zIndex: 1 }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">{WL_ICONS[i]}</svg>
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1a0507', marginBottom: 8, fontFamily: "'Playfair Display',serif", lineHeight: 1.3, position: 'relative', zIndex: 1 }}>{f.title}</h3>
                  <p style={{ fontSize: 12.5, color: '#7a5050', lineHeight: 1.76, margin: 0, position: 'relative', zIndex: 1 }}>{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* World Stats Bar */}
          <motion.div className="wl-stats" initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.72, delay: 0.18 }}
            style={{ background: '#fff', border: '1.5px solid rgba(201,168,76,0.3)', borderRadius: 20, padding: '24px 36px', boxShadow: '0 4px 28px rgba(61,12,17,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, flexWrap: 'wrap', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,transparent,#c9a84c60,transparent)' }} />
            {[{ num: '50+', label: 'Countries' }, { num: '50K+', label: 'Pages Created' }, { num: '22+', label: 'Occasions' }, { num: '4.9★', label: 'World Rating' }].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                {i > 0 && <div className="wl-stat-div" style={{ width: 1, height: 42, background: 'rgba(61,12,17,0.08)', margin: '0 32px' }} />}
                <div className="wl-stat-item" style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(20px,2.4vw,28px)', fontWeight: 700, color: '#3d0c11', lineHeight: 1, marginBottom: 5 }}>{s.num}</div>
                  <div style={{ fontSize: 10.5, color: '#9a7070', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .wl-feat-grid { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .wl-feat-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
      `}</style>
    </section>
  );
}
