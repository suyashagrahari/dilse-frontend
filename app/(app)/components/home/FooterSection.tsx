"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { getMandalaLineEndpoint, MANDALA_ANGLES } from "./mandala";

const GOLD_F = 'brightness(0) saturate(100%) invert(72%) sepia(52%) saturate(700%) hue-rotate(2deg) brightness(96%) contrast(110%)';

const SOCIALS = [
  {
    label: 'Instagram',
    icon: <><rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="1.8" /><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.8" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" /></>,
  },
  {
    label: 'Twitter / X',
    icon: <><path d="M18.9 4H21l-7.5 8.6L22 20h-4.4l-5.1-6.7L6 20H3.9l8.1-9.3L3 4h4.4l4.7 6.2L18.9 4z" fill="currentColor" stroke="none" /></>,
  },
  {
    label: 'WhatsApp',
    icon: <><path d="M20.52 3.48A11.94 11.94 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.11.55 4.16 1.6 5.97L0 24l6.22-1.57A11.94 11.94 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.22-3.48-8.52z" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M8.5 8.5c.5 1.5 1.5 2.8 2.5 3.8s2.3 2 3.8 2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></>,
  },
  {
    label: 'Facebook',
    icon: <><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></>,
  },
  {
    label: 'YouTube',
    icon: <><rect x="2" y="6" width="20" height="13" rx="3" fill="none" stroke="currentColor" strokeWidth="1.8" /><polygon points="10,10 16,12.5 10,15" fill="currentColor" /></>,
  },
];

const COLS = [
  {
    title: "OCCASIONS",
    links: [
      { label: "Birthday Pages", href: "/templates" },
      { label: "Wedding Shaadi", href: "/templates" },
      { label: "Holi Festival", href: "/templates" },
      { label: "Eid Mubarak", href: "/templates" },
      { label: "Reception Night", href: "/templates" },
      { label: "Valentine's Day", href: "/templates" },
      { label: "Anniversary", href: "/templates" },
    ],
  },
  {
    title: "PLATFORM",
    links: [
      { label: "How It Works", href: "/templates" },
      { label: "Templates", href: "/templates" },
      { label: "AI Generator", href: "/templates" },
      { label: "Password Guard", href: "/templates" },
      { label: "Blessings Wall", href: "/templates" },
      { label: "Sharing", href: "/templates" },
    ],
  },
  {
    title: "COMPANY",
    links: [
      { label: "About Us", href: "/about-us" },
      { label: "Contact Us", href: "/contact-us" },
      { label: "Help", href: "/help" },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms of Service", href: "/terms-of-service" },
    ],
  },
];

const sparks = [
  { top: '15%', left: '6%' }, { top: '35%', right: '5%' }, { bottom: '25%', left: '3%' },
  { top: '60%', right: '8%' }, { bottom: '12%', right: '22%' }, { top: '80%', left: '18%' },
];

export default function FooterSection() {
  return (
    <footer className="footer-section" style={{ background: 'linear-gradient(180deg,#faf3ee 0%,#f5ede6 50%,#f0e4d4 100%)', position: 'relative' }}>
      {/* Gold top line */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,transparent,#c9a84c 25%,#c9a84c 75%,transparent)' }} />

      {/* Mandala watermark */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 640, height: 640, opacity: 0.04, pointerEvents: 'none', zIndex: 0 }}>
        <svg viewBox="0 0 200 200" fill="none" width="100%" height="100%">
          {[96, 78, 62, 46, 32, 18].map(r => <circle key={r} cx="100" cy="100" r={r} stroke="#3d0c11" strokeWidth="0.4" />)}
          {MANDALA_ANGLES.map(a => {
            const endpoint = getMandalaLineEndpoint(a, 96);
            return <line key={a} x1="100" y1="100" x2={endpoint.x2} y2={endpoint.y2} stroke="#3d0c11" strokeWidth="0.3" />;
          })}
          {[0, 45, 90, 135].map(a => <ellipse key={a} cx="100" cy="100" rx="96" ry="22" stroke="#3d0c11" strokeWidth="0.25" transform={`rotate(${a} 100 100)`} />)}
        </svg>
      </div>

      {/* Spinning akehan accents */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="akehan3.svg" aria-hidden="true" alt="" style={{ position: 'absolute', top: '10%', left: '26%', width: 56, opacity: 0.07, zIndex: 0, pointerEvents: 'none', animation: 'spinSlow 30s linear infinite' }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="akehan3.svg" aria-hidden="true" alt="" style={{ position: 'absolute', bottom: '18%', right: '24%', width: 44, opacity: 0.07, zIndex: 0, pointerEvents: 'none', animation: 'spinSlow 24s linear infinite reverse' }} />

      {/* Floating gold sparks */}
      {sparks.map((pos, i) => (
        <div key={i} style={{ position: 'absolute', ...(pos as object), pointerEvents: 'none', zIndex: 0 }}>
          <motion.div animate={{ y: [-5, 5, -5], opacity: [0.18, 0.45, 0.18] }} transition={{ repeat: Infinity, duration: 3 + (i * 0.5), ease: 'easeInOut', delay: i * 0.4 }}>
            <svg width="8" height="8" viewBox="0 0 24 24" fill="#c9a84c"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17 5.8 21.3l2.4-7.4L2 9.4h7.6z" /></svg>
          </motion.div>
        </div>
      ))}

      {/* Main content */}
      <div className="footer-main-inner" style={{ width: '100%', maxWidth: 1220, margin: '0 auto', padding: '88px 44px 44px', position: 'relative', zIndex: 2 }}>

        {/* Top grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 48, marginBottom: 56 }} className="footer-grid footer-grid-main">

          {/* Brand column */}
          <motion.div className="footer-brand" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <div className="footer-brand-head" style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, overflow: 'hidden', border: '1.5px solid rgba(201,168,76,0.4)', boxShadow: '0 0 18px rgba(201,168,76,0.15)', flexShrink: 0 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://cdn.subhsandesh.in/gifts-media/indianFestival/logo.webp" alt="SubhSandesh" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <div className="footer-brand-text">
                <div className="footer-brand-title" style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: '#1a0507', letterSpacing: '-0.3px', lineHeight: 1 }}>SubhSandesh</div>
                <div className="footer-brand-subtitle" style={{ fontSize: 11, color: 'rgba(201,168,76,0.8)', letterSpacing: '0.12em', fontWeight: 700 }}>DIGITAL CELEBRATIONS</div>
              </div>
            </div>
            <div style={{ fontFamily: 'serif', fontSize: 18, color: '#c9a84c', marginBottom: 14, fontStyle: 'italic', letterSpacing: '0.04em' }}>
              शुभ संदेश 🪔
            </div>
            <p className="footer-brand-copy" style={{ fontSize: 13.5, color: 'rgba(61,12,17,0.52)', lineHeight: 1.85, maxWidth: 268, marginBottom: 24 }}>
              Turn your heartfelt wishes into beautiful digital celebration pages — shared with love around the world.
            </p>
            <div className="footer-social-row" style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
              {SOCIALS.map(s => (
                <a key={s.label} href="#" title={s.label} style={{
                  width: 36, height: 36, borderRadius: '50%', border: '1px solid rgba(61,12,17,0.14)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'rgba(61,12,17,0.4)', textDecoration: 'none',
                  background: 'rgba(61,12,17,0.03)', transition: 'all 0.25s',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#c9a84c'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,168,76,0.5)'; (e.currentTarget as HTMLElement).style.background = 'rgba(201,168,76,0.08)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(61,12,17,0.4)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(61,12,17,0.14)'; (e.currentTarget as HTMLElement).style.background = 'rgba(61,12,17,0.03)'; }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">{s.icon}</svg>
                </a>
              ))}
            </div>
            <div className="footer-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, border: '1px solid rgba(61,12,17,0.12)', borderRadius: 30, padding: '9px 18px', background: 'rgba(61,12,17,0.03)' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
              <span style={{ fontSize: 11, color: 'rgba(61,12,17,0.5)', fontWeight: 600, letterSpacing: '0.04em' }}>Privacy Protected · 50K+ Families</span>
            </div>
          </motion.div>

          {/* Link columns */}
          {COLS.map((col, ci) => (
            <motion.div
              key={col.title}
              className={`footer-col footer-col-${col.title.toLowerCase().replace(/\s+/g, "-")}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 + ci * 0.08 }}
            >
              <div className="footer-col-title" style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '2.5px', color: 'rgba(201,168,76,0.9)', marginBottom: 22, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 14, height: 1, background: 'rgba(201,168,76,0.5)' }} />
                {col.title}
              </div>
              {col.links.map((l) => (
                <div key={l.label} style={{ marginBottom: 10 }}>
                  <Link href={l.href} style={{ fontSize: 13, color: 'rgba(61,12,17,0.45)', textDecoration: 'none', transition: 'color 0.2s', display: 'block', lineHeight: 1.6 }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#c9a84c'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(61,12,17,0.45)'}>
                    {l.label}
                  </Link>
                </div>
              ))}
            </motion.div>
          ))}
        </div>

        <div className="footer-company-tabs">
          {COLS[2].links.map((item) => (
            <Link key={item.label} href={item.href} className="footer-company-tab">
              {item.label}
            </Link>
          ))}
        </div>

        {/* Divider */}
        <div style={{ position: 'relative', margin: '0 0 32px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,transparent,rgba(61,12,17,0.12))' }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="akehan3.svg" aria-hidden="true" alt="" style={{ width: 22, height: 22, opacity: 0.25, filter: GOLD_F }} />
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,rgba(61,12,17,0.12),transparent)' }} />
        </div>

        {/* Stats strip */}
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.65, delay: 0.2 }}
          style={{ display: 'flex', justifyContent: 'center', gap: 0, flexWrap: 'wrap', marginBottom: 32 }}>
          {[{ n: '50K+', l: 'Pages Created' }, { n: '50+', l: 'Countries' }, { n: '22+', l: 'Occasions' }, { n: '4.9★', l: 'Avg Rating' }, { n: '2 min', l: 'Setup Time' }].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
              {i > 0 && <div style={{ width: 1, height: 36, background: 'rgba(61,12,17,0.1)', margin: '0 28px' }} />}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(17px,2vw,22px)', fontWeight: 700, color: '#3d0c11', lineHeight: 1, marginBottom: 4 }}>{s.n}</div>
                <div style={{ fontSize: 10, color: 'rgba(61,12,17,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>{s.l}</div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Bottom bar */}
        <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,rgba(61,12,17,0.1),transparent)', marginBottom: 24 }} />
        <div className="footer-bottom-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <p style={{ fontSize: 12.5, color: 'rgba(61,12,17,0.38)', margin: 0 }}>© 2026 SubhSandesh</p>
            <div style={{ width: 1, height: 12, background: 'rgba(61,12,17,0.12)' }} />
            <p style={{ fontSize: 12, color: 'rgba(61,12,17,0.45)', fontStyle: 'italic', margin: 0 }}>Made with ❤️ in Bengaluru, for the world</p>
          </div>
         
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(201,168,76,0.7)', animation: 'pulseSlow 2s ease-in-out infinite' }} />
            <span style={{ fontSize: 11, color: 'rgba(61,12,17,0.4)', fontWeight: 600, letterSpacing: '0.06em' }}>The World&apos;s #1 Celebration Studio</span>
          </div>
        </div>
      </div>

      {/* Gold bottom bar */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg,#c9a84c,#a8823a 50%,#c9a84c)' }} />

      <style>{`
        .footer-company-tabs {
          display: none;
        }
        .footer-company-tab {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(61,12,17,0.14);
          background: rgba(61,12,17,0.03);
          color: rgba(61,12,17,0.56);
          border-radius: 999px;
          padding: 8px 14px;
          font-size: 12px;
          font-weight: 600;
          text-decoration: none;
          letter-spacing: 0.02em;
          transition: all 0.2s ease;
        }
        .footer-company-tab:hover {
          color: #c9a84c;
          border-color: rgba(201,168,76,0.42);
          background: rgba(201,168,76,0.08);
        }
        @media (max-width: 900px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 768px) {
          .footer-main-inner {
            max-width: none !important;
            width: 100% !important;
            padding-left: 16px !important;
            padding-right: 16px !important;
            padding-bottom: 230px !important;
          }
          .footer-grid-main {
            grid-template-columns: 1fr 1fr !important;
            gap: 24px !important;
            align-items: start !important;
          }
          .footer-brand {
            grid-column: 1 / -1 !important;
          }
          .footer-col-occasions {
            grid-column: 1 / 2 !important;
          }
          .footer-col-platform {
            grid-column: 2 / 3 !important;
          }
          .footer-col-company {
            display: none !important;
          }
          .footer-grid-main > div {
            text-align: center !important;
          }
          .footer-col-title {
            justify-content: center !important;
          }
          .footer-brand-text {
            text-align: left !important;
          }
          .footer-brand-title,
          .footer-brand-subtitle {
            text-align: left !important;
          }
          .footer-brand-copy {
            text-align: center !important;
            max-width: 100% !important;
            margin-left: auto !important;
            margin-right: auto !important;
          }
          .footer-brand-head {
            justify-content: center !important;
            width: 100% !important;
          }
          .footer-social-row {
            justify-content: center !important;
          }
          .footer-pill {
            justify-content: center !important;
            width: 100% !important;
          }
          .footer-company-tabs {
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px;
            margin: 0 0 24px;
          }
          .footer-company-tab {
            width: 100%;
            min-height: 38px;
          }
          .footer-bottom-row,
          .footer-bottom-links {
            justify-content: center !important;
          }
          .footer-bottom-row {
            margin-bottom: 76px !important;
          }
          .footer-bottom-links {
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 8px 10px !important;
            width: 100% !important;
            justify-items: center !important;
          }
          .footer-bottom-links a {
            white-space: nowrap !important;
            font-size: 11px !important;
          }
          .footer-bottom-row > div:first-child {
            width: 100% !important;
            justify-content: center !important;
          }
        }
        @media (max-width: 480px) {
          .footer-grid-main {
            grid-template-columns: 1fr 1fr !important;
            gap: 20px !important;
          }
          .footer-company-tabs {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
    </footer>
  );
}
