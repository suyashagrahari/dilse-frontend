"use client";

import Link from "next/link";

interface LuxuryMobileTopBrandProps {
  onBrandClick?: () => void;
  topOffsetPx?: number;
}

export default function LuxuryMobileTopBrand({ onBrandClick, topOffsetPx = 0 }: LuxuryMobileTopBrandProps) {
  const brandInner = (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        // gap: 2,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/indianFestival/logo.png"
        alt="SubhSandesh"
        style={{
          width: 48,
          height: 48,
          objectFit: "contain",
          objectPosition: "center",
          flexShrink: 0,
          display: "block",
        }}
      />
      <span
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 16,
          fontWeight: 700,
          color: "#2a0a0e",
          lineHeight: 1,
          whiteSpace: "nowrap",
        }}
      >
        SubhSandesh
      </span>
    </span>
  );

  const brandShellStyle: React.CSSProperties = {
    width: "calc(60%)",
    maxWidth: 318,
    minWidth: 190,
    maxHeight: 58,
    padding: "2px 12px",
    background: "rgba(245,237,230,0.92)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: "1px solid rgba(61,12,17,0.12)",
    boxShadow: "0 6px 24px rgba(61,12,17,0.12)",
    textDecoration: "none",
  };

  return (
    <>
      <div
        className="fixed left-0 right-0 md:hidden z-40 flex justify-center"
        style={{ background: "transparent", top: topOffsetPx, paddingTop: 8 }}
      >
        {onBrandClick ? (
          <button
            type="button"
            onClick={onBrandClick}
            className="mb-2 rounded-[999px] flex items-center justify-center"
            style={brandShellStyle}
            aria-label="Go to home hero section"
          >
            {brandInner}
          </button>
        ) : (
          <Link
            href="/"
            className="mb-2 rounded-[999px] flex items-center justify-center"
            style={brandShellStyle}
            aria-label="Go to home"
          >
            {brandInner}
          </Link>
        )}
      </div>
      <div className="md:hidden" style={{ height: 84 }} />
    </>
  );
}
