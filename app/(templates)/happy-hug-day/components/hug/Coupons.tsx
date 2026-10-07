"use client";

// Tear-off hug coupons. Each coupon has a stub and a perforation; drag the
// coupon down along the perforation (or pull it away from the stub). The rip
// follows your finger; past 70% it tears free with a rip sound, and WhatsApp
// opens with "Redeeming my <coupon> from Jhappi Café". Under 70% it snaps
// back. Every coupon also has a plain "Tear & redeem" button.

import { useRef } from "react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { FONTS, VW } from "../../../_valentine/theme";
import { burst, haptic, useReducedMotion } from "../../../_valentine/kit";
import { Btn, H, Hint, Title, clamp, sfx } from "./ui";

const TEAR_PX = 120;
const COLORS = [
  ["#FFE3EA", H.cheek],
  ["#FFF0CC", "#D9822B"],
  ["#E9E0FF", "#7E5BC2"],
  ["#DDF3E8", "#2F8F6B"],
  ["#FFE1D3", "#E0704B"],
  ["#E3EEFF", "#3D6FB6"],
] as const;

export function waRedeem(title: string, detail: string, sender: string) {
  const text = `Redeeming my 🎟️ *${title}* coupon from Jhappi Café 🤗${detail ? `\n“${detail}”` : ""}\nAa jao abhi!${sender ? `\n— to ${sender}` : ""}`;
  // api.whatsapp.com directly: the wa.me redirect mangles some emoji into U+FFFD
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}

function Coupon({ k, title, detail, sender, torn, onTear }: { k: number; title: string; detail: string; sender: string; torn: boolean; onTear: () => void }) {
  const reduced = useReducedMotion();
  const p = useMotionValue(torn ? 1 : 0);
  const rot = useTransform(p, [0, 1], [0, 7]);
  const x = useTransform(p, [0, 1], [0, 14]);
  const rip = useTransform(p, (v) => `${Math.min(100, v * 100)}%`);
  const start = useRef<{ id: number; x: number; y: number } | null>(null);
  const [bg, ink] = COLORS[k % COLORS.length];
  const href = waRedeem(title, detail, sender);

  const tear = (open: boolean) => {
    if (torn) return;
    sfx.rip();
    haptic([20, 30, 20]);
    animate(p, 1, { duration: 0.2 });
    onTear();
    burst({ kind: "sparkles", emojis: ["✦", "·", "🤍"], count: 12, spread: 0.12 });
    if (open && typeof window !== "undefined") window.open(href, "_blank", "noopener,noreferrer");
  };

  const down = (e: React.PointerEvent) => {
    if (torn) return;
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    start.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
  };
  const move = (e: React.PointerEvent) => {
    const s = start.current;
    if (!s || s.id !== e.pointerId || torn) return;
    const v = clamp(Math.max(e.clientY - s.y, e.clientX - s.x) / TEAR_PX, 0, 1);
    if (Math.floor(v * 6) > Math.floor(p.get() * 6)) haptic(4);
    p.set(v);
  };
  const up = (e: React.PointerEvent) => {
    const s = start.current;
    if (!s || s.id !== e.pointerId) return;
    start.current = null;
    if (torn) return;
    if (p.get() >= 0.7) tear(true);
    else animate(p, 0, { duration: 0.2, ease: "easeOut" });
  };

  return (
    <div style={{ position: "relative", display: "grid", gridTemplateColumns: "64px 1fr", filter: "drop-shadow(0 12px 16px rgba(107,66,50,.18))" }}>
      {/* stub */}
      <div style={{ background: bg, borderRadius: "14px 0 0 14px", display: "grid", placeItems: "center", padding: "8px 0", borderRight: 0 }}>
        <span style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", font: `800 10.5px ${FONTS.ui}`, letterSpacing: ".2em", color: ink }}>JHAPPI CAFÉ · No.{String(k + 1).padStart(3, "0")}</span>
      </div>
      {/* perforation + the rip */}
      <div aria-hidden style={{ position: "absolute", left: 61, top: 4, bottom: 4, width: 6, background: `radial-gradient(circle, ${VW.base} 0 2.4px, transparent 2.8px) 0 0/6px 10px`, zIndex: 2 }} />
      <motion.div aria-hidden style={{ position: "absolute", left: 60, top: 0, width: 8, height: rip, background: "repeating-linear-gradient(180deg, #fff 0 4px, transparent 4px 7px)", zIndex: 3, opacity: 0.9 }} />
      {/* body */}
      <motion.div
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        style={{
          rotate: rot,
          x,
          originX: 0,
          originY: 1,
          position: "relative",
          minHeight: 112,
          padding: "14px 16px 12px 18px",
          borderRadius: "0 14px 14px 0",
          background: `linear-gradient(135deg, ${bg}, #fff 160%)`,
          textAlign: "left",
          touchAction: torn ? "auto" : "none",
          cursor: torn ? "default" : "grab",
          userSelect: "none",
        }}
      >
        <p style={{ margin: 0, font: `800 10px ${FONTS.ui}`, letterSpacing: ".22em", color: ink }}>HUG COUPON · VALID FOREVER</p>
        <p style={{ margin: "4px 0 2px", font: `700 19px/1.2 ${FONTS.ui}`, color: H.cocoaDeep, overflowWrap: "anywhere" }}>{title}</p>
        {detail && <p style={{ margin: 0, font: `400 13.5px/1.4 ${FONTS.ui}`, color: H.cocoa, overflowWrap: "anywhere" }}>{detail}</p>}
        {torn ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
            <span style={{ padding: "3px 10px", border: `2px solid ${ink}`, borderRadius: 6, transform: "rotate(-6deg)", font: `800 12px ${FONTS.ui}`, letterSpacing: ".12em", color: ink }}>REDEEMED ✓</span>
            <a href={href} target="_blank" rel="noopener noreferrer" style={{ font: `700 13px ${FONTS.ui}`, color: "#1F9D55", textDecoration: "underline", textUnderlineOffset: 3, minHeight: 32, display: "inline-flex", alignItems: "center" }}>
              send it on WhatsApp →
            </a>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 8 }}>
            <span style={{ font: `600 12px ${FONTS.ui}`, color: "rgba(107,66,50,.6)" }}>{reduced ? "" : "↓ tear along the dots"}</span>
            <button type="button" onClick={() => tear(true)} style={{ minHeight: 36, padding: "6px 12px", borderRadius: 10, border: `1.5px solid ${ink}`, background: "rgba(255,255,255,.7)", color: ink, font: `700 12.5px ${FONTS.ui}`, cursor: "pointer" }}>
              Tear &amp; redeem
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function Coupons({ coupons, sender, redeemed, onRedeem, sticker, onNext }: { coupons: { title: string; detail: string }[]; sender: string; redeemed: number[]; onRedeem: (k: number) => void; sticker: React.ReactNode; onNext: () => void }) {
  return (
    <>
      {sticker}
      <Title>Hug coupons</Title>
      <p style={{ margin: "-6px 0 0", maxWidth: 320, font: `400 15px/1.45 ${FONTS.ui}`, color: VW.inkSoft }}>
        Tear one off whenever you need a real one. {sender} has to report immediately. Rules of the café.
      </p>
      <div style={{ width: "min(100%, calc(420px * var(--vw-s, 1)))", display: "grid", gap: 14 }}>
        {coupons.map((c, k) => (
          <Coupon key={k} k={k} title={c.title} detail={c.detail} sender={sender} torn={redeemed.includes(k)} onTear={() => onRedeem(k)} />
        ))}
      </div>
      <Hint>Drag a coupon down along the dots to tear it ✂️</Hint>
      <Btn onClick={onNext}>{redeemed.length ? "Get my Jhappi Passport →" : "Save them for later →"}</Btn>
    </>
  );
}
