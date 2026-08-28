"use client";

import Image from "next/image";
import { useRef, useEffect, useState, useCallback } from "react";
import type { BirthdayData } from "./types";

const ASSETS = "https://cdn.subhsandesh.in/gifts-media/assets/Birthday1";

const CW = 1080;
const CH = 1920;
const NAV_H = 76;

/* The wish block is the only free-text element on the cover, so it is the one
   that decides how tall the canvas has to be. Everything below it is decorative
   and gets anchored to the canvas bottom so the frame survives the stretch. */
const WISH_TOP = 1610;
const WISH_PAD_BOTTOM = 100;

/* The name is centred on the canvas (100 + 880/2 === 1080/2), so widening the box
   only buys room for long names — short ones sit exactly where they always did. */
const NAME_LEFT = 100;
const NAME_W = 880;
const NAME_SIZE_MAX = 52;
const NAME_SIZE_MIN = 24;

interface Props {
  data: BirthdayData;
  isPersonalized: boolean;
}

export default function HomeSection({ data, isPersonalized }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const wishRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLSpanElement>(null);
  const [dims, setDims] = useState({ w: 390, h: 844 });
  const [wishH, setWishH] = useState(0);
  const [nameSize, setNameSize] = useState(NAME_SIZE_MAX);
  const [scrolled, setScrolled] = useState(false);

  const name =
    (isPersonalized ? data.recipientName : "Samira Hadid") || "Samira Hadid";
  const wish =
    (isPersonalized ? data.birthdayWish : "") ||
    "Wishing you a birthday filled with love, laughter, and cherished memories to last a lifetime.";

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

  /* offsetHeight is layout px — the scaled ancestor transform does not touch it,
     so this is already in 1080x1920 canvas units. Re-runs on every wish edit, and
     again once the webfont swaps in, since Cormorant reflows the block. */
  useEffect(() => {
    const el = wishRef.current;
    if (!el) return;
    let alive = true;
    const measure = () => {
      if (!alive) return;
      setWishH((prev) => (Math.abs(el.offsetHeight - prev) > 0.5 ? el.offsetHeight : prev));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    const raf = requestAnimationFrame(measure);
    document.fonts?.ready?.then(measure).catch(() => {});
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [wish]);

  /* The name is set on a single line by design — wrapping drops it behind the washi
     tape and the polaroid. The probe span below is always laid out at NAME_SIZE_MAX,
     and text width is linear in font-size, so one measurement gives the exact fit
     with no feedback loop between the measurement and the size it produces. */
  useEffect(() => {
    const el = nameRef.current;
    if (!el) return;
    let alive = true;
    const fit = () => {
      if (!alive) return;
      const natural = el.offsetWidth; // layout px — the scaled ancestor does not affect it
      if (!natural) return;
      setNameSize(
        Math.max(
          NAME_SIZE_MIN,
          Math.min(NAME_SIZE_MAX, Math.floor((NAME_SIZE_MAX * NAME_W) / natural)),
        ),
      );
    };
    fit();
    const raf = requestAnimationFrame(fit);
    document.fonts?.ready?.then(fit).catch(() => {});
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
    };
  }, [name]);

  const isMobile = dims.h > dims.w;
  const padBot = isMobile ? NAV_H : 0;
  const availH = dims.h - padBot;

  /* Scale stays pinned to the *designed* 1920 frame, so a long wish never
     shrinks the artwork — it lengthens the page instead. */
  const scale = Math.min(dims.w / CW, availH / CH);
  const contentH = Math.max(CH, WISH_TOP + wishH + WISH_PAD_BOTTOM);
  const scaledH = contentH * scale;
  const needsScroll = scaledH > availH + 1;

  const offsetX = dims.w / 2 - (CW * scale) / 2;
  const offsetY = needsScroll ? 0 : (availH - scaledH) / 2;

  const onScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrolled(e.currentTarget.scrollTop > 12);
  }, []);

  const cover = data.homeCoverPhoto;
  const coverSrc = cover?.url || "";
  const coverPos = `${cover?.cropX ?? 50}% ${cover?.cropY ?? 50}%`;
  const coverScl = (cover?.scale ?? 100) / 100;

  const photo1 = data.homePhoto1 || "";
  const photo2 = data.homePhoto2 || "";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Cormorant+Garamond:ital,wght@0,400;1,400;1,500&family=Great+Vibes&display=swap');
        @keyframes bgf-home-hint {
          0%, 100% { transform: translateY(0); opacity: 0.85; }
          50%      { transform: translateY(5px); opacity: 1; }
        }
        .bgf-home-scroll::-webkit-scrollbar { width: 0; height: 0; }
        /* the bottom flora is drawn bleeding off the page edge — clipping it here
           keeps it from adding dead scroll length past the last line of the wish */
        .bgf-home-page { overflow: hidden; }
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
        {/* ── Background — stays put while the cover scrolls ── */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <Image
            src={`${ASSETS}/backgorundImage.webp`}
            alt=""
            fill
            style={{ objectFit: "cover" }}
            priority
          />
        </div>

        {/* ── Scroll viewport (only actually scrolls when the wish overflows) ── */}
        <div
          className="bgf-home-scroll"
          onScroll={onScroll}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            overflowY: needsScroll ? "auto" : "hidden",
            overflowX: "hidden",
            WebkitOverflowScrolling: "touch",
            overscrollBehavior: "contain",
            scrollbarWidth: "none",
          }}
        >
          <div
            className="bgf-home-page"
            style={{
              position: "relative",
              width: "100%",
              height: needsScroll ? scaledH + padBot : "100%",
            }}
          >
            {/* ── Scaled 1080-wide canvas for content ── */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: CW,
                height: contentH,
                transformOrigin: "top left",
                transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`,
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

              {/* ── Bottom-right botanical plant (mirrored) — anchored to canvas bottom ── */}
              <div
                style={{
                  position: "absolute",
                  left: 696,
                  bottom: -688,
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

              {/* ── Bottom-left small pressed flower — anchored to canvas bottom ── */}
              <div
                style={{
                  position: "absolute",
                  left: 36,
                  bottom: 139,
                  width: 152,
                  height: 153,
                  zIndex: 7,
                  pointerEvents: "none",
                }}
              >
                <Image src={`${ASSETS}/bottomflower2.webp`} alt="" fill
                  style={{ objectFit: "contain" }} />
              </div>

              {/* ── Bottom-left large pressed flower — anchored to canvas bottom ── */}
              <div
                style={{
                  position: "absolute",
                  left: 86,
                  bottom: -150,
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
                  left: NAME_LEFT,
                  top: 533,
                  width: NAME_W,
                  fontFamily: "'Abril Fatface', Georgia, serif",
                  fontWeight: 400,
                  fontSize: nameSize,
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

              {/* ── Off-screen probe: the name at full size, so the fit is measured once ── */}
              <span
                ref={nameRef}
                aria-hidden
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  visibility: "hidden",
                  pointerEvents: "none",
                  display: "inline-block",
                  whiteSpace: "nowrap",
                  fontFamily: "'Abril Fatface', Georgia, serif",
                  fontWeight: 400,
                  fontSize: NAME_SIZE_MAX,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                }}
              >
                {name.toUpperCase()}
              </span>

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

              {/* ── Birthday wish text — grows the canvas instead of being clipped ── */}
              <div
                ref={wishRef}
                style={{
                  position: "absolute",
                  left: 200,
                  top: WISH_TOP,
                  width: 680,
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontStyle: "italic",
                  fontWeight: 400,
                  fontSize: 50,
                  color: "#2A1A10",
                  lineHeight: 1.35,
                  letterSpacing: "-0.01em",
                  textAlign: "center",
                  whiteSpace: "pre-wrap",
                  overflowWrap: "anywhere",
                  zIndex: 6,
                }}
              >
                {wish}
              </div>
            </div>
          </div>
        </div>

        {/* ── Scroll affordance — only while there is more to see ── */}
        {needsScroll && !scrolled && (
          <div
            aria-hidden
            style={{
              position: "absolute",
              left: "50%",
              bottom: padBot + 14,
              transform: "translateX(-50%)",
              zIndex: 2,
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 14px",
              borderRadius: 999,
              background: "linear-gradient(135deg, #AD684A 0%, #5D3F31 100%)",
              boxShadow: "0 4px 16px rgba(93,63,49,0.30)",
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontStyle: "italic",
              fontSize: 13,
              color: "#FFF8EE",
              pointerEvents: "none",
              animation: "bgf-home-hint 1.8s ease-in-out infinite",
            }}
          >
            scroll for more
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
          </div>
        )}
      </div>
    </>
  );
}
