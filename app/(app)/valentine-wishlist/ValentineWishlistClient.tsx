"use client";

// ─── The Valentine's week wishlist ──────────────────────────────────────────
//
// One button with four states, driven by hooks/useWishlist:
//   loading     → a quiet placeholder of the same size (no layout jump)
//   signed-out  → "Sign up & join" opens the sign-up sheet; the join finishes
//                 by itself the moment the account exists
//   open        → "Join" submits straight away
//   joined      → disabled, plus the pass with their place in line
//
// Motion is transform/opacity only; reduced motion turns the drifting hearts
// and the burst off.

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Bell, Check, Gift, Heart, Loader2, Lock, UserCheck } from "lucide-react";
import AuthModal from "@/components/AuthModal";
import LuxuryMobileTopBrand from "@/components/LuxuryMobileTopBrand";
import CornerOrnaments from "@/app/(app)/components/home/CornerOrnaments";
import ValentinePass from "@/components/wishlist/ValentinePass";
import CardCorners from "@/components/wishlist/CardCorners";
import { fetchWishlistCount, useWishlist } from "@/hooks/useWishlist";
import { useAppSelector } from "@/store/hooks";
import {
  VALENTINE_CAMPAIGN, VALENTINE_DAYS, VALENTINE_DISCOUNT, VALENTINE_WEEK_START,
} from "@/lib/wishlist/valentine";

const HEARTS = Array.from({ length: 16 }, (_, i) => ({
  left: (i * 37 + 11) % 100,
  size: 10 + ((i * 7) % 14),
  delay: (i * 0.73) % 9,
  dur: 9 + ((i * 5) % 7),
  drift: ((i % 2 ? 1 : -1) * (12 + (i * 3) % 18)),
}));

const PETALS = Array.from({ length: 9 }, (_, i) => ({
  left: (i * 23 + 5) % 100,
  size: 9 + ((i * 5) % 8),
  delay: (i * 1.37) % 11,
  dur: 11 + ((i * 3) % 6),
}));

// The same alekhan corner the landing frames itself with, in gold here.
const ALEKHAN = "https://cdn.subhsandesh.in/gifts-media/indianFestival/alekhancorner2.svg";
const MOTIF = "https://cdn.subhsandesh.in/gifts-media/indianFestival/akehan3.svg";
const CORNERS = [
  { k: "tl", flip: "scaleY(-1)" }, { k: "tr", flip: "scale(-1,-1)" },
  { k: "bl", flip: "none" }, { k: "br", flip: "scaleX(-1)" },
] as const;

function Corners({ tone = "gold" }: { tone?: "gold" | "rose" }) {
  return (
    <>
      {CORNERS.map((c, i) => (
        <span key={c.k} className={`vwCorner ${c.k} ${tone}`} style={{ animationDelay: `${0.15 + i * 0.12}s, ${1.4 + i * 0.6}s` }} aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ALEKHAN} alt="" style={{ transform: c.flip }} />
        </span>
      ))}
    </>
  );
}

function Motif({ light, className = "" }: { light?: boolean; className?: string }) {
  return (
    <div className={`vwMotif${light ? " light" : ""} ${className}`} aria-hidden>
      <span className="vwMotifL" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={MOTIF} alt="" />
      <span className="vwMotifR" />
    </div>
  );
}

// ── The cute bits ──────────────────────────────────────────────────────────

/** A blushing heart with a face. `side` decides which way it leans. */
function CuteHeart({ side }: { side: "l" | "r" }) {
  return (
    <span className={`vwCute ${side}`} aria-hidden>
      <svg viewBox="0 0 64 58" width="100%" height="100%">
        <defs>
          <linearGradient id={`vwch-${side}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={side === "l" ? "#ff8fa8" : "#ffb38f"} />
            <stop offset="1" stopColor={side === "l" ? "#e0345a" : "#e05a46"} />
          </linearGradient>
        </defs>
        <path d="M32 56 C 10 40, 0 28, 0 16 C 0 6, 8 0, 17 0 C 24 0, 29 4, 32 9 C 35 4, 40 0, 47 0 C 56 0, 64 6, 64 16 C 64 28, 54 40, 32 56 Z" fill={`url(#vwch-${side})`} />
        <ellipse cx="18" cy="13" rx="6" ry="3.5" fill="#fff" opacity=".45" transform="rotate(-25 18 13)" />
        <g className="vwCuteEyes">
          <circle cx="23" cy="25" r="3.2" fill="#3d0c11" />
          <circle cx="41" cy="25" r="3.2" fill="#3d0c11" />
          <circle cx="24.2" cy="23.8" r="1" fill="#fff" />
          <circle cx="42.2" cy="23.8" r="1" fill="#fff" />
        </g>
        <ellipse cx="16" cy="32" rx="4.2" ry="2.6" fill="#ff5f84" opacity=".55" />
        <ellipse cx="48" cy="32" rx="4.2" ry="2.6" fill="#ff5f84" opacity=".55" />
        <path d="M28 31 Q 32 35.5 36 31" stroke="#3d0c11" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
    </span>
  );
}

/** The envelope: the wax seal pops, the flap opens, the offer rises out. */
function LoveLetter() {
  return (
    <span className="vwEnvBox">
      <span className="vwEnvBack" />
      <span className="vwLetter">
        <span className="vwLetterFor">for you ♥</span>
        <span className="vwLetterN">{VALENTINE_DISCOUNT}<small>%</small></span>
        <span className="vwLetterOff">OFF</span>
      </span>
      <span className="vwEnvPocket" />
      <span className="vwEnvFlap" />
      <span className="vwWax">♥</span>
    </span>
  );
}

const SPARKS = [
  { l: 6, t: 18, d: 0 }, { l: 92, t: 10, d: 0.8 }, { l: 14, t: 78, d: 1.6 }, { l: 86, t: 70, d: 0.4 }, { l: 50, t: -4, d: 1.2 },
];

const tickSubscribe = (cb: () => void) => { const id = setInterval(cb, 1000); return () => clearInterval(id); };
const nowSec = () => Math.floor(Date.now() / 1000);

/** Days · hours · minutes · seconds to Rose Day, ticking. Client-only. */
function LoveCountdown() {
  const now = useSyncExternalStore(tickSubscribe, nowSec, () => null);
  const target = Math.floor(VALENTINE_WEEK_START.getTime() / 1000);
  const left = now === null ? null : Math.max(0, target - now);
  if (left === 0) return null;
  const parts = left === null ? null : [
    { v: Math.floor(left / 86400), l: "Days" },
    { v: Math.floor((left % 86400) / 3600), l: "Hours" },
    { v: Math.floor((left % 3600) / 60), l: "Mins" },
    { v: left % 60, l: "Secs" },
  ];
  return (
    <div className="vwCount" aria-label="Time until Rose Day">
      <div className="vwCountRow">
        {(parts ?? [{ v: 0, l: "Days" }, { v: 0, l: "Hours" }, { v: 0, l: "Mins" }, { v: 0, l: "Secs" }]).map((p, i) => (
          <div key={p.l} className="vwTile" style={{ visibility: parts ? "visible" : "hidden" }}>
            <b key={p.l === "Secs" ? p.v : undefined} className={i === 3 ? "tick" : undefined}>{String(p.v).padStart(2, "0")}</b>
            <span>{p.l}</span>
          </div>
        ))}
      </div>
      <p className="vwCountCap">until Rose Day 🌹</p>
    </div>
  );
}

const BURST = Array.from({ length: 14 }, (_, i) => {
  const a = (i / 14) * Math.PI * 2;
  return { x: Math.cos(a) * (70 + (i % 3) * 22), y: Math.sin(a) * (54 + (i % 3) * 18) - 10, r: (i % 2 ? 1 : -1) * 25 };
});

export default function ValentineWishlistClient() {
  const wl = useWishlist(VALENTINE_CAMPAIGN);
  const user = useAppSelector((s) => s.auth.user);
  const reduce = useReducedMotion();
  const [showAuth, setShowAuth] = useState(false);
  const [burst, setBurst] = useState(0);
  const [count, setCount] = useState<number | null>(null);
  const [prevStatus, setPrevStatus] = useState(wl.status);

  useEffect(() => {
    let live = true;
    void fetchWishlistCount(VALENTINE_CAMPAIGN).then((n) => live && setCount(n));
    return () => { live = false; };
  }, []);

  // Celebrate a join that happens on this page (open → joined), not a
  // returning visitor whose status loads straight as joined.
  if (wl.status !== prevStatus) {
    if (prevStatus === "open" && wl.status === "joined") {
      setBurst((b) => b + 1);
      setCount((c) => (c === null ? c : c + 1));
    }
    setPrevStatus(wl.status);
  }

  const onJoin = () => {
    if (wl.status === "joined" || wl.joining) return;
    if (!wl.requestJoin("wishlist-page")) setShowAuth(true);
  };

  const cta = useMemo(() => {
    if (wl.status === "loading") return { label: "Just a moment…", icon: <Loader2 size={18} className="animate-spin" />, disabled: true };
    if (wl.status === "joined") return { label: "You're on the list", icon: <Check size={18} strokeWidth={3} />, disabled: true };
    if (wl.joining) return { label: "Saving your spot…", icon: <Loader2 size={18} className="animate-spin" />, disabled: true };
    if (wl.status === "signed-out") return { label: "Sign up & join the wishlist", icon: <Heart size={18} fill="currentColor" />, disabled: false };
    return { label: `Join & reserve ${VALENTINE_DISCOUNT}% off`, icon: <Heart size={18} fill="currentColor" />, disabled: false };
  }, [wl.status, wl.joining]);

  const joined = wl.status === "joined";

  return (
    <div className="vwPage">
      <LuxuryMobileTopBrand />
      <CornerOrnaments />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="vwHero">
        <div className="vwHearts" aria-hidden>
          {!reduce && HEARTS.map((h, i) => (
            <span key={i} className="vwHeart" style={{
              left: `${h.left}%`, fontSize: h.size, animationDelay: `${h.delay}s`, animationDuration: `${h.dur}s`,
              ["--drift" as string]: `${h.drift}px`,
            }}>♥</span>
          ))}
        </div>
        <div className="vwPetals" aria-hidden>
          {!reduce && PETALS.map((pt, i) => (
            <span key={i} className="vwPetal" style={{
              left: `${pt.left}%`, width: pt.size, height: pt.size * 1.3, animationDelay: `${pt.delay}s`, animationDuration: `${pt.dur}s`,
            }} />
          ))}
        </div>
        <span className="vwGlow" aria-hidden />

        <div className="vwHeroIn">
          <motion.span className="vwKick" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="vwBeat" aria-hidden>♥</span> Valentine&apos;s Week · 7–14 Feb 2027
          </motion.span>

          <motion.h1 className="vwTitle" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.05 }}>
            Be the first to{" "}
            <span className="vwLove">
              <em>fall in love</em>
              <svg className="vwScribble" viewBox="0 0 300 30" preserveAspectRatio="none" aria-hidden>
                <path d="M4 18 C 50 6, 100 26, 150 15 S 240 6, 270 16 C 280 19, 286 10, 280 7 C 274 4, 270 13, 278 19" />
              </svg>
            </span>{" "}
            again.
          </motion.h1>
          <Motif light className="vwHeroMotif" />

          <motion.p className="vwSub" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.12 }}>
            Eight new templates are on their way — one for every day from Rose Day to Valentine&apos;s Day.
            Join now and your <b>{VALENTINE_DISCOUNT}% off</b> is saved to your account.
          </motion.p>

          <motion.div className="vwStage" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.2 }} aria-label={`${VALENTINE_DISCOUNT}% off for wishlist members`}>
            {SPARKS.map((sp, i) => (
              <span key={i} className="vwSpark" style={{ left: `${sp.l}%`, top: `${sp.t}%`, animationDelay: `${sp.d}s` }} aria-hidden>✦</span>
            ))}
            <CuteHeart side="l" />
            <LoveLetter />
            <CuteHeart side="r" />
          </motion.div>

          <motion.div className="vwCtaWrap" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <div className="vwBtnHold">
              <motion.button
                type="button"
                className={`vwBtn${joined ? " is-joined" : ""}`}
                onClick={onJoin}
                disabled={cta.disabled}
                aria-disabled={cta.disabled}
                whileTap={cta.disabled ? undefined : { scale: 0.96 }}
                layout
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span key={cta.label} className="vwBtnIn"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                    {cta.icon} {cta.label}
                  </motion.span>
                </AnimatePresence>
              </motion.button>
              <AnimatePresence>
                {burst > 0 && !reduce && (
                  <motion.span key={burst} className="vwBurst" aria-hidden initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 1.4, delay: 0.5 }}>
                    {BURST.map((b, i) => (
                      <motion.span key={i} className="vwBurstH"
                        initial={{ x: 0, y: 0, scale: 0.3, rotate: 0 }}
                        animate={{ x: b.x, y: b.y, scale: 1, rotate: b.r }}
                        transition={{ type: "spring", stiffness: 160, damping: 14 }}>♥</motion.span>
                    ))}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            <p className="vwNote" role="status" aria-live="polite">
              {wl.error ? <span className="vwErr">{wl.error} — please try again.</span>
                : joined ? <>We&apos;ll tell you the moment the collection is live.</>
                : wl.status === "signed-out" ? <><Lock size={12} aria-hidden /> 10 seconds · your offer is saved to your account</>
                : <><UserCheck size={12} aria-hidden /> Signed in{user?.name ? ` as ${user.name.split(" ")[0]}` : ""} — one tap and you&apos;re in.</>}
            </p>
          </motion.div>

          <LoveCountdown />
          {count !== null && count >= 10 && (
            <p className="vwWaiting"><Heart size={12} fill="currentColor" aria-hidden /> {count.toLocaleString("en-IN")} lovers already waiting</p>
          )}
        </div>
      </section>

      <div className="vwBody">
        {/* ── The pass ──────────────────────────────────────────────────── */}
        <AnimatePresence initial={false}>
          {joined && wl.entry && (
            <motion.div className="vwPassWrap" initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 22, delay: burst ? 0.35 : 0 }}>
              <ValentinePass entry={wl.entry} name={user?.name} />
              <Link href="/profile" className="vwPassLink">Saved in your profile <ArrowRight size={13} aria-hidden /></Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Eight days ────────────────────────────────────────────────── */}
        <section className="vwSec">
          <p className="vwSecKick">What&apos;s coming</p>
          <h2 className="vwSecTitle">Eight days. <em>Eight ways to say it.</em></h2>
          <Motif />
          <ol className="vwDays">
            {VALENTINE_DAYS.map((d, i) => (
              <motion.li key={d.date} className={`vwDay${d.date === 14 ? " is-big" : ""}`}
                initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: (i % 4) * 0.06 }}>
                <CardCorners size={30} tone={d.date === 14 ? "gold" : "maroon"} opacity={d.date === 14 ? 0.75 : 0.42} breathe={false} />
                <span className="vwDayE" aria-hidden>{d.emoji}</span>
                <span className="vwDayD">{d.date} Feb</span>
                <span className="vwDayN">{d.name}</span>
              </motion.li>
            ))}
          </ol>
        </section>

        {/* ── Perks ─────────────────────────────────────────────────────── */}
        <section className="vwSec">
          <p className="vwSecKick">Why join</p>
          <h2 className="vwSecTitle">A little love, <em>saved for you.</em></h2>
          <Motif />
          <div className="vwPerks">
            {[
              { Icon: Gift, t: `${VALENTINE_DISCOUNT}% off`, d: "On the Valentine's week templates, kept on your account — nothing to remember, no code to lose." },
              { Icon: Bell, t: "First to know", d: "We'll let you know the moment the collection goes live, before the rush." },
              { Icon: Heart, t: "In your profile", d: "Your spot and your offer sit in your profile, ready when you are." },
            ].map(({ Icon, t, d }, i) => (
              <motion.div key={t} className="vwPerk" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.45, delay: i * 0.08 }}>
                <CardCorners size={44} tone="maroon" opacity={0.4} breathe={false} />
                <span className="vwPerkI"><Icon size={18} aria-hidden /></span>
                <b>{t}</b>
                <p>{d}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {!joined && (
          <section className="vwEnd">
            <span className="vwFrame" aria-hidden />
            <Corners />
            <p>Someone special deserves something new this February.</p>
            <button type="button" className="vwBtn small" onClick={onJoin} disabled={cta.disabled}>
              <span className="vwBtnIn">{cta.icon} {cta.label}</span>
            </button>
          </section>
        )}
      </div>

      <AnimatePresence>
        {showAuth && (
          <AuthModal
            defaultMode="register"
            onClose={() => { setShowAuth(false); wl.cancelPending(); }}
            onSuccess={() => setShowAuth(false)}
          />
        )}
      </AnimatePresence>

      <style>{VW_CSS}</style>
    </div>
  );
}

const VW_CSS = `
.vwPage { position: relative; min-height: 100vh; background: linear-gradient(180deg, #fff3f0 0%, #f9ebe4 40%, #f5ede6 100%); padding-bottom: 96px; }
.vwHero { position: relative; isolation: isolate; overflow: hidden; margin: 4px 12px 0; padding: 50px 22px 36px;
  background: radial-gradient(120% 90% at 50% 0%, #a01d3a 0%, #6d0f26 42%, #3d0c11 78%, #2a070c 100%); color: #fff4f1; text-align: center;
  border-radius: 30px; box-shadow: 0 30px 60px -34px rgba(61,12,17,.9), 0 0 0 1px rgba(246,213,138,.22); }
.vwGlow { position: absolute; z-index: -1; left: 50%; top: 38%; width: 520px; height: 520px; transform: translate(-50%, -50%); border-radius: 50%;
  background: radial-gradient(circle, rgba(255,120,140,.28), transparent 65%); pointer-events: none; }
.vwFrame { position: absolute; inset: 10px; z-index: 0; pointer-events: none; border-radius: 22px; border: 1px solid rgba(246,213,138,.4);
  animation: vwFrameIn 1.1s cubic-bezier(.22,1,.36,1) both; }
.vwFrame::after { content: ""; position: absolute; inset: 5px; border-radius: 18px; border: 1px dashed rgba(246,213,138,.2); }
@keyframes vwFrameIn { from { opacity: 0; transform: scale(.97); } to { opacity: 1; transform: scale(1); } }
.vwCorner { position: absolute; z-index: 0; width: 92px; height: 92px; pointer-events: none;
  animation: vwCornerIn 1s cubic-bezier(.22,1,.36,1) both, vwCornerBreathe 5s ease-in-out infinite; }
.vwCorner img { width: 100%; height: 100%; display: block;
  filter: brightness(0) saturate(100%) invert(84%) sepia(38%) saturate(640%) hue-rotate(350deg) brightness(101%) contrast(92%); }
.vwCorner.tl { top: 2px; left: 2px; transform-origin: 0 0; }
.vwCorner.tr { top: 2px; right: 2px; transform-origin: 100% 0; }
.vwCorner.bl { bottom: 2px; left: 2px; transform-origin: 0 100%; }
.vwCorner.br { bottom: 2px; right: 2px; transform-origin: 100% 100%; }
@keyframes vwCornerIn { from { opacity: 0; transform: scale(.4) rotate(-6deg); } to { opacity: .7; transform: scale(1) rotate(0); } }
@keyframes vwCornerBreathe { 0%, 100% { opacity: .7; transform: scale(1); } 50% { opacity: .95; transform: scale(1.05); } }
.vwPetals { position: absolute; inset: 0; z-index: -1; pointer-events: none; overflow: hidden; }
.vwPetal { position: absolute; top: -24px; border-radius: 150% 0 150% 0; opacity: 0;
  background: linear-gradient(135deg, #ffb3c1, #e0435f 70%, #a3173a); box-shadow: inset -2px -2px 4px rgba(120,10,30,.35);
  animation: vwFall linear infinite; will-change: transform, opacity; }
@keyframes vwFall {
  0% { transform: translate3d(0,0,0) rotate(0deg); opacity: 0; }
  10% { opacity: .85; }
  25% { transform: translate3d(18px, 25vh, 0) rotate(90deg); }
  50% { transform: translate3d(-14px, 50vh, 0) rotate(200deg); }
  75% { transform: translate3d(16px, 75vh, 0) rotate(290deg); opacity: .7; }
  100% { transform: translate3d(-8px, 100vh, 0) rotate(380deg); opacity: 0; } }
.vwMotif { display: flex; align-items: center; justify-content: center; gap: 12px; margin: 14px auto 0; }
.vwMotif img { width: 22px; height: 22px; opacity: .8; animation: vwMotifSpin 14s linear infinite;
  filter: brightness(0) saturate(100%) invert(14%) sepia(66%) saturate(3600%) hue-rotate(332deg) brightness(88%) contrast(105%); }
.vwMotif.light img { filter: brightness(0) saturate(100%) invert(84%) sepia(38%) saturate(640%) hue-rotate(350deg) brightness(101%) contrast(92%); }
.vwMotifL, .vwMotifR { width: 70px; height: 1px; }
.vwMotifL { background: linear-gradient(to right, transparent, rgba(179,36,63,.55)); }
.vwMotifR { background: linear-gradient(to left, transparent, rgba(179,36,63,.55)); }
.vwMotif.light .vwMotifL { background: linear-gradient(to right, transparent, rgba(246,213,138,.7)); }
.vwMotif.light .vwMotifR { background: linear-gradient(to left, transparent, rgba(246,213,138,.7)); }
@keyframes vwMotifSpin { to { transform: rotate(360deg); } }
.vwSecTitle + .vwMotif { margin: -10px auto 24px; }
.vwHearts { position: absolute; inset: 0; z-index: -1; pointer-events: none; overflow: hidden; }
.vwHeart { position: absolute; bottom: -30px; color: rgba(255,170,180,.5); animation: vwRise linear infinite; will-change: transform, opacity; }
@keyframes vwRise { 0% { transform: translate3d(0,0,0) rotate(0); opacity: 0; } 12% { opacity: .9; }
  100% { transform: translate3d(var(--drift), -110vh, 0) rotate(40deg); opacity: 0; } }
.vwHeroIn { position: relative; z-index: 1; max-width: 760px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; }
.vwKick { display: inline-flex; align-items: center; gap: 7px; padding: 7px 14px; border-radius: 99px; border: 1px solid rgba(255,200,190,.35);
  background: rgba(255,240,236,.08); color: #ffd4cb; font: 700 10.5px/1 'Inter', system-ui, sans-serif; letter-spacing: .16em; text-transform: uppercase; }
.vwTitle { margin: 16px 0 0; font: 600 clamp(36px, 7vw, 68px)/1.02 'Playfair Display', serif; letter-spacing: -.02em; text-wrap: balance; }
.vwTitle em { color: #f6d58a; font-style: italic; }
.vwSub { margin: 14px auto 0; max-width: 560px; color: rgba(255,236,232,.8); font: 400 14px/1.6 'Inter', system-ui, sans-serif; }
.vwSub b { color: #fff; }
/* kicker heartbeat */
.vwBeat { display: inline-block; color: #ff8fa3; font-size: 12px; animation: vwBeatK 1.6s ease-in-out infinite; }
@keyframes vwBeatK { 0%, 100% { transform: scale(1); } 14% { transform: scale(1.35); } 28% { transform: scale(1); } 42% { transform: scale(1.2); } 56% { transform: scale(1); } }

/* hand-drawn underline + heart loop under "fall in love" */
.vwLove { position: relative; display: inline-block; white-space: nowrap; }
.vwScribble { position: absolute; left: -2%; right: -6%; bottom: -10px; width: 108%; height: 18px; overflow: visible; pointer-events: none; }
.vwScribble path { fill: none; stroke: #f6d58a; stroke-width: 3; stroke-linecap: round; stroke-linejoin: round;
  stroke-dasharray: 420; stroke-dashoffset: 420; animation: vwDraw 1.4s .7s cubic-bezier(.65,0,.35,1) forwards; opacity: .9; }
@keyframes vwDraw { to { stroke-dashoffset: 0; } }

/* the stage: two cute hearts and the love letter */
.vwStage { position: relative; display: flex; align-items: flex-end; justify-content: center; gap: 4px; margin: 26px 0 0; padding-top: 52px; }
.vwSpark { position: absolute; color: #f6d58a; font-size: 13px; animation: vwTwinkle 2.4s ease-in-out infinite; text-shadow: 0 0 10px rgba(246,213,138,.8); }
@keyframes vwTwinkle { 0%, 100% { opacity: .15; transform: scale(.6) rotate(0); } 50% { opacity: 1; transform: scale(1.15) rotate(20deg); } }
.vwCute { width: 52px; height: 47px; flex-shrink: 0; margin-bottom: 6px; filter: drop-shadow(0 8px 12px rgba(0,0,0,.35)); }
.vwCute.l { animation: vwCuteL 3.2s ease-in-out infinite; }
.vwCute.r { animation: vwCuteR 3.2s ease-in-out infinite; }
@keyframes vwCuteL { 0%, 100% { transform: translateY(0) rotate(-14deg); } 50% { transform: translate(5px, -9px) rotate(-4deg); } }
@keyframes vwCuteR { 0%, 100% { transform: translateY(-4px) rotate(14deg); } 50% { transform: translate(-5px, -12px) rotate(4deg); } }
.vwCuteEyes { transform-box: fill-box; transform-origin: center; animation: vwBlink 4.2s infinite; }
.vwCute.r .vwCuteEyes { animation-delay: .25s; }
@keyframes vwBlink { 0%, 92%, 100% { transform: scaleY(1); } 95% { transform: scaleY(.1); } }

.vwEnvBox { position: relative; width: 150px; height: 98px; flex-shrink: 0; perspective: 700px; }
.vwEnvBack { position: absolute; inset: 0; border-radius: 10px; background: linear-gradient(180deg, #e9bfa9, #dba78d); box-shadow: 0 18px 34px -14px rgba(0,0,0,.6); }
.vwLetter { position: absolute; z-index: 1; left: 10px; right: 10px; bottom: 8px; height: 92px; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1px;
  color: #7a1028; background: repeating-linear-gradient(180deg, #fffaf3 0 13px, #f6e9dc 13px 14px); box-shadow: 0 6px 14px -8px rgba(0,0,0,.4);
  animation: vwLetterUp 1s 1.15s cubic-bezier(.22,1,.36,1) forwards, vwLetterBob 3.6s 2.4s ease-in-out infinite; }
@keyframes vwLetterUp { to { transform: translateY(-50px); } }
@keyframes vwLetterBob { 0%, 100% { transform: translateY(-50px); } 50% { transform: translateY(-56px) rotate(-1.5deg); } }
.vwLetterFor { font: italic 500 12px/1 'Playfair Display', serif; color: #b3243f; }
.vwLetterN { font: 700 34px/1 'Playfair Display', serif; }
.vwLetterN small { font-size: 17px; }
.vwLetterOff { font: 800 9.5px/1 'Inter', system-ui, sans-serif; letter-spacing: .32em; padding-left: .32em; color: #3d0c11; }
.vwEnvPocket { position: absolute; z-index: 2; inset: 0; border-radius: 10px; background: linear-gradient(160deg, #f8e4d6, #ecc6b0);
  clip-path: polygon(0 0, 50% 52%, 100% 0, 100% 100%, 0 100%); box-shadow: inset 0 -2px 0 rgba(122,16,40,.08); }
.vwEnvFlap { position: absolute; z-index: 3; left: 0; right: 0; top: 0; height: 60%; transform-origin: 50% 0;
  background: linear-gradient(180deg, #e4b39a, #d49a7e); clip-path: polygon(0 0, 100% 0, 50% 100%); border-radius: 10px 10px 0 0;
  animation: vwFlap .75s .6s cubic-bezier(.65,0,.35,1) forwards; }
@keyframes vwFlap { 0% { transform: rotateX(0); z-index: 3; } 50% { z-index: 3; } 51% { z-index: 0; } 100% { transform: rotateX(180deg); z-index: 0; } }
.vwWax { position: absolute; z-index: 4; left: 50%; top: 46%; width: 32px; height: 32px; margin: -16px 0 0 -16px; border-radius: 50%; display: grid; place-items: center;
  color: #ffe1e6; font-size: 15px; background: radial-gradient(circle at 35% 30%, #e0435f, #a3173a 70%); box-shadow: 0 3px 8px rgba(0,0,0,.35), inset 0 -2px 3px rgba(0,0,0,.2);
  animation: vwWaxPop .45s .3s cubic-bezier(.5,0,.75,0) forwards; }
@keyframes vwWaxPop { 0% { transform: scale(1); } 40% { transform: scale(1.18); } 100% { transform: scale(0) rotate(40deg); opacity: 0; } }

/* countdown tiles */
.vwCount { margin-top: 28px; padding-top: 20px; border-top: 1px solid rgba(255,214,206,.18); width: min(100%, 420px); }
.vwCountRow { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 8px; }
.vwTile { position: relative; padding: 10px 4px 8px; border-radius: 14px; background: rgba(255,240,236,.08); border: 1px solid rgba(246,213,138,.25);
  display: flex; flex-direction: column; align-items: center; gap: 4px; overflow: hidden; }
.vwTile::before { content: ""; position: absolute; left: 0; right: 0; top: 50%; height: 1px; background: rgba(0,0,0,.18); }
.vwTile b { font: 700 24px/1 'Playfair Display', serif; color: #fff4f1; font-variant-numeric: tabular-nums; }
.vwTile b.tick { animation: vwTick .45s cubic-bezier(.22,1,.36,1); color: #f6d58a; }
@keyframes vwTick { from { transform: translateY(-40%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
.vwTile span { font: 700 9px/1 'Inter', system-ui, sans-serif; letter-spacing: .14em; text-transform: uppercase; color: rgba(255,236,232,.6); }
.vwCountCap { margin: 10px 0 0; font: italic 500 14px/1 'Playfair Display', serif; color: #ffd4cb; }
.vwWaiting { display: inline-flex; align-items: center; gap: 6px; margin: 14px 0 0; padding: 7px 13px; border-radius: 99px; background: rgba(255,240,236,.1);
  color: #ffd4cb; font: 600 12px/1 'Inter', system-ui, sans-serif; }

.vwCtaWrap { margin-top: 22px; display: flex; flex-direction: column; align-items: center; gap: 12px; width: 100%; }
.vwBtnHold { position: relative; display: flex; justify-content: center; width: 100%; }
.vwBtn { position: relative; overflow: hidden; display: inline-flex; align-items: center; justify-content: center; min-width: min(100%, 320px); min-height: 56px; padding: 0 28px;
  border: none; border-radius: 99px; cursor: pointer; color: #3d0c11; background: linear-gradient(135deg, #fff1c9, #f0cd7c 45%, #c99a45);
  font: 800 15px/1 'Inter', system-ui, sans-serif; box-shadow: 0 16px 34px -14px rgba(246,213,138,.75), inset 0 1px 0 rgba(255,255,255,.7);
  transition: box-shadow .25s ease, background .35s ease, color .35s ease; }
.vwBtn::after { content: ""; position: absolute; top: 0; bottom: 0; width: 40%; left: -60%; transform: skewX(-20deg);
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.55), transparent); animation: vwBtnSheen 3.6s ease-in-out infinite; }
@keyframes vwBtnSheen { 0%, 55% { left: -60%; } 90%, 100% { left: 130%; } }
.vwBtn:hover:not(:disabled) { box-shadow: 0 20px 40px -14px rgba(246,213,138,.95), inset 0 1px 0 rgba(255,255,255,.7); }
.vwBtn:focus-visible { outline: 2px solid #f6d58a; outline-offset: 4px; }
.vwBtn:disabled { cursor: default; }
.vwBtn:disabled::after { display: none; }
.vwBtn.is-joined { background: rgba(255,240,236,.12); color: #fff4f1; box-shadow: inset 0 0 0 1.5px rgba(255,214,206,.5); }
.vwBtnIn { display: inline-flex; align-items: center; gap: 10px; white-space: nowrap; }
.vwBtn.small { min-height: 50px; font-size: 14px; }
.vwBurst { position: absolute; left: 50%; top: 50%; width: 0; height: 0; pointer-events: none; }
.vwBurstH { position: absolute; left: -8px; top: -10px; color: #ff8fa3; font-size: 18px; text-shadow: 0 2px 8px rgba(255,80,110,.5); }
.vwBurstH:nth-child(3n) { color: #f6d58a; font-size: 14px; }
.vwNote { display: block; text-align: center; text-wrap: balance; min-height: 18px; margin: 0; color: rgba(255,236,232,.7); font: 500 12.5px/1.4 'Inter', system-ui, sans-serif; }
.vwNote svg { display: inline-block; vertical-align: -2px; margin-right: 5px; }
.vwErr { color: #ffb4b4; }

.vwBody { max-width: 980px; margin: 0 auto; padding: 0 16px; }
.vwPassWrap { --vp-notch: #fff1ed; max-width: 520px; margin: -26px auto 0; position: relative; z-index: 2; display: flex; flex-direction: column; align-items: center; gap: 10px; }
.vwPassLink { display: inline-flex; align-items: center; gap: 5px; color: #7a1028; font: 700 12.5px/1 'Inter', system-ui, sans-serif; text-decoration: none; }
.vwSec { margin-top: 52px; text-align: center; }
.vwSecKick { margin: 0; color: #b3243f; font: 800 10.5px/1 'Inter', system-ui, sans-serif; letter-spacing: .22em; text-transform: uppercase; }
.vwSecTitle { margin: 10px 0 22px; color: #2a0a0e; font: 600 clamp(26px, 4.4vw, 40px)/1.1 'Playfair Display', serif; letter-spacing: -.01em; }
.vwSecTitle em { color: #b3243f; font-style: italic; }
.vwDays { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 10px; }
.vwDay { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 22px 14px 20px; border-radius: 18px; background: #fffaf8;
  border: 1px solid rgba(179,36,63,.12); box-shadow: 0 10px 26px -20px rgba(122,16,40,.5); transition: transform .3s cubic-bezier(.22,1,.36,1), box-shadow .3s ease; }
.vwDay { position: relative; overflow: hidden; }
.vwDay > :not(.cc), .vwPerk > :not(.cc) { position: relative; z-index: 1; }
.vwDay .cc-c, .vwPerk .cc-c { transition: opacity .3s ease, transform .4s cubic-bezier(.22,1,.36,1); }
@media (hover: hover) { .vwDay:hover .cc-c, .vwPerk:hover .cc-c { opacity: .6; transform: scale(1.12); } }
.vwDayE { font-size: 30px; line-height: 1; transition: transform .35s cubic-bezier(.22,1,.36,1); }
@media (hover: hover) { .vwDay:hover .vwDayE { transform: scale(1.18) rotate(-6deg); } }
.vwDayD { color: #b3243f; font: 800 10px/1 'Inter', system-ui, sans-serif; letter-spacing: .14em; text-transform: uppercase; }
.vwDayN { color: #2a0a0e; font: 600 16px/1.15 'Playfair Display', serif; }
.vwDay.is-big { background: linear-gradient(140deg, #b3243f, #6d0f26); border-color: transparent; }
.vwDay.is-big .vwDayD { color: #ffd4cb; } .vwDay.is-big .vwDayN { color: #fff4f1; }
@media (hover: hover) { .vwDay:hover { transform: translateY(-4px); box-shadow: 0 18px 32px -20px rgba(122,16,40,.6); } }
.vwPerks { display: grid; grid-template-columns: minmax(0,1fr); gap: 12px; text-align: left; }
.vwPerk { position: relative; overflow: hidden; padding: 24px 26px; border-radius: 20px; background: #fffaf8; border: 1px solid rgba(179,36,63,.12); box-shadow: 0 10px 26px -20px rgba(122,16,40,.5); }
.vwPerkI { display: grid; place-items: center; width: 40px; height: 40px; border-radius: 12px; color: #fff; background: linear-gradient(140deg, #d13a59, #7a1028); margin-bottom: 12px; }
.vwPerk b { display: block; color: #2a0a0e; font: 600 19px/1.2 'Playfair Display', serif; }
.vwPerk p { margin: 6px 0 0; color: #6b4545; font: 400 13.5px/1.55 'Inter', system-ui, sans-serif; }
.vwEnd { position: relative; isolation: isolate; overflow: hidden; margin: 52px auto 0; padding: 40px 28px; max-width: 620px; border-radius: 24px; text-align: center;
  background: radial-gradient(120% 140% at 50% 0%, #8f1932, #3d0c11); color: #fff4f1; display: flex; flex-direction: column; align-items: center; gap: 16px; }
.vwEnd > p, .vwEnd > button { position: relative; z-index: 1; }
.vwEnd .vwCorner { width: 64px; height: 64px; }
.vwEnd p { margin: 0; font: 500 italic 20px/1.3 'Playfair Display', serif; }
@media (min-width: 768px) { .vwHero { margin-top: 104px; } }
@media (min-width: 640px) {
  .vwSub { font-size: 15px; }
  .vwEnvBox { width: 180px; height: 116px; }
  .vwLetter { height: 108px; }
  .vwLetterN { font-size: 40px; }
  .vwCute { width: 64px; height: 58px; }
  .vwStage { gap: 14px; padding-top: 58px; }
  .vwTile b { font-size: 30px; }
  .vwDays { grid-template-columns: repeat(4, minmax(0,1fr)); gap: 14px; }
  .vwPerks { grid-template-columns: repeat(3, minmax(0,1fr)); gap: 16px; }
}
@media (min-width: 1024px) {
  .vwHero { max-width: 1240px; margin: 104px auto 0; padding: 72px 40px 52px; border-radius: 40px; }
  .vwFrame { inset: 14px; border-radius: 30px; }
  .vwFrame::after { border-radius: 25px; }
  .vwCorner { width: 150px; height: 150px; }
  .vwEnd .vwCorner { width: 80px; height: 80px; }
  .vwSub { font-size: 16.5px; }
    }
/* Phones: the whole card — offer, button and countdown — on one screen. */
@media (max-width: 639px) {
  .vwHero { padding: 22px 16px 18px; border-radius: 26px; }
  .vwKick { padding: 5px 11px; font-size: 9.5px; letter-spacing: .14em; }
  .vwTitle { margin-top: 12px; font-size: clamp(29px, 8.4vw, 34px); }
  .vwScribble { bottom: -7px; height: 14px; }
  .vwHeroMotif { display: none; }
  .vwSub { margin-top: 12px; font-size: 13.5px; line-height: 1.5; }
  .vwStage { margin-top: 10px; padding-top: 40px; gap: 6px; }
  .vwEnvBox { width: 124px; height: 80px; }
  .vwLetter { left: 8px; right: 8px; bottom: 6px; height: 76px; }
  @keyframes vwLetterUp { to { transform: translateY(-40px); } }
  @keyframes vwLetterBob { 0%, 100% { transform: translateY(-40px); } 50% { transform: translateY(-45px) rotate(-1.5deg); } }
  .vwLetterFor { font-size: 10.5px; }
  .vwLetterN { font-size: 28px; }
  .vwLetterN small { font-size: 14px; }
  .vwLetterOff { font-size: 8.5px; }
  .vwWax { width: 26px; height: 26px; margin: -13px 0 0 -13px; font-size: 12px; }
  .vwCute { width: 40px; height: 36px; margin-bottom: 4px; }
  .vwSpark { font-size: 11px; }
  .vwCtaWrap { margin-top: 14px; gap: 8px; }
  .vwBtn { min-height: 50px; font-size: 14.5px; }
  .vwNote { font-size: 11.5px; }
  .vwCount { margin-top: 14px; padding-top: 12px; }
  .vwCountRow { gap: 6px; }
  .vwTile { padding: 7px 2px 6px; border-radius: 11px; gap: 3px; }
  .vwTile b { font-size: 19px; }
  .vwTile span { font-size: 8px; }
  .vwCountCap { margin-top: 7px; font-size: 12px; }
  .vwWaiting { margin-top: 10px; }
  .vwPassWrap { margin-top: 16px; }
}
/* Short phones (iPhone SE and the like): tighter still. */
@media (max-width: 639px) and (max-height: 740px) {
  .vwHero { padding: 16px 14px 14px; }
  .vwTitle { margin-top: 9px; font-size: 27px; }
  .vwSub { margin-top: 9px; font-size: 12.5px; line-height: 1.45; }
  .vwStage { margin-top: 6px; padding-top: 34px; }
  .vwEnvBox { width: 108px; height: 70px; }
  .vwLetter { height: 66px; }
  @keyframes vwLetterUp { to { transform: translateY(-34px); } }
  @keyframes vwLetterBob { 0%, 100% { transform: translateY(-34px); } 50% { transform: translateY(-38px) rotate(-1.5deg); } }
  .vwLetterN { font-size: 24px; }
  .vwCute { width: 34px; height: 31px; }
  .vwCtaWrap { margin-top: 10px; gap: 6px; }
  .vwBtn { min-height: 46px; font-size: 14px; }
  .vwCount { margin-top: 10px; padding-top: 9px; }
  .vwTile { padding: 5px 2px 4px; }
  .vwTile b { font-size: 16px; }
  .vwCountCap { margin-top: 5px; font-size: 11px; }
}
@media (prefers-reduced-motion: reduce) {
  .vwHeart, .vwBtn::after, .vwCute, .vwCuteEyes, .vwSpark, .vwBeat, .vwLetter, .vwEnvFlap, .vwWax, .vwScribble path, .vwTile b.tick, .vwCorner, .vwFrame, .vwMotif img, .vwPetal { animation: none !important; }
  .vwCorner { opacity: .7; }
  .vwDay { transition: none; }
}
`;
