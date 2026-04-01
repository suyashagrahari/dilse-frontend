"use client";

import Image from "next/image";
import { useRef, useEffect, useState } from "react";

const ASSETS = "/assets/Birthday1";

const CW = 1080;
const CH = 1920;
const NAV_H = 76;

interface Props {
  children: React.ReactNode;
}

export default function FlowerBackground({ children }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [vp, setVp] = useState({ w: 390, h: 844 });

  useEffect(() => {
    const calc = () =>
      setVp({ w: window.innerWidth, h: window.innerHeight });
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  const isMobile = vp.h > vp.w;
  const padBot = isMobile ? NAV_H : 0;
  const availH = vp.h - padBot;
  const scale = Math.min(vp.w / CW, availH / CH);
  const cx = vp.w / 2;
  const cy = availH / 2;

  return (
    <div
      ref={wrapRef}
      style={{
        position: "relative",
        height: "100%",
        width: "100%",
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Cormorant+Garamond:ital,wght@0,400;1,400;1,500&family=Great+Vibes&display=swap');`}</style>

      {/* ── Full-screen kraft paper texture ── */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <Image
          src={`${ASSETS}/backgorundImage.webp`}
          alt=""
          fill
          style={{ objectFit: "cover" }}
          priority
        />
      </div>

      {/* ── Flowers layer — exact same 1080×1920 canvas as HomeSection ── */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100dvh",
          pointerEvents: "none",
          zIndex: 1,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: CW,
            height: CH,
            transformOrigin: "top left",
            transform: `translate(${cx - (CW * scale) / 2}px, ${cy - (CH * scale) / 2}px) scale(${scale})`,
          }}
        >
          {/* Top-left botanical plant (rotated) */}
          <div
            style={{
              position: "absolute",
              left: -218,
              top: -500,
              width: 441,
              height: 1090,
              transform: "rotate(-174.94deg) scaleX(-1)",
              transformOrigin: "center center",
            }}
          >
            <Image src={`${ASSETS}/topleftcornerflower.webp`} alt="" fill
              style={{ objectFit: "contain" }} />
          </div>

          {/* Top-right large pressed flora */}
          <div
            style={{
              position: "absolute",
              left: 878,
              top: 108,
              width: 276,
              height: 288,
            }}
          >
            <Image src={`${ASSETS}/righttopflower2.webp`} alt="" fill
              style={{ objectFit: "contain" }} />
          </div>

          {/* Top-right small pressed flora */}
          <div
            style={{
              position: "absolute",
              left: 901,
              top: 455,
              width: 135,
              height: 140,
            }}
          >
            <Image src={`${ASSETS}/righttopflower1.webp`} alt="" fill
              style={{ objectFit: "contain" }} />
          </div>

          {/* Bottom-right botanical plant (mirrored) */}
          <div
            style={{
              position: "absolute",
              left: 696,
              top: 1227,
              width: 559,
              height: 1381,
              transform: "scaleX(-1)",
            }}
          >
            <Image src={`${ASSETS}/bottomrightflower.webp`} alt="" fill
              style={{ objectFit: "contain", objectPosition: "top" }} />
          </div>

          {/* Bottom-left small pressed flower */}
          <div
            style={{
              position: "absolute",
              left: 36,
              top: 1628,
              width: 152,
              height: 153,
            }}
          >
            <Image src={`${ASSETS}/bottomflower2.png`} alt="" fill
              style={{ objectFit: "contain" }} />
          </div>

          {/* Bottom-left large pressed flower */}
          <div
            style={{
              position: "absolute",
              left: 86,
              top: 1765,
              width: 303,
              height: 305,
            }}
          >
            <Image src={`${ASSETS}/bottomflower1.png`} alt="" fill
              style={{ objectFit: "contain" }} />
          </div>
        </div>
      </div>

      {/* ── Content — scrollable ── */}
      <div style={{
        position: "relative",
        zIndex: 2,
        height: "100%",
        overflowY: "auto",
        overflowX: "hidden",
        WebkitOverflowScrolling: "touch",
      }}>
        {children}
      </div>
    </div>
  );
}
