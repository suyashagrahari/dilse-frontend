"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 28);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <motion.div
      className="hidden md:flex"
      initial={{ opacity: 0, y: -24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, justifyContent: 'center', padding: '14px 260px 0', pointerEvents: 'none' }}
    >
      <header style={{
        pointerEvents: 'all',
        width: '100%',
        maxWidth: 860,
        background: scrolled ? 'rgba(245,237,230,0.97)' : 'rgba(245,237,230,0.92)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        border: '1px solid rgba(61,12,17,0.12)',
        borderRadius: 60,
        boxShadow: scrolled ? '0 8px 32px rgba(61,12,17,0.13)' : '0 4px 20px rgba(61,12,17,0.08)',
        transition: 'all 0.35s ease',
        padding: '0 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 54,
      }}>
        {/* Logo */}
        <Link href="/#hero" aria-label="SubhSandesh — back to top" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, whiteSpace: 'nowrap', padding: '2px 2px 2px 0', textDecoration: "none" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://cdn.subhsandesh.in/gifts-media/indianFestival/logo.webp" alt="" style={{ width: 36, height: 36, objectFit: 'contain', flexShrink: 0 }} />
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: '#2a0a0e', letterSpacing: '-0.2px', userSelect: 'none' }}>SubhSandesh</span>
        </Link>

        {/* Nav links */}
        <nav style={{ display: 'flex', gap: 36 }}>
          {[
            { label: 'OCCASIONS', href: '#occasions' },
            { label: 'FEATURES', href: '#features' },
            { label: 'TEMPLATES', href: '/templates' },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '1.6px', color: '#2a0a0e', textDecoration: 'none', opacity: 0.65, transition: 'opacity 0.2s' }}
              onMouseEnter={(e) => { (e.target as HTMLElement).style.opacity = '1'; }}
              onMouseLeave={(e) => { (e.target as HTMLElement).style.opacity = '0.65'; }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2a0a0e', opacity: 0.6, display: 'flex', padding: 4 }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </button>
          <motion.button
            whileHover={{ scale: 1.04, backgroundColor: '#2a0809' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push('/templates')}
            style={{ background: '#3d0c11', color: '#f5ede6', border: 'none', padding: '10px 20px', fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', cursor: 'pointer', borderRadius: 40, transition: 'background-color 0.22s', whiteSpace: 'nowrap' }}
          >
            CREATE EVENT
          </motion.button>
        </div>
      </header>
    </motion.div>
  );
}
