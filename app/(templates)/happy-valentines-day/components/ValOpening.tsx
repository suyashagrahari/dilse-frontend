"use client";

// ─── Valentine's Day: the ADMIT TWO ticket, the seven lanterns, Love Wrapped ─

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useAnimationControls, useMotionValue, useTransform } from "framer-motion";
import { burst, haptic, useReducedMotion } from "../../_valentine/kit";
import { FONTS } from "../../_valentine/theme";
import { WEEK_LINE_DAYS } from "../../_valentine/days/happy-valentines-day";
import { LANTERN_TINTS, Lantern, Moon, NIGHT, Rooftop, Starfield } from "./valArt";

export const goldBtn: React.CSSProperties = {
  minHeight: 54,
  padding: "14px 28px",
  borderRadius: 18,
  border: 0,
  background: "linear-gradient(180deg, #FBE3A6, #F5C66B 55%, #E2AC48)",
  color: NIGHT.midnight,
  font: `700 17px ${FONTS.ui}`,
  boxShadow: "0 5px 0 #A9792A, 0 18px 34px -14px rgba(245,198,107,.55)",
  cursor: "pointer",
};
export const ghostBtn: React.CSSProperties = {
  minHeight: 46,
  padding: "10px 20px",
  borderRadius: 999,
  border: "1.5px solid rgba(255,246,229,.22)",
  background: "rgba(255,246,229,.07)",
  color: NIGHT.star,
  font: `600 15px ${FONTS.ui}`,
  cursor: "pointer",
};
export const kicker: React.CSSProperties = { margin: 0, font: `600 12px ${FONTS.ui}`, letterSpacing: ".24em", textTransform: "uppercase", color: NIGHT.gold, textAlign: "center" };
export const headline: React.CSSProperties = { margin: 0, font: `italic 700 clamp(27px, 7.6vw, 36px)/1.12 ${FONTS.serif}`, color: NIGHT.star, textAlign: "center" };

// ── 1. ADMIT TWO ─────────────────────────────────────────────────────────────

const zigzag = (() => {
  const pts: string[] = ["0% 0%", "calc(100% - 7px) 0%"];
  for (let k = 0; k <= 16; k++) pts.push(`${k % 2 ? "100%" : "calc(100% - 7px)"} ${(k * 100) / 16}%`);
  pts.push("0% 100%");
  return `polygon(${pts.join(",")})`;
})();

export function TicketArrival({ recipientName, senderName, ticketLine, sticker, bottomPad, onTorn }: { recipientName: string; senderName: string; ticketLine: string; sticker: ReactNode; bottomPad: number; onTorn: () => void }) {
  const reduced = useReducedMotion();
  const [torn, setTorn] = useState(false);
  const [dim, setDim] = useState(false);
  const stub = useAnimationControls();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rot = useTransform([x, y], ([a, b]: number[]) => Math.max(-30, Math.min(30, (b as number) * 0.18 + (a as number) * 0.08)));

  const tear = () => {
    if (torn) return;
    setTorn(true);
    haptic([15, 30, 15]);
    if (!reduced) void stub.start({ x: 60, y: 520, rotate: 38, opacity: 0, transition: { duration: 1.1, ease: [0.5, 0, 0.8, 0.6] } });
    window.setTimeout(() => setDim(true), reduced ? 100 : 650);
    window.setTimeout(onTorn, reduced ? 400 : 1500);
  };

  const foil = "linear-gradient(110deg, #C48F2E 0%, #F5C66B 18%, #FFF0C4 32%, #E8B04B 48%, #F9DD94 64%, #C48F2E 82%, #F5C66B 100%)";

  return (
    <div style={{ position: "relative", minHeight: "calc(100dvh - var(--vw-dock-space, 0px))", display: "flex", flexDirection: "column", alignItems: "center", padding: `64px 16px ${bottomPad}px`, gap: 8, overflow: "hidden", background: "radial-gradient(120% 70% at 50% 40%, #5A1030 0%, #3A0A24 45%, #1A0612 100%)" }}>
      {/* velvet texture */}
      <div aria-hidden style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(90deg, rgba(255,255,255,.018) 0 2px, transparent 2px 6px), radial-gradient(60% 40% at 50% 45%, rgba(245,198,107,.12), transparent 70%)", pointerEvents: "none" }} />
      <p style={{ ...kicker, position: "relative", marginTop: 6 }}>You&apos;re invited</p>
      <h1 style={{ position: "relative", margin: 0, font: `700 clamp(44px, 13vw, 64px)/1.05 ${FONTS.script}`, color: NIGHT.star, textAlign: "center", overflowWrap: "anywhere", maxWidth: "100%" }}>{recipientName || "You"}</h1>
      <p style={{ position: "relative", margin: 0, font: `italic 400 18px ${FONTS.serif}`, color: "#E6CFE0" }}>to one night only</p>

      <div style={{ position: "relative", width: "min(94vw, calc(380px * var(--vw-s, 1)))", marginTop: 44 }}>
        <div aria-hidden style={{ position: "absolute", left: -8, top: -64, width: 84, height: 84, transform: "rotate(-8deg)", zIndex: 3 }}>
          {sticker}
        </div>
        <motion.div
          initial={reduced ? false : { y: 40, opacity: 0, rotate: -8 }}
          animate={{ y: 0, opacity: 1, rotate: -3 }}
          transition={{ type: "spring", stiffness: 110, damping: 14, delay: 0.2 }}
          style={{ display: "flex", height: 176, filter: "drop-shadow(0 26px 30px rgba(0,0,0,.55))" }}
        >
          {/* main part */}
          <div
            className="vn-foil"
            style={{ flex: 1, minWidth: 0, position: "relative", borderRadius: "14px 0 0 14px", background: foil, backgroundSize: "200% 100%", clipPath: torn ? zigzag : undefined, padding: "14px 16px 12px 18px", color: "#3A1A10", display: "flex", flexDirection: "column", justifyContent: "space-between" }}
          >
            <div aria-hidden style={{ position: "absolute", inset: 6, border: "1.5px solid rgba(90,50,10,.45)", borderRadius: 10, borderRight: "none", pointerEvents: "none" }} />
            <div style={{ font: `700 10.5px ${FONTS.ui}`, letterSpacing: ".3em", opacity: 0.8 }}>★ VALENTINE&apos;S NIGHT ★</div>
            <div style={{ font: `900 clamp(30px, 9vw, 40px)/1 ${FONTS.serif}`, letterSpacing: ".04em", color: "#4A1708", textShadow: "0 1px 0 rgba(255,255,255,.5)" }}>ADMIT TWO</div>
            <div style={{ font: `italic 500 13.5px/1.25 ${FONTS.serif}`, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{ticketLine || "Admit two · one night · forever seats"}</div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, font: `700 10.5px ${FONTS.ui}`, letterSpacing: ".12em", textTransform: "uppercase" }}>
              <span>14 Feb · 8 PM</span>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Seat: next to {senderName || "me"}</span>
            </div>
          </div>
          {/* perforation */}
          <div aria-hidden style={{ width: 0, borderLeft: "2.5px dotted rgba(90,50,10,.55)", position: "relative", zIndex: 1 }} />
          {/* stub */}
          <motion.div
            drag={!torn && !reduced}
            dragSnapToOrigin
            dragElastic={0.6}
            animate={stub}
            onDrag={(_, info) => {
              if (Math.hypot(info.offset.x, info.offset.y) > 80) tear();
            }}
            onTap={() => !torn && haptic(6)}
            style={{ x, y, rotate: rot, width: 92, flex: "none", position: "relative", borderRadius: "0 14px 14px 0", background: foil, backgroundSize: "200% 100%", transformOrigin: "0% 0%", cursor: torn ? "default" : "grab", touchAction: "none", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, color: "#3A1A10", clipPath: torn ? "polygon(7px 0, 100% 0, 100% 100%, 7px 100%, 0 94%, 7px 88%, 0 82%, 7px 76%, 0 70%, 7px 64%, 0 58%, 7px 52%, 0 46%, 7px 40%, 0 34%, 7px 28%, 0 22%, 7px 16%, 0 10%, 7px 4%)" : undefined }}
          >
            <div aria-hidden style={{ position: "absolute", inset: 6, border: "1.5px solid rgba(90,50,10,.45)", borderRadius: 10, borderLeft: "none" }} />
            <span style={{ font: `700 9px ${FONTS.ui}`, letterSpacing: ".22em" }}>№ 1402</span>
            <span style={{ font: `900 22px/1 ${FONTS.serif}` }}>♥</span>
            <span style={{ font: `700 9px ${FONTS.ui}`, letterSpacing: ".16em", textAlign: "center", lineHeight: 1.4 }}>
              ROW 1<br />SEAT 2
            </span>
            <span aria-hidden style={{ width: 56, height: 18, background: "repeating-linear-gradient(90deg, #3A1A10 0 2px, transparent 2px 4px, #3A1A10 4px 5px, transparent 5px 8px)", opacity: 0.7 }} />
          </motion.div>
        </motion.div>
      </div>

      <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 8, marginTop: 30, font: `600 14px ${FONTS.ui}`, color: "#E6CFE0" }}>
        <motion.span aria-hidden animate={reduced || torn ? undefined : { x: [0, 8, 0], y: [0, 8, 0] }} transition={{ duration: 1.2, repeat: Infinity }} style={{ display: "inline-block" }}>
          ✂️
        </motion.span>
        {torn ? "Enjoy the night…" : "Drag the stub to tear it"}
      </div>
      <div style={{ flex: 1, minHeight: 16 }} />
      <button type="button" onClick={tear} disabled={torn} style={{ ...goldBtn, position: "relative", opacity: torn ? 0.5 : 1 }}>
        Tear the ticket ✂️
      </button>
      <AnimatePresence>{dim && <motion.div aria-hidden initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} style={{ position: "absolute", inset: 0, background: NIGHT.midnight, zIndex: 5 }} />}</AnimatePresence>
    </div>
  );
}

// ── 2. Seven days, seven lights ──────────────────────────────────────────────

const DAY_GLYPHS = ["🌹", "💍", "🍫", "🧸", "🤞", "🤗", "💋"];

export function LanternWalk({ weekLines, bottomPad, onDone }: { weekLines: string[]; bottomPad: number; onDone: () => void }) {
  const reduced = useReducedMotion();
  const [lit, setLit] = useState<boolean[]>(() => Array(7).fill(false));
  const [last, setLast] = useState<number | null>(null);
  const count = lit.filter(Boolean).length;
  const all = count === 7;
  const [eighth, setEighth] = useState(false);

  useEffect(() => {
    if (!all) return;
    const t = window.setTimeout(() => {
      setEighth(true);
      burst({ kind: "sparkles", origin: { x: 0.5, y: 0.3 }, count: 26, emojis: ["✨", "💫", "⭐"] });
    }, reduced ? 100 : 900);
    return () => window.clearTimeout(t);
  }, [all, reduced]);

  const light = (i: number) => {
    if (lit[i]) {
      setLast(i);
      return;
    }
    haptic(10);
    setLit((l) => l.map((v, k) => (k === i ? true : v)));
    setLast(i);
  };
  const lightAll = () => {
    setLit(Array(7).fill(true));
    setLast(6);
  };

  const line = last != null ? (weekLines[last] ?? "").trim() : "";

  return (
    <div style={{ position: "relative", minHeight: "calc(100dvh - var(--vw-dock-space, 0px))", overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center", padding: `60px 12px ${bottomPad}px` }}>
      <Starfield count={60} />
      <motion.div aria-hidden animate={{ opacity: count / 7 }} transition={{ duration: 0.8 }} style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 60% at 50% 100%, rgba(255,179,71,.28), rgba(232,67,110,.12) 45%, transparent 75%)", pointerEvents: "none" }} />
      <Moon size={60} style={{ position: "absolute", right: "max(22px, calc(50% - 420px))", top: "50%", zoom: "var(--vw-s, 1)" }} />

      <p style={{ ...kicker, position: "relative" }}>Seven days · seven lights</p>
      <h2 style={{ ...headline, position: "relative", marginTop: 6, fontSize: "clamp(24px, 6.8vw, 32px)" }}>{eighth ? "…and today is the 8th." : "Light up our week"}</h2>
      <p style={{ position: "relative", margin: "6px 0 0", font: `400 14px ${FONTS.ui}`, color: "#E6CFE0", textAlign: "center" }}>{all ? "Every lantern is lit 🏮" : `Tap each lantern · ${count} / 7 lit`}</p>

      {/* the string of lanterns */}
      <div style={{ position: "relative", width: "min(100%, 420px)", height: 168, marginTop: 14, zoom: "var(--vw-s, 1)" }}>
        <svg aria-hidden viewBox="0 0 100 40" preserveAspectRatio="none" style={{ position: "absolute", left: 0, top: 0, width: "100%", height: 70 }}>
          <path d="M-2 2 Q50 46 102 2" stroke="#C9A25A" strokeOpacity=".7" strokeWidth=".5" fill="none" vectorEffect="non-scaling-stroke" />
        </svg>
        {DAY_GLYPHS.map((g, i) => {
          const t = (i + 0.5) / 7;
          const cy = ((1 - t) * (1 - t) * 2 + 2 * (1 - t) * t * 46 + t * t * 2) * (70 / 40);
          const drop = i % 2 ? 22 : 8;
          return (
            <button
              key={i}
              type="button"
              onClick={() => light(i)}
              aria-pressed={lit[i]}
              aria-label={`${WEEK_LINE_DAYS[i]}${lit[i] ? " (lit)" : " — light it"}`}
              style={{ position: "absolute", left: `${t * 100}%`, top: cy - 2, width: 50, marginLeft: -25, padding: 0, border: 0, background: "transparent", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center" }}
            >
              <span aria-hidden style={{ width: 1, height: drop, background: "#C9A25A", opacity: 0.7 }} />
              <motion.span
                className={lit[i] && !reduced ? "vn-sway" : undefined}
                animate={lit[i] && !reduced ? { scale: [0.9, 1.12, 1] } : undefined}
                transition={{ duration: 0.5 }}
                style={{ display: "block", animationDelay: `${i * 0.3}s` }}
              >
                <Lantern tint={LANTERN_TINTS[i]} lit={lit[i]} size={40} glyph={g} />
              </motion.span>
            </button>
          );
        })}
      </div>

      {/* the line that floats out */}
      <div style={{ position: "relative", width: "min(100%, 360px)", minHeight: 126, display: "grid", placeItems: "center", marginTop: 4, zoom: "var(--vw-s, 1)" }}>
        <AnimatePresence mode="wait">
          {last != null && !eighth && (
            <motion.div
              key={last}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: -50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ type: "spring", stiffness: 160, damping: 18 }}
              style={{ width: "100%", padding: "16px 18px", borderRadius: 18, background: "rgba(255,246,229,.07)", border: "1px solid rgba(245,198,107,.28)", boxShadow: `0 0 40px -10px ${LANTERN_TINTS[last]}88`, backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", textAlign: "center" }}
            >
              <div style={{ font: `700 11px ${FONTS.ui}`, letterSpacing: ".2em", textTransform: "uppercase", color: NIGHT.gold }}>
                Day {last + 1} · {WEEK_LINE_DAYS[last]}
              </div>
              <p style={{ margin: "8px 0 0", font: `italic 400 19px/1.4 ${FONTS.serif}`, color: NIGHT.star, overflowWrap: "anywhere" }}>{line || "✨ This one just glows."}</p>
            </motion.div>
          )}
          {eighth && (
            <motion.p key="8th" initial={reduced ? false : { opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9 }} style={{ margin: 0, font: `700 clamp(40px, 12vw, 58px)/1.05 ${FONTS.script}`, color: NIGHT.gold, textAlign: "center", textShadow: "0 0 24px rgba(245,198,107,.55)" }}>
              Happy Valentine&apos;s Day
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div style={{ flex: 1, minHeight: 12 }} />
      <div style={{ position: "relative", zIndex: 2, display: "grid", justifyItems: "center", gap: 10, marginBottom: 6 }}>
        {all ? (
          <button type="button" onClick={onDone} style={{ ...goldBtn, opacity: eighth ? 1 : 0.7 }}>
            Our year, wrapped →
          </button>
        ) : (
          count >= 1 && (
            <button type="button" onClick={lightAll} style={ghostBtn}>
              Light them all ✨
            </button>
          )
        )}
      </div>
      <div aria-hidden style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "26dvh", pointerEvents: "none" }}>
        <Rooftop glow={count / 7} style={{ position: "absolute", bottom: 0, height: "100%" }} />
      </div>
    </div>
  );
}

// ── 3. Love Wrapped ──────────────────────────────────────────────────────────

/** "YYYY-MM-DD" → local Date, or null for anything odd / in the future. */
export function parseSince(v: unknown): Date | null {
  if (typeof v !== "string") return null;
  const m = v.trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  if (Number.isNaN(d.getTime()) || d.getFullYear() < 1940 || d.getTime() > Date.now()) return null;
  return d;
}

export function useTogether(since: Date | null) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!since) return;
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, [since]);
  if (!since) return null;
  const ms = Math.max(0, now - since.getTime());
  const s = Math.floor(ms / 1000);
  return { days: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

interface WCard {
  key: string;
  bg: string;
  body: ReactNode;
}

export function LoveWrapped({ recipientName, senderName, togetherSince, metPlace, stats, sticker, bottomPad, onDone }: { recipientName: string; senderName: string; togetherSince: string; metPlace: string; stats: { label: string; value: string }[]; sticker: ReactNode; bottomPad: number; onDone: () => void }) {
  const reduced = useReducedMotion();
  const since = useMemo(() => parseSince(togetherSince), [togetherSince]);
  const t = useTogether(since);
  const scroller = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const year = new Date().getFullYear();
  const label: React.CSSProperties = { font: `700 11px ${FONTS.ui}`, letterSpacing: ".22em", textTransform: "uppercase", color: NIGHT.gold };
  const big: React.CSSProperties = { font: `italic 700 clamp(40px, 12vw, 56px)/1.05 ${FONTS.serif}`, color: NIGHT.star, overflowWrap: "anywhere" };

  const cards: WCard[] = [];
  cards.push({
    key: "intro",
    bg: "radial-gradient(120% 90% at 20% 0%, #7A1035, #2A1240 60%, #12081F)",
    body: (
      <>
        <span style={label}>Love Wrapped · {year}</span>
        <div style={{ width: 120, height: 120, margin: "8px auto" }}>{sticker}</div>
        <div style={big}>Your year in us</div>
        <div style={{ font: `700 22px ${FONTS.script}`, color: NIGHT.blush, overflowWrap: "anywhere" }}>
          {recipientName || "You"} × {senderName || "Me"}
        </div>
        <div style={{ font: `500 13px ${FONTS.ui}`, color: "#E6CFE0", marginTop: 6 }}>swipe →</div>
      </>
    ),
  });
  if (since && t) {
    cards.push({
      key: "days",
      bg: "radial-gradient(120% 90% at 80% 0%, #E8436E, #7A1035 50%, #2A1240)",
      body: (
        <>
          <span style={label}>Together for</span>
          <div style={{ font: `800 clamp(64px, 20vw, 92px)/1 ${FONTS.serif}`, color: NIGHT.gold, fontVariantNumeric: "tabular-nums", textShadow: "0 0 30px rgba(245,198,107,.4)" }}>{t.days.toLocaleString("en-IN")}</div>
          <div style={{ font: `italic 600 24px ${FONTS.serif}`, color: NIGHT.star }}>days of us</div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 12 }}>
            {([["h", t.h], ["m", t.m], ["s", t.s]] as const).map(([u, v]) => (
              <span key={u} style={{ minWidth: 54, padding: "8px 6px", borderRadius: 12, background: "rgba(18,8,31,.45)", border: "1px solid rgba(245,198,107,.3)", font: `700 20px ${FONTS.ui}`, color: NIGHT.star, fontVariantNumeric: "tabular-nums" }}>
                {String(v).padStart(2, "0")}
                <small style={{ font: `600 11px ${FONTS.ui}`, color: NIGHT.gold, marginLeft: 2 }}>{u}</small>
              </span>
            ))}
          </div>
          <div style={{ font: `500 12.5px ${FONTS.ui}`, color: "#F3D9E4", marginTop: 10 }}>and counting, live ⏱</div>
        </>
      ),
    });
  }
  if (metPlace.trim()) {
    cards.push({
      key: "met",
      bg: "radial-gradient(120% 90% at 50% 100%, #4A1A4F, #2A1240 55%, #12081F)",
      body: (
        <>
          <span style={label}>Where it all started</span>
          <div style={{ fontSize: 46, margin: "6px 0" }}>📍</div>
          <div style={{ ...big, fontSize: "clamp(30px, 9vw, 42px)" }}>{metPlace}</div>
          <div style={{ font: `italic 400 16px ${FONTS.serif}`, color: "#E6CFE0", marginTop: 8 }}>Best plot twist of my life.</div>
        </>
      ),
    });
  }
  const statBgs = ["linear-gradient(160deg, #2A1240, #12081F)", "linear-gradient(160deg, #7A1035, #2A1240)", "linear-gradient(160deg, #4A1A4F, #12081F)", "linear-gradient(160deg, #5A1030, #12081F)", "linear-gradient(160deg, #2A1240, #4A1A4F)"];
  stats
    .filter((s) => (s.label ?? "").trim() || (s.value ?? "").trim())
    .slice(0, 5)
    .forEach((s, k) =>
      cards.push({
        key: `s${k}`,
        bg: statBgs[k % statBgs.length],
        body: (
          <>
            <span style={label}>№ {k + 1}</span>
            <div style={{ font: `600 19px/1.3 ${FONTS.ui}`, color: "#F3D9E4", marginTop: 10, overflowWrap: "anywhere" }}>{s.label}</div>
            <div style={{ ...big, color: NIGHT.gold, marginTop: 6 }}>{s.value || "∞"}</div>
          </>
        ),
      }),
    );
  cards.push({
    key: "top",
    bg: "radial-gradient(120% 90% at 50% 0%, #F5C66B, #C48F2E 30%, #7A1035 70%, #2A1240)",
    body: (
      <>
        <span style={{ ...label, color: NIGHT.midnight }}>Top person of my year</span>
        <div style={{ fontSize: 52, margin: "8px 0" }}>👑</div>
        <div style={{ font: `700 clamp(48px, 14vw, 66px)/1 ${FONTS.script}`, color: NIGHT.star, textShadow: "0 3px 18px rgba(18,8,31,.5)", overflowWrap: "anywhere" }}>{recipientName || "you"}.</div>
        <div style={{ font: `600 14px ${FONTS.ui}`, color: NIGHT.star, marginTop: 10 }}>Played on repeat. Every single day.</div>
      </>
    ),
  });

  const onScroll = () => {
    const el = scroller.current;
    if (!el) return;
    const w = el.firstElementChild?.firstElementChild as HTMLElement | null;
    const step = (w?.offsetWidth ?? el.clientWidth) + 14;
    setActive(Math.max(0, Math.min(cards.length - 1, Math.round(el.scrollLeft / step))));
  };
  const goTo = (k: number) => {
    const el = scroller.current;
    const card = el?.querySelectorAll<HTMLElement>("[data-card]")[k];
    if (el && card) el.scrollTo({ left: card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <div style={{ position: "relative", minHeight: "calc(100dvh - var(--vw-dock-space, 0px))", display: "flex", flexDirection: "column", alignItems: "center", padding: `60px 0 ${bottomPad}px`, overflow: "hidden" }}>
      <Starfield count={34} style={{ opacity: 0.6 }} />
      <p style={{ ...kicker, position: "relative" }}>Love Wrapped</p>
      <h2 style={{ ...headline, position: "relative", marginTop: 6, padding: "0 16px" }}>Our year, in numbers</h2>

      <div
        ref={scroller}
        onScroll={onScroll}
        style={{ position: "relative", width: "100%", maxWidth: "calc(560px * var(--vw-s, 1))", overflowX: "auto", scrollSnapType: "x mandatory", scrollbarWidth: "none", marginTop: 18, WebkitOverflowScrolling: "touch" }}
      >
        <div style={{ display: "flex", gap: 14, padding: "6px calc((100% - min(76vw, 320px)) / 2) 18px", width: "max-content" }}>
          {cards.map((c, k) => (
            <motion.div
              key={c.key}
              data-card
              initial={reduced ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0, scale: active === k ? 1 : 0.94 }}
              transition={{ delay: k < 2 ? 0.1 + k * 0.1 : 0, type: "spring", stiffness: 180, damping: 22 }}
              style={{ width: "min(76vw, calc(320px * var(--vw-s, 1)))", height: "min(56dvh, calc(430px * var(--vw-s, 1)))", minHeight: 340, flex: "none", scrollSnapAlign: "center", borderRadius: 26, background: c.bg, boxShadow: "0 30px 50px -26px rgba(0,0,0,.85), inset 0 0 0 1px rgba(255,246,229,.1)", padding: "26px 20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 4, position: "relative", overflow: "hidden" }}
            >
              <span aria-hidden style={{ position: "absolute", right: -40, top: -40, width: 150, height: 150, borderRadius: "50%", background: "rgba(255,246,229,.06)" }} />
              <span aria-hidden style={{ position: "absolute", left: -30, bottom: -50, width: 130, height: 130, borderRadius: "50%", background: "rgba(245,198,107,.07)" }} />
              <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, width: "100%" }}>{c.body}</div>
            </motion.div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button type="button" aria-label="Previous card" onClick={() => goTo(Math.max(0, active - 1))} style={{ ...ghostBtn, width: 44, height: 44, padding: 0, minHeight: 44 }}>
          ‹
        </button>
        <div aria-hidden style={{ display: "flex", gap: 6 }}>
          {cards.map((c, k) => (
            <span key={c.key} style={{ width: k === active ? 18 : 6, height: 6, borderRadius: 9, background: k === active ? NIGHT.gold : "rgba(255,246,229,.25)", transition: "width .3s" }} />
          ))}
        </div>
        <button type="button" aria-label="Next card" onClick={() => goTo(Math.min(cards.length - 1, active + 1))} style={{ ...ghostBtn, width: 44, height: 44, padding: 0, minHeight: 44 }}>
          ›
        </button>
      </div>
      <div style={{ flex: 1, minHeight: 14 }} />
      <button type="button" onClick={onDone} style={{ ...goldBtn, position: "relative", opacity: active === cards.length - 1 ? 1 : 0.85 }}>
        Unwrap your gift 🎁
      </button>
    </div>
  );
}
