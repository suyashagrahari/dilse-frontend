"use client";

// ─── "Send it in Premium?" — the offer a free publish opens first ────────────
//
// A centred card (on a phone too: it never rises from the bottom) with the
// premium template's poster, its price for this visitor, what it adds, and two
// equal choices side by side: ✨ Preview Premium (left) · Publish free (right).
//
// "Preview Premium" does not charge or publish anything. The parent converts their
// free content into a premium draft (an AI writes the extra words; their photos,
// if any, come across, and none are invented) and opens the premium editor in
// preview. While that runs the card shows the bouquet being re-tied; if it
// fails, the card says so and both choices stay open.
//
// The flow and the analytics are in lib/upgrade/offer.ts.

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X, Sparkles, Send, RotateCcw } from "lucide-react";
import { formatPrice, type UpgradeOffer } from "@/lib/upgrade/offer";

const PERK_ICONS = ["🎁", "🌷", "💌", "💗", "✨"];
const WORKING_STEPS = ["Reading your card…", "Re-tying your flowers…", "Writing a line for each bloom…", "Wrapping it in Premium…"];

export interface PremiumUpgradeModalProps {
  offer: UpgradeOffer;
  /** The premium template's poster. */
  cover: string;
  /** Asked when the free page has no recipient yet, so the preview can say their name. */
  recipient?: { value: string; onChange: (v: string) => void; label: string; placeholder: string } | null;
  /** Converts + navigates. A thrown Error's message is shown. */
  onTry: () => Promise<void>;
  onFree: () => void;
  onClose: () => void;
}

export default function PremiumUpgradeModal({ offer, cover, recipient, onTry, onFree, onClose }: PremiumUpgradeModalProps) {
  const [stage, setStage] = useState<"offer" | "working" | "error">("offer");
  const [error, setError] = useState("");
  const [step, setStep] = useState(0);
  const titleId = useId();
  const tryRef = useRef<HTMLButtonElement>(null);

  // Lock the page behind, close on Escape (not while working), focus the main choice.
  useEffect(() => {
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    tryRef.current?.focus({ preventScroll: true });
    return () => { document.documentElement.style.overflow = prev; };
  }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && stage !== "working") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stage, onClose]);
  useEffect(() => {
    if (stage !== "working") return;
    const t = window.setInterval(() => setStep((s) => Math.min(WORKING_STEPS.length - 1, s + 1)), 1600);
    return () => window.clearInterval(t);
  }, [stage]);

  const run = async () => {
    setStage("working");
    setStep(0);
    try {
      await onTry();
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : "Something went wrong. Please try again.");
      setStage("error");
    }
  };

  const p = offer.price;
  const priceMain = p.isFree || p.freeForViewer ? "Free for you" : formatPrice(p.final, p.currency);
  const showMrp = !p.isFree && p.mrp > p.final;

  if (typeof document === "undefined") return null;

  return createPortal(
    <motion.div
      className="upm-back"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => stage !== "working" && onClose()}
    >
      <style>{CSS}</style>
      <motion.div
        className="upm-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        initial={{ opacity: 0, scale: 0.92, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="upm-hero">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cover} alt="" className="upm-cover" decoding="async" />
          <div className="upm-shade" />
          <span className="upm-badge"><Sparkles size={12} /> Premium</span>
          {stage !== "working" && (
            <button type="button" className="upm-x" onClick={onClose} aria-label="Close">
              <X size={16} />
            </button>
          )}
          <div className="upm-price" aria-label={`Price: ${priceMain}`}>
            {showMrp && <s>{formatPrice(p.mrp, p.currency)}</s>}
            <b>{priceMain}</b>
            {showMrp && p.discountPercent > 0 && !p.freeForViewer && <em>{p.discountPercent}% off</em>}
          </div>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {stage === "working" ? (
            <motion.div key="w" className="upm-body upm-working" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} aria-live="polite">
              <div className="upm-blooms" aria-hidden>
                {["🌷", "🌹", "🌸", "🌼", "💐"].map((f, i) => (
                  <span key={f} style={{ animationDelay: `${i * 0.18}s` }}>{f}</span>
                ))}
              </div>
              <h2 id={titleId} className="upm-title">Making it Premium</h2>
              <AnimatePresence mode="wait">
                <motion.p key={step} className="upm-step" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                  {WORKING_STEPS[step]}
                </motion.p>
              </AnimatePresence>
              <div className="upm-bar"><i style={{ width: `${((step + 1) / WORKING_STEPS.length) * 100}%` }} /></div>
              <p className="upm-fine">Free preview: nothing is published or charged.</p>
            </motion.div>
          ) : (
            <motion.div key="o" className="upm-body" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h2 id={titleId} className="upm-title">See it in Premium, free</h2>
              <p className="upm-sub">
                One tap and we fill the whole premium bouquet for you: your flowers, your card, your names, already in place. Watch exactly how it looks before you decide.
              </p>

              <ul className="upm-perks">
                {offer.perks.map((perk, i) => (
                  <li key={perk}><span aria-hidden>{PERK_ICONS[i % PERK_ICONS.length]}</span>{perk}</li>
                ))}
              </ul>

              {recipient && (
                <label className="upm-field">
                  <span>{recipient.label}</span>
                  <input
                    value={recipient.value}
                    maxLength={30}
                    placeholder={recipient.placeholder}
                    onChange={(e) => recipient.onChange(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") void run(); }}
                  />
                </label>
              )}

              <div className="upm-free-note">
                <span aria-hidden>👀</span>
                <p><b>Free to preview.</b> No payment to look around. You only pay if you like it and publish Premium.</p>
              </div>

              {stage === "error" && <p className="upm-err" role="alert">{error}</p>}

              <div className="upm-actions">
                <button ref={tryRef} type="button" className="upm-try" onClick={() => void run()}>
                  {stage === "error" ? <RotateCcw size={14} /> : <Sparkles size={14} />}
                  <span>{stage === "error" ? "Try again" : "Preview Premium"}</span>
                </button>
                <button type="button" className="upm-free" onClick={onFree}>
                  <Send size={13} />
                  <span>Publish free</span>
                </button>
              </div>
              <p className="upm-fine">Your free bouquet stays saved: you can still publish it free from the premium preview.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>,
    document.body,
  );
}

const CSS = `
.upm-back { position: fixed; inset: 0; z-index: 2147482000; display: flex; align-items: center; justify-content: center; padding: 16px;
  background: rgba(36,20,40,.55); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); }
.upm-card { position: relative; width: 100%; max-width: 420px; max-height: calc(100dvh - 32px); overflow-y: auto; overscroll-behavior: contain;
  border-radius: 26px; background: #fffaf5; color: #2b2440; border: 2px solid #2b2440; box-shadow: 6px 8px 0 rgba(43,36,64,.18), 0 30px 80px -30px rgba(0,0,0,.6);
  font-family: inherit; scrollbar-width: none; }
.upm-card::-webkit-scrollbar { display: none; }
.upm-hero { position: relative; aspect-ratio: 2 / 1; overflow: hidden; border-radius: 24px 24px 0 0; background: linear-gradient(135deg,#ffe0e9,#ece3fd); }
.upm-cover { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center 12%; }
.upm-shade { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(43,36,64,0) 45%, rgba(43,36,64,.55)); }
.upm-badge { position: absolute; top: 12px; left: 12px; display: inline-flex; align-items: center; gap: 5px; padding: 5px 10px; border-radius: 99px;
  font-size: 11px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: #3b2a05; background: linear-gradient(135deg,#ffe7a3,#e2b44a); box-shadow: 0 4px 14px -4px rgba(0,0,0,.4); }
.upm-x { all: unset; cursor: pointer; position: absolute; top: 10px; right: 10px; display: grid; place-items: center; width: 34px; height: 34px; border-radius: 50%;
  color: #2b2440; background: rgba(255,250,245,.92); box-shadow: 0 4px 14px -6px rgba(0,0,0,.5); }
.upm-price { position: absolute; left: 12px; bottom: 12px; display: inline-flex; align-items: baseline; gap: 7px; padding: 7px 12px; border-radius: 14px;
  background: rgba(255,250,245,.96); border: 1.5px solid #2b2440; box-shadow: 2px 3px 0 rgba(43,36,64,.2); }
.upm-price b { font-size: 17px; font-weight: 800; }
.upm-price s { font-size: 12.5px; color: #7a7191; }
.upm-price em { font-style: normal; font-size: 11px; font-weight: 800; color: #fff; background: #ff5f96; padding: 2px 7px; border-radius: 99px; }
.upm-body { padding: 16px 16px 14px; }
.upm-title { margin: 0; font-size: 21px; line-height: 1.2; font-weight: 800; letter-spacing: -.01em; }
.upm-sub { margin: 5px 0 0; font-size: 13px; line-height: 1.5; color: #5d5574; }
.upm-perks { list-style: none; margin: 12px 0 0; padding: 4px 12px; display: grid; border-radius: 16px; background: #fff; border: 1px solid #ece3d4; }
.upm-perks li { display: flex; align-items: flex-start; gap: 10px; padding: 7px 0; font-size: 13px; line-height: 1.4; font-weight: 600; }
.upm-perks li + li { border-top: 1px dashed #ece3d4; }
.upm-perks li span { flex: none; font-size: 16px; line-height: 1.1; }
.upm-field { display: grid; gap: 6px; margin-top: 12px; font-size: 12.5px; font-weight: 700; color: #5d5574; }
.upm-field input { font: inherit; font-size: 15px; font-weight: 600; color: #2b2440; padding: 11px 13px; border-radius: 13px; border: 1.5px solid #d9cfe8; background: #fff; outline: none; }
.upm-field input:focus { border-color: #8b6fd4; box-shadow: 0 0 0 3px rgba(139,111,212,.18); }
.upm-free-note { display: flex; align-items: flex-start; gap: 9px; margin-top: 12px; padding: 10px 12px; border-radius: 14px; background: #ecfbf3; border: 1.5px dashed #46b37b; }
.upm-free-note span { font-size: 18px; line-height: 1.2; }
.upm-free-note p { margin: 0; font-size: 12.5px; line-height: 1.45; color: #1f5a3c; }
.upm-free-note b { color: #136b40; }
.upm-err { margin: 12px 0 0; padding: 9px 12px; border-radius: 12px; font-size: 13px; color: #9b1c3a; background: #ffe6ec; }
.upm-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 14px; }
.upm-actions button { all: unset; box-sizing: border-box; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 6px; min-height: 44px; padding: 0 8px; min-width: 0;
  border-radius: 14px; font-size: 13.5px; font-weight: 800; text-align: center; white-space: nowrap; letter-spacing: -.01em; border: 2px solid #2b2440; transition: transform .15s ease, box-shadow .15s ease; }
.upm-actions button svg { flex: none; }
.upm-actions .upm-try { color: #fff; background: linear-gradient(135deg,#ff5f96,#8b6fd4); box-shadow: 3px 4px 0 rgba(43,36,64,.22); position: relative; overflow: hidden; }
.upm-try::after { content: ""; position: absolute; inset: 0; background: linear-gradient(110deg, transparent 30%, rgba(255,255,255,.45) 50%, transparent 70%); transform: translateX(-100%); animation: upmShine 2.8s ease-in-out 1s infinite; }
.upm-actions .upm-free { color: #2b2440; background: #fff; box-shadow: 2px 3px 0 rgba(43,36,64,.14); }
.upm-actions button:hover { transform: translateY(-1px); }
.upm-actions button:active { transform: translateY(1px); box-shadow: none; }
.upm-actions button:focus-visible, .upm-x:focus-visible { outline: 3px solid #e2b44a; outline-offset: 2px; }
.upm-fine { margin: 10px 0 0; font-size: 11.5px; line-height: 1.45; color: #7a7191; text-align: center; }
.upm-working { text-align: center; padding: 22px 18px 20px; }
.upm-blooms { display: flex; justify-content: center; gap: 6px; font-size: 28px; margin-bottom: 10px; }
.upm-blooms span { display: inline-block; animation: upmBloom 1.4s ease-in-out infinite; }
.upm-step { margin: 8px 0 0; font-size: 14px; font-weight: 600; color: #5d5574; min-height: 21px; }
.upm-bar { height: 8px; margin: 14px auto 0; max-width: 260px; border-radius: 99px; background: #f1e8f7; overflow: hidden; border: 1.5px solid #2b2440; }
.upm-bar i { display: block; height: 100%; background: linear-gradient(90deg,#ff8fb1,#8b6fd4); transition: width 1.4s ease; }
@keyframes upmBloom { 0%,100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-8px) scale(1.12); } }
@keyframes upmShine { 0% { transform: translateX(-100%); } 60%,100% { transform: translateX(100%); } }
@media (max-width: 374px) { .upm-actions button { font-size: 12.5px; gap: 5px; padding: 0 6px; } .upm-actions { gap: 7px; } }
@media (max-width: 339px) { .upm-actions { grid-template-columns: 1fr; } .upm-title { font-size: 19px; } }
@media (max-height: 700px) { .upm-hero { aspect-ratio: 5 / 2; } .upm-sub { display: none; } .upm-perks li { padding: 5px 0; } }
@media (prefers-reduced-motion: reduce) { .upm-blooms span, .upm-try::after { animation: none; } }
`;
