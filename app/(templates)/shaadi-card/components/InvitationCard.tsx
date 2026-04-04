"use client";

/**
 * InvitationCard — animated 1080×1920 wedding invitation canvas.
 * Mobile: fills available screen height (below top nav, above bottom nav).
 * Desktop: centred card with blurred bg + info panels left / right.
 * SSR-safe: petals initialised in useEffect only.
 */

import Image from "next/image";
import { motion, useAnimation } from "framer-motion";
import { useEffect, useState } from "react";

/* ─── Canvas ──────────────────────────────────────────────────────────── */
const CW = 1080;
const CH = 1920;
/**
 * Pixel layout matched from Canva export (1080×1920 artboard, translate = left/top).
 * https://media-public… assets in the reference map to local /shaadi-card/* equivalents.
 */
const CANVA = {
  /** Top corners — compact inset so florals stay visible and don’t dominate the header */
  topFloral: { w: 380, h: 336, leftL: 14, top: 14, leftR: CW - 380 - 14 },
  theWeddingOf: { left: 288.701, top: 228.684, w: 523.216, h: 67.7806 },
  names: { left: 222.862, top: 325.464, w: 634.277, h: 330.325 },
  wreath: { left: (CW - 560) / 2, top: 534.663, w: 560, h: 325.126 },
  month: { left: 449.301, top: 865.789, w: 206.986, h: 43.945 },
  weekday: { left: 251.299, top: 924.841, w: 255.889, h: 54.1722 },
  dayNum: { left: 480.306, top: 909.734, w: 144.975, h: 84.3861 },
  time: { left: 625.281, top: 924.841, w: 190.644, h: 54.1722 },
  lineFlowerL: { left: 286.847, top: 999.892, w: 184.792, h: 63.1652 },
  year: { left: 449.301, top: 994.12, w: 206.986, h: 43.945 },
  lineFlowerR: { left: 639.86, top: 1006.48, w: 184.792, h: 63.1652 },
  address: { left: 222.862, top: 1098.99, w: 677.478, h: 43.2939 },
  mandap: { left: 280.556, top: 1189.4, w: 535.005, h: 613.027 },
  couple: { left: 387.513, top: 1352.06, w: 397.257, h: 605.239 },
  floralBottomL: { left: -221.288, top: 1447.05, w: 734.668, h: 613.141 },
  floralBottomR: { left: 513.379, top: 1447.05, w: 734.668, h: 613.141 },
} as const;

/* ─── Design tokens (Canva-style invite: cream + wine + soft rose) ───── */
const C_DARK   = "rgb(109,43,59)";
const C_MED    = "rgb(203,107,130)";
const C_SCRIPT = "rgb(171,28,62)";
const F_CINZEL  = "var(--font-cinzel), 'Cinzel', 'Times New Roman', serif";
const F_DANCING = "var(--font-dancing), 'Dancing Script', cursive";
const F_LORA    = "var(--font-lora), 'Lora', Georgia, serif";

/* ─── Easing ─────────────────────────────────────────────────────────── */
const EASE_OUT  = [0.22, 1, 0.36, 1] as const;
const SPRING_SM = { type: "spring", stiffness: 80,  damping: 15 } as const;
const SPRING_MD = { type: "spring", stiffness: 60,  damping: 13 } as const;
const SPRING_LG = { type: "spring", stiffness: 45,  damping: 12 } as const;

/* ─── Petals (SSR-safe; empty = static Canva-style canvas) ─────────────── */
interface Petal { id: number; x: number; delay: number; dur: number; size: number; hue: number }

/* ─── Date helpers ────────────────────────────────────────────────────── */
function formatWeddingDate(iso: string) {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) throw new Error("invalid");
    const day     = String(d.getDate()).padStart(2, "0");
    const month   = d.toLocaleString("en-IN", { month: "long" });
    const weekday = d.toLocaleString("en-IN", { weekday: "long" }).toUpperCase();
    const h       = d.getHours();
    const m       = d.getMinutes();
    const ampm    = h >= 12 ? "PM" : "AM";
    const h12     = h % 12 || 12;
    const hhmm    = `${h12}:${String(m).padStart(2, "0")}`;
    const timeLine =
      m === 0
        ? `${String(h12).padStart(2, "0")} ${ampm}`
        : `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;
    const timeLower = timeLine.toLowerCase();
    const weekdayLower = d.toLocaleString("en-IN", { weekday: "long" }).toLowerCase();
    return {
      day,
      month,
      weekday,
      weekdayLower,
      hhmm,
      ampm,
      year: String(d.getFullYear()),
      timeLine,
      timeLower,
    };
  } catch {
    return {
      day: "15",
      month: "April",
      weekday: "WEDNESDAY",
      weekdayLower: "wednesday",
      hhmm: "11:00",
      ampm: "AM",
      year: "2026",
      timeLine: "11 AM",
      timeLower: "11 am",
    };
  }
}

/* ─── Props ───────────────────────────────────────────────────────────── */
interface Props {
  brideName:   string;
  groomName:   string;
  weddingDate: string;
  venue:       string;
  blessing:    string;
}

export default function InvitationCard({ brideName, groomName, weddingDate, venue, blessing }: Props) {
  const [scale,   setScale]   = useState<number | null>(null);
  const [desktop, setDesktop] = useState(false);
  const [petals,  setPetals]  = useState<Petal[]>([]);
  const controls = useAnimation();
  const dateInfo = formatWeddingDate(weddingDate);
  const bride = brideName || "Ananya";
  const groom = groomName || "Arjun";
  const yearHalf = dateInfo.year.length >= 4
    ? [dateInfo.year.slice(0, 2), dateInfo.year.slice(2)] as [string, string]
    : [dateInfo.year, ""] as [string, string];

  /* ── scale calculation ─────────────────────────────────────────── */
  useEffect(() => {
    const update = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const isDesk = vw >= 1024;
      setDesktop(isDesk);
      if (isDesk) {
        const usableW = vw * 0.56;
        const usableH = vh * 0.90;
        setScale(Math.min(usableW / CW, usableH / CH));
      } else {
        // Mobile: card fills the FULL viewport (nav overlays on top)
        // Use width-based scale so card never overflows screen width
        const scaleW = vw / CW;
        const scaleH = vh / CH;
        setScale(Math.max(scaleW, scaleH));
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    setPetals([]);
  }, []);
  useEffect(() => { if (scale !== null) controls.start("visible"); }, [scale, controls]);

  if (scale === null) return <div style={{ width: "100vw", height: "100vh", background: "#FDFBF7" }} />;

  const W = Math.round(CW * scale);
  const H = Math.round(CH * scale);

  /** Phone: compact vertical stack, split title, glass date card — desktop keeps Canva coords */
  const phone = !desktop;
  const PL = phone
    ? {
        oyTitle: -12,
        oyNames: -4,
        oyDate: -100,
        oyYearLine: -100,
        oyAddress: -118,
        splitTitle: true,
        nameSize: 78,
        ampSize: 20,
        nameShadow:
          "0 1px 0 rgba(255,255,255,0.5), 0 6px 22px rgba(109,43,59,0.06), 0 18px 40px rgba(171,28,62,0.04)",
        titleLine1: 18,
        titleLine2: 14,
        titleLetter1: "0.32em",
        titleLetter2: "0.56em",
        titleBoxH: 72,
        namesBoxH: 220,
        monthFs: 35,
        rowFs: 42,
        dayFs: 46,
        yearFs: 36,
        addressFs: 31,
        blessingFs: 30,
        /** Lily wreath — scaled to sit in the gap between names and date row */
        wreathW: 472,
        wreathH: 158,
        wreathTop: 604,
      }
    : {
        oyTitle: 0,
        oyNames: 0,
        oyDate: 0,
        oyYearLine: 0,
        oyAddress: 0,
        blessingTop: 1142,
        splitTitle: false,
        nameSize: 128,
        ampSize: 32,
        nameShadow: "0 1px 0 rgba(255,255,255,0.35), 0 8px 28px rgba(171,28,62,0.06)",
        titleLine1: 52,
        titleLine2: 52,
        titleLetter1: "0.12em",
        titleLetter2: "0.12em",
        titleBoxH: CANVA.theWeddingOf.h,
        namesBoxH: 320,
        monthFs: 43,
        rowFs: 53,
        dayFs: 53,
        yearFs: 40,
        addressFs: 36,
        blessingFs: 38,
        wreathW: CANVA.wreath.w,
        wreathH: CANVA.wreath.h,
        wreathTop: CANVA.wreath.top,
      };

  /* ════════════════════════════════════════════════════════════════
     CARD CANVAS — shared between mobile + desktop
     ════════════════════════════════════════════════════════════════ */
  const cardCanvas = (
    <div style={{ width: W, height: H, overflow: "hidden", position: "relative", flexShrink: 0, borderRadius: 0 }}>
      {/* 1080×1920 inner canvas */}
      <div style={{ width: CW, height: CH, position: "absolute", top: 0, left: 0, transformOrigin: "0 0", transform: `scale(${scale})` }}>

        {petals.map((p) => (
          <motion.div key={p.id} className="pointer-events-none" style={{
            position: "absolute", zIndex: 50,
            width: p.size, height: p.size, left: `${p.x}%`, top: -p.size,
            borderRadius: "50%",
            background: `radial-gradient(circle at 35% 35%, hsl(${p.hue},92%,90%), hsl(${p.hue},76%,68%))`,
            filter: "blur(0.4px)",
          }}
            animate={{ y: "108vh", x: [0, 12, -8, 14, -5, 0], rotate: [0, 360], opacity: [0, 0.42, 0.42, 0.38, 0] }}
            transition={{ duration: p.dur, delay: p.delay, ease: "linear", opacity: { times: [0, 0.04, 0.5, 0.92, 1] } }}
          />
        ))}

        {/* ── BG + cream wash (Canva: white poster + soft pink) ── */}
        <motion.div style={{ position: "absolute", inset: 0 }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 1.4, ease: "easeOut" }}>
          <Image src="/shaadi-card/image10.webp" alt="" fill style={{ objectFit: "cover" }} priority />
        </motion.div>
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            pointerEvents: "none",
            background: "rgba(255, 255, 255, 0.38)",
            mixBlendMode: "soft-light",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 880,
            width: CW,
            height: CH - 880,
            zIndex: 2,
            pointerEvents: "none",
            background: "linear-gradient(to top, rgba(253, 244, 248, 0.35) 0%, transparent 55%)",
          }}
        />

        {/* Lower stack — Canva paint order: mandap → couple → bottom florals → top corners */}
        <motion.div
          style={{
            position: "absolute",
            left: CANVA.mandap.left,
            top: CANVA.mandap.top,
            width: CANVA.mandap.w,
            height: CANVA.mandap.h,
            zIndex: 10,
          }}
          initial={{ opacity: 0, y: 48 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING_LG, delay: 0.55 }}
        >
          <div style={{ position: "relative", width: "100%", height: "100%", filter: "saturate(1.02) contrast(0.98)" }}>
            <Image
              src="/shaadi-card/image9.png"
              alt="mandap"
              fill
              sizes="540px"
              style={{ objectFit: "contain", objectPosition: "50% 100%" }}
            />
          </div>
        </motion.div>

        <motion.div
          style={{
            position: "absolute",
            left: CANVA.couple.left,
            top: CANVA.couple.top,
            width: CANVA.couple.w,
            height: CANVA.couple.h,
            zIndex: 12,
          }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING_LG, delay: 0.7 }}
        >
          <div style={{ position: "relative", width: "100%", height: "100%", filter: "saturate(1.02) contrast(0.98)" }}>
            <Image
              src="/shaadi-card/image8.png"
              alt="couple"
              fill
              sizes="400px"
              style={{ objectFit: "contain", objectPosition: "50% 100%" }}
            />
          </div>
        </motion.div>

        <motion.div
          style={{
            position: "absolute",
            left: CANVA.floralBottomL.left,
            top: CANVA.floralBottomL.top,
            width: CANVA.floralBottomL.w,
            height: CANVA.floralBottomL.h,
            zIndex: 14,
            mixBlendMode: "multiply",
            opacity: 0.92,
          }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 0.92, y: 0 }}
          transition={{ ...SPRING_MD, delay: 0.85 }}
        >
          <div style={{ transform: "scaleX(-1)", width: "100%", height: "100%" }}>
            <div style={{ position: "relative", width: "100%", height: "100%" }}>
              <Image
                src="/shaadi-card/image7.webp"
                alt=""
                fill
                sizes="735px"
                style={{ objectFit: "contain", objectPosition: "left bottom" }}
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          style={{
            position: "absolute",
            left: CANVA.floralBottomR.left,
            top: CANVA.floralBottomR.top,
            width: CANVA.floralBottomR.w,
            height: CANVA.floralBottomR.h,
            zIndex: 14,
            mixBlendMode: "multiply",
            opacity: 0.92,
          }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 0.92, y: 0 }}
          transition={{ ...SPRING_MD, delay: 0.9 }}
        >
          <div style={{ position: "relative", width: "100%", height: "100%" }}>
            <Image
              src="/shaadi-card/image6.webp"
              alt=""
              fill
              sizes="735px"
              style={{ objectFit: "contain", objectPosition: "right bottom" }}
            />
          </div>
        </motion.div>

        <motion.div
          style={{
            position: "absolute",
            left: CANVA.topFloral.leftR,
            top: CANVA.topFloral.top,
            width: CANVA.topFloral.w,
            height: CANVA.topFloral.h,
            zIndex: 16,
            mixBlendMode: "multiply",
            opacity: 0.82,
          }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 0.82, y: 0 }}
          transition={{ ...SPRING_MD, delay: 0.2 }}
        >
          <div style={{ position: "relative", width: "100%", height: "100%" }}>
            <Image
              src="/shaadi-card/image4.webp"
              alt=""
              fill
              priority
              sizes="(max-width: 1024px) 42vw, 380px"
              style={{ objectFit: "contain", objectPosition: "right top" }}
            />
          </div>
        </motion.div>

        <motion.div
          style={{
            position: "absolute",
            left: CANVA.topFloral.leftL,
            top: CANVA.topFloral.top,
            width: CANVA.topFloral.w,
            height: CANVA.topFloral.h,
            zIndex: 16,
            mixBlendMode: "multiply",
            opacity: 0.82,
          }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 0.82, y: 0 }}
          transition={{ ...SPRING_MD, delay: 0.25 }}
        >
          <div style={{ transform: "scaleX(-1)", width: "100%", height: "100%" }}>
            <div style={{ position: "relative", width: "100%", height: "100%" }}>
              <Image
                src="/shaadi-card/image5.webp"
                alt=""
                fill
                priority
                sizes="(max-width: 1024px) 42vw, 380px"
                style={{ objectFit: "contain", objectPosition: "left top" }}
              />
            </div>
          </div>
        </motion.div>

        {/* Couple names — two-line stack + typographic & (no card-style chrome) */}
        <motion.h2
          style={{
            position: "absolute",
            left: CANVA.names.left,
            top: CANVA.names.top + PL.oyNames + (phone ? 16 : 36),
            width: CANVA.names.w,
            height: PL.namesBoxH,
            zIndex: 22,
            margin: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            boxSizing: "border-box",
            padding: phone ? "0 24px" : "0 16px",
            fontWeight: 700,
            color: C_SCRIPT,
            textAlign: "center",
          }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING_SM, delay: 0.35 }}
        >
          <span style={{
            display: "block",
            fontFamily: F_DANCING,
            fontSize: PL.nameSize,
            lineHeight: 1.08,
            textShadow: PL.nameShadow,
            letterSpacing: "-0.02em",
          }}>
            {bride}
          </span>
          <span
            style={{
              display: "block",
              margin: phone ? "6px 0 4px" : "8px 0 6px",
              fontFamily: F_CINZEL,
              fontSize: PL.ampSize,
              fontWeight: 400,
              color: C_MED,
              letterSpacing: "0.28em",
              lineHeight: 1,
              opacity: 0.92,
            }}
            aria-hidden
          >
            &
          </span>
          <span style={{
            display: "block",
            fontFamily: F_DANCING,
            fontSize: PL.nameSize,
            lineHeight: 1.08,
            textShadow: PL.nameShadow,
            letterSpacing: "-0.02em",
          }}>
            {groom}
          </span>
        </motion.h2>

        <motion.header
          style={{
            position: "absolute",
            left: CANVA.theWeddingOf.left,
            top: CANVA.theWeddingOf.top + PL.oyTitle,
            width: CANVA.theWeddingOf.w,
            height: PL.titleBoxH,
            zIndex: 23,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            margin: 0,
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.15, ease: EASE_OUT }}
        >
          {PL.splitTitle ? (
            <>
              <span style={{
                fontFamily: F_CINZEL,
                fontSize: PL.titleLine1,
                fontWeight: 300,
                color: C_MED,
                lineHeight: 1.15,
                textTransform: "uppercase",
                letterSpacing: PL.titleLetter1,
                opacity: 0.82,
                textShadow: "0 1px 0 rgba(255,255,255,0.55)",
              }}>
                The Wedding
              </span>
              <span style={{
                fontFamily: F_CINZEL,
                fontSize: PL.titleLine2,
                fontWeight: 300,
                color: C_MED,
                lineHeight: 1.2,
                textTransform: "uppercase",
                letterSpacing: "0.58em",
                paddingLeft: "0.58em",
                marginTop: 2,
                opacity: 0.7,
                textShadow: "0 1px 0 rgba(255,255,255,0.4)",
              }}>
                O F
              </span>
            </>
          ) : (
            <span style={{
              fontFamily: F_CINZEL,
              fontSize: PL.titleLine1,
              fontWeight: 400,
              color: C_MED,
              lineHeight: "68px",
              textTransform: "uppercase",
              letterSpacing: PL.titleLetter1,
              textShadow: "0 1px 0 rgba(255,255,255,0.35)",
            }}>
              The Wedding of
            </span>
          )}
        </motion.header>

        {/* White lily wreath — between title block and date; soft multiply into watercolor */}
        <motion.div
          aria-hidden
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...SPRING_SM, delay: 0.45 }}
          style={{
            position: "absolute",
            left: phone ? (CW - PL.wreathW) / 2 : CANVA.wreath.left,
            top: PL.wreathTop,
            width: PL.wreathW,
            height: PL.wreathH,
            zIndex: 21,
            mixBlendMode: "multiply",
            opacity: phone ? 0.9 : 0.92,
            pointerEvents: "none",
          }}
        >
          <div style={{ position: "relative", width: "100%", height: "100%", filter: "saturate(1.06) contrast(0.98)" }}>
            <Image
              src="/shaadi-card/image1.webp"
              alt=""
              fill
              sizes={phone ? "(max-width: 1024px) 60vw, 472px" : "560px"}
              style={{ objectFit: "contain", objectPosition: "center bottom" }}
            />
          </div>
        </motion.div>

        {/* Mobile: date / place / blessing — text only, painted on the invite (no card, no panel) */}
        {phone ? (
          <motion.article
            aria-label="Wedding date, time, and location"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.52, ease: EASE_OUT }}
            style={{
              position: "absolute",
              left: 36,
              top: CANVA.month.top + PL.oyDate,
              width: CW - 72,
              zIndex: 24,
              textAlign: "center",
              pointerEvents: "none",
            }}
          >
            <p style={{
              margin: 0,
              fontFamily: F_CINZEL,
              fontSize: 26,
              fontWeight: 500,
              color: C_MED,
              letterSpacing: "0.38em",
              textTransform: "uppercase",
              lineHeight: 1.25,
              textShadow: "0 1px 0 rgba(255,255,255,0.75)",
            }}>
              {dateInfo.month}
            </p>
            <p style={{
              margin: "18px 0 0",
              fontFamily: F_LORA,
              fontSize: 34,
              fontWeight: 700,
              color: C_DARK,
              lineHeight: 1.3,
              textShadow: "0 1px 1px rgba(255,255,255,0.85)",
            }}>
              <span style={{ fontWeight: 700 }}>{dateInfo.weekdayLower}</span>
              <span style={{
                display: "inline-block",
                margin: "0 14px",
                fontSize: 48,
                fontWeight: 700,
                color: C_MED,
                letterSpacing: "-0.03em",
                lineHeight: 1,
              }}>
                {dateInfo.day}
              </span>
              <span style={{ fontWeight: 700 }}>{dateInfo.timeLower}</span>
            </p>
            <p style={{
              margin: "20px 0 0",
              fontFamily: F_LORA,
              fontSize: 40,
              fontWeight: 400,
              color: C_DARK,
              lineHeight: 1.22,
              letterSpacing: "0.05em",
              textShadow: "0 1px 0 rgba(255,255,255,0.75)",
            }}>
              {yearHalf[1] ? (
                <>
                  <span style={{ fontWeight: 300, opacity: 0.78 }}>{yearHalf[0]}</span>
                  <span style={{ margin: "0 10px", color: "rgba(109,43,59,0.38)", fontWeight: 300, fontSize: "0.95em" }}>|</span>
                  <span style={{ fontWeight: 600, color: C_SCRIPT }}>{yearHalf[1]}</span>
                </>
              ) : (
                dateInfo.year
              )}
            </p>
            <p style={{
              margin: "20px 0 0",
              fontFamily: F_LORA,
              fontSize: 30,
              fontWeight: 500,
              color: C_DARK,
              letterSpacing: "0.14em",
              lineHeight: 1.4,
              textShadow: "0 1px 1px rgba(255,255,255,0.8)",
            }}>
              {venue || "Udaipur"}
            </p>
            <p style={{
              margin: "16px 0 0",
              fontFamily: F_DANCING,
              fontSize: 34,
              fontWeight: 700,
              color: C_SCRIPT,
              lineHeight: 1.35,
              opacity: 0.96,
            }}>
              {blessing || "ॐ शुभ विवाह"}
            </p>
          </motion.article>
        ) : null}

        {!phone ? (
        <motion.div
          style={{
            position: "absolute",
            left: CANVA.month.left,
            top: CANVA.month.top + PL.oyDate,
            width: CANVA.month.w,
            height: CANVA.month.h,
            zIndex: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.55, delay: 0.65 }}
        >
          <p style={{
            margin: 0,
            fontFamily: F_LORA,
            fontSize: PL.monthFs,
            fontWeight: 400,
            color: C_DARK,
            lineHeight: "60px",
            letterSpacing: "0",
          }}>
            {dateInfo.month}
          </p>
        </motion.div>
        ) : null}

        {!phone ? (
        <motion.div
          style={{
            position: "absolute",
            left: CANVA.weekday.left,
            top: CANVA.weekday.top + PL.oyDate,
            width: CANVA.weekday.w,
            height: CANVA.weekday.h,
            zIndex: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            paddingRight: 4,
            boxSizing: "border-box",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.55, delay: 0.72 }}
        >
          <p style={{
            margin: 0,
            fontFamily: F_LORA,
            fontSize: PL.rowFs,
            fontWeight: 700,
            color: C_DARK,
            lineHeight: "74px",
            textTransform: "lowercase",
            letterSpacing: "0",
          }}>
            {dateInfo.weekdayLower}
          </p>
        </motion.div>
        ) : null}

        {!phone ? (
        <motion.div
          style={{
            position: "absolute",
            left: CANVA.dayNum.left,
            top: CANVA.dayNum.top + PL.oyDate,
            width: CANVA.dayNum.w,
            height: CANVA.dayNum.h,
            zIndex: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.55, delay: 0.78 }}
        >
          <p style={{
            margin: 0,
            fontFamily: F_LORA,
            fontSize: PL.dayFs,
            fontWeight: 700,
            color: C_MED,
            lineHeight: "74px",
            textTransform: "uppercase",
            textShadow: "none",
          }}>
            {dateInfo.day}
          </p>
        </motion.div>
        ) : null}

        {!phone ? (
        <motion.div
          style={{
            position: "absolute",
            left: CANVA.time.left,
            top: CANVA.time.top + PL.oyDate,
            width: CANVA.time.w,
            height: CANVA.time.h,
            zIndex: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            paddingLeft: 4,
            boxSizing: "border-box",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.55, delay: 0.84 }}
        >
          <p style={{
            margin: 0,
            fontFamily: F_LORA,
            fontSize: PL.rowFs,
            fontWeight: 700,
            color: C_DARK,
            lineHeight: "74px",
            textTransform: "lowercase",
            letterSpacing: "0",
          }}>
            {dateInfo.timeLower}
          </p>
        </motion.div>
        ) : null}

        {/* Year — desktop: split lockup */}
        {!phone ? (
        <motion.p
          style={{
            position: "absolute",
            left: (CW - 320) / 2,
            top: CANVA.year.top + PL.oyYearLine,
            width: 320,
            minHeight: 72,
            zIndex: 24,
            margin: 0,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: yearHalf[1] ? 20 : 0,
          }}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.88, duration: 0.45, ease: EASE_OUT }}
        >
          {yearHalf[1] ? (
            <>
              <span style={{
                fontFamily: F_LORA,
                fontSize: PL.yearFs + 6,
                fontWeight: 300,
                color: C_DARK,
                letterSpacing: "0.12em",
                lineHeight: 1,
                opacity: 0.88,
              }}>
                {yearHalf[0]}
              </span>
              <span
                aria-hidden
                style={{
                  width: 2,
                  height: 42,
                  borderRadius: 2,
                  background: "linear-gradient(180deg, rgba(203,107,130,0), rgba(203,107,130,0.55), rgba(203,107,130,0))",
                  boxShadow: "0 0 12px rgba(203,107,130,0.25)",
                }}
              />
              <span style={{
                fontFamily: F_LORA,
                fontSize: PL.yearFs + 6,
                fontWeight: 600,
                color: C_SCRIPT,
                letterSpacing: "0.06em",
                lineHeight: 1,
              }}>
                {yearHalf[1]}
              </span>
            </>
          ) : (
            <span style={{
              fontFamily: F_LORA,
              fontSize: PL.yearFs + 6,
              fontWeight: 500,
              color: C_DARK,
              letterSpacing: "0.1em",
              lineHeight: 1,
            }}>
              {dateInfo.year}
            </span>
          )}
        </motion.p>
        ) : null}

        {!phone ? (
        <motion.div
          style={{
            position: "absolute",
            left: CANVA.address.left,
            top: CANVA.address.top + PL.oyAddress,
            width: CANVA.address.w,
            minHeight: CANVA.address.h,
            zIndex: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          <p style={{
            margin: 0,
            textAlign: "center",
            fontFamily: F_LORA,
            fontSize: PL.addressFs,
            fontWeight: 400,
            color: C_DARK,
            lineHeight: "48px",
            padding: "0 12px",
            letterSpacing: "0",
          }}>
            {venue || "123 Anywhere St., Any City, ST 12345"}
          </p>
        </motion.div>
        ) : null}

        {!phone ? (
        <motion.div
          style={{
            position: "absolute",
            left: CANVA.address.left,
            top: PL.blessingTop,
            width: CANVA.address.w,
            zIndex: 25,
          }}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 1.08 }}
        >
          <p style={{
            margin: 0,
            textAlign: "center",
            fontFamily: F_DANCING,
            fontSize: PL.blessingFs,
            fontWeight: 700,
            color: C_SCRIPT,
            lineHeight: "48px",
            opacity: 0.92,
            letterSpacing: "0",
            textShadow: "none",
          }}>
            {blessing || "ॐ शुभ विवाह"}
          </p>
        </motion.div>
        ) : null}

      </div>{/* /inner canvas */}
    </div>
  );

  /* ════════════════════════════════════════════════════════════════
     MOBILE LAYOUT
     ════════════════════════════════════════════════════════════════ */
  if (!desktop) {
    return (
      /* fixed inset-0 → always covers the full screen, no centering gaps */
      <div style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        background: "#FDFBF7",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        {/* Canvas is always >= viewport in both dimensions (Math.max scale) */}
        {cardCanvas}
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════════════
     DESKTOP LAYOUT — beautifully centred card, watercolor background
     ════════════════════════════════════════════════════════════════ */
  return (
    <div style={{
      width: "100%", height: "100vh", minHeight: "100dvh", overflow: "hidden",
      display: "flex", alignItems: "center", justifyContent: "center",
      position: "relative",
    }}>
      {/* Crisp watercolor background */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0,
        backgroundImage: "url(/shaadi-card/image10.webp)",
        backgroundSize: "cover", backgroundPosition: "center top",
      }} />
      {/* Soft white wash */}
      <div style={{ position: "absolute", inset: 0, zIndex: 1, background: "rgba(255,252,250,0.46)" }} />
      {/* Top fade */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 2, height: 140,
        background: "linear-gradient(to bottom, rgba(253,248,244,0.88), transparent)" }} />
      {/* Bottom fade */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 2, height: 180,
        background: "linear-gradient(to top, rgba(253,248,244,0.92), transparent)" }} />

      {/* Corner florals */}
      <div style={{ position: "absolute", top: 0, left: 0, zIndex: 3, width: 260, height: 240, opacity: 0.9, mixBlendMode: "multiply", pointerEvents: "none" }}>
        <div style={{ position: "relative", width: "100%", height: "100%", transform: "scaleX(-1)" }}>
          <Image src="/shaadi-card/image5.webp" alt="" fill style={{ objectFit: "contain", objectPosition: "left top" }} />
        </div>
      </div>
      <div style={{ position: "absolute", top: 0, right: 0, zIndex: 3, width: 260, height: 240, opacity: 0.9, mixBlendMode: "multiply", pointerEvents: "none" }}>
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
          <Image src="/shaadi-card/image4.webp" alt="" fill style={{ objectFit: "contain", objectPosition: "right top" }} />
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 0, left: 0, zIndex: 3, width: 280, height: 240, opacity: 0.85, mixBlendMode: "multiply", pointerEvents: "none" }}>
        <div style={{ position: "relative", width: "100%", height: "100%", transform: "scaleX(-1)" }}>
          <Image src="/shaadi-card/image7.webp" alt="" fill style={{ objectFit: "contain", objectPosition: "left bottom" }} />
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 0, right: 0, zIndex: 3, width: 280, height: 240, opacity: 0.85, mixBlendMode: "multiply", pointerEvents: "none" }}>
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
          <Image src="/shaadi-card/image6.webp" alt="" fill style={{ objectFit: "contain", objectPosition: "right bottom" }} />
        </div>
      </div>

      {/* Centred invitation card */}
      <motion.div
        style={{ position: "relative", zIndex: 10 }}
        initial={{ opacity: 0, y: 36, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.95, ease: EASE_OUT }}
      >
        <div style={{ boxShadow: "0 32px 90px rgba(109,43,59,0.28), 0 10px 30px rgba(109,43,59,0.14)", overflow: "hidden" }}>
          {cardCanvas}
        </div>
      </motion.div>
    </div>
  );
}
