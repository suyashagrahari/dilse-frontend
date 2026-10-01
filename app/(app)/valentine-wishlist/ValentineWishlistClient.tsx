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
import { ArrowRight, Bell, Check, Gift, Heart, Loader2, Lock, Sparkles, UserCheck } from "lucide-react";
import AuthModal from "@/components/AuthModal";
import LuxuryMobileTopBrand from "@/components/LuxuryMobileTopBrand";
import CornerOrnaments from "@/app/(app)/components/home/CornerOrnaments";
import ValentinePass from "@/components/wishlist/ValentinePass";
import { fetchWishlistCount, useWishlist } from "@/hooks/useWishlist";
import { useAppSelector } from "@/store/hooks";
import {
  VALENTINE_CAMPAIGN, VALENTINE_DAYS, VALENTINE_DISCOUNT, daysUntilValentineWeek,
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

function Motif({ light }: { light?: boolean }) {
  return (
    <div className={`vwMotif${light ? " light" : ""}`} aria-hidden>
      <span className="vwMotifL" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={MOTIF} alt="" />
      <span className="vwMotifR" />
    </div>
  );
}

const BURST = Array.from({ length: 14 }, (_, i) => {
  const a = (i / 14) * Math.PI * 2;
  return { x: Math.cos(a) * (70 + (i % 3) * 22), y: Math.sin(a) * (54 + (i % 3) * 18) - 10, r: (i % 2 ? 1 : -1) * 25 };
});

const noopSubscribe = () => () => {};

export default function ValentineWishlistClient() {
  const wl = useWishlist(VALENTINE_CAMPAIGN);
  const user = useAppSelector((s) => s.auth.user);
  const reduce = useReducedMotion();
  const [showAuth, setShowAuth] = useState(false);
  const [burst, setBurst] = useState(0);
  const [count, setCount] = useState<number | null>(null);
  // Days are a client-only number: the server would render yesterday's.
  const days = useSyncExternalStore(noopSubscribe, daysUntilValentineWeek, () => null);
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
        <span className="vwFrame" aria-hidden />
        <Corners />

        <div className="vwHeroIn">
          <motion.span className="vwKick" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Sparkles size={12} aria-hidden /> Valentine&apos;s Week · 7–14 Feb 2027
          </motion.span>

          <motion.h1 className="vwTitle" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.05 }}>
            Be the first to <em>fall in love</em> again.
          </motion.h1>
          <Motif light />

          <motion.p className="vwSub" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.12 }}>
            A new collection of Valentine&apos;s week templates is on its way — one for every day from Rose Day to Valentine&apos;s Day.
            Join the wishlist and your <b>{VALENTINE_DISCOUNT}% off</b> is saved to your account.
          </motion.p>

          <motion.div className="vwSeal" initial={{ scale: 0.6, opacity: 0, rotate: -20 }} animate={{ scale: 1, opacity: 1, rotate: -8 }}
            transition={{ type: "spring", stiffness: 220, damping: 16, delay: 0.25 }} aria-label={`${VALENTINE_DISCOUNT}% off for wishlist members`}>
            <span className="vwSealRing" aria-hidden />
            <span className="vwSealN">{VALENTINE_DISCOUNT}<small>%</small></span>
            <span className="vwSealL">OFF</span>
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
                : wl.status === "signed-out" ? <><Lock size={12} aria-hidden /> Takes 10 seconds — your offer is tied to your account.</>
                : <><UserCheck size={12} aria-hidden /> Signed in{user?.name ? ` as ${user.name.split(" ")[0]}` : ""} — one tap and you&apos;re in.</>}
            </p>
          </motion.div>

          <div className="vwStats">
            {days !== null && days > 0 && (
              <div className="vwStat"><b>{days}</b><span>days to Rose Day</span></div>
            )}
            {count !== null && count >= 10 && (
              <div className="vwStat"><b>{count.toLocaleString("en-IN")}</b><span>already waiting</span></div>
            )}
            <div className="vwStat"><b>8</b><span>days of love</span></div>
          </div>
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
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="vwDayOrn" src={ALEKHAN} alt="" aria-hidden />
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
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="vwPerkOrn" src={ALEKHAN} alt="" aria-hidden />
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
.vwSeal { position: relative; margin: 18px 0 0; width: 96px; height: 96px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center;
  background: radial-gradient(circle at 35% 30%, #fff1c9, #f0cd7c 45%, #b8893a 100%); color: #3d0c11; box-shadow: 0 18px 40px -14px rgba(0,0,0,.6), inset 0 2px 0 rgba(255,255,255,.6); }
.vwSealRing { position: absolute; inset: 7px; border-radius: 50%; border: 1.5px dashed rgba(61,12,17,.35); animation: vwSpin 18s linear infinite; }
@keyframes vwSpin { to { transform: rotate(360deg); } }
.vwSealN { font: 700 40px/1 'Playfair Display', serif; }
.vwSealN small { font-size: 20px; }
.vwSealL { font: 800 12px/1 'Inter', system-ui, sans-serif; letter-spacing: .3em; margin-top: 2px; padding-left: .3em; }
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
.vwStats { display: flex; justify-content: center; gap: 28px; margin-top: 30px; padding-top: 22px; border-top: 1px solid rgba(255,214,206,.18); width: min(100%, 460px); }
.vwStat { display: flex; flex-direction: column; gap: 4px; }
.vwStat b { font: 700 26px/1 'Playfair Display', serif; color: #fff4f1; }
.vwStat span { font: 600 10.5px/1.2 'Inter', system-ui, sans-serif; color: rgba(255,236,232,.6); letter-spacing: .08em; text-transform: uppercase; }

.vwBody { max-width: 980px; margin: 0 auto; padding: 0 16px; }
.vwPassWrap { --vp-notch: #fff1ed; max-width: 520px; margin: -26px auto 0; position: relative; z-index: 2; display: flex; flex-direction: column; align-items: center; gap: 10px; }
.vwPassLink { display: inline-flex; align-items: center; gap: 5px; color: #7a1028; font: 700 12.5px/1 'Inter', system-ui, sans-serif; text-decoration: none; }
.vwSec { margin-top: 52px; text-align: center; }
.vwSecKick { margin: 0; color: #b3243f; font: 800 10.5px/1 'Inter', system-ui, sans-serif; letter-spacing: .22em; text-transform: uppercase; }
.vwSecTitle { margin: 10px 0 22px; color: #2a0a0e; font: 600 clamp(26px, 4.4vw, 40px)/1.1 'Playfair Display', serif; letter-spacing: -.01em; }
.vwSecTitle em { color: #b3243f; font-style: italic; }
.vwDays { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 10px; }
.vwDay { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 18px 10px 16px; border-radius: 18px; background: #fffaf8;
  border: 1px solid rgba(179,36,63,.12); box-shadow: 0 10px 26px -20px rgba(122,16,40,.5); transition: transform .3s cubic-bezier(.22,1,.36,1), box-shadow .3s ease; }
.vwDay { position: relative; overflow: hidden; }
.vwDayOrn, .vwPerkOrn { position: absolute; top: 0; right: 0; width: 46px; height: 46px; opacity: .22; pointer-events: none; transform: scale(-1,-1);
  filter: brightness(0) saturate(100%) invert(14%) sepia(66%) saturate(3600%) hue-rotate(332deg) brightness(88%) contrast(105%); transition: opacity .3s ease, transform .4s cubic-bezier(.22,1,.36,1); }
.vwDay.is-big .vwDayOrn { filter: brightness(0) saturate(100%) invert(84%) sepia(38%) saturate(640%) hue-rotate(350deg) brightness(101%) contrast(92%); opacity: .5; }
@media (hover: hover) { .vwDay:hover .vwDayOrn, .vwPerk:hover .vwPerkOrn { opacity: .45; transform: scale(-1.12,-1.12); } }
.vwDayE { font-size: 30px; line-height: 1; transition: transform .35s cubic-bezier(.22,1,.36,1); }
@media (hover: hover) { .vwDay:hover .vwDayE { transform: scale(1.18) rotate(-6deg); } }
.vwDayD { color: #b3243f; font: 800 10px/1 'Inter', system-ui, sans-serif; letter-spacing: .14em; text-transform: uppercase; }
.vwDayN { color: #2a0a0e; font: 600 16px/1.15 'Playfair Display', serif; }
.vwDay.is-big { background: linear-gradient(140deg, #b3243f, #6d0f26); border-color: transparent; }
.vwDay.is-big .vwDayD { color: #ffd4cb; } .vwDay.is-big .vwDayN { color: #fff4f1; }
@media (hover: hover) { .vwDay:hover { transform: translateY(-4px); box-shadow: 0 18px 32px -20px rgba(122,16,40,.6); } }
.vwPerks { display: grid; grid-template-columns: minmax(0,1fr); gap: 12px; text-align: left; }
.vwPerk { position: relative; overflow: hidden; padding: 20px; border-radius: 20px; background: #fffaf8; border: 1px solid rgba(179,36,63,.12); box-shadow: 0 10px 26px -20px rgba(122,16,40,.5); }
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
  .vwSeal { position: absolute; right: -150px; top: 30px; width: 140px; height: 140px; margin: 0; }
  .vwSealN { font-size: 48px; }
}
@media (prefers-reduced-motion: reduce) {
  .vwHeart, .vwSealRing, .vwBtn::after, .vwCorner, .vwFrame, .vwMotif img, .vwPetal { animation: none !important; }
  .vwCorner { opacity: .7; }
  .vwDay { transition: none; }
}
`;
