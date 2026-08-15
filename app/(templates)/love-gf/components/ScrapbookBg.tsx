"use client";

import Image from "next/image";

/**
 * Reusable scrapbook paper background wrapper.
 * Renders the crumpled paper texture + soft radial vignette + botanical corner accents.
 * Wrap any section content inside this to instantly apply the theme.
 */
export default function ScrapbookBg({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`relative min-h-screen w-full overflow-hidden ${className}`}
      style={{
        background: `
          radial-gradient(ellipse at 50% 50%, transparent 20%, rgba(28,15,6,0.28) 100%),
          url(/love/image18.webp) center / cover no-repeat
        `,
      }}
    >
      {/* Top-left botanical: yarrow */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute", top: "-2%", left: "-4%",
          width: "clamp(80px, 18vw, 160px)", pointerEvents: "none",
          transform: "rotate(18deg)", zIndex: 1, mixBlendMode: "multiply", opacity: 0.75,
        }}
      >
        <Image src="https://cdn.subhsandesh.in/gifts-media/love/image4.webp" alt="" width={215} height={355}
          style={{ width: "100%", height: "auto", display: "block" }} />
      </div>

      {/* Top-right botanical: dandelion */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute", top: "-2%", right: "-3%",
          width: "clamp(70px, 16vw, 140px)", pointerEvents: "none",
          transform: "rotate(-20deg) scaleX(-1)", zIndex: 1, mixBlendMode: "multiply", opacity: 0.70,
        }}
      >
        <Image src="https://cdn.subhsandesh.in/gifts-media/love/image6.webp" alt="" width={210} height={228}
          style={{ width: "100%", height: "auto", display: "block" }} />
      </div>

      {/* Bottom-left botanical: fern */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute", bottom: "-2%", left: "-2%",
          width: "clamp(70px, 15vw, 130px)", pointerEvents: "none",
          transform: "rotate(-25deg)", zIndex: 1, mixBlendMode: "multiply", opacity: 0.68,
        }}
      >
        <Image src="https://cdn.subhsandesh.in/gifts-media/love/image7.webp" alt="" width={174} height={459}
          style={{ width: "100%", height: "auto", display: "block" }} />
      </div>

      {/* Bottom-right botanical: flower */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute", bottom: "-1%", right: "-1%",
          width: "clamp(60px, 13vw, 110px)", pointerEvents: "none",
          transform: "rotate(15deg) scaleX(-1)", zIndex: 1, mixBlendMode: "multiply", opacity: 0.68,
        }}
      >
        <Image src="https://cdn.subhsandesh.in/gifts-media/love/image8.webp" alt="" width={240} height={360}
          style={{ width: "100%", height: "auto", display: "block" }} />
      </div>

      {/* Main content */}
      <div className="relative" style={{ zIndex: 2 }}>
        {children}
      </div>
    </div>
  );
}
