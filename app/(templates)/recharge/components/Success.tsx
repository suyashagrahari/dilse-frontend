"use client";

// ─── Success: green tick, confetti, scratch card, receipt ────────────────────
//
// The full-bleed green success screen every payments app shares: a white disc
// pops in, the tick draws itself, two ripples roll out, and (sound-less)
// confetti falls. Below it: the plan now active, a cashback scratch card you
// actually scratch, the payment note (the part that stops joking), moments,
// and the transaction details with a copyable UPI reference.

import { useCallback, useEffect, useRef, useState } from "react";
import { OPERATOR_NAME, parseRow, type Plan, type RechargeData } from "./types";
import { Avatar, Photo, priceLabel, fmtStamp, txnRef, INK, MUTED, FAINT, PINK, PINK_DEEP, BERRY, GREEN_DEEP } from "./ui";
import { IconCheck, IconCopy, IconGift, IconHeartFill, IconMail, IconRepeat, IconShare, LogoMark } from "./icons";

/* ── Confetti ─────────────────────────────────────────────────────────────── */

const COLORS = ["#FFFFFF", "#FFE14D", "#FF8CB8", "#FFD1E3", "#B9F5D0"];

/** Deterministic pseudo-random in [0,1) — no Math.random in render. */
const rnd = (i: number, salt: number) => {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

function Confetti({ count = 44, fall = 420 }: { count?: number; fall?: number }) {
  return (
    <div className="rc-confetti" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => {
        const heart = i % 5 === 0;
        const w = heart ? 12 + rnd(i, 1) * 10 : 6 + rnd(i, 1) * 6;
        const style = {
          "--x": `${rnd(i, 2) * 100}%`,
          "--w": `${w}px`,
          "--h": `${heart ? w : w * (1.4 + rnd(i, 3))}px`,
          "--c": COLORS[i % COLORS.length],
          "--br": i % 3 === 0 ? "50%" : "2px",
          "--r": `${rnd(i, 4) * 360}deg`,
          "--d": `${1.8 + rnd(i, 5) * 1.6}s`,
          "--dl": `${0.25 + rnd(i, 6) * 0.9}s`,
          "--dx": `${(rnd(i, 7) - 0.5) * 120}px`,
          "--fy": `${fall * (0.7 + rnd(i, 8) * 0.5)}px`,
        } as React.CSSProperties;
        return heart ? (
          <i key={i} className="h" style={style}>
            ♥
          </i>
        ) : (
          <i key={i} style={style} />
        );
      })}
    </div>
  );
}

/* ── Scratch card ─────────────────────────────────────────────────────────── */

function ScratchCard({ title, note, onWin }: { title: string; note: string; onWin: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [won, setWon] = useState(false);
  const drawing = useRef(false);
  const moves = useRef(0);
  const last = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const { width, height } = c.getBoundingClientRect();
    c.width = Math.round(width * dpr);
    c.height = Math.round(height * dpr);
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    const g = ctx.createLinearGradient(0, 0, width, height);
    g.addColorStop(0, "#FF5C9A");
    g.addColorStop(0.55, "#D3125F");
    g.addColorStop(1, "#6E1250");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);
    // Pattern of little hearts, like the foil on a real scratch card.
    ctx.fillStyle = "rgba(255,255,255,.14)";
    ctx.font = "16px system-ui";
    for (let y = 14; y < height; y += 30) {
      for (let x = (y / 30) % 2 ? 6 : 20; x < width; x += 30) ctx.fillText("♥", x, y);
    }
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    ctx.font = "800 22px system-ui, sans-serif";
    ctx.fillText("Scratch me", width / 2, height / 2 - 4);
    ctx.font = "600 12.5px system-ui, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,.85)";
    ctx.fillText("you've definitely won something 💗", width / 2, height / 2 + 20);
    ctx.globalCompositeOperation = "destination-out";
  }, []);

  const reveal = useCallback(() => {
    if (won) return;
    setWon(true);
    onWin();
  }, [won, onWin]);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const scratch = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx || won) return;
    const p = pos(e);
    ctx.lineWidth = 42;
    ctx.lineCap = "round";
    ctx.beginPath();
    const from = last.current ?? p;
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
    moves.current += 1;
    if (moves.current % 8 === 0) {
      const { data } = ctx.getImageData(0, 0, c.width, c.height);
      let clear = 0;
      let total = 0;
      for (let i = 3; i < data.length; i += 4 * 24) {
        total += 1;
        if (data[i] < 20) clear += 1;
      }
      if (clear / total > 0.42) reveal();
    }
  };

  return (
    <div>
      <div className="rc-scratch">
        <div className={`rc-prize${won ? " won" : ""}`}>
          <span style={{ width: 58, height: 58, borderRadius: 18, background: "#FFE14D", display: "grid", placeItems: "center", color: INK }}>
            <IconGift size={30} />
          </span>
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".1em", color: GREEN_DEEP, marginTop: 12 }}>YOU WON</div>
          <b>{title || "Unlimited cuddles"}</b>
          {note ? <small>{note}</small> : null}
        </div>
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          style={{ opacity: won ? 0 : 1, pointerEvents: won ? "none" : "auto" }}
          onPointerDown={(e) => {
            drawing.current = true;
            last.current = null;
            e.currentTarget.setPointerCapture(e.pointerId);
            scratch(e);
          }}
          onPointerMove={(e) => drawing.current && scratch(e)}
          onPointerUp={() => {
            drawing.current = false;
            last.current = null;
          }}
          onPointerCancel={() => {
            drawing.current = false;
          }}
        />
      </div>
      {!won ? (
        <div style={{ textAlign: "center", marginTop: 12 }}>
          <button type="button" className="rc-link" onClick={reveal}>
            Too impatient? Tap to reveal
          </button>
        </div>
      ) : null}
    </div>
  );
}

/* ── The screen ───────────────────────────────────────────────────────────── */

export default function Success({
  data,
  plan,
  stamp,
  bank,
  onAgain,
  onLetter,
  onToast,
  topInset,
}: {
  data: RechargeData;
  plan: Plan;
  stamp: Date;
  bank: string;
  onAgain: () => void;
  onLetter: (() => void) | null;
  onToast: (t: string) => void;
  topInset: number;
}) {
  const [burst, setBurst] = useState(0);
  const name = data.subscriber.name || "them";
  const ref = txnRef(`${data.subscriber.name}|${data.sender.name}|${plan.id}`);
  const rows = plan.rows.map(parseRow);

  const copy = () => {
    try {
      void navigator.clipboard?.writeText(ref);
    } catch {
      /* clipboard blocked — the toast still lands */
    }
    onToast("UPI ref copied (it's not real, relax 😌)");
  };

  const share = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const text = `Recharge successful 💗 ${priceLabel(plan.price)} · ${plan.validity}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Recharge successful", text, url });
        return;
      }
      await navigator.clipboard?.writeText(url);
      onToast("Link copied 💌");
    } catch {
      /* dismissed */
    }
  };

  return (
    <div>
      <div className="rc-ok-hero" style={{ paddingTop: 34 + topInset }}>
        <Confetti />
        {burst > 0 ? <Confetti key={burst} count={30} fall={620} /> : null}
        <div style={{ position: "relative" }}>
          <div className="rc-ok-tick">
            <span className="wave" />
            <span className="wave b" />
            <span className="disc" />
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#18A058" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m5 12.5 4.5 4.5L19 7.5" />
            </svg>
          </div>
          <h1 className="rc-ok-title">Recharge Successful</h1>
          <div className="rc-ok-amt">{priceLabel(plan.price)}</div>
          <div className="rc-ok-sub">
            Paid to <b>{name}</b> · {data.subscriber.number}
            <br />
            <span style={{ opacity: 0.85 }}>{fmtStamp(stamp)}</span>
          </div>
        </div>
      </div>

      <div className="rc-ok-body">
        <div className="rc-ok-col">
          {/* Plan now active */}
          <div className="rc-card" style={{ padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Avatar photo={data.photos[0]} name={name} size={48} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{name} 💗</div>
                <div style={{ fontSize: 12.5, color: MUTED, marginTop: 2 }}>
                  Prepaid · {OPERATOR_NAME}
                  {data.subscriber.circle ? ` · ${data.subscriber.circle}` : ""}
                </div>
              </div>
              <span className="rc-status">
                <IconCheck size={12} stroke={3} /> Active
              </span>
            </div>
            <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: 14, background: "#FAF8FC", display: "flex", justifyContent: "space-between", gap: 10, fontSize: 13.5 }}>
              <span style={{ color: MUTED }}>
                Plan <b style={{ color: INK }}>{priceLabel(plan.price)}</b>
              </span>
              <span style={{ color: MUTED }}>
                Validity <b style={{ color: INK }}>{plan.validity || "—"}</b>
              </span>
            </div>
            {rows.length || plan.benefits.length ? (
              <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
                {[...rows.map((r) => (r.label ? `${r.label}: ${r.value}` : r.value)), ...plan.benefits].slice(0, 6).map((t, i) => (
                  <div key={i} style={{ display: "flex", gap: 9, alignItems: "flex-start", fontSize: 13.5, lineHeight: 1.4 }}>
                    <span style={{ color: GREEN_DEEP, marginTop: 1, flex: "none" }}>
                      <IconCheck size={15} stroke={2.8} />
                    </span>
                    {t}
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {/* The note — where the joking stops */}
          {data.receipt.message.length ? (
            <div className="rc-card" style={{ padding: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: MUTED, fontWeight: 600, marginBottom: 12 }}>
                <IconMail size={16} /> Payment note from {data.sender.name || "someone who loves you"}
              </div>
              <div className="rc-note">
                {data.receipt.message.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              <div style={{ textAlign: "right", fontSize: 11, color: FAINT, marginTop: 6 }}>
                delivered · {fmtStamp(stamp).split(", ")[1]} ✓✓
              </div>
            </div>
          ) : null}

          {/* Moments */}
          {data.photos.length ? (
            <div className="rc-card" style={{ padding: "18px 14px 10px" }}>
              <div style={{ fontWeight: 700, fontSize: 15, padding: "0 4px" }}>Moments unlocked with this plan 📸</div>
              <div className="rc-polas rc-noscroll">
                {data.photos.map((ph, i) => (
                  <div key={i} className="rc-pola" style={{ "--t": `${[-3, 2.5, -1.5, 3, -2.5, 1.5][i % 6]}deg` } as React.CSSProperties}>
                    <div>
                      <Photo photo={ph} />
                    </div>
                    <span>{["us 💗", "core memory", "my fav", "again pls", "full bars", "forever"][i % 6]}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="rc-ok-col">
          {/* Scratch card */}
          <div className="rc-card" style={{ padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 14 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16 }}>You&apos;ve won a scratch card! 🎁</div>
                <div style={{ fontSize: 12.5, color: MUTED, marginTop: 2 }}>Cashback on your {priceLabel(plan.price)} recharge</div>
              </div>
            </div>
            <ScratchCard title={data.cashback.title} note={data.cashback.note} onWin={() => setBurst((b) => b + 1)} />
          </div>

          {/* Transaction details */}
          <div className="rc-card" style={{ padding: "8px 18px" }}>
            <div className="rc-kv">
              <span>Status</span>
              <b>
                <span className="rc-status">
                  <IconCheck size={12} stroke={3} /> Successful
                </span>
              </b>
            </div>
            <div className="rc-kv">
              <span>UPI transaction ID</span>
              <b>
                {ref}
                <button type="button" className="rc-icon-btn" onClick={copy} aria-label="Copy UPI transaction ID" style={{ width: 28, height: 28, color: PINK_DEEP }}>
                  <IconCopy size={15} />
                </button>
              </b>
            </div>
            <div className="rc-kv">
              <span>Paid from</span>
              <b>
                {bank} · XXXX 1402
              </b>
            </div>
            <div className="rc-kv">
              <span>Paid by</span>
              <b>{data.sender.name || "you know who 😉"}</b>
            </div>
            <div className="rc-kv">
              <span>Recharged for</span>
              <b>
                {name} · {data.subscriber.number}
              </b>
            </div>
            <div className="rc-kv">
              <span>Date &amp; time</span>
              <b>{fmtStamp(stamp)}</b>
            </div>
            <div className="rc-kv">
              <span>Refund policy</span>
              <b>None. You&apos;re stuck with me.</b>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: onLetter ? "1fr 1fr" : "1fr", gap: 10 }}>
            <button type="button" className="rc-btn rc-btn-ghost" onClick={share}>
              <IconShare size={17} /> Share receipt
            </button>
            {onLetter ? (
              <button type="button" className="rc-btn rc-btn-pink" onClick={onLetter}>
                <IconHeartFill size={15} /> Open letter
              </button>
            ) : null}
          </div>
          <button type="button" className="rc-btn rc-btn-ghost" style={{ background: "transparent", border: 0, color: PINK_DEEP }} onClick={onAgain}>
            <IconRepeat size={16} /> Recharge again (you know you want to)
          </button>

          <div className="rc-foot" style={{ paddingTop: 4 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: BERRY, fontWeight: 700 }}>
              <LogoMark size={16} /> dilpay
            </span>
            <br />
            Need help with this recharge? Call the number you already know by heart.
            <span style={{ color: PINK }}> It rings on the first ring.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
