"use client";

// ─── The purchase: fly-to-cart, "Added to cart", checkout, order placed ──────
//
// The whole second act of the page. Add to Cart throws her photo in an arc
// into whichever cart icon is on screen (the header on desktop, the tab bar on
// a phone), the cart count ticks and bounces, and the "Added to cart" panel
// slides in — from the right on desktop, from the bottom on a phone, exactly
// where the real one lives. Proceed to Buy opens a stripped checkout, and
// Place your order ends on the success screen, which hands off to the letter.
//
// Everything here is transform/opacity and honours reduced motion: with it on,
// nothing flies and the panels simply appear.

import { useEffect, useRef, useState } from "react";
import { C, FONT, WRAP, useReducedMotion } from "./tokens";
import type { PhotoCrop, ProductData } from "./types";
import { Framed } from "./Gallery";
import { PriceTag } from "./Details";
import { Wordmark } from "./Chrome";
import { IconCheckCircle, IconHeart, IconLock } from "./icons";

/* ── Fly to cart ───────────────────────────────────────────────────────────── */

export interface Flight {
  id: number;
  src: string;
  crop?: PhotoCrop;
  from: { x: number; y: number; w: number; h: number };
  to: { x: number; y: number };
}

/** Finds the cart icon that is actually on screen right now. */
export function visibleCartTarget(): { x: number; y: number } | null {
  const els = Array.from(document.querySelectorAll<HTMLElement>("[data-lk-cart]"));
  for (const el of els) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }
  return null;
}

export function FlyingPhoto({ flight, onLanded }: { flight: Flight; onLanded: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const landed = useRef(onLanded);
  useEffect(() => {
    landed.current = onLanded;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced || typeof el.animate !== "function") {
      const t = window.setTimeout(() => landed.current(), 0);
      return () => window.clearTimeout(t);
    }
    const size = Math.min(flight.from.w, flight.from.h, 180);
    const sx = flight.from.x + flight.from.w / 2 - size / 2;
    const sy = flight.from.y + flight.from.h / 2 - size / 2;
    const dx = flight.to.x - (sx + size / 2);
    const dy = flight.to.y - (sy + size / 2);
    el.style.left = `${sx}px`;
    el.style.top = `${sy}px`;
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    const lift = Math.min(160, Math.abs(dy) * 0.35 + 60);
    const anim = el.animate(
      [
        { transform: "translate(0,0) scale(1) rotate(0deg)", opacity: 1, borderRadius: "12px" },
        { transform: `translate(${dx * 0.45}px, ${dy * 0.35 - lift}px) scale(.55) rotate(-8deg)`, opacity: 1, borderRadius: "40%", offset: 0.45 },
        { transform: `translate(${dx}px, ${dy}px) scale(.08) rotate(10deg)`, opacity: 0.4, borderRadius: "50%" },
      ],
      { duration: 820, easing: "cubic-bezier(.55,.06,.36,1)", fill: "forwards" }
    );
    anim.onfinish = () => landed.current();
    return () => anim.cancel();
  }, [flight, reduced]);

  return (
    <div ref={ref} className="lk-fly" aria-hidden="true">
      <Framed src={flight.src} crop={flight.crop} alt="" eager />
      <span className="lk-fly-heart">
        <IconHeart size={18} color="#fff" fill={C.love} />
      </span>
    </div>
  );
}

/* ── Added to cart ─────────────────────────────────────────────────────────── */

export function AddedToCart({
  data,
  crop,
  onProceed,
  onClose,
}: {
  data: ProductData;
  crop?: PhotoCrop;
  onProceed: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="lk-added-wrap" role="dialog" aria-modal="true" aria-label="Added to cart">
      <div className="lk-scrim" onClick={onClose} />
      <div className="lk-added">
        <button type="button" className="lk-x" onClick={onClose} aria-label="Close">
          ✕
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span className="lk-added-thumb">
            <Framed src={data.subject.photos[0] ?? ""} crop={crop} alt="" />
          </span>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, display: "flex", alignItems: "center", gap: 6, fontSize: 18, fontWeight: 700, color: C.okGreen }}>
              <IconCheckCircle size={20} /> Added to cart
            </p>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: C.secondary, ...WRAP }}>
              She was already in your cart. We added her again anyway.
            </p>
          </div>
        </div>

        <div className="lk-added-sub">
          <span style={{ fontSize: 15 }}>Cart subtotal:</span>
          <strong style={{ color: C.priceRed }}>
            <PriceTag amount={data.price.amount} size={20} />
          </strong>
        </div>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: C.okGreen }}>
          ✓ Your order qualifies for FREE delivery. Forever.
        </p>

        <button type="button" className="lk-cta lk-cta-yellow" style={{ marginTop: 14 }} onClick={onProceed}>
          Proceed to Buy (1 item)
        </button>
        <button type="button" className="lk-cta lk-cta-ghost" style={{ marginTop: 8 }} onClick={onClose}>
          Continue shopping (why though)
        </button>

        <div className="lk-added-also">
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Customers who bought this item also bought</p>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: C.secondary }}>Nothing else. Ever. That&apos;s the review.</p>
        </div>
      </div>
    </div>
  );
}

/* ── Checkout → order placed ───────────────────────────────────────────────── */

const PAY = [
  { id: "hod", label: "Hugs on Delivery", note: "Pay at the door. Minimum 10 seconds." },
  { id: "upi", label: "UPI · forever@love", note: "Instant. Non-refundable." },
  { id: "emi", label: "No Cost EMI", note: "Forehead kisses, one a day, for life." },
  { id: "nb", label: "Net Banking (feelings)", note: "Select your bank: the heart." },
] as const;

export function Checkout({
  data,
  crop,
  hasLetter,
  onOpenLetter,
  onClose,
}: {
  data: ProductData;
  crop?: PhotoCrop;
  hasLetter: boolean;
  onOpenLetter: () => void;
  onClose: () => void;
}) {
  const [pay, setPay] = useState<string>("hod");
  const [stage, setStage] = useState<"form" | "placing" | "done">("form");
  const [rated, setRated] = useState(0);
  const reduced = useReducedMotion();
  const her = data.subject.firstName.trim() || "her";
  const him = data.sender.firstName.trim() || "me";

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    if (stage !== "placing") return;
    const t = window.setTimeout(() => setStage("done"), reduced ? 200 : 1500);
    return () => window.clearTimeout(t);
  }, [stage, reduced]);

  const orderNo = `407-${(data.subject.firstName.length * 7919 + 1402143) % 9999999}-${him.length}${her.length}143`;

  return (
    <div className="lk-co" role="dialog" aria-modal="true" aria-label="Checkout">
      <header className="lk-co-head">
        <Wordmark scale={0.85} color="#0F1111" />
        <span className="lk-co-title">{stage === "done" ? "Order placed" : "Checkout"}</span>
        <IconLock size={18} color="#999" />
        <button type="button" onClick={onClose} className="lk-x" style={{ position: "static" }} aria-label="Close checkout">
          ✕
        </button>
      </header>

      {stage !== "done" ? (
        <div className="lk-co-body">
          <div className="lk-co-main">
            <section className="lk-co-card">
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <h3 className="lk-co-h">Delivering to {her}</h3>
                <span className="lk-link" style={{ fontSize: 13 }}>
                  Change
                </span>
              </div>
              <p style={{ margin: "4px 0 0", fontSize: 14, lineHeight: 1.5, color: C.text }}>
                Flat 143, My Heart, Forever Apartments, Wherever-{him}-Is 560001
              </p>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: C.secondary }}>Add delivery instructions: “ring twice, then hug”</p>
            </section>

            <section className="lk-co-card">
              <h3 className="lk-co-h">Payment method</h3>
              <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
                {PAY.map((p) => (
                  <label key={p.id} className={`lk-pay${pay === p.id ? " on" : ""}`}>
                    <input type="radio" name="lk-pay" checked={pay === p.id} onChange={() => setPay(p.id)} />
                    <span>
                      <strong style={{ fontSize: 14 }}>{p.label}</strong>
                      <span style={{ display: "block", fontSize: 12.5, color: C.secondary }}>{p.note}</span>
                    </span>
                  </label>
                ))}
              </div>
            </section>

            <section className="lk-co-card">
              <h3 className="lk-co-h" style={{ color: C.okGreen }}>Arriving forever, starting today</h3>
              <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
                <span className="lk-added-thumb">
                  <Framed src={data.subject.photos[0] ?? ""} crop={crop} alt="" />
                </span>
                <div style={{ minWidth: 0, fontSize: 14 }}>
                  <p style={{ margin: 0, fontWeight: 700, ...WRAP }}>{data.title}</p>
                  <p style={{ margin: "4px 0 0", color: C.priceRed, fontWeight: 700 }}>
                    <PriceTag amount={data.price.amount} size={16} />
                  </p>
                  <p style={{ margin: "2px 0 0", color: C.secondary, fontSize: 13 }}>Qty: 1 · Sold by: nobody, she chose this</p>
                </div>
              </div>
            </section>
          </div>

          <aside className="lk-co-side">
            <button
              type="button"
              className="lk-cta lk-cta-yellow lk-place"
              onClick={() => setStage("placing")}
              disabled={stage === "placing"}
            >
              {stage === "placing" ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <span className="lk-spin" /> Placing your order…
                </span>
              ) : (
                "Place your order"
              )}
            </button>
            <p style={{ margin: "8px 0 12px", fontSize: 11.5, color: C.secondary, lineHeight: 1.45 }}>
              By placing your order, you agree to be loved on bad days too. No returns. No exchanges.
            </p>
            <div className="lk-co-sum">
              <div>
                <span>Items:</span>
                <span>{data.price.amount}</span>
              </div>
              <div>
                <span>Delivery:</span>
                <span>FREE</span>
              </div>
              <div>
                <span>Hugs:</span>
                <span>included</span>
              </div>
              <div className="lk-co-total">
                <span>Order Total:</span>
                <span>{data.price.amount}</span>
              </div>
            </div>
          </aside>
        </div>
      ) : (
        <div className="lk-done">
          <div className="lk-done-burst" aria-hidden="true">
            {Array.from({ length: 14 }).map((_, i) => (
              <span key={i} style={{ ["--a" as string]: `${(360 / 14) * i}deg`, ["--d" as string]: `${i * 18}ms` }}>
                {i % 3 === 0 ? "💛" : i % 3 === 1 ? "❤️" : "✨"}
              </span>
            ))}
            <span className="lk-done-check">
              <IconCheckCircle size={74} />
            </span>
          </div>
          <h2 className="lk-done-h">Order placed, thank you!</h2>
          <p style={{ margin: "6px 0 0", fontSize: 15, color: C.text }}>Confirmation will be sent to your heart.</p>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: C.secondary }}>Order #{orderNo}</p>

          <div className="lk-done-card">
            <span className="lk-added-thumb">
              <Framed src={data.subject.photos[0] ?? ""} crop={crop} alt="" />
            </span>
            <div style={{ minWidth: 0, textAlign: "left" }}>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.okGreen }}>Arriving forever</p>
              <p style={{ margin: "3px 0 0", fontSize: 13, color: C.text, ...WRAP }}>
                Hand-delivered by {him}, on foot, holding flowers he&apos;ll claim were on offer.
              </p>
            </div>
          </div>

          {hasLetter ? (
            <button type="button" className="lk-cta lk-cta-yellow" style={{ maxWidth: 360, marginTop: 18 }} onClick={onOpenLetter}>
              Open the note that came in the box 💌
            </button>
          ) : null}

          <div style={{ marginTop: 20 }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>How was your purchase?</p>
            <div className="lk-rate-me" role="radiogroup" aria-label="Rate your purchase">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={rated === n}
                  aria-label={`${n} star${n === 1 ? "" : "s"}`}
                  onClick={() => setRated(n)}
                  className={n <= rated ? "on" : ""}
                >
                  ★
                </button>
              ))}
            </div>
            {rated > 0 ? (
              <p style={{ margin: "4px 0 0", fontSize: 13, color: rated === 5 ? C.okGreen : C.priceRed }}>
                {rated === 5 ? "Five stars. Obviously. 💛" : "We've rounded that up to five. You're welcome."}
              </p>
            ) : null}
          </div>

          <button type="button" className="lk-link" style={{ marginTop: 18, fontSize: 14 }} onClick={onClose}>
            Continue shopping
          </button>
        </div>
      )}
    </div>
  );
}

export function CartStyles() {
  return (
    <style>{`
      .lk-fly { position: fixed; z-index: 500; pointer-events: none; overflow: hidden; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,.28); will-change: transform; }
      .lk-fly-heart { position: absolute; right: 6px; bottom: 6px; width: 28px; height: 28px; border-radius: 50%; background: ${C.love}; display: grid; place-items: center; }

      .lk-added-wrap { position: fixed; inset: 0; z-index: 300; }
      .lk-scrim { position: absolute; inset: 0; background: rgba(15,17,17,.45); animation: lk-fadein .2s ease; }
      @keyframes lk-fadein { from { opacity: 0; } }
      .lk-added {
        position: absolute; left: 0; right: 0; bottom: 0; background: #fff; border-radius: 16px 16px 0 0; padding: 20px 16px calc(20px + env(safe-area-inset-bottom, 0px));
        font-family: ${FONT}; color: ${C.text}; animation: lk-sheet-up .36s cubic-bezier(.2,1,.3,1); box-shadow: 0 -10px 30px rgba(0,0,0,.2);
        max-height: 88dvh; overflow-y: auto;
      }
      @keyframes lk-sheet-up { from { transform: translateY(100%); } }
      @media (min-width: 768px) {
        .lk-added { left: auto; top: 0; width: 380px; border-radius: 0; padding: 26px 22px; animation-name: lk-sheet-left; max-height: none; }
        @keyframes lk-sheet-left { from { transform: translateX(100%); } }
      }
      .lk-x { position: absolute; top: 10px; right: 10px; width: 34px; height: 34px; border-radius: 50%; border: 0; background: #F0F2F2; cursor: pointer; font-size: 14px; color: ${C.text}; }
      .lk-added-thumb { flex: none; width: 72px; height: 72px; border-radius: 8px; overflow: hidden; border: 1px solid ${C.hairline}; }
      .lk-added-sub { display: flex; align-items: center; gap: 8px; margin-top: 18px; }
      .lk-added-also { margin-top: 18px; padding-top: 14px; border-top: 1px solid ${C.hairline}; }

      .lk-co { position: fixed; inset: 0; z-index: 320; background: #fff; display: flex; flex-direction: column; font-family: ${FONT}; color: ${C.text}; animation: lk-fadein .2s ease; }
      .lk-co-head { display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: linear-gradient(180deg, #F7F7F7, #EDEDED); border-bottom: 1px solid #DDD; }
      .lk-co-title { flex: 1; text-align: center; font-size: 22px; font-weight: 400; }
      @media (max-width: 480px) { .lk-co-title { font-size: 17px; } }
      .lk-co-body { flex: 1; overflow-y: auto; display: grid; gap: 14px; padding: 14px; align-content: start; max-width: 1150px; width: 100%; margin: 0 auto; }
      @media (min-width: 900px) { .lk-co-body { grid-template-columns: 1fr 300px; padding: 22px; } }
      .lk-co-main { display: grid; gap: 14px; min-width: 0; }
      .lk-co-card { border: 1px solid ${C.border}; border-radius: 8px; padding: 14px 16px; }
      .lk-co-h { margin: 0; font-size: 17px; font-weight: 700; }
      .lk-pay { display: flex; gap: 10px; align-items: flex-start; padding: 10px 12px; border-radius: 8px; border: 1px solid ${C.hairline}; cursor: pointer; transition: background .15s ease, border-color .15s ease; }
      .lk-pay.on { background: #FCF5EE; border-color: #FBD8B4; }
      .lk-pay input { accent-color: #E77600; margin-top: 3px; width: 16px; height: 16px; flex: none; }
      .lk-co-side { border: 1px solid ${C.border}; border-radius: 8px; padding: 14px 16px; align-self: start; background: #fff; }
      @media (min-width: 900px) { .lk-co-side { position: sticky; top: 0; } }
      .lk-place { min-height: 44px !important; font-size: 15px !important; }
      .lk-co-sum { border-top: 1px solid ${C.hairline}; padding-top: 10px; display: grid; gap: 4px; font-size: 13px; }
      .lk-co-sum > div { display: flex; justify-content: space-between; }
      .lk-co-total { border-top: 1px solid ${C.hairline}; margin-top: 6px; padding-top: 8px; color: ${C.priceRed}; font-size: 18px; font-weight: 700; }
      .lk-spin { width: 16px; height: 16px; border-radius: 50%; border: 2px solid rgba(0,0,0,.2); border-top-color: ${C.text}; animation: lk-rot .7s linear infinite; }
      @keyframes lk-rot { to { transform: rotate(360deg); } }

      .lk-done { flex: 1; overflow-y: auto; display: flex; flex-direction: column; align-items: center; text-align: center; padding: 34px 18px 60px; }
      .lk-done-burst { position: relative; width: 120px; height: 120px; display: grid; place-items: center; }
      .lk-done-burst > span:not(.lk-done-check) {
        position: absolute; left: 50%; top: 50%; font-size: 18px; opacity: 0;
        animation: lk-burst 1.2s cubic-bezier(.2,.8,.3,1) forwards; animation-delay: calc(.25s + var(--d));
      }
      @keyframes lk-burst {
        0% { opacity: 0; transform: translate(-50%,-50%) rotate(var(--a)) translateY(0) scale(.4); }
        25% { opacity: 1; }
        100% { opacity: 0; transform: translate(-50%,-50%) rotate(var(--a)) translateY(-78px) scale(1.1); }
      }
      .lk-done-check { animation: lk-check-pop .6s cubic-bezier(.2,1.6,.4,1) both; }
      @keyframes lk-check-pop { from { transform: scale(0); } }
      .lk-done-h { margin: 12px 0 0; font-size: 24px; font-weight: 700; color: ${C.okGreen}; animation: lk-rise .4s .2s ease both; }
      .lk-done-card { display: flex; align-items: center; gap: 12px; margin-top: 18px; padding: 12px 14px; border: 1px solid ${C.border}; border-radius: 10px; max-width: 420px; width: 100%; }
      .lk-rate-me { display: flex; justify-content: center; gap: 4px; margin-top: 6px; }
      .lk-rate-me button { border: 0; background: none; font-size: 30px; color: #D5D9D9; cursor: pointer; transition: transform .15s cubic-bezier(.2,1.6,.4,1), color .15s ease; }
      .lk-rate-me button.on { color: ${C.star}; transform: scale(1.12); }

      @media (prefers-reduced-motion: reduce) {
        .lk-scrim, .lk-added, .lk-co, .lk-done-check, .lk-done-h { animation: none; }
        .lk-done-burst > span:not(.lk-done-check) { display: none; }
      }
    `}</style>
  );
}
