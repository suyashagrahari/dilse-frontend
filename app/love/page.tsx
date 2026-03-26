"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

/*
  PIXEL-PERFECT recreation from Canva HTML source.
  Now includes a bottom navbar for navigating between sections.
*/

const TABS = [
  { id: "scrapbook", label: "Scrapbook", icon: "♡" },
  { id: "message", label: "Message", icon: "✦" },
  { id: "photos", label: "Photos", icon: "📷" },
  { id: "wish", label: "Wish", icon: "✿" },
];

export default function LovePage() {
  const [tab, setTab] = useState("scrapbook");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* Full-viewport crumpled paper background with a warm radial vignette */
        .lw {
          height: 100dvh;
          min-height: 100dvh;
          width: 100%;
          background:
            radial-gradient(ellipse at 50% 50%, transparent 22%, rgba(28,15,6,0.32) 100%),
            url(/love/image18.webp) center / cover no-repeat;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        /* Romantic header quote */
        .lw-hd {
          font-family: 'Dancing Script', 'Brush Script MT', cursive;
          font-size: clamp(15px, 4.2vw, 21px);
          font-weight: 600;
          color: rgb(108, 74, 46);
          opacity: 0.88;
          letter-spacing: 0.04em;
          text-align: center;
          padding: 22px 24px 10px;
          pointer-events: none;
        }

        /* Romantic footer quote */
        .lw-ft {
          font-family: 'Dancing Script', 'Brush Script MT', cursive;
          font-size: clamp(13px, 3.5vw, 17px);
          font-weight: 600;
          color: rgb(108, 74, 46);
          opacity: 0.68;
          letter-spacing: 0.10em;
          text-align: center;
          padding: 10px 24px 22px;
          pointer-events: none;
        }

        /* On mobile we want the collage to dominate the screen (no empty gaps). */
        @media (max-width: 639px) {
          .lw-hd { display: none; }
          .lw-ft { display: none; }
        }

        /*
          Canvas: transparent, 2:3 ratio, NO z-index (not a stacking context).
          multiply-blend children blend against the wrapper paper background.
        */
        .lc {
          position: relative;
          flex-shrink: 0;
          width: 100%;
          /* Fit the 2:3 canvas into the viewport (leave space for bottom navbar). */
          max-width: min(100vw, calc((100dvh - 82px) * 2 / 3));
          aspect-ratio: 2 / 3;
          background: transparent;
          overflow: hidden;
        }

        /* ── DESKTOP ≥ 640 px ── */
        @media (min-width: 640px) {
          .lw-hd { font-size: clamp(17px, 1.6vw, 24px); padding: 28px 32px 12px; }
          .lw-ft  { font-size: clamp(14px, 1.3vw, 19px); padding: 12px 32px 28px; }
          .lc {
            width: min(400px, calc((100dvh - 130px) * 2 / 3));
            max-width: min(400px, calc((100dvh - 130px) * 2 / 3));
            isolation: isolate;
            border-radius: 6px;
            box-shadow:
              0 48px 110px rgba(40,22,8,0.60),
              0 16px 40px rgba(40,22,8,0.38),
              0 0 0 1px rgba(160,118,72,0.22);
          }
        }

        /* Polaroid frame */
        .pol {
          position: absolute;
          background: #faf8f2;
          box-shadow: 3px 6px 22px rgba(0,0,0,0.30), 0 1px 6px rgba(0,0,0,0.15);
        }
 
        /* Multiply blend for botanical overlays */
        .mul { mix-blend-mode: multiply; }

        /* Canvas bg: hidden on mobile (wrapper bg shows through), visible on desktop */
        .lc-bg { display: none; }
        @media (min-width: 640px) { .lc-bg { display: block; } }

        /* Bottom navbar */
        .lnav {
          position: fixed; bottom: 0; left: 0; right: 0; z-index: 100;
          background: rgba(250,246,240,0.94);
          backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
          border-top: 1px solid rgba(158,126,97,0.22);
          display: flex; justify-content: space-around; align-items: center;
          padding: 6px 0 calc(6px + env(safe-area-inset-bottom,0px));
        }
        .lnav-btn {
          display: flex; flex-direction: column; align-items: center; gap: 2px;
          border: none; background: transparent; cursor: pointer; flex: 1;
          padding: 3px 4px;
        }
        .lnav-icon { font-size: clamp(13px,3.8vw,16px); line-height: 1; }
        .lnav-label {
          font-family: 'Dancing Script','Brush Script MT',cursive;
          font-size: clamp(9px,2.4vw,11px); letter-spacing: 0.04em; line-height: 1;
        }
        .lnav-dot { width: 14px; height: 2px; border-radius: 1px;
          background: linear-gradient(90deg,rgba(158,126,97,0.4),rgb(158,126,97),rgba(158,126,97,0.4)); }

        /* Non-scrapbook section backgrounds */
        .lsec {
          min-height: 100dvh; width: 100%; padding: 0 0 96px;
          background:
            radial-gradient(ellipse at 50% 50%, transparent 22%, rgba(28,15,6,0.28) 100%),
            url(/love/image18.webp) center / cover no-repeat;
          position: relative; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          overflow: hidden;
        }
        /* Botanical corners on sections */
        .lsec-tl,.lsec-tr,.lsec-bl,.lsec-br {
          position: absolute; pointer-events: none; mix-blend-mode: multiply; opacity: 0.65; z-index: 1;
        }
        .lsec-tl { top:-2%; left:-4%; width:clamp(70px,18vw,150px); transform:rotate(18deg); }
        .lsec-tr { top:-2%; right:-3%; width:clamp(60px,15vw,130px); transform:rotate(-20deg) scaleX(-1); }
        .lsec-bl { bottom:-2%; left:-2%; width:clamp(60px,14vw,120px); transform:rotate(-25deg); }
        .lsec-br { bottom:-1%; right:-1%; width:clamp(55px,12vw,100px); transform:rotate(15deg) scaleX(-1); }

        /* Wish card */
        .lwc {
          position: relative; z-index: 2;
          width: calc(100% - 48px); max-width: 420px;
          background: rgba(250,248,242,0.90); border-radius: 8px;
          padding: 36px 28px 44px;
          box-shadow: 0 20px 60px rgba(80,50,20,0.18),0 4px 16px rgba(80,50,20,0.10),0 0 0 1px rgba(158,126,97,0.15);
        }
        .lwc-border-t,.lwc-border-b {
          position:absolute; left:10%;right:10%; height:3px;
          background:linear-gradient(90deg,transparent,rgba(158,126,97,0.5),transparent); border-radius:2px;
        }
        .lwc-border-t { top:0; }
        .lwc-border-b { bottom:0; }

        /* Photo grid */
        .lphgrid { position:relative;z-index:2; display:grid; grid-template-columns:1fr 1fr;
          gap:14px; width:calc(100% - 40px); max-width:380px; }
        .lpol { aspect-ratio:3/4; border-radius:4px; overflow:hidden;
          background:#faf8f2; box-shadow:3px 6px 22px rgba(0,0,0,0.25),0 1px 6px rgba(0,0,0,0.12); }
        .lpol-inner { width:100%;height:100%;object-fit:cover;display:block; }

        /* Message card */
        .lmsg {
          position:relative;z-index:2;
          width:calc(100% - 40px); max-width:440px;
          background:rgba(250,248,242,0.90); border-radius:8px;
          padding:36px 28px;
          box-shadow:0 20px 60px rgba(80,50,20,0.18),0 4px 16px rgba(80,50,20,0.10);
        }
      `}</style>

      {/* ── Tab content ── */}
      <div style={{ display: tab === "scrapbook" ? "block" : "none" }}>
      <div className="lw">
        <p className="lw-hd">every love story is beautiful</p>
        <div className="lc">
          {/* Rounded phone frame + corner brackets (Canva-like) */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 28,
              pointerEvents: "none",
              zIndex: 60,
              border: "1.5px solid rgba(158, 126, 97, 0.22)",
              boxShadow: "0 18px 60px rgba(40,22,8,0.12)",
              background: "transparent",
            }}
          />
          {/* top-left */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              width: 44,
              height: 44,
              pointerEvents: "none",
              zIndex: 61,
              borderLeft: "3px solid rgba(158, 126, 97, 0.40)",
              borderTop: "3px solid rgba(158, 126, 97, 0.40)",
              borderTopLeftRadius: 16,
              opacity: 0.7,
            }}
          />
          {/* top-right */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              width: 44,
              height: 44,
              pointerEvents: "none",
              zIndex: 61,
              borderRight: "3px solid rgba(158, 126, 97, 0.40)",
              borderTop: "3px solid rgba(158, 126, 97, 0.40)",
              borderTopRightRadius: 16,
              opacity: 0.7,
            }}
          />
          {/* bottom-left */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              bottom: 12,
              left: 12,
              width: 44,
              height: 44,
              pointerEvents: "none",
              zIndex: 61,
              borderLeft: "3px solid rgba(158, 126, 97, 0.40)",
              borderBottom: "3px solid rgba(158, 126, 97, 0.40)",
              borderBottomLeftRadius: 16,
              opacity: 0.7,
            }}
          />
          {/* bottom-right */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              bottom: 12,
              right: 12,
              width: 44,
              height: 44,
              pointerEvents: "none",
              zIndex: 61,
              borderRight: "3px solid rgba(158, 126, 97, 0.40)",
              borderBottom: "3px solid rgba(158, 126, 97, 0.40)",
              borderBottomRightRadius: 16,
              opacity: 0.7,
            }}
          />

          {/* ═══════════════════════════════════════════
              z=0  BACKGROUND — beige crumpled paper
              Hidden on mobile (wrapper bg shows through transparent canvas).
              Visible on desktop (provides paper bg inside isolation:isolate card).
          ═══════════════════════════════════════════ */}
          <div className="lc-bg" aria-hidden="true" style={{ position: "absolute", inset: 0 }}>
            <Image
              src="/love/image18.webp"
              alt="" fill priority
              style={{ objectFit: "cover", objectPosition: "center" }}
            />
          </div>

          {/* ═══════════════════════════════════════════
              z=1  TORN PAPER LEFT — LBXWs5Tdl7mYc0Xm
              662.042×238.335px → translate(-255.431, 159.894) rotate(92.09°)
              left=-33.8%  top=14.1%  w=87.6%  h=21.0%
              Rotated ~90° → appears as vertical kraft strip on left side
          ═══════════════════════════════════════════ */}
          <div className="mul" style={{
            position: "absolute",
            left: "-33.8%", top: "14.1%",
            width: "87.6%", height: "21.0%",
            transform: "rotate(92.09deg)",
            zIndex: 1,
            opacity: 0.9,
          }}>
            <Image src="/love/image17.webp" alt="" width={1600} height={577}
              style={{ width: "100%", height: "100%", display: "block", objectFit: "fill" }} />
          </div>

          {/* ═══════════════════════════════════════════
              z=2  STICKY NOTE — LBrXNcGY07R2H06r
              357.033×257.51px → translate(331.964, 79.118) rotate(8°)
              left=43.9%  top=7.0%  w=47.2%
          ═══════════════════════════════════════════ */}
          <div style={{
            position: "absolute",
            left: "43.9%", top: "7.0%",
            width: "47.2%",
            transform: "rotate(8deg)",
            zIndex: 2,
          }}>
            <Image src="/love/image16.webp" alt="notepad" width={780} height={605}
              style={{ width: "100%", height: "auto", display: "block" }} />
          </div>

          {/* ═══════════════════════════════════════════
              z=3  TORN PAPER RIGHT — LBf0TvNmbGbMgcsP
              662.042×238.335px → translate(349.294, 837.305) rotate(-83.58°)
              left=46.2%  top=73.8%  w=87.6%  h=21.0%
              Rotated ~-84° → appears as kraft strip on bottom-right
          ═══════════════════════════════════════════ */}
          <div className="mul" style={{
            position: "absolute",
            left: "46.2%", top: "73.8%",
            width: "87.6%", height: "21.0%",
            transform: "rotate(-83.58deg)",
            zIndex: 3,
            opacity: 0.9,
          }}>
            <Image src="/love/image15.webp" alt="" width={1600} height={577}
              style={{ width: "100%", height: "100%", display: "block", objectFit: "fill" }} />
          </div>

          {/* ═══════════════════════════════════════════
              z=4  PHOTO 2 — LB1StQ9kRrDxb2Y1 (couple on stairs/blanket)
              304.606×319.498px → translate(372.583, 255.029) rotate(15°)
              left=49.3%  top=22.5%  w=40.3%  h=28.2%
          ═══════════════════════════════════════════ */}
          <div className="pol" style={{
            left: "49.3%", top: "22.5%",
            width: "40.3%", height: "28.2%",
            transform: "rotate(15deg)",
            zIndex: 4,
          }}>
            <div style={{ position: "absolute", inset: "5% 6% 21% 10%" }}>
              <Image src="/love/image14.webp" fill alt="couple"
                style={{ objectFit: "cover", objectPosition: "center 20%" }}
                sizes="(max-width:640px) 40vw, 169px" />
            </div>
          </div>

          {/* ═══════════════════════════════════════════
              z=5  PHOTO 4 — LBzGq9F51WB5QDfB (couple reading/lying)
              331.537×468.234px → translate(337.175, 587.721) rotate(8°)
              left=44.6%  top=51.8%  w=43.9%  h=41.3%
          ═══════════════════════════════════════════ */}
          <div className="pol" style={{
            left: "44.6%", top: "51.8%",
            width: "43.9%", height: "41.3%",
            transform: "rotate(8deg)",
            zIndex: 5,
          }}>
            <div style={{ position: "absolute", inset: "5% 6% 21% 10%" }}>
              <Image src="/love/image13.webp" fill alt="couple reading"
                style={{ objectFit: "cover", objectPosition: "center 25%" }}
                sizes="(max-width:640px) 44vw, 184px" />
            </div>
          </div>

          {/* ═══════════════════════════════════════════
              z=6  PHOTO 3 — LBxjrYpl73ppn1Lc (couple on couch)
              304.606×319.498px → translate(55.493, 647.262) rotate(-9°)
              left=7.3%  top=57.1%  w=40.3%  h=28.2%
          ═══════════════════════════════════════════ */}
          <div className="pol" style={{
            left: "7.3%", top: "57.1%",
            width: "40.3%", height: "28.2%",
            transform: "rotate(-9deg)",
            zIndex: 6,
          }}>
            <div style={{ position: "absolute", inset: "5% 6% 21% 10%" }}>
              <Image src="/love/imaghe12.webp" fill alt="couple couch"
                style={{ objectFit: "cover", objectPosition: "center" }}
                sizes="(max-width:640px) 40vw, 169px" />
            </div>
          </div>

          {/* ═══════════════════════════════════════════
              z=7  RIGHT BOTANICAL — LBrxQ0LN856ZDcHj (pressed flora, right side)
              312.523×508.168px → translate(510.671, 293.96) rotate(8°)
              left=67.6%  top=25.9%  w=41.3%
          ═══════════════════════════════════════════ */}
          <div className="mul" style={{
            position: "absolute",
            left: "67.6%", top: "25.9%",
            width: "41.3%",
            transform: "rotate(8deg)",
            zIndex: 7,
          }}>
            <Image src="/love/image11.webp" alt="" width={312} height={508}
              style={{ width: "100%", height: "auto", display: "block" }} />
          </div>

          {/* ═══════════════════════════════════════════
              z=8  PUSHPIN 1 — LBdDQQt2YyhqqRMz (for Photo 2)
              52.35×53.35px → translate(549.337, 242.47) rotate(15°)
              left=72.7%  top=21.4%  w=6.9%
          ═══════════════════════════════════════════ */}
          <div className="mul" style={{
            position: "absolute",
            left: "72.7%", top: "21.4%",
            width: "6.9%",
            transform: "rotate(15deg)",
            zIndex: 8,
          }}>
            <Image src="/love/image9.webp" alt="" width={200} height={200}
              style={{ width: "100%", height: "auto", display: "block" }} />
          </div>

          {/* ═══════════════════════════════════════════
              z=9  PUSHPIN 2 — LBtX7vZfxChz8sPc (for Photo 3)
              52.35×53.35px → translate(159.132, 629.17) rotate(-9°)
              left=21.1%  top=55.5%  w=6.9%
          ═══════════════════════════════════════════ */}
          <div className="mul" style={{
            position: "absolute",
            left: "21.1%", top: "55.5%",
            width: "6.9%",
            transform: "rotate(-9deg)",
            zIndex: 9,
          }}>
            <Image src="/love/image10.webp" alt="" width={200} height={200}
              style={{ width: "100%", height: "auto", display: "block" }} />
          </div>

          {/* ═══════════════════════════════════════════
              z=10  BOTTOM FLOWER — LBhSYdHzKPdwWybJ (orange/yellow rose)
              189.178×220.616px → translate(126.381, 946.356) rotate(12°)
              left=16.7%  top=83.5%  w=25.0%
          ═══════════════════════════════════════════ */}
          <div className="mul" style={{
            position: "absolute",
            left: "16.7%", top: "83.5%",
            width: "25.0%",
            transform: "rotate(12deg)",
            zIndex: 10,
          }}>
            <Image src="/love/image8.webp" alt="" width={240} height={360}
              style={{ width: "100%", height: "auto", display: "block" }} />
          </div>

          {/* ═══════════════════════════════════════════
              z=11  FERN — LBc8MvpXXfVMYg3k (fern frond, bottom-left)
              173.772×458.804px → translate(31.667, 819.72) rotate(-30°)
              left=4.2%  top=72.3%  w=23.0%
          ═══════════════════════════════════════════ */}
          <div className="mul" style={{
            position: "absolute",
            left: "4.2%", top: "72.3%",
            width: "23.0%",
            transform: "rotate(-30deg)",
            zIndex: 11,
          }}>
            <Image src="/love/image7.webp" alt="" width={174} height={459}
              style={{ width: "100%", height: "auto", display: "block" }} />
          </div>

          {/* ═══════════════════════════════════════════
              z=12  DANDELION — LBQkFlmyXq1R1n8R (top-right corner)
              209.841×228.399px → translate(607.608, -36.967) rotate(26.17°)
              left=80.4%  top=-3.3%  w=27.8%
          ═══════════════════════════════════════════ */}
          <div className="mul" style={{
            position: "absolute",
            left: "80.4%", top: "-3.3%",
            width: "27.8%",
            transform: "rotate(26.17deg)",
            zIndex: 12,
          }}>
            <Image src="/love/image6.webp" alt="" width={210} height={228}
              style={{ width: "100%", height: "auto", display: "block" }} />
          </div>

          {/* ═══════════════════════════════════════════
              z=13  "love you!" TEXT — LBybMRPXZKwbB5Y4
              281.777×118.267px → translate(390.073, 114.408) rotate(8°)
              left=51.6%  top=10.1%  w=37.3%
              font-size=98.67px in 755.906px canvas = 13.05% of canvas width
              color: rgb(158, 126, 97)
          ═══════════════════════════════════════════ */}
          <div style={{
            position: "absolute",
            left: "51.6%", top: "10.1%",
            width: "37.3%",
            transform: "rotate(8deg)",
            zIndex: 13,
          }}>
            <span style={{
              display: "block",
              fontFamily: "'Dancing Script', 'Brush Script MT', cursive",
              fontSize: "clamp(24px, 12.5vw, 54px)",
              color: "rgb(158, 126, 97)",
              fontWeight: 700,
              letterSpacing: "0.01em",
              lineHeight: 1.2,
              whiteSpace: "nowrap",
              pointerEvents: "none",
            }}>
              love you!
            </span>
          </div>

          {/* ═══════════════════════════════════════════
              z=14  PHOTO 1 LARGE — LBq2KgTFl00MK4ny (couple hugging on bed)
              331.537×468.234px → translate(79.788, 159.59) rotate(-6°)
              left=10.6%  top=14.1%  w=43.9%  h=41.3%
          ═══════════════════════════════════════════ */}
          <div className="pol" style={{
            left: "10.6%", top: "14.1%",
            width: "43.9%", height: "41.3%",
            transform: "rotate(-6deg)",
            zIndex: 14,
          }}>
            <div style={{ position: "absolute", inset: "5% 6% 21% 10%" }}>
              <Image src="/love/image5.webp" fill alt="couple hugging"
                style={{ objectFit: "cover", objectPosition: "center 10%" }}
                sizes="(max-width:640px) 44vw, 184px" />
            </div>
          </div>

          {/* ═══════════════════════════════════════════
              z=15  TOP-LEFT BOTANICAL — LB4XfNCFZPbJg6Q9 (yarrow/herb)
              215.009×355.387px → translate(-51.281, -4.153) rotate(18.83°)
              left=-6.8%  top=-0.4%  w=28.5%
          ═══════════════════════════════════════════ */}
          <div className="mul" style={{
            position: "absolute",
            left: "-6.8%", top: "-0.4%",
            width: "28.5%",
            transform: "rotate(18.83deg)",
            zIndex: 15,
          }}>
            <Image src="/love/image4.webp" alt="" width={215} height={355}
              style={{ width: "100%", height: "auto", display: "block" }} />
          </div>

          {/* ═══════════════════════════════════════════
              z=16  CENTER PRESSED FLOWER — LBP3l8d4cQMBzkZ0
              121.826×121.417px → translate(331.163, 500.96) rotate(0°)
              left=43.8%  top=44.2%  w=16.1%
          ═══════════════════════════════════════════ */}
          <div className="mul" style={{
            position: "absolute",
            left: "43.8%", top: "44.2%",
            width: "16.1%",
            zIndex: 16,
          }}>
            <Image src="/love/image3.webp" alt="" width={122} height={121}
              style={{ width: "100%", height: "auto", display: "block" }} />
          </div>

        </div>

        <p className="lw-ft">— but ours is my favourite ♡</p>
      </div>
      </div>{/* end scrapbook tab */}

      {/* ── MESSAGE TAB ── */}
      {tab === "message" && (
        <div className="lsec">
          <Image src="/love/image4.webp" alt="" width={215} height={355} className="lsec-tl" style={{ width: "clamp(70px,18vw,150px)", height: "auto" }} />
          <Image src="/love/image6.webp" alt="" width={210} height={228} className="lsec-tr" style={{ width: "clamp(60px,15vw,130px)", height: "auto" }} />
          <Image src="/love/image7.webp" alt="" width={174} height={459} className="lsec-bl" style={{ width: "clamp(60px,14vw,120px)", height: "auto" }} />
          <Image src="/love/image8.webp" alt="" width={240} height={360} className="lsec-br" style={{ width: "clamp(55px,12vw,100px)", height: "auto" }} />
          <div className="lmsg">
            <p style={{ fontFamily:"'Dancing Script','Brush Script MT',cursive", fontSize:"clamp(11px,3vw,14px)", color:"rgb(108,74,46)", opacity:0.6, letterSpacing:"0.14em", textAlign:"center", marginBottom:20, textTransform:"uppercase" }}>
              a letter to you
            </p>
            <p style={{ fontFamily:"'Dancing Script','Brush Script MT',cursive", fontSize:"clamp(17px,4.8vw,24px)", color:"rgb(90,60,35)", lineHeight:1.8, textAlign:"center" }}>
              Every moment with you is a treasure I hold close to my heart. You are my sunshine on cloudy days, my laughter in silent rooms, and my home wherever we are.
            </p>
            <p style={{ fontFamily:"'Dancing Script','Brush Script MT',cursive", fontSize:"clamp(17px,4.8vw,24px)", color:"rgb(90,60,35)", lineHeight:1.8, textAlign:"center", marginTop:16 }}>
              I love you more than words can say, and I'll keep showing you that every single day. You are my forever.
            </p>
            <p style={{ fontFamily:"'Dancing Script','Brush Script MT',cursive", fontSize:"clamp(15px,4vw,20px)", color:"rgb(108,74,46)", opacity:0.75, textAlign:"right", marginTop:24 }}>
              — Always Yours ♡
            </p>
          </div>
          <Link href="/love-gf" style={{
            marginTop:24, padding:"10px 28px", borderRadius:50, position:"relative", zIndex:2,
            border:"1.5px solid rgba(158,126,97,0.55)", background:"rgba(158,126,97,0.12)",
            fontFamily:"'Dancing Script','Brush Script MT',cursive", fontSize:"clamp(14px,3.8vw,17px)",
            fontWeight:600, color:"rgb(108,74,46)", cursor:"pointer", letterSpacing:"0.04em", textDecoration:"none",
            backdropFilter:"blur(4px)",
          }}>
            ✦ Write your own love page ✦
          </Link>
        </div>
      )}

      {/* ── PHOTOS TAB ── */}
      {tab === "photos" && (
        <div className="lsec">
          <Image src="/love/image4.webp" alt="" width={215} height={355} className="lsec-tl" style={{ width: "clamp(70px,18vw,150px)", height: "auto" }} />
          <Image src="/love/image6.webp" alt="" width={210} height={228} className="lsec-tr" style={{ width: "clamp(60px,15vw,130px)", height: "auto" }} />
          <Image src="/love/image7.webp" alt="" width={174} height={459} className="lsec-bl" style={{ width: "clamp(60px,14vw,120px)", height: "auto" }} />
          <Image src="/love/image8.webp" alt="" width={240} height={360} className="lsec-br" style={{ width: "clamp(55px,12vw,100px)", height: "auto" }} />
          <p style={{ position:"relative",zIndex:2, fontFamily:"'Dancing Script','Brush Script MT',cursive", fontSize:"clamp(18px,5vw,26px)", fontWeight:700, color:"rgb(108,74,46)", opacity:0.88, marginBottom:20 }}>
            our moments ♡
          </p>
          <div className="lphgrid">
            {["/love/image5.webp","/love/image14.webp","/love/imaghe12.webp","/love/image13.webp"].map((src,i) => (
              <div key={i} className="lpol">
                <Image src={src} alt="couple" width={400} height={530} className="lpol-inner"
                  style={{ objectFit:"cover", width:"100%", height:"100%" }} />
              </div>
            ))}
          </div>
          <Link href="/love-gf" style={{
            marginTop:24, padding:"10px 28px", borderRadius:50, position:"relative", zIndex:2,
            border:"1.5px solid rgba(158,126,97,0.55)", background:"rgba(158,126,97,0.12)",
            fontFamily:"'Dancing Script','Brush Script MT',cursive", fontSize:"clamp(14px,3.8vw,17px)",
            fontWeight:600, color:"rgb(108,74,46)", cursor:"pointer", letterSpacing:"0.04em", textDecoration:"none",
          }}>
            ✦ Add your own photos ✦
          </Link>
        </div>
      )}

      {/* ── WISH TAB ── */}
      {tab === "wish" && (
        <div className="lsec">
          <Image src="/love/image4.webp" alt="" width={215} height={355} className="lsec-tl" style={{ width: "clamp(70px,18vw,150px)", height: "auto" }} />
          <Image src="/love/image6.webp" alt="" width={210} height={228} className="lsec-tr" style={{ width: "clamp(60px,15vw,130px)", height: "auto" }} />
          <Image src="/love/image7.webp" alt="" width={174} height={459} className="lsec-bl" style={{ width: "clamp(60px,14vw,120px)", height: "auto" }} />
          <Image src="/love/image8.webp" alt="" width={240} height={360} className="lsec-br" style={{ width: "clamp(55px,12vw,100px)", height: "auto" }} />
          <div className="lwc">
            <div className="lwc-border-t" />
            <div className="lwc-border-b" />
            <p style={{ fontFamily:"'Dancing Script','Brush Script MT',cursive", fontSize:"clamp(11px,3vw,14px)", color:"rgb(108,74,46)", opacity:0.6, letterSpacing:"0.14em", textAlign:"center", marginBottom:20, textTransform:"uppercase" }}>
              a little note for you
            </p>
            <p style={{ fontFamily:"'Dancing Script','Brush Script MT',cursive", fontSize:"clamp(16px,4.5vw,22px)", color:"rgb(90,60,35)", lineHeight:1.8, textAlign:"center" }}>
              To the one who holds my heart — thank you for every laugh, every hug, every quiet moment that felt like the whole world.
            </p>
            <p style={{ fontFamily:"'Dancing Script','Brush Script MT',cursive", fontSize:"clamp(16px,4.5vw,22px)", color:"rgb(90,60,35)", lineHeight:1.8, textAlign:"center", marginTop:14 }}>
              You are my favourite person. Love you to the moon and back ♡
            </p>
            <p style={{ fontFamily:"'Dancing Script','Brush Script MT',cursive", fontSize:"clamp(14px,3.8vw,19px)", color:"rgb(108,74,46)", opacity:0.75, textAlign:"right", marginTop:24 }}>
              — Always Yours ♡
            </p>
          </div>
          <Link href="/love-gf" style={{
            marginTop:24, padding:"10px 28px", borderRadius:50, position:"relative", zIndex:2,
            border:"1.5px solid rgba(158,126,97,0.55)", background:"rgba(158,126,97,0.12)",
            fontFamily:"'Dancing Script','Brush Script MT',cursive", fontSize:"clamp(14px,3.8vw,17px)",
            fontWeight:600, color:"rgb(108,74,46)", cursor:"pointer", letterSpacing:"0.04em", textDecoration:"none",
          }}>
            ✦ Create yours ✦
          </Link>
        </div>
      )}

      {/* ── BOTTOM NAVBAR ── */}
      <nav className="lnav">
        {TABS.map((t) => {
          const active = t.id === tab;
          return (
            <button key={t.id} className="lnav-btn" onClick={() => setTab(t.id)}>
              <span className="lnav-icon">{t.icon}</span>
              <span className="lnav-label" style={{ color: active ? "rgb(108,74,46)" : "rgb(140,105,75)", fontWeight: active ? 700 : 400, opacity: active ? 1 : 0.55 }}>
                {t.label}
              </span>
              {active && <div className="lnav-dot" />}
            </button>
          );
        })}
      </nav>
    </>
  );
}
