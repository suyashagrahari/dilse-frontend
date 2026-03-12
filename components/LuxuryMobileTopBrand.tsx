"use client";

import Link from "next/link";

export default function LuxuryMobileTopBrand() {
  return (
    <>
      <div className="fixed top-0 left-0 right-0 md:hidden z-40 pt-2" style={{ background: "transparent" }}>
        <Link
          href="/"
          className="mx-auto mb-2 px-3 py-2 rounded-[999px] inline-flex items-center"
          style={{
            position: "relative",
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(245,237,230,0.92)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(61,12,17,0.12)",
            boxShadow: "0 6px 24px rgba(61,12,17,0.12)",
            textDecoration: "none",
          }}
          aria-label="Go to home"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/indianFestival/logo.png" alt="SubhSandesh" style={{ width: 40, height: 40, objectFit: "contain", flexShrink: 0 }} />
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: "#2a0a0e", lineHeight: 1, whiteSpace: "nowrap" }}>
            SubhSandesh
          </span>
        </Link>
      </div>
      <div className="md:hidden" style={{ height: 84 }} />
    </>
  );
}
