"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X, Copy, Check, Heart, Maximize2 } from "lucide-react";
import Confetti from "./Confetti";

// 3D wax-sealed envelope, matched to the reference design (warm cream flaps, glossy
// rose seal, a letter card that slides up out of the pocket, tap-to-expand modal),
// driven by the template's own data.
const ENV = {
  back: "#cdaf95",
  top: "#f5eae0",
  left: "#ebd5c3",
  right: "#e4ccb9",
  bottom: "#dcbc9f",
  seam: "rgba(255,255,255,.5)",
  ink: "#3a2c27",
  label: "#b39a86",
  rose: "#c9436d",
  roseDeep: "#9e2b4d",
};

export default function WaxSealLetter({
  petName,
  letterBody,
  signature,
  senderName,
}: {
  petName: string;
  letterBody: string;
  signature: string;
  senderName: string;
}) {
  const [open, setOpen] = useState(false);
  const [flapBehind, setFlapBehind] = useState(false);
  const [reading, setReading] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [copied, setCopied] = useState(false);
  const [portalEl, setPortalEl] = useState<HTMLElement | null>(null);
  const [year, setYear] = useState("");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    setPortalEl((document.querySelector(".mu-root") as HTMLElement) || document.body);
    setYear(String(new Date().getFullYear()));
  }, []);
  useEffect(() => () => { timers.current.forEach(clearTimeout); }, []);

  const paras = letterBody.split(/\n{2,}|\n/).map((p) => p.trim()).filter(Boolean);
  const greeting = petName?.trim() || "my love";
  const from = senderName?.trim() || "";
  const sign = signature?.trim() || "yours always,";
  const excerpt = (letterBody || "").trim();

  const openEnvelope = () => {
    if (open) return;
    setOpen(true);
    setConfetti(true);
    timers.current.push(setTimeout(() => setFlapBehind(true), 300));
    timers.current.push(setTimeout(() => setConfetti(false), 2200));
  };
  const closeEnvelope = () => {
    if (!open) return;
    setReading(false);
    setOpen(false);
    timers.current.push(setTimeout(() => setFlapBehind(false), 340));
  };
  const copy = () => {
    const text = `${excerpt}\n\n${sign}${from ? ` ${from}` : ""}`;
    try { navigator.clipboard?.writeText(text); } catch {}
    setCopied(true);
    timers.current.push(setTimeout(() => setCopied(false), 1800));
  };

  const serifName: CSSProperties = { fontStyle: "normal", fontWeight: 700, color: ENV.ink };

  return (
    <div className="relative mx-auto w-full max-w-[540px]">
      {confetti && <Confetti originX={50} originY={40} />}

      {/* 3D stage */}
      <div className="relative mx-auto w-full" style={{ perspective: 1100 }}>
        <div className="relative w-full" style={{ aspectRatio: "3 / 2", transformStyle: "preserve-3d" }}>
          {/* back interior wall */}
          <div className="absolute inset-0 rounded-[26px]" style={{ background: ENV.back, boxShadow: "inset 0 2px 16px rgba(90,60,40,.4)", border: "1px solid rgba(120,80,55,.25)", zIndex: 0 }} />

          {/* letter card — hidden in the pocket when sealed, slides up when open */}
          <button
            type="button"
            onClick={() => open && setReading(true)}
            disabled={!open}
            aria-label="Read the letter"
            className="mu-paper-dots mu-env-anim absolute flex flex-col justify-between rounded-2xl p-4 text-left sm:p-5"
            style={{
              left: "6%", right: "6%", top: "5%", bottom: "5%", zIndex: 10,
              border: "1px solid rgba(120,80,55,.18)", boxShadow: "0 12px 24px -14px rgba(90,48,56,.5)",
              transform: open ? "translateY(-64%) scale(1.02)" : "translateY(0) scale(0.96)",
              transition: "transform .75s cubic-bezier(.34,1.15,.64,1)",
              cursor: open ? "pointer" : "default",
            }}
          >
            {/* header */}
            <div className="flex items-start justify-between border-b pb-2" style={{ borderColor: "rgba(120,80,55,.14)" }}>
              <div className="min-w-0">
                <p className="mu-sans text-[9px] font-semibold uppercase tracking-[0.25em]" style={{ color: ENV.label }}>dearest</p>
                <h3 className="mu-serif truncate text-base sm:text-lg" style={serifName}>{greeting}</h3>
              </div>
              <span aria-hidden className="flex h-10 w-8 shrink-0 flex-col items-center justify-center rounded-sm" style={{ border: "1px dashed rgba(120,80,55,.35)", background: "rgba(247,230,233,.5)" }}>
                <Heart size={13} style={{ color: "#e08aa0" }} />
                <span className="mu-sans mt-0.5 text-[6px] font-semibold" style={{ color: "rgba(120,80,55,.6)" }}>LOVE</span>
              </span>
            </div>
            {/* body excerpt */}
            <p className="mu-serif my-2 flex-1 overflow-hidden text-xs italic leading-relaxed sm:text-sm" style={{ color: "rgba(58,44,39,.9)", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>
              &ldquo;{excerpt}&rdquo;
            </p>
            {/* footer */}
            <div className="flex items-end justify-between border-t pt-2" style={{ borderColor: "rgba(120,80,55,.14)" }}>
              <span className="mu-sans text-[8px] tracking-wider" style={{ color: "rgba(120,80,55,.4)" }}>{year}</span>
              <div className="text-right">
                <p className="mu-sans text-[8px] uppercase tracking-widest" style={{ color: ENV.label }}>{sign}</p>
                {from && <h4 className="mu-serif text-xs sm:text-sm" style={serifName}>{from}</h4>}
              </div>
            </div>
            {/* expand pill */}
            <span className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full px-3 py-1 text-[10px] font-semibold text-white" style={{ background: ENV.rose, opacity: open ? 1 : 0, transition: "opacity .3s .45s", pointerEvents: "none", whiteSpace: "nowrap", boxShadow: "0 6px 14px -6px rgba(120,40,60,.6)" }}>
              <Maximize2 size={11} /> tap to read
            </span>
          </button>

          {/* front pocket (left / right / bottom flaps) */}
          <div aria-hidden className="absolute inset-0 overflow-hidden rounded-[26px]" style={{ zIndex: 20, pointerEvents: "none" }}>
            <div className="mu-env-left absolute inset-0" style={{ background: ENV.left }} />
            <div className="mu-env-left absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(90,60,40,.08), transparent 60%)" }} />
            <div className="mu-env-right absolute inset-0" style={{ background: ENV.right }} />
            <div className="mu-env-right absolute inset-0" style={{ background: "linear-gradient(270deg, rgba(90,60,40,.1), transparent 60%)" }} />
            <div className="mu-env-bottom absolute inset-0" style={{ background: ENV.bottom }} />
            <div className="mu-env-bottom absolute inset-0" style={{ background: `linear-gradient(180deg, transparent 48.8%, ${ENV.seam} 49.6%, transparent 50.3%)` }} />
          </div>

          {/* top flap — folds back on open, drops behind the letter mid-flip */}
          <div className="absolute inset-0 overflow-hidden rounded-[26px]" style={{ zIndex: flapBehind ? 5 : 30, pointerEvents: "none" }}>
            <button
              type="button"
              onClick={open ? undefined : openEnvelope}
              disabled={open}
              aria-label="Open the envelope"
              className="mu-env-top mu-env-anim absolute inset-0"
              style={{ background: ENV.top, transformOrigin: "top center", transform: open ? "rotateX(180deg)" : "rotateX(0deg)", transition: "transform .65s cubic-bezier(.4,0,.2,1)", pointerEvents: open ? "none" : "auto", cursor: open ? "default" : "pointer", border: "none" }}
            >
              <span aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(255,255,255,.45), transparent 55%, rgba(90,60,40,.1))" }} />
            </button>
          </div>

          {/* glossy rose wax seal — tap to open */}
          <button
            type="button"
            onClick={openEnvelope}
            disabled={open}
            aria-label="Tap the seal to open the letter"
            className="mu-env-anim absolute left-1/2 top-1/2"
            style={{ zIndex: 40, transform: open ? "translate(-50%,-50%) scale(.4) rotate(14deg)" : "translate(-50%,-50%) scale(1)", opacity: open ? 0 : 1, transition: "transform .35s, opacity .35s", pointerEvents: open ? "none" : "auto", cursor: open ? "default" : "pointer" }}
          >
            <span className="mu-anim-glow relative grid place-items-center overflow-hidden rounded-full" style={{ width: "clamp(52px,13vw,60px)", height: "clamp(52px,13vw,60px)", background: `linear-gradient(135deg, #d9537d, ${ENV.rose} 55%, ${ENV.roseDeep})`, boxShadow: "0 10px 20px -6px rgba(120,40,60,.55), inset 0 -3px 8px rgba(120,20,45,.4)", border: "1px solid rgba(255,255,255,.3)" }}>
              <span aria-hidden className="absolute rounded-full" style={{ top: 5, left: 9, width: 18, height: 9, background: "rgba(255,255,255,.45)", filter: "blur(.5px)", transform: "rotate(-45deg)" }} />
              <Heart size={22} fill="#fff" color="#fff" style={{ position: "relative", zIndex: 1 }} />
            </span>
          </button>
        </div>
      </div>

      {/* caption / controls */}
      <div className="mt-6 flex flex-col items-center gap-2">
        {!open ? (
          <p className="mu-script text-xl" style={{ color: "#9a7457" }}>tap the seal to open</p>
        ) : (
          <button type="button" onClick={closeEnvelope} className="mu-btn-ghost mu-sans px-4 py-1.5 text-xs">reseal the envelope</button>
        )}
      </div>

      {/* full reading modal */}
      {portalEl &&
        createPortal(
          <AnimatePresence>
            {reading && (
              <motion.div
                className="fixed inset-0 z-[80] flex items-center justify-center p-4"
                style={{ background: "rgba(58,44,39,.5)", backdropFilter: "blur(4px)" }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setReading(false)}
                role="dialog" aria-label="The letter"
              >
                <motion.div
                  className="mu-paper-dots relative flex w-full max-w-lg flex-col overflow-hidden rounded-3xl p-6 sm:p-8"
                  style={{ maxHeight: "86vh", border: "1px solid rgba(120,80,55,.18)", boxShadow: "0 40px 80px -24px rgba(58,44,39,.6)" }}
                  initial={{ opacity: 0, scale: 0.9, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ type: "spring", stiffness: 280, damping: 26 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button onClick={() => setReading(false)} aria-label="Close" className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full" style={{ background: "rgba(120,80,55,.1)", color: ENV.ink }}>
                    <X size={16} />
                  </button>

                  <div className="flex items-center justify-between border-b pb-3 pr-12" style={{ borderColor: "rgba(120,80,55,.14)" }}>
                    <div>
                      <p className="mu-sans text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: ENV.label }}>a letter to</p>
                      <h3 className="mu-serif text-xl" style={serifName}>{greeting}</h3>
                    </div>
                    <span className="mu-sans text-xs tracking-wider" style={{ color: "rgba(120,80,55,.4)" }}>{year}</span>
                  </div>

                  <div className="my-4 flex-1 overflow-y-auto pr-1">
                    {paras.map((p, i) => (
                      <p key={i} className="mu-serif text-sm leading-relaxed sm:text-base" style={{ color: "rgba(58,44,39,.9)", fontStyle: "normal", marginTop: i ? "0.9rem" : 0 }}>
                        {i === 0 ? `“${p}` : p}{i === paras.length - 1 ? "”" : ""}
                      </p>
                    ))}
                  </div>

                  <div className="flex items-end justify-between border-t pt-3" style={{ borderColor: "rgba(120,80,55,.14)" }}>
                    <button type="button" onClick={copy} className="mu-sans flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium" style={{ background: "rgba(120,80,55,.1)", color: ENV.ink }}>
                      {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? "copied" : "copy"}
                    </button>
                    <div className="text-right">
                      <p className="mu-sans text-[10px] uppercase tracking-[0.2em]" style={{ color: ENV.label }}>{sign}</p>
                      {from && <h4 className="mu-serif text-lg" style={serifName}>{from}</h4>}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          portalEl,
        )}
    </div>
  );
}
