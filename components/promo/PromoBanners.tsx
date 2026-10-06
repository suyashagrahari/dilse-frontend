"use client";

// ─── The wishlist sale banners ──────────────────────────────────────────────
//
// `PromoMarquee` — the moving strip at the top of the blog and the template
// gallery. `PromoCountdownCard` — the big countdown inside a blog post.
//
// Both render nothing unless a super admin has a countdown running
// (/admin/wishlist), and both vanish the second it reaches zero. A tap goes to
// the wishlist page with `?join=1`, which opens the join by itself (sign-up
// first if needed); `src` records which banner brought them, so the admin page
// can show what works. Someone who already joined is never sold to again — the
// card thanks them instead and the strip stays out of the way.

import Link from "next/link";
import { X, Check, Heart } from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";
import {
  usePromo, useNow, countdown, pad2, promoCopy, promoJoinHref, dismissPromo, usePromoDismissed, type Countdown,
} from "@/hooks/usePromo";

const fmt = (n: number) => n.toLocaleString("en-IN");

function clockText(c: Countdown) {
  const hms = `${pad2(c.h)}:${pad2(c.m)}:${pad2(c.s)}`;
  return c.d > 0 ? `${c.d}d ${hms}` : hms;
}

function daysLeftText(c: Countdown) {
  if (c.d >= 2) return `Only ${c.d} days left`;
  if (c.d === 1) return "Only 1 day left";
  return "Ends today";
}

export function PromoMarquee({ source, className = "" }: { source: string; className?: string }) {
  const p = usePromo();
  const t = useNow();
  const wl = useWishlist(p?.campaign ?? "valentine-2027");
  const dismissed = usePromoDismissed(p);
  if (!p || dismissed || wl.status === "joined" || wl.status === "loading") return null;

  const c = countdown(p.endsAtLocal, t);
  const copy = promoCopy(p);
  const urgent = c.totalMs < 86_400_000;
  const items = [
    `${copy.emoji} ${copy.title}`,
    "Join the wishlist free — your discount is saved to your account",
    p.joined >= 10 ? `🔥 ${fmt(p.joined)} people already joined` : "🔥 Early members get the best price",
    `⏰ ${daysLeftText(c)}`,
    "🌹 Rose Day to 💘 Valentine's Day — 8 new templates",
  ];
  const group = (hidden: boolean) => (
    <span className="pmq-group" aria-hidden={hidden || undefined}>
      {items.map((s, i) => (
        <span key={i} className="pmq-item">{s}<i className="pmq-dot">✦</i></span>
      ))}
    </span>
  );

  return (
    <div className={`pmq-wrap ${className}`}>
      <style>{PROMO_CSS}</style>
      <Link href={promoJoinHref(p, source)} className={`pmq ${urgent ? "is-urgent" : ""}`} aria-label={`${copy.tag}: ${copy.title}. Ends in ${clockText(c)}. Join the wishlist.`}>
        <span className="pmq-tag">{copy.tag}</span>
        <span className="pmq-tag pmq-tag-short">{p.discountPercent}% OFF</span>
        <span className="pmq-track">
          <span className="pmq-run">{group(false)}{group(true)}</span>
        </span>
        <span className="pmq-clock" aria-hidden>
          <span className="pmq-clock-l">Ends in</span>
          <b>{clockText(c)}</b>
        </span>
        <span className="pmq-cta" aria-hidden>Join free →</span>
      </Link>
      <button type="button" className="pmq-x" aria-label="Hide this offer" onClick={() => dismissPromo(p)}>
        <X size={13} strokeWidth={2.6} />
      </button>
    </div>
  );
}

export function PromoCountdownCard({ source, className = "" }: { source: string; className?: string }) {
  const p = usePromo();
  const t = useNow();
  const wl = useWishlist(p?.campaign ?? "valentine-2027");
  if (!p || wl.status === "loading") return null;

  if (wl.status === "joined") {
    return (
      <aside className={`pcc-done ${className}`}>
        <style>{PROMO_CSS}</style>
        <span className="pcc-done-ic"><Check size={18} strokeWidth={3} /></span>
        <div>
          <b>Your {wl.entry?.discountPercent ?? p.discountPercent}% Valentine discount is locked 💘</b>
          <span>
            {wl.entry?.position ? <>You&apos;re <b>#{fmt(wl.entry.position)}</b> on the list. </> : null}
            We&apos;ll tell you the moment the Valentine&apos;s week templates go live.
          </span>
        </div>
        <Link href={p.path} className="pcc-done-link">Your pass →</Link>
      </aside>
    );
  }

  const c = countdown(p.endsAtLocal, t);
  const copy = promoCopy(p);
  const boxes = [
    { v: c.d, l: "Days" },
    { v: c.h, l: "Hours" },
    { v: c.m, l: "Mins" },
    { v: c.s, l: "Secs" },
  ];

  return (
    <aside className={`pcc ${className}`} aria-label={`${copy.tag}: ${p.discountPercent}% off`}>
      <style>{PROMO_CSS}</style>
      <span className="pcc-hearts" aria-hidden>
        {[0, 1, 2, 3, 4, 5].map((i) => <i key={i} style={{ left: `${8 + i * 16}%`, animationDelay: `${i * 1.3}s` }}>♥</i>)}
      </span>
      <div className="pcc-top">
        <span className="pcc-tag">{copy.emoji} {copy.tag} · LIMITED TIME</span>
        <p className="pcc-pct"><b>{p.discountPercent}%</b><span>OFF</span></p>
        <p className="pcc-sub">
          {p.style === "sale" ? (
            <>Valentine&apos;s week templates, Rose Day to Valentine&apos;s Day. Join the wishlist free and your discount is saved to your account.</>
          ) : (
            <>{copy.title}. Join the wishlist free and your discount is saved to your account.</>
          )}
        </p>
      </div>
      <div className="pcc-clock" role="timer" aria-label={`Offer ends in ${c.d} days ${c.h} hours ${c.m} minutes`}>
        {boxes.map((b, i) => (
          <span key={b.l} className="pcc-box">
            <b key={i === 3 ? b.v : undefined} className={i === 3 ? "pcc-tick" : undefined}>{pad2(b.v)}</b>
            <small>{b.l}</small>
          </span>
        ))}
      </div>
      <Link href={promoJoinHref(p, source)} className="pcc-cta">
        <Heart size={17} fill="currentColor" /> Join &amp; lock {p.discountPercent}% off
      </Link>
      <p className="pcc-proof">
        {p.joined >= 10 ? <>🔥 <b>{fmt(p.joined)}</b> people already joined</> : <>🔥 Early members get the best price</>}
        <span> · Free · Takes 10 seconds</span>
      </p>
    </aside>
  );
}

const PROMO_CSS = `
.pmq-wrap { position: relative; margin: 0 0 18px; }
.pmq { position: relative; isolation: isolate; overflow: hidden; display: flex; align-items: center; gap: 10px; min-height: 44px; padding: 6px 40px 6px 8px;
  border-radius: 14px; text-decoration: none; color: #fff4f1;
  background: linear-gradient(100deg, #3d0c11 0%, #7a1229 45%, #a01d3a 70%, #6d0f26 100%);
  box-shadow: 0 10px 26px -14px rgba(61,12,17,.85), inset 0 0 0 1px rgba(246,213,138,.28); }
.pmq::after { content: ""; position: absolute; inset: 0; z-index: -1; pointer-events: none;
  background: linear-gradient(105deg, transparent 35%, rgba(255,226,160,.22) 50%, transparent 65%); background-size: 250% 100%;
  animation: pmqShine 4.5s ease-in-out infinite; }
@keyframes pmqShine { from { background-position: 130% 0; } to { background-position: -30% 0; } }
.pmq-tag-short { display: none; }
.pmq-tag { flex: none; padding: 5px 10px; border-radius: 999px; font: 800 10.5px/1 'Inter', sans-serif; letter-spacing: .14em;
  color: #3d0c11; background: linear-gradient(180deg, #ffe7a8, #e8bf5f); box-shadow: 0 2px 8px rgba(0,0,0,.25); }
.pmq-track { flex: 1; min-width: 0; overflow: hidden; white-space: nowrap;
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent); mask-image: linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent); }
.pmq-run { display: inline-flex; animation: pmqScroll 34s linear infinite; will-change: transform; }
.pmq:hover .pmq-run, .pmq:focus-visible .pmq-run { animation-play-state: paused; }
.pmq-group { display: inline-flex; flex: none; }
.pmq-item { display: inline-flex; align-items: center; font: 600 13px/1 'Inter', sans-serif; letter-spacing: .01em; }
.pmq-dot { margin: 0 16px; font-style: normal; color: #f6d58a; font-size: 10px; }
@keyframes pmqScroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
.pmq-clock { flex: none; display: inline-flex; align-items: baseline; gap: 6px; padding: 6px 10px; border-radius: 10px;
  background: rgba(0,0,0,.28); box-shadow: inset 0 0 0 1px rgba(246,213,138,.35); }
.pmq-clock-l { font: 700 9.5px/1 'Inter', sans-serif; letter-spacing: .12em; text-transform: uppercase; color: #f6d58a; }
.pmq-clock b { font: 800 14px/1 'Inter', sans-serif; font-variant-numeric: tabular-nums; letter-spacing: .02em; color: #fff; }
.pmq.is-urgent .pmq-clock { animation: pmqPulse 1.2s ease-in-out infinite; }
@keyframes pmqPulse { 50% { box-shadow: inset 0 0 0 1px rgba(255,140,140,.9), 0 0 14px rgba(255,90,110,.55); } }
.pmq-cta { flex: none; padding: 8px 13px; border-radius: 10px; font: 800 12.5px/1 'Inter', sans-serif; color: #3d0c11;
  background: linear-gradient(180deg, #fff1cc, #f0c96b); transition: transform .2s ease; }
.pmq:hover .pmq-cta { transform: translateX(2px); }
.pmq-x { position: absolute; top: 50%; right: 8px; transform: translateY(-50%); width: 24px; height: 24px; display: grid; place-items: center;
  border: 0; border-radius: 999px; color: rgba(255,244,241,.85); background: rgba(255,255,255,.12); cursor: pointer; }
.pmq-x:hover { background: rgba(255,255,255,.24); color: #fff; }
@media (max-width: 640px) {
  .pmq { gap: 8px; min-height: 40px; padding: 5px 36px 5px 6px; border-radius: 12px; }
  .pmq-tag, .pmq-cta, .pmq-clock-l { display: none; }
  .pmq-tag.pmq-tag-short { display: inline-block; padding: 5px 8px; font-size: 10px; letter-spacing: .06em; }
  .pmq-item { font-size: 12px; }
  .pmq-dot { margin: 0 12px; }
  .pmq-clock { padding: 5px 8px; }
  .pmq-clock b { font-size: 12.5px; }
}
@media (max-width: 900px) { .pmq-cta { display: none; } }

.pcc { position: relative; isolation: isolate; overflow: hidden; margin: 32px 0; padding: 26px 22px 20px; border-radius: 24px; text-align: center; color: #fff4f1;
  background: radial-gradient(120% 90% at 50% 0%, #a01d3a 0%, #6d0f26 45%, #3d0c11 85%);
  box-shadow: 0 26px 50px -30px rgba(61,12,17,.9), inset 0 0 0 1px rgba(246,213,138,.3); }
.pcc::before { content: ""; position: absolute; inset: 8px; z-index: -1; border-radius: 18px; border: 1px dashed rgba(246,213,138,.28); pointer-events: none; }
.pcc-hearts { position: absolute; inset: 0; z-index: -1; pointer-events: none; overflow: hidden; }
.pcc-hearts i { position: absolute; bottom: -24px; font-style: normal; font-size: 16px; color: rgba(255,150,170,.35); animation: pccFloat 8s linear infinite; }
@keyframes pccFloat { from { transform: translateY(0) rotate(-10deg); opacity: 0; } 15% { opacity: 1; } to { transform: translateY(-340px) rotate(14deg); opacity: 0; } }
.pcc-tag { display: inline-block; padding: 6px 12px; border-radius: 999px; font: 800 10.5px/1 'Inter', sans-serif; letter-spacing: .16em;
  color: #3d0c11; background: linear-gradient(180deg, #ffe7a8, #e8bf5f); }
.pcc-pct { margin: 16px 0 14px; display: flex; align-items: flex-start; justify-content: center; gap: 6px; line-height: .9; }
.pcc-pct b { font: 700 72px/0.9 'Playfair Display', serif; color: #fff; text-shadow: 0 6px 30px rgba(255,120,140,.45); }
.pcc-pct span { margin-top: 10px; font: 800 18px/1 'Inter', sans-serif; letter-spacing: .14em; color: #f6d58a; }
.pcc-sub { max-width: 30rem; margin: 6px auto 0; font: 400 14px/1.55 'Inter', sans-serif; color: rgba(255,244,241,.85); }
.pcc-clock { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; max-width: 360px; margin: 18px auto 0; }
.pcc-box { display: flex; flex-direction: column; align-items: center; gap: 5px; padding: 11px 0 9px; border-radius: 14px;
  background: linear-gradient(180deg, rgba(255,255,255,.14), rgba(255,255,255,.05)); box-shadow: inset 0 0 0 1px rgba(246,213,138,.32); }
.pcc-box b { font: 800 26px/1 'Inter', sans-serif; font-variant-numeric: tabular-nums; color: #fff; }
.pcc-box small { font: 700 9.5px/1 'Inter', sans-serif; letter-spacing: .14em; text-transform: uppercase; color: #f6d58a; }
.pcc-tick { animation: pccTick .45s cubic-bezier(.22,1,.36,1); }
@keyframes pccTick { from { transform: translateY(-6px); opacity: .3; } to { transform: none; opacity: 1; } }
.pcc-cta { display: inline-flex; align-items: center; justify-content: center; gap: 8px; margin-top: 18px; padding: 14px 24px; border-radius: 999px;
  font: 800 15px/1 'Inter', sans-serif; color: #3d0c11; text-decoration: none;
  background: linear-gradient(180deg, #fff1cc, #f0c96b); box-shadow: 0 12px 26px -12px rgba(240,201,107,.9); transition: transform .2s ease, box-shadow .2s ease; }
.pcc-cta:hover { transform: translateY(-2px); box-shadow: 0 16px 30px -12px rgba(240,201,107,1); }
.pcc-proof { margin: 12px 0 0; font: 500 12.5px/1.4 'Inter', sans-serif; color: rgba(255,244,241,.85); }
.pcc-proof b { color: #fff; }
.pcc-proof span { color: rgba(255,244,241,.6); }
@media (max-width: 480px) {
  .pcc { padding: 22px 14px 18px; border-radius: 20px; }
  .pcc-pct b { font-size: 60px; }
  .pcc-box b { font-size: 22px; }
  .pcc-cta { width: 100%; }
}

.pcc-done { display: flex; align-items: center; gap: 12px; margin: 28px 0; padding: 14px 16px; border-radius: 18px;
  background: linear-gradient(180deg, #fff8ef, #fbeee4); box-shadow: inset 0 0 0 1px rgba(201,168,76,.45); color: #2a0a0e; }
.pcc-done-ic { flex: none; width: 36px; height: 36px; display: grid; place-items: center; border-radius: 999px; color: #fff; background: linear-gradient(180deg, #2f9a63, #1e7a4b); }
.pcc-done div { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; font: 400 13px/1.45 'Inter', sans-serif; color: rgba(42,10,14,.75); }
.pcc-done div > b { font-size: 14px; color: #2a0a0e; }
.pcc-done-link { flex: none; font: 700 13px/1 'Inter', sans-serif; color: #8b5a2b; text-decoration: none; }
.pcc-done-link:hover { text-decoration: underline; }
@media (max-width: 480px) { .pcc-done { flex-wrap: wrap; } .pcc-done-link { margin-left: 48px; } }

@media (prefers-reduced-motion: reduce) {
  .pmq-run, .pmq::after, .pmq.is-urgent .pmq-clock, .pcc-hearts i, .pcc-tick { animation: none !important; }
  .pmq-track { -webkit-mask-image: none; mask-image: none; text-overflow: ellipsis; }
  .pmq-group[aria-hidden] { display: none; }
}
`;
