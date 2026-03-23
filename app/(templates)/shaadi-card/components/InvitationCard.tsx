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

/* ─── Bottom nav height on mobile (px) ───────────────────────────────── */
const MOBILE_NAV_H = 68;

/* ─── Design tokens ──────────────────────────────────────────────────── */
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

/* ─── Petal seeds (SSR-safe) ──────────────────────────────────────────── */
interface Petal { id: number; x: number; delay: number; dur: number; size: number; hue: number }
const PETAL_SEEDS: Omit<Petal, "id">[] = [
  { x: 4,  delay: 0.0, dur: 7.5, size: 7,  hue: 340 },
  { x: 11, delay: 1.3, dur: 8.0, size: 9,  hue: 350 },
  { x: 21, delay: 2.6, dur: 6.8, size: 6,  hue: 330 },
  { x: 29, delay: 0.5, dur: 9.0, size: 10, hue: 345 },
  { x: 39, delay: 1.9, dur: 7.2, size: 7,  hue: 355 },
  { x: 47, delay: 3.2, dur: 8.5, size: 8,  hue: 338 },
  { x: 57, delay: 0.8, dur: 6.5, size: 6,  hue: 348 },
  { x: 64, delay: 2.1, dur: 9.2, size: 9,  hue: 332 },
  { x: 73, delay: 1.0, dur: 7.8, size: 7,  hue: 342 },
  { x: 81, delay: 3.5, dur: 8.2, size: 8,  hue: 358 },
  { x: 89, delay: 0.4, dur: 7.0, size: 6,  hue: 335 },
  { x: 95, delay: 2.8, dur: 6.9, size: 10, hue: 352 },
  { x: 16, delay: 4.0, dur: 8.8, size: 7,  hue: 340 },
  { x: 52, delay: 1.5, dur: 7.4, size: 9,  hue: 347 },
  { x: 77, delay: 4.5, dur: 8.1, size: 6,  hue: 336 },
];

interface SparkDot { id: number; x: number; y: number; delay: number; sz: number }
const SPARKS: SparkDot[] = [
  { id: 0, x: 13, y: 28, delay: 0.0, sz: 9  },
  { id: 1, x: 83, y: 24, delay: 0.9, sz: 11 },
  { id: 2, x: 22, y: 52, delay: 1.7, sz: 7  },
  { id: 3, x: 76, y: 47, delay: 0.4, sz: 10 },
  { id: 4, x: 9,  y: 74, delay: 2.1, sz: 8  },
  { id: 5, x: 89, y: 68, delay: 1.2, sz: 7  },
  { id: 6, x: 45, y: 36, delay: 2.5, sz: 9  },
  { id: 7, x: 57, y: 82, delay: 1.4, sz: 6  },
  { id: 8, x: 33, y: 17, delay: 0.7, sz: 11 },
  { id: 9, x: 66, y: 91, delay: 1.9, sz: 8  },
];

/* ─── Decorative SVG ──────────────────────────────────────────────────── */
function LineFlower({ flip }: { flip?: boolean }) {
  return (
    <svg width="185" height="63" viewBox="0 0 185 63" fill="none"
      style={{ display: "block", transform: flip ? "scaleX(-1)" : undefined }}>
      <g transform="translate(28,31)">
        {[0, 72, 144, 216, 288].map((a) => (
          <g key={a} transform={`rotate(${a})`}>
            <ellipse cx="0" cy="-10.5" rx="5.5" ry="9"
              fill="none" stroke="#cb6b82" strokeWidth="1.35" />
          </g>
        ))}
        <circle cx="0" cy="0" r="4.5" fill="none" stroke="#cb6b82" strokeWidth="1.2" />
        <circle cx="0" cy="0" r="2"   fill="#cb6b82" opacity="0.9" />
      </g>
      <path d="M46 31 Q80 26 114 31 Q140 36 172 29"
        stroke="#cb6b82" strokeWidth="1.2" strokeLinecap="round" />
      <g transform="translate(114,22)">
        {[0, 90, 180, 270].map((a) => (
          <g key={a} transform={`rotate(${a})`}>
            <ellipse cx="0" cy="-5.5" rx="3" ry="5"
              fill="none" stroke="#cb6b82" strokeWidth="1" opacity="0.65" />
          </g>
        ))}
        <circle cx="0" cy="0" r="2" fill="#cb6b82" opacity="0.55" />
      </g>
    </svg>
  );
}

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
    return { day, month, weekday, hhmm, ampm, year: String(d.getFullYear()) };
  } catch {
    return { day: "15", month: "April", weekday: "WEDNESDAY", hhmm: "11:00", ampm: "AM", year: "2026" };
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
  const [availH,  setAvailH]  = useState(0);
  const [petals,  setPetals]  = useState<Petal[]>([]);
  const controls = useAnimation();
  const dateInfo = formatWeddingDate(weddingDate);

  /* ── scale calculation ─────────────────────────────────────────── */
  useEffect(() => {
    const update = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const isDesk = vw >= 1024;
      setDesktop(isDesk);
      if (isDesk) {
        // Desktop: card fits in 44% of sidebar-adjusted width, 88% of height
        const usableW = (vw - 256) * 0.44;
        const usableH = vh * 0.88;
        setScale(Math.min(usableW / CW, usableH / CH));
        setAvailH(vh);
      } else {
        // Mobile: card fills the FULL viewport (nav overlays on top)
        // Use width-based scale so card never overflows screen width
        const scaleW = vw / CW;
        const scaleH = vh / CH;
        setScale(Math.max(scaleW, scaleH));
        setAvailH(vh);
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => { setPetals(PETAL_SEEDS.map((p, i) => ({ ...p, id: i }))); }, []);
  useEffect(() => { if (scale !== null) controls.start("visible"); }, [scale, controls]);

  if (scale === null) return <div style={{ width: "100vw", height: "100vh", background: "#FDF5F0" }} />;

  const W = Math.round(CW * scale);
  const H = Math.round(CH * scale);

  /* ════════════════════════════════════════════════════════════════
     CARD CANVAS — shared between mobile + desktop
     ════════════════════════════════════════════════════════════════ */
  const cardCanvas = (
    <div style={{ width: W, height: H, overflow: "hidden", position: "relative", flexShrink: 0, borderRadius: desktop ? 16 : 0 }}>
      {/* 1080×1920 inner canvas */}
      <div style={{ width: CW, height: CH, position: "absolute", top: 0, left: 0, transformOrigin: "0 0", transform: `scale(${scale})` }}>

        {/* ── Falling petals ── */}
        {petals.map((p) => (
          <motion.div key={p.id} className="pointer-events-none" style={{
            position: "absolute", zIndex: 50,
            width: p.size, height: p.size, left: `${p.x}%`, top: -p.size,
            borderRadius: "50%",
            background: `radial-gradient(circle at 35% 35%, hsl(${p.hue},92%,90%), hsl(${p.hue},76%,68%))`,
            filter: "blur(0.4px)",
          }}
            animate={{ y: "108vh", x: [0, 18, -12, 22, -8, 0], rotate: [0, 360], opacity: [0, 0.9, 0.9, 0.9, 0] }}
            transition={{ duration: p.dur, delay: p.delay, ease: "linear", opacity: { times: [0, 0.04, 0.5, 0.92, 1] } }}
          />
        ))}

        {/* ── Sparkles ── */}
        {SPARKS.map((s) => (
          <motion.div key={s.id} style={{ position: "absolute", zIndex: 40, left: `${s.x}%`, top: `${s.y}%`, pointerEvents: "none" }}
            animate={{ scale: [0, 1.3, 0.8, 1.1, 0], opacity: [0, 1, 0.6, 0.9, 0], rotate: [0, 45, 90, 135, 180] }}
            transition={{ duration: 2, delay: s.delay + 1.5, ease: "easeInOut" }}>
            <svg width={s.sz} height={s.sz} viewBox="0 0 20 20">
              <path d="M10 0L11.8 8.2L20 10L11.8 11.8L10 20L8.2 11.8L0 10L8.2 8.2Z" fill="#db7093" opacity="0.78" />
            </svg>
          </motion.div>
        ))}

        {/* ── BG ── */}
        <motion.div style={{ position: "absolute", inset: 0 }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 1.4, ease: "easeOut" }}>
          <Image src="/shaadi-card/image10.webp" alt="" fill style={{ objectFit: "cover" }} priority />
        </motion.div>

        {/* ── Bottom-right blossoms — top=1300 anchored at canvas bottom ── */}
        <motion.div style={{ position: "absolute", left: 390, top: 1220, width: 850, height: 700, mixBlendMode: "multiply", zIndex: 5 }}
          initial={{ opacity: 0, x: 140, y: 80 }} animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ ...SPRING_LG, delay: 3.5 }}>
          <div style={{ position: "relative", width: "100%", height: "100%" }}>
            <Image src="/shaadi-card/image6.webp" alt="" fill style={{ objectFit: "contain" }} />
          </div>
        </motion.div>

        {/* ── Bottom-left blossoms (mirrored) ── */}
        <motion.div style={{ position: "absolute", left: -160, top: 1220, width: 850, height: 700, mixBlendMode: "multiply", zIndex: 5 }}
          initial={{ opacity: 0, x: -140, y: 80 }} animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ ...SPRING_LG, delay: 3.6 }}>
          <div style={{ transform: "scaleX(-1)", width: "100%", height: "100%" }}>
            <div style={{ position: "relative", width: "100%", height: "100%" }}>
              <Image src="/shaadi-card/image7.webp" alt="" fill style={{ objectFit: "contain" }} />
            </div>
          </div>
        </motion.div>

        {/* ── Mandap — top=1020, height=900 → bottom=1920, 290px taller than before ── */}
        <motion.div style={{ position: "absolute", left: 180, top: 1020, width: 720, height: 900, zIndex: 10 }}
          initial={{ opacity: 0, y: 120 }} animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING_LG, delay: 3.0 }}>
          <motion.div style={{ position: "relative", width: "100%", height: "100%" }}
            animate={{ y: [0, -14, 0] }} transition={{ duration: 4.5, ease: "easeInOut", delay: 4.2, repeat: Infinity }}>
            <Image src="/shaadi-card/image9.png" alt="mandap" fill style={{ objectFit: "contain" }} />
          </motion.div>
        </motion.div>

        {/* ── Couple — top=1210, width=560, height=710 → centred inside mandap ── */}
        <motion.div style={{ position: "absolute", left: 260, top: 1210, width: 560, height: 710, zIndex: 15 }}
          initial={{ opacity: 0, y: 120 }} animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING_LG, delay: 3.3 }}>
          <motion.div style={{ position: "relative", width: "100%", height: "100%" }}
            animate={{ y: [0, -10, 0] }} transition={{ duration: 5, ease: "easeInOut", delay: 4.5, repeat: Infinity }}>
            <Image src="/shaadi-card/image8.png" alt="couple" fill style={{ objectFit: "contain" }} />
          </motion.div>
        </motion.div>

        {/* ── Top-right corner bouquet ── */}
        <motion.div style={{ position: "absolute", left: 760, top: -20, width: 320, height: 290, mixBlendMode: "multiply" }}
          initial={{ opacity: 0, x: 60, y: -60, scale: 0.8 }} animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          transition={{ ...SPRING_MD, delay: 0.3 }}>
          <div style={{ position: "relative", width: "100%", height: "100%" }}>
            <Image src="/shaadi-card/image4.webp" alt="" fill priority style={{ objectFit: "contain", objectPosition: "left top" }} />
          </div>
        </motion.div>

        {/* ── Top-left corner bouquet (mirrored) ── */}
        <motion.div style={{ position: "absolute", left: 0, top: -20, width: 320, height: 290, mixBlendMode: "multiply" }}
          initial={{ opacity: 0, x: -60, y: -60, scale: 0.8 }} animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          transition={{ ...SPRING_MD, delay: 0.4 }}>
          <div style={{ transform: "scaleX(-1)", width: "100%", height: "100%" }}>
            <div style={{ position: "relative", width: "100%", height: "100%" }}>
              <Image src="/shaadi-card/image5.webp" alt="" fill priority style={{ objectFit: "contain", objectPosition: "left top" }} />
            </div>
          </div>
        </motion.div>

        {/* ── "THE WEDDING OF" ── delay 0.7s */}
        <motion.div style={{ position: "absolute", left: 0, top: 155, width: 1080 }}
          initial={{ opacity: 0, y: 28, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.7, ease: EASE_OUT }}>
          <p style={{
            margin: 0, textAlign: "center",
            fontFamily: F_CINZEL, fontSize: 64, fontWeight: 400,
            color: C_MED, lineHeight: "84px",
            textTransform: "uppercase", letterSpacing: "0.06em",
          }}>
            The Wedding of
          </p>
        </motion.div>

        {/* ── Names ── delay 1.0s */}
        <motion.div style={{ position: "absolute", left: 0, top: 254, width: 1080 }}
          initial={{ opacity: 0, scale: 0.75, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ ...SPRING_SM, delay: 1.0 }}>
          <p style={{
            margin: 0, textAlign: "center",
            fontFamily: F_DANCING, fontSize: 160, fontWeight: 700,
            color: C_SCRIPT, lineHeight: "140px",
          }}>
            {brideName || "Ananya"}&nbsp;&amp;<br />{groomName || "Arjun"}
          </p>
        </motion.div>

        {/* ── Lily wreath — compact: h:220 ── delay 1.6s */}
        <motion.div style={{ position: "absolute", left: 310, top: 516, width: 460, height: 220, mixBlendMode: "multiply" }}
          initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ ...SPRING_SM, delay: 1.6 }}>
          <motion.div style={{ position: "relative", width: "100%", height: "100%" }}
            animate={{ scale: [1, 1.04, 1], y: [0, -8, 0] }}
            transition={{ duration: 5, ease: "easeInOut", delay: 2.8, repeat: Infinity }}>
            <Image src="/shaadi-card/image1.webp" alt="lily wreath" fill style={{ objectFit: "contain" }} />
          </motion.div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════
            DATE SECTION — compact, centred on x=540
            Month → [WEEKDAY | BIG-DATE | HH:MM] → LineFlower YEAR LineFlower
            → Venue → Blessing
            Total height ~240px (was ~320px) → frees 80px for illustration
            ═══════════════════════════════════════════════════════════ */}

        {/* Month name */}
        <motion.div style={{ position: "absolute", left: 290, top: 744, width: 500 }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 2.0, ease: EASE_OUT }}>
          <p style={{ margin: 0, textAlign: "center", fontFamily: F_LORA, fontSize: 34, fontWeight: 400, color: C_DARK, lineHeight: "46px" }}>
            {dateInfo.month}
          </p>
        </motion.div>

        {/* Left: Weekday */}
        <motion.div style={{ position: "absolute", left: 150, top: 792, width: 295 }}
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 2.15, ease: EASE_OUT }}>
          <p style={{ margin: 0, textAlign: "right", fontFamily: F_LORA, fontSize: 33, fontWeight: 700, color: C_DARK, lineHeight: "46px", textTransform: "uppercase" }}>
            {dateInfo.weekday}
          </p>
        </motion.div>

        {/* Center: big day number */}
        <motion.div style={{ position: "absolute", left: 443, top: 775, width: 168 }}
          initial={{ opacity: 0, scale: 0.4 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ ...SPRING_SM, delay: 2.3 }}>
          <motion.p
            style={{ margin: 0, textAlign: "center", fontFamily: F_LORA, fontSize: 76, fontWeight: 700, color: C_MED, lineHeight: "90px" }}
            animate={{ scale: [1, 1.1, 1, 1.05, 1] }}
            transition={{ duration: 1.8, ease: "easeInOut", delay: 3.2 }}>
            {dateInfo.day}
          </motion.p>
        </motion.div>

        {/* Right: HH:MM AM/PM */}
        <motion.div style={{ position: "absolute", left: 609, top: 792, width: 295 }}
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 2.25, ease: EASE_OUT }}>
          <p style={{ margin: 0, textAlign: "left", fontFamily: F_LORA, fontSize: 33, fontWeight: 700, color: C_DARK, lineHeight: "46px" }}>
            {dateInfo.hhmm} <span style={{ fontSize: 25, fontWeight: 400, color: C_MED }}>{dateInfo.ampm}</span>
          </p>
        </motion.div>

        {/* Line flowers + year row */}
        <motion.div style={{ position: "absolute", left: 148, top: 836 }}
          initial={{ opacity: 0, scale: 0.6, x: -20 }} animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 2.5, ease: EASE_OUT }}>
          <LineFlower />
        </motion.div>

        <motion.div style={{ position: "absolute", left: 395, top: 830, width: 290 }}
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 2.55, ease: EASE_OUT }}>
          <p style={{ margin: 0, textAlign: "center", fontFamily: F_LORA, fontSize: 33, fontWeight: 400, color: C_DARK, lineHeight: "46px" }}>
            {dateInfo.year}
          </p>
        </motion.div>

        <motion.div style={{ position: "absolute", left: 638, top: 836 }}
          initial={{ opacity: 0, scale: 0.6, x: 20 }} animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 2.6, ease: EASE_OUT }}>
          <LineFlower flip />
        </motion.div>

        {/* Venue */}
        <motion.div style={{ position: "absolute", left: 190, top: 882, width: 700 }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 2.8, ease: EASE_OUT }}>
          <p style={{ margin: 0, textAlign: "center", fontFamily: F_LORA, fontSize: 32, fontWeight: 400, color: C_DARK, lineHeight: "44px" }}>
            {venue || "Udaipur"}
          </p>
        </motion.div>

        {/* Blessing — bottom≈986, gap to mandap (1020)=34px */}
        <motion.div style={{ position: "absolute", left: 190, top: 930, width: 700 }}
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 2.95, ease: EASE_OUT }}>
          <p style={{ margin: 0, textAlign: "center", fontFamily: F_DANCING, fontSize: 46, fontWeight: 700, color: C_SCRIPT, lineHeight: "58px", opacity: 0.88 }}>
            {blessing || "ॐ शुभ विवाह"}
          </p>
        </motion.div>

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
        background: "#f0d6e0",
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
     DESKTOP LAYOUT  — blurred bg + card centre + info panels
     ════════════════════════════════════════════════════════════════ */
  return (
    <div style={{
      width: "100%", height: "100vh", overflow: "hidden",
      display: "flex", alignItems: "center", justifyContent: "center",
      position: "relative",
    }}>
      {/* Blurred bg */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0,
        backgroundImage: "url(/shaadi-card/image10.webp)",
        backgroundSize: "cover", backgroundPosition: "center",
        filter: "blur(20px) brightness(1.06)",
        transform: "scale(1.1)",
      }} />
      <div style={{
        position: "absolute", inset: 0, zIndex: 1,
        background: "linear-gradient(160deg, rgba(255,235,245,0.62), rgba(220,165,190,0.48))",
      }} />

      {/* BG petals */}
      {petals.slice(0, 8).map((p) => (
        <motion.div key={`bg-${p.id}`} style={{
          position: "absolute", zIndex: 2,
          width: p.size + 4, height: p.size + 4, left: `${p.x}%`, top: -(p.size + 4),
          borderRadius: "50%",
          background: `radial-gradient(circle at 35% 35%, hsl(${p.hue},92%,90%), hsl(${p.hue},76%,68%))`,
          filter: "blur(0.6px)", pointerEvents: "none",
        }}
          animate={{ y: "108vh", x: [0, 22, -14, 18, -8, 0], rotate: [0, 360], opacity: [0, 0.7, 0.7, 0.7, 0] }}
          transition={{ duration: p.dur + 2, delay: p.delay, ease: "linear", opacity: { times: [0, 0.04, 0.5, 0.92, 1] } }}
        />
      ))}

      {/* ── Left info panel ──────────────────────────────────────── */}
      <motion.div
        style={{
          position: "relative", zIndex: 5,
          width: 260, marginRight: 40, flexShrink: 0,
          display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 22,
        }}
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.1, delay: 0.6, ease: EASE_OUT }}>

        <div style={{ opacity: 0.9, mixBlendMode: "multiply" }}>
          <Image src="/shaadi-card/image6.webp" alt="" width={240} height={180}
            style={{ objectFit: "contain", filter: "drop-shadow(0 4px 14px rgba(171,28,62,0.20))" }} />
        </div>

        <div style={{ textAlign: "right" }}>
          <p style={{ margin: "0 0 5px", fontFamily: F_CINZEL, fontSize: 11, fontWeight: 400, color: C_MED, letterSpacing: "0.2em", textTransform: "uppercase" }}>
            You are cordially invited to
          </p>
          <p style={{ margin: 0, fontFamily: F_CINZEL, fontSize: 21, fontWeight: 400, color: C_DARK, letterSpacing: "0.07em", textTransform: "uppercase" }}>
            The Wedding of
          </p>
        </div>

        <p style={{ margin: 0, textAlign: "right", fontFamily: F_DANCING, fontSize: 50, fontWeight: 700, color: C_SCRIPT, lineHeight: "1.15" }}>
          {brideName || "Ananya"}&nbsp;&amp;<br />{groomName || "Arjun"}
        </p>

        <div style={{ width: "100%", height: 1, background: `linear-gradient(to left, ${C_MED}, transparent)`, opacity: 0.4 }} />

        <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { label: "DATE",  value: `${dateInfo.weekday[0] + dateInfo.weekday.slice(1).toLowerCase()}, ${dateInfo.month} ${dateInfo.day}` },
            { label: "YEAR",  value: dateInfo.year },
            { label: "TIME",  value: `${dateInfo.hhmm} ${dateInfo.ampm}` },
            { label: "VENUE", value: venue || "Udaipur" },
          ].map((row) => (
            <div key={row.label} style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <p style={{ margin: "0 0 2px", fontFamily: F_CINZEL, fontSize: 9, letterSpacing: "0.22em", color: C_MED, textTransform: "uppercase" }}>
                {row.label}
              </p>
              <p style={{ margin: 0, fontFamily: F_LORA, fontSize: 14, color: C_DARK, lineHeight: "1.5" }}>
                {row.value}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Centre card ──────────────────────────────────────────── */}
      <motion.div
        style={{ position: "relative", zIndex: 10, flexShrink: 0 }}
        initial={{ opacity: 0, y: 40, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.0, delay: 0.3, ease: EASE_OUT }}>
        <div style={{ boxShadow: "0 28px 80px rgba(109,43,59,0.30), 0 8px 24px rgba(109,43,59,0.18)", borderRadius: 16, overflow: "hidden" }}>
          {cardCanvas}
        </div>
      </motion.div>

      {/* ── Right info panel ─────────────────────────────────────── */}
      <motion.div
        style={{
          position: "relative", zIndex: 5,
          width: 260, marginLeft: 40, flexShrink: 0,
          display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 22,
        }}
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.1, delay: 0.7, ease: EASE_OUT }}>

        <div style={{ opacity: 0.9, mixBlendMode: "multiply", transform: "scaleX(-1)" }}>
          <Image src="/shaadi-card/image7.webp" alt="" width={240} height={180}
            style={{ objectFit: "contain", filter: "drop-shadow(0 4px 14px rgba(171,28,62,0.18))" }} />
        </div>

        <div style={{ textAlign: "left" }}>
          <p style={{ margin: "0 0 6px", fontFamily: F_CINZEL, fontSize: 11, fontWeight: 400, color: C_MED, letterSpacing: "0.18em", textTransform: "uppercase" }}>
            Save the date
          </p>
          <div style={{ display: "flex", gap: 6, alignItems: "baseline" }}>
            <span style={{ fontFamily: F_LORA, fontSize: 62, fontWeight: 700, color: C_MED, lineHeight: 1 }}>{dateInfo.day}</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ fontFamily: F_CINZEL, fontSize: 13, color: C_DARK, letterSpacing: "0.1em", textTransform: "uppercase" }}>{dateInfo.month}</span>
              <span style={{ fontFamily: F_CINZEL, fontSize: 13, color: C_DARK, letterSpacing: "0.1em", textTransform: "uppercase" }}>{dateInfo.year}</span>
            </div>
          </div>
        </div>

        <div style={{ width: "100%", height: 1, background: `linear-gradient(to right, ${C_MED}, transparent)`, opacity: 0.4 }} />

        <div style={{ textAlign: "left" }}>
          <p style={{ margin: "0 0 5px", fontFamily: F_CINZEL, fontSize: 9, letterSpacing: "0.22em", color: C_MED, textTransform: "uppercase" }}>Blessing</p>
          <p style={{ margin: 0, fontFamily: F_DANCING, fontSize: 22, fontWeight: 700, color: C_SCRIPT, lineHeight: "1.5" }}>
            {blessing || "ॐ शुभ विवाह"}
          </p>
        </div>

        <div style={{ textAlign: "left" }}>
          <p style={{ margin: "0 0 5px", fontFamily: F_CINZEL, fontSize: 9, letterSpacing: "0.22em", color: C_MED, textTransform: "uppercase" }}>Dress Code</p>
          <p style={{ margin: 0, fontFamily: F_LORA, fontSize: 14, color: C_DARK }}>
            Traditional / Ethnic
          </p>
        </div>

        <div style={{ textAlign: "left" }}>
          <p style={{ margin: "0 0 5px", fontFamily: F_CINZEL, fontSize: 9, letterSpacing: "0.22em", color: C_MED, textTransform: "uppercase" }}>R.S.V.P.</p>
          <p style={{ margin: 0, fontFamily: F_LORA, fontSize: 13, color: C_DARK, lineHeight: "1.7" }}>
            Kindly confirm your<br />attendance with family
          </p>
        </div>

        <div style={{ opacity: 0.85, mixBlendMode: "multiply", marginTop: "auto" }}>
          <Image src="/shaadi-card/image4.webp" alt="" width={200} height={160}
            style={{ objectFit: "contain", filter: "drop-shadow(0 4px 12px rgba(171,28,62,0.15))" }} />
        </div>
      </motion.div>

    </div>
  );
}
