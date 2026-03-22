"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function MobileBottomNav() {
  const [active, setActive] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const activeColor = '#f2cf74';
  const mutedColor = 'rgba(245,222,177,0.90)';

  const isActive = (id: string) => active === id;
  const tabBg = (a: boolean) => a ? 'linear-gradient(180deg,rgba(214,174,84,0.24),rgba(214,174,84,0.08))' : 'transparent';
  const tabBorder = (a: boolean) => a ? '1px solid rgba(229,191,101,0.42)' : '1px solid transparent';

  return (
    <nav className="md:hidden" style={{ position: 'fixed', bottom: 14, left: 30, right: 30, zIndex: 200 }}>
      <div style={{
        height: 62, borderRadius: 24,
        background: 'linear-gradient(180deg,#2b070d 0%,#3a0812 56%,#22060b 100%)',
        border: '1px solid rgba(212,175,84,0.52)',
        boxShadow: '0 12px 24px rgba(0,0,0,0.42),inset 0 1px 0 rgba(255,228,160,0.28),inset 0 -1px 0 rgba(155,88,18,0.32)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-around',
        padding: '0 10px', overflow: 'visible',
      }}>

        {/* PAGES */}
        <button onClick={() => { setActive('pages'); router.push('/templates'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, flex: 1, height: '100%' }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: tabBg(isActive('pages')), border: tabBorder(isActive('pages')), transition: 'all 0.2s' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={isActive('pages') ? activeColor : mutedColor} strokeWidth="1.95" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 7h6M9 11h6M9 15h4"/>
            </svg>
          </div>
          <span style={{ fontSize: 8.2, fontWeight: 700, letterSpacing: '1px', color: isActive('pages') ? activeColor : mutedColor, fontFamily: "'Inter',sans-serif", lineHeight: 1 }}>PAGES</span>
        </button>

        {/* EVENTS */}
        <button onClick={() => setActive('events')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, flex: 1, height: '100%' }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid transparent', transition: 'all 0.2s' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={mutedColor} strokeWidth="1.95" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3c0 0-6 4-6 9a6 6 0 0 0 12 0c0-5-6-9-6-9z"/><path d="M12 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0"/>
            </svg>
          </div>
          <span style={{ fontSize: 8.2, fontWeight: 700, letterSpacing: '1px', color: mutedColor, fontFamily: "'Inter',sans-serif", lineHeight: 1 }}>EVENTS</span>
        </button>

        {/* HOME — gold lifted button */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', flex: 1, overflow: 'visible' }}>
          <motion.button
            onClick={() => { setActive('home'); router.push('/'); }}
            whileTap={{ scale: 0.88 }}
            whileHover={{ scale: 1.05 }}
            style={{
              position: 'relative', marginTop: -28, flexShrink: 0,
              width: 58, height: 58, borderRadius: '50%', cursor: 'pointer', border: 'none',
              background: 'linear-gradient(145deg,#f1d98a 0%,#d4af54 46%,#a87722 100%)',
              boxShadow: isActive('home')
                ? '0 0 0 2px rgba(229,193,101,0.72),0 0 22px rgba(212,175,84,0.48),0 4px 14px rgba(0,0,0,0.35)'
                : '0 0 0 1.5px rgba(212,175,84,0.42),0 4px 12px rgba(0,0,0,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10,
            }}
          >
            <div style={{ position: 'absolute', inset: -4, borderRadius: '50%', border: '1.5px solid rgba(226,190,102,0.55)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', inset: 6, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.36)', pointerEvents: 'none' }} />
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.2 }} viewBox="0 0 66 66">
              {[0,45,90,135,180,225,270,315].map(a => (
                <ellipse key={a} cx="33" cy="33" rx="14" ry="6" stroke="rgba(255,255,255,0.8)" strokeWidth="0.6" fill="none" transform={`rotate(${a} 33 33)`} />
              ))}
            </svg>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff7e2" stroke="none"><path d="M12 2L4 9v11h5v-6h6v6h5V9z" /></svg>
          </motion.button>
        </div>

        {/* SAVED */}
        <button onClick={() => setActive('saved')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, flex: 1, height: '100%' }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: tabBg(isActive('saved')), border: tabBorder(isActive('saved')), transition: 'all 0.2s' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill={isActive('saved') ? activeColor : mutedColor} stroke="none">
              <path d="M17 3H7a2 2 0 0 0-2 2v16l7-3.5L19 21V5a2 2 0 0 0-2-2z" opacity="0.97" />
            </svg>
          </div>
          <span style={{ fontSize: 8.2, fontWeight: 700, letterSpacing: '1px', color: isActive('saved') ? activeColor : mutedColor, fontFamily: "'Inter',sans-serif", lineHeight: 1 }}>SAVED</span>
        </button>

        {/* MORE */}
        <div ref={moreRef} style={{ position: 'relative', display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <button onClick={() => { setMenuOpen(v => !v); setActive('more'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, height: '100%', width: '100%' }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: tabBg(isActive('more') && menuOpen), border: tabBorder(isActive('more') && menuOpen), transition: 'all 0.2s' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill={isActive('more') && menuOpen ? activeColor : mutedColor} stroke="none">
                <circle cx="5" cy="12" r="1.45"/><circle cx="12" cy="12" r="1.45"/><circle cx="19" cy="12" r="1.45"/>
              </svg>
            </div>
            <span style={{ fontSize: 8.2, fontWeight: 700, letterSpacing: '1px', color: isActive('more') && menuOpen ? activeColor : mutedColor, fontFamily: "'Inter',sans-serif", lineHeight: 1 }}>MORE</span>
          </button>

          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'absolute', bottom: 72, right: 4, minWidth: 190, padding: 8, borderRadius: 18, zIndex: 420,
                background: 'linear-gradient(135deg,rgba(20,8,10,0.98),rgba(40,14,18,0.98))',
                border: '1px solid rgba(201,168,76,0.3)',
                boxShadow: '0 16px 48px rgba(0,0,0,0.6),inset 0 1px 0 rgba(201,168,76,0.15)',
                backdropFilter: 'blur(16px)',
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 16, right: 16, height: 1, background: 'linear-gradient(90deg,transparent,#c9a84c,transparent)', borderRadius: 1 }} />
              {[{ label: 'My Profile' }, { label: 'Share App' }].map(item => (
                <button key={item.label} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 13px', border: 'none', borderRadius: 12, cursor: 'pointer', background: 'transparent', color: 'rgba(245,237,230,0.85)', fontSize: 12.5, fontWeight: 600, textAlign: 'left' }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.95" strokeLinecap="round" strokeLinejoin="round">
                      {item.label === 'My Profile'
                        ? <><circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/></>
                        : <><circle cx="18" cy="5" r="2"/><circle cx="6" cy="12" r="2"/><circle cx="18" cy="19" r="2"/><path d="M8 11.2l7.8-4.1M8 12.8l7.8 4.1"/></>
                      }
                    </svg>
                  </div>
                  {item.label}
                </button>
              ))}
              <div style={{ height: 1, background: 'rgba(201,168,76,0.1)', margin: '4px 8px' }} />
              <div style={{ padding: '8px 13px 4px', display: 'flex', alignItems: 'center', gap: 6 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="akehan3.svg" style={{ width: 16, height: 16, opacity: 0.4 }} alt="" />
                <span style={{ fontSize: 9, color: 'rgba(201,168,76,0.45)', letterSpacing: '1.5px', fontWeight: 700 }}>SUBHSANDESH</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </nav>
  );
}
