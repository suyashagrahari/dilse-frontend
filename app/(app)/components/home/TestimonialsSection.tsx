"use client";

import { motion } from "framer-motion";
import { CELEBRATION_STORIES } from "./data";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.13 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

function StoryCard({ r }: { r: typeof CELEBRATION_STORIES[number] }) {
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
        {/* Occasion + example label */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexShrink: 0 }}>
          <span style={{ fontSize: 9, color: '#c9a84c', fontWeight: 700, letterSpacing: '0.05em', background: 'rgba(201,168,76,0.1)', padding: '3px 9px', borderRadius: 6, border: '1px solid rgba(201,168,76,0.28)', whiteSpace: 'nowrap' }}>
            {r.tag}
          </span>
          <span style={{ fontSize: 9, color: '#9a7070', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Example</span>
        </div>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: '#1a0507', lineHeight: 1.3, marginBottom: 8 }}>{r.title}</div>
        <p style={{ fontSize: 13, color: '#6b4545', lineHeight: 1.72, marginBottom: 14, flex: 1, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' as const }}>
          {r.story}
        </p>
        {/* Gold divider */}
        <div style={{ height: 1, background: 'linear-gradient(90deg,rgba(201,168,76,0.4),rgba(61,12,17,0.06))', marginBottom: 12, flexShrink: 0 }} />
        {/* Where it travelled */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9.5" /><path d="M2.5 12h19M12 2.5c2.6 2.8 3.9 6 3.9 9.5s-1.3 6.7-3.9 9.5c-2.6-2.8-3.9-6-3.9-9.5s1.3-6.7 3.9-9.5z" /></svg>
          <span style={{ fontSize: 11, color: '#7a5050', fontWeight: 600, letterSpacing: '0.02em' }}>{r.places}</span>
        </div>
      </div>
    </div>
  );
}

export default function TestimonialsSection() {
  const all = CELEBRATION_STORIES;
  const row = [...all, ...all];

  return (
    <section style={{ background: '#f5ede6', padding: '110px 0 48px', position: 'relative', overflow: 'hidden' }}>
      {/* Radial glows */}
      {[{ top: '5%', left: '3%' }, { bottom: '10%', left: '40%' }].map((pos, i) => (
        <div key={i} style={{ position: 'absolute', ...pos as object, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle,rgba(201,168,76,0.06),transparent 70%)', pointerEvents: 'none' }} />
      ))}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,transparent,#c9a84c 25%,#c9a84c 75%,transparent)' }} />

      {/* Header */}
      <div className="test-header" style={{ maxWidth: 900, margin: '0 auto', padding: '0 44px', textAlign: 'center', marginBottom: 56, position: 'relative', zIndex: 1 }}>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger}>
          <motion.span variants={fadeUp} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 20px', borderRadius: 24, border: '1px solid rgba(61,12,17,0.2)', color: '#3d0c11', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', background: 'rgba(61,12,17,0.06)', marginBottom: 20 }}>
            <svg width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3" fill="#c9a84c" /></svg>
            Trusted Around the World
            <svg width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3" fill="#c9a84c" /></svg>
          </motion.span>
          <motion.h2 variants={fadeUp} style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(30px,4.5vw,54px)', fontWeight: 700, color: '#1a0507', letterSpacing: '-1.5px', marginBottom: 16, lineHeight: 1.1 }}>
            Loved by families celebrating<br />
            <em style={{ color: '#c9a84c', fontStyle: 'italic' }}>every special moment</em>
          </motion.h2>
          <motion.p variants={fadeUp} style={{ color: '#7a5050', fontSize: 15, lineHeight: 1.8, maxWidth: 520, margin: '0 auto 32px' }}>
            Families around the world use SubhSandesh to celebrate weddings, birthdays, festivals and every milestone — one link that reaches loved ones in any country.
          </motion.p>

          {/* Occasions strip */}
          <motion.div className="test-occasions" variants={fadeUp} style={{ display: 'inline-flex', alignItems: 'center', gap: 0, background: '#fff', borderRadius: 16, border: '1px solid rgba(61,12,17,0.09)', boxShadow: '0 2px 16px rgba(61,12,17,0.07)', overflow: 'hidden', marginBottom: 8, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 680 }}>
            {['Weddings', 'Birthdays', 'Anniversaries', 'Festivals', 'Holi', 'Eid', 'Diwali', 'Baby Showers', 'Christmas', 'Graduations'].map((occ, i, arr) => (
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

        <div style={{ overflowX: 'hidden', overflowY: 'visible', padding: '10px 0' }}>
          <div className="test-marquee" style={{ display: 'flex', animation: 'marquee 64s linear infinite', width: 'max-content' }}>
            {row.map((r, i) => <StoryCard key={i} r={r} />)}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 1, background: 'rgba(61,12,17,0.15)' }} />
          <span className="test-hint-desktop" style={{ fontSize: 10.5, color: 'rgba(61,12,17,0.35)', letterSpacing: '0.12em', fontWeight: 600 }}>HOVER TO PAUSE · HOW FAMILIES CELEBRATE AROUND THE WORLD</span>
          <span className="test-hint-mobile" style={{ display: 'none', fontSize: 10.5, color: 'rgba(61,12,17,0.35)', letterSpacing: '0.12em', fontWeight: 600 }}>CELEBRATING AROUND THE WORLD</span>
          <div style={{ width: 28, height: 1, background: 'rgba(61,12,17,0.15)' }} />
        </div>
      </motion.div>

      {/* Stats bar */}
      <motion.div className="test-stats" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.7, delay: 0.2 }}
        style={{ maxWidth: 800, margin: '52px auto 0', padding: '0 44px', display: 'flex', position: 'relative', zIndex: 1, background: '#fff', border: '1px solid rgba(201,168,76,0.28)', borderRadius: 20, boxShadow: '0 4px 28px rgba(61,12,17,0.08)' }}>
        {[{ num: '50,000+', label: 'Happy Families' }, { num: '🌍', label: 'Shared Worldwide' }, { num: '4.9★', label: 'Avg. Rating' }, { num: '12+', label: 'Occasions' }].map((s, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center', padding: '22px 12px', borderRight: i < 3 ? '1px solid rgba(61,12,17,0.07)' : 'none' }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(18px,2.5vw,26px)', fontWeight: 700, color: '#3d0c11', lineHeight: 1, marginBottom: 6 }}>{s.num}</div>
            <div style={{ fontSize: 11, color: '#9a7070', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </motion.div>

      <style>{`
        .test-marquee:hover { animation-play-state: paused; }
      `}</style>
    </section>
  );
}
