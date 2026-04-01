"use client";

import Image from "next/image";

export default function ScrapbookBg({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: "relative", minHeight: "100svh", background: "#F5EDE0", overflow: "hidden" }}>
      {/* Subtle texture overlay */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0,
        backgroundImage: "url('/assets/Birthday1/backgorundImage.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        opacity: 0.15,
        pointerEvents: "none",
      }} />
      <div style={{ position: "relative", zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
}
