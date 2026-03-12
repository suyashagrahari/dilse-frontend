"use client";

import { motion } from "framer-motion";
import { REVIEWS_ROW1, REVIEWS_ROW2 } from "./data";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.13 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

function RevCard({ r }: { r: typeof REVIEWS_ROW1[0] }) {
  const initials = r.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className="rev-card" style={{ flexShrink: 0, width: 300, marginRight: 20 }}>
      <div style={{
        background: '#fff', border: '1px solid rgba(61,12,17,0.09)', borderRadius: 20,
        padding: '22px 20px', boxShadow: '0 2px 12px rgba(61,12,17,0.06)',
        transition: 'border-color 0.3s,box-shadow 0.3s,transform 0.3s',
        position: 'relative', overflow: 'hidden', minHeight: 248, boxSizing: 'border-box' as const,
        display: 'flex', flexDirection: 'column' as const,
      }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,168,76,0.45)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 40px rgba(61,12,17,0.14)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(61,12,17,0.09)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(61,12,17,0.06)'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}>
        {/* Gold top accent */}
        <div style={{ position: 'absolute', top: 0, left: 20, right: 20, height: 2, background: 'linear-gradient(90deg,transparent,#c9a84c60,transparent)', borderRadius: '0 0 2px 2px' }} />

        {/* Stars + tag */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 2 }}>
            {[1, 2, 3, 4, 5].map(i => (
              <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill="#c9a84c">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
          <span style={{ fontSize: 9, color: '#c9a84c', fontWeight: 700, letterSpacing: '0.05em', background: 'rgba(201,168,76,0.1)', padding: '3px 9px', borderRadius: 6, border: '1px solid rgba(201,168,76,0.28)', whiteSpace: 'nowrap' }}>
            {r.tag}
          </span>
        </div>

        {/* Quote */}
        <p style={{ fontSize: 13, color: '#6b4545', lineHeight: 1.72, marginBottom: 14, fontStyle: 'italic', flex: 1, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' as const }}>
          &ldquo;{r.review}&rdquo;
        </p>

        {/* Gold divider */}
        <div style={{ height: 1, background: 'linear-gradient(90deg,rgba(201,168,76,0.4),rgba(61,12,17,0.06))', marginBottom: 14, flexShrink: 0 }} />

        {/* Reviewer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#3d0c11', border: '2px solid rgba(201,168,76,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: '#c9a84c', letterSpacing: '0.02em' }}>{initials}</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1a0507', fontFamily: "'Playfair Display',serif", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#9a7070" strokeWidth="2.5" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
              <span style={{ fontSize: 10, color: '#9a7070', fontWeight: 500 }}>{r.city}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TestimonialsSection() {
  const row1 = [...REVIEWS_ROW1, ...REVIEWS_ROW1];
  const row2 = [...REVIEWS_ROW2, ...REVIEWS_ROW2];

  return (
    <section style={{ background: '#f5ede6', padding: '110px 0 120px', position: 'relative', overflow: 'hidden' }}>
      {/* Radial glows */}
      {[{ top: '5%', left: '3%' }, { bottom: '10%', left: '40%' }].map((pos, i) => (
        <div key={i} style={{ position: 'absolute', ...pos as object, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle,rgba(201,168,76,0.06),transparent 70%)', pointerEvents: 'none' }} />
      ))}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,transparent,#c9a84c 25%,#c9a84c 75%,transparent)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg,#c9a84c,#a8823a 50%,#c9a84c)' }} />

      {/* Header */}
      <div className="test-header" style={{ maxWidth: 900, margin: '0 auto', padding: '0 44px', textAlign: 'center', marginBottom: 56, position: 'relative', zIndex: 1 }}>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger}>
          <motion.span variants={fadeUp} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 20px', borderRadius: 24, border: '1px solid rgba(61,12,17,0.2)', color: '#3d0c11', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', background: 'rgba(61,12,17,0.06)', marginBottom: 20 }}>
            <svg width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3" fill="#c9a84c" /></svg>
            Trusted Across India
            <svg width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3" fill="#c9a84c" /></svg>
          </motion.span>
          <motion.h2 variants={fadeUp} style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(30px,4.5vw,54px)', fontWeight: 700, color: '#1a0507', letterSpacing: '-1.5px', marginBottom: 16, lineHeight: 1.1 }}>
            Loved by families celebrating<br />
            <em style={{ color: '#c9a84c', fontStyle: 'italic' }}>every special moment</em>
          </motion.h2>
          <motion.p variants={fadeUp} style={{ color: '#7a5050', fontSize: 15, lineHeight: 1.8, maxWidth: 520, margin: '0 auto 32px' }}>
            SubhSandesh brings joy to every Indian home — celebrating weddings, birthdays, festivals, and every special milestone with love.
          </motion.p>

          {/* Occasions strip */}
          <motion.div className="test-occasions" variants={fadeUp} style={{ display: 'inline-flex', alignItems: 'center', gap: 0, background: '#fff', borderRadius: 16, border: '1px solid rgba(61,12,17,0.09)', boxShadow: '0 2px 16px rgba(61,12,17,0.07)', overflow: 'hidden', marginBottom: 8, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 680 }}>
            {['Weddings', 'Birthdays', 'Anniversaries', 'Festivals', 'Holi', 'Eid', 'Diwali', 'Baby Showers', 'Christmas', 'Lohri'].map((occ, i, arr) => (
              <div key={occ} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRight: i < arr.length - 1 ? '1px solid rgba(61,12,17,0.06)' : 'none' }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#c9a84c', flexShrink: 0 }} />
                <span style={{ fontSize: 10, color: '#5a3535', fontWeight: 600, letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{occ}</span>
              </div>
            ))}
          </motion.div>
          <motion.div variants={fadeUp} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 24 }}>
            <div style={{ width: 64, height: 1, background: 'linear-gradient(90deg,transparent,rgba(61,12,17,0.2))' }} />
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#c9a84c"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17 5.8 21.3l2.4-7.4L2 9.4h7.6z" /></svg>
            <div style={{ width: 64, height: 1, background: 'linear-gradient(90deg,rgba(61,12,17,0.2),transparent)' }} />
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll rows */}
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.8 }}
        style={{ position: 'relative', zIndex: 1 }}>
        <div className="test-fade-l" style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 120, background: 'linear-gradient(90deg,#f5ede6,transparent)', zIndex: 10, pointerEvents: 'none' }} />
        <div className="test-fade-r" style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: 120, background: 'linear-gradient(270deg,#f5ede6,transparent)', zIndex: 10, pointerEvents: 'none' }} />

        <div style={{ overflowX: 'hidden', overflowY: 'visible', marginBottom: 16, padding: '8px 0' }}>
          <div style={{ display: 'flex', animation: 'marquee 38s linear infinite', width: 'max-content' }}>
            {row1.map((r, i) => <RevCard key={i} r={r} />)}
          </div>
        </div>
        <div style={{ overflowX: 'hidden', overflowY: 'visible', padding: '8px 0' }}>
          <div style={{ display: 'flex', animation: 'marquee 44s linear infinite reverse', width: 'max-content' }}>
            {row2.map((r, i) => <RevCard key={i} r={r} />)}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 1, background: 'rgba(61,12,17,0.15)' }} />
          <span className="test-hint-desktop" style={{ fontSize: 10.5, color: 'rgba(61,12,17,0.35)', letterSpacing: '0.12em', fontWeight: 600 }}>HOVER TO PAUSE · 12+ LANGUAGES · 28 STATES</span>
          <span className="test-hint-mobile" style={{ display: 'none', fontSize: 10.5, color: 'rgba(61,12,17,0.35)', letterSpacing: '0.12em', fontWeight: 600 }}>12+ LANGUAGES · 28 STATES</span>
          <div style={{ width: 28, height: 1, background: 'rgba(61,12,17,0.15)' }} />
        </div>
      </motion.div>

      {/* Stats bar */}
      <motion.div className="test-stats" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.7, delay: 0.2 }}
        style={{ maxWidth: 800, margin: '52px auto 0', padding: '0 44px', display: 'flex', position: 'relative', zIndex: 1, background: '#fff', border: '1px solid rgba(201,168,76,0.28)', borderRadius: 20, boxShadow: '0 4px 28px rgba(61,12,17,0.08)' }}>
        {[{ num: '50,000+', label: 'Happy Families' }, { num: '28', label: 'States Covered' }, { num: '4.9★', label: 'Avg. Rating' }, { num: '12+', label: 'Occasions' }].map((s, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center', padding: '22px 12px', borderRight: i < 3 ? '1px solid rgba(61,12,17,0.07)' : 'none' }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(18px,2.5vw,26px)', fontWeight: 700, color: '#3d0c11', lineHeight: 1, marginBottom: 6 }}>{s.num}</div>
            <div style={{ fontSize: 11, color: '#9a7070', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
