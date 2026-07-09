"use client";

import Image from "next/image";
import { useRef, useEffect, useState } from "react";
import type { BirthdayData } from "./types";

const ASSETS = "/assets/Birthday1";

const CW = 1080;
const CH = 1920;
const NAV_H = 76;

interface Props {
  data: BirthdayData;
  isPersonalized: boolean;
}

export default function HomeSection({ data, isPersonalized }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 390, h: 844 });

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const calc = () =>
      setDims({ w: el.clientWidth, h: el.clientHeight });
    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const isMobile = dims.h > dims.w;
  const padBot = isMobile ? NAV_H : 0;
  const availH = dims.h - padBot;
  const scale = Math.min(dims.w / CW, availH / CH);
  const cx = dims.w / 2;
  const cy = availH / 2;

  const cover = data.homeCoverPhoto;
  const coverSrc = cover?.url || "";
  const coverPos = `${cover?.cropX ?? 50}% ${cover?.cropY ?? 50}%`;
  const coverScl = (cover?.scale ?? 100) / 100;

  const photo1 = data.homePhoto1 || "";
  const photo2 = data.homePhoto2 || "";

  const name =
    (isPersonalized ? data.recipientName : "Samira Hadid") || "Samira Hadid";
  const wish =
    (isPersonalized ? data.birthdayWish : "") ||
    "Wishing you a birthday filled with love, laughter, and cherished memories to last a lifetime.";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Cormorant+Garamond:ital,wght@0,400;1,400;1,500&family=Great+Vibes&display=swap');
      `}</style>

      <div
        ref={wrapRef}
        style={{
          position: "relative",
          width: "100%",
          height: "100svh",
          overflow: "hidden",
        }}
      >
        {/* ── Background — always fills full screen ── */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <Image
            src={`${ASSETS}/backgorundImage.webp`}
            alt=""
            fill
            style={{ objectFit: "cover" }}
            priority
          />
        </div>

        {/* ── Scaled 1080×1920 canvas for content ── */}
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

          {/* ── Top-left botanical plant (rotated) ── */}
          <div
            style={{
              position: "absolute",
              left: -218,
              top: -500,
              width: 441,
              height: 1090,
              zIndex: 1,
              pointerEvents: "none",
              transform: "rotate(-174.94deg) scaleX(-1)",
              transformOrigin: "center center",
            }}
          >
            <Image src={`${ASSETS}/topleftcornerflower.webp`} alt="" fill
              style={{ objectFit: "contain" }} />
          </div>

          {/* ── Top-right large pressed flora ── */}
          <div
            style={{
              position: "absolute",
              left: 878,
              top: 108,
              width: 276,
              height: 288,
              zIndex: 1,
              pointerEvents: "none",
            }}
          >
            <Image src={`${ASSETS}/righttopflower2.webp`} alt="" fill
              style={{ objectFit: "contain" }} />
          </div>

          {/* ── Top-right small pressed flora ── */}
          <div
            style={{
              position: "absolute",
              left: 901,
              top: 455,
              width: 135,
              height: 140,
              zIndex: 1,
              pointerEvents: "none",
            }}
          >
            <Image src={`${ASSETS}/righttopflower1.webp`} alt="" fill
              style={{ objectFit: "contain" }} />
          </div>

          {/* ── Bottom-right botanical plant (mirrored) ── */}
          <div
            style={{
              position: "absolute",
              left: 696,
              top: 1227,
              width: 559,
              height: 1381,
              zIndex: 1,
              pointerEvents: "none",
              transform: "scaleX(-1)",
            }}
          >
            <Image src={`${ASSETS}/bottomrightflower.webp`} alt="" fill
              style={{ objectFit: "contain", objectPosition: "top" }} />
          </div>

          {/* ── Bottom-left small pressed flower ── */}
          <div
            style={{
              position: "absolute",
              left: 36,
              top: 1628,
              width: 152,
              height: 153,
              zIndex: 7,
              pointerEvents: "none",
            }}
          >
            <Image src={`${ASSETS}/bottomflower2.webp`} alt="" fill
              style={{ objectFit: "contain" }} />
          </div>

          {/* ── Bottom-left large pressed flower ── */}
          <div
            style={{
              position: "absolute",
              left: 86,
              top: 1765,
              width: 303,
              height: 305,
              zIndex: 7,
              pointerEvents: "none",
            }}
          >
            <Image src={`${ASSETS}/bottomflower1.webp`} alt="" fill
              style={{ objectFit: "contain" }} />
          </div>

          {/* ── "HAPPY" ── */}
          <div
            style={{
              position: "absolute",
              left: 140,
              top: 154,
              width: 867,
              fontFamily: "'Abril Fatface', Georgia, serif",
              fontWeight: 400,
              fontSize: 151,
              color: "#5D3F31",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              lineHeight: 0.77,
              textShadow: "rgba(0,0,0,0.08) 0px 5.67px 7.52px",
              zIndex: 2,
              userSelect: "none",
            }}
          >
            HAPPY
          </div>

          {/* ── "Birthday" ── */}
          <div
            style={{
              position: "absolute",
              left: 190,
              top: 240,
              width: 779,
              fontFamily: "'Great Vibes', cursive",
              fontWeight: 400,
              fontSize: 220,
              color: "#AD684A",
              lineHeight: 1.4,
              zIndex: 2,
              userSelect: "none",
            }}
          >
            Birthday
          </div>

          {/* ── Recipient name ── */}
          <div
            style={{
              position: "absolute",
              left: 187,
              top: 533,
              width: 706,
              fontFamily: "'Abril Fatface', Georgia, serif",
              fontWeight: 400,
              fontSize: 52,
              color: "#5D3F31",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              textShadow: "rgba(0,0,0,0.08) 0px 4px 6px",
              textAlign: "center",
              zIndex: 2,
              userSelect: "none",
            }}
          >
            {name.toUpperCase()}
          </div>

          {/* ── Washi tape ── */}
          <div
            style={{
              position: "absolute",
              left: 373,
              top: 619,
              width: 334,
              height: 60,
              zIndex: 4,
              pointerEvents: "none",
            }}
          >
            <Image src={`${ASSETS}/stickermiddletop.webp`} alt="" fill
              style={{ objectFit: "fill" }} />
          </div>

          {/* ── Center polaroid shadow ── */}
          <div
            style={{
              position: "absolute",
              left: 211,
              top: 1444,
              width: 664,
              height: 174,
              zIndex: 2,
              pointerEvents: "none",
              background: "radial-gradient(ellipse at center, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.06) 40%, transparent 70%)",
              filter: "blur(8px)",
            }}
          />

          {/* ── Main center polaroid ── */}
          <div
            style={{
              position: "absolute",
              left: 211,
              top: 638,
              width: 664,
              height: 938,
              background: "#fff",
              padding: 12,
              boxShadow: "0 8px 40px rgba(0,0,0,0.13), 0 2px 8px rgba(0,0,0,0.06)",
              zIndex: 3,
            }}
          >
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
                overflow: "hidden",
                background: "#C9B9A9",
              }}
            >
              {coverSrc ? (
                <Image
                  src={coverSrc}
                  alt={name}
                  fill
                  style={{
                    objectFit: "cover",
                    objectPosition: coverPos,
                    transform: `scale(${coverScl})`,
                    transformOrigin: coverPos,
                  }}
                />
              ) : (
                <Image
                  src={`${ASSETS}/maincenterImage.webp`}
                  alt="Birthday person"
                  fill
                  style={{ objectFit: "cover", objectPosition: "center top" }}
                />
              )}
            </div>
          </div>

          {/* ── Top-right polaroid shadow ── */}
          <div
            style={{
              position: "absolute",
              left: 721,
              top: 927,
              width: 250,
              height: 66,
              transform: "rotate(13.85deg)",
              zIndex: 4,
              pointerEvents: "none",
              background: "radial-gradient(ellipse, rgba(0,0,0,0.22) 0%, transparent 70%)",
              borderRadius: "50%",
            }}
          />

          {/* ── Top-right polaroid ── */}
          <div
            style={{
              position: "absolute",
              left: 752,
              top: 718,
              width: 239,
              height: 239,
              background: "#fff",
              padding: "10px 10px 10px 10px",
              boxShadow: "0 6px 24px rgba(0,0,0,0.20), 0 2px 6px rgba(0,0,0,0.10)",
              transform: "rotate(11.17deg)",
              transformOrigin: "center center",
              zIndex: 5,
            }}
          >
            <div style={{
              position: "relative", width: "100%", height: "100%",
              overflow: "hidden", background: "#C9B9A9",
            }}>
              {photo1 ? (
                <Image src={photo1} alt="" fill style={{ objectFit: "cover" }} />
              ) : (
                <Image src={`${ASSETS}/toprightphoto.webp`} alt="" fill
                  style={{ objectFit: "cover", objectPosition: "center top" }} />
              )}
            </div>
          </div>

          {/* ── Bottom-left polaroid shadow ── */}
          <div
            style={{
              position: "absolute",
              left: 112,
              top: 1331,
              width: 250,
              height: 66,
              transform: "rotate(-13.77deg)",
              zIndex: 4,
              pointerEvents: "none",
              background: "radial-gradient(ellipse, rgba(0,0,0,0.22) 0%, transparent 70%)",
              borderRadius: "50%",
            }}
          />

          {/* ── Bottom-left polaroid ── */}
          <div
            style={{
              position: "absolute",
              left: 92,
              top: 1130,
              width: 239,
              height: 239,
              background: "#fff",
              padding: "10px 10px 10px 10px",
              boxShadow: "0 6px 24px rgba(0,0,0,0.20), 0 2px 6px rgba(0,0,0,0.10)",
              transform: "rotate(-13.02deg)",
              transformOrigin: "center center",
              zIndex: 5,
            }}
          >
            <div style={{
              position: "relative", width: "100%", height: "100%",
              overflow: "hidden", background: "#C9B9A9",
            }}>
              {photo2 ? (
                <Image src={photo2} alt="" fill style={{ objectFit: "cover" }} />
              ) : (
                <Image src={`${ASSETS}/bottomleftphoto.webp`} alt="" fill
                  style={{ objectFit: "cover", objectPosition: "center top" }} />
              )}
            </div>
          </div>

          {/* ── Birthday wish text ── */}
          <div
            style={{
              position: "absolute",
              left: 200,
              top: 1610,
              width: 680,
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: 50,
              color: "#2A1A10",
              lineHeight: 1.35,
              letterSpacing: "-0.01em",
              textAlign: "center",
              zIndex: 6,
            }}
          >
            {wish}
          </div>
        </div>
      </div>
    </>
  );
}
