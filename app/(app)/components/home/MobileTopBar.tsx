"use client";

import { useEffect, useState } from "react";

export default function MobileTopBar() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const goToHero = () => {
    const hero = document.getElementById("hero");
    if (hero) {
      hero.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      className="md:hidden flex"
      style={{
        position: 'fixed', top: 8, left: '50%', transform: 'translateX(-50%)', zIndex: 100,
        height: 54, borderRadius: 999,
        background: '#f5ede6',
        border: '1px solid rgba(61,12,17,0.34)',
        boxShadow: '0 1px 0 rgba(255,255,255,0.65) inset',
        alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
        width: '50%',
        minWidth: 160,
      }}
    >
      <button
        onClick={goToHero}
        aria-label="Go to home hero section"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
          margin: 0,
        }}
      >
        <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700,
        color: '#2a0a0e', letterSpacing: '0.2px', textAlign: 'center',
        userSelect: 'none', lineHeight: 1,
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/indianFestival/logo.png" alt="SubhSandesh logo" style={{ width: 34, height: 34, objectFit: 'contain' }} />
          SubhSandesh
        </span>
      </button>
    </div>
  );
}
