"use client";

// ─── Payment: options sheet → UPI PIN → processing ───────────────────────────
//
// The options sheet lists invented UPI apps (generic glyphs, invented names)
// and the usual "other methods". The PIN screen is the standard bank PIN
// layout: bank + masked account, a dark band with payee and amount, four PIN
// slots, the yellow "you are paying…" warning, and a grey numeric keypad with
// backspace and a tick. Any four digits work — it's a love letter, not a bank.

import { useCallback, useEffect, useRef, useState } from "react";
import type { Plan, RechargeData } from "./types";
import { OPERATOR_NAME } from "./types";
import { Avatar, Price, Sheet, priceLabel, useReducedMotion, INK, MUTED, FAINT, PINK } from "./ui";
import {
  IconAlert,
  IconBackspace,
  IconBank,
  IconCard,
  IconCheck,
  IconClose,
  IconEye,
  IconHeartFill,
  IconHug,
  IconShield,
  IconTag,
  IconWallet,
  LogoMark,
  IconBolt,
  IconMail,
} from "./icons";

export interface PayMethod {
  id: string;
  label: string;
  bank: string;
}

const UPI_APPS: { id: string; label: string; bg: string; icon: React.ReactNode; bank: string }[] = [
  { id: "dilpay", label: "dilpay UPI", bg: "linear-gradient(135deg,#FF5C9A,#D3125F)", icon: <LogoMark size={40} />, bank: "Kiss Bank" },
  { id: "cuddle", label: "Cuddle Wallet", bg: "linear-gradient(135deg,#FFB347,#FF7A45)", icon: <IconHug size={22} stroke={2} />, bank: "Cuddle Co-op Bank" },
  { id: "butterfly", label: "Butterfly Pay", bg: "linear-gradient(135deg,#6B8CFF,#3A55D9)", icon: <IconBolt size={22} stroke={2} />, bank: "Butterflies Bank" },
  { id: "letter", label: "Pay by Letter", bg: "linear-gradient(135deg,#2BC271,#0F8646)", icon: <IconMail size={22} stroke={2} />, bank: "Post Office of Love" },
];

const OTHER = [
  { id: "card", label: "Debit / Credit card", sub: "Saved card •••• 1402 · heart-shaped", icon: <IconCard size={20} />, bank: "Kiss Bank Card" },
  { id: "net", label: "Net banking", sub: "All banks. None of them will understand this.", icon: <IconBank size={20} />, bank: "Every Bank Ever" },
  { id: "wallet", label: "Hug wallet", sub: "Balance: ∞ · auto top-up on", icon: <IconWallet size={20} />, bank: "Hug Wallet" },
  { id: "inperson", label: "Pay in person 🫦", sub: "Settle with a hug. Preferred method.", icon: <IconHeartFill size={18} />, bank: "In-person settlement" },
];

export const methodBank = (id: string): string =>
  UPI_APPS.find((a) => a.id === id)?.bank ?? OTHER.find((o) => o.id === id)?.bank ?? "Kiss Bank";

export function PaySheet({
  open,
  data,
  plan,
  method,
  onMethod,
  onClose,
  onPay,
}: {
  open: boolean;
  data: RechargeData;
  plan: Plan | null;
  method: string;
  onMethod: (id: string) => void;
  onClose: () => void;
  onPay: () => void;
}) {
  if (!plan) return null;
  return (
    <Sheet
      open={open}
      onClose={onClose}
      label="Payment options"
      title="Payment options"
      footer={
        <>
          <button type="button" className="rc-btn rc-btn-pink" style={{ width: "100%", minHeight: 52, fontSize: 16 }} onClick={onPay}>
            Pay {priceLabel(plan.price)}
          </button>
          <div className="rc-secure">
            <IconShield size={13} /> 100% safe &amp; secure payments · powered by UPI
          </div>
        </>
      }
    >
      <div className="rc-amount">
        <Avatar photo={data.photos[0]} name={data.subscriber.name} size={44} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, color: MUTED }}>Recharge for</div>
          <div style={{ fontWeight: 700, fontSize: 15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {data.subscriber.name || "them"} · {data.subscriber.number}
          </div>
          <div style={{ fontSize: 12, color: FAINT, marginTop: 2 }}>
            {OPERATOR_NAME} · {plan.validity}
          </div>
        </div>
        <Price price={plan.price} size={28} />
      </div>

      <div className="rc-coupon">
        <IconTag size={18} />
        <span>
          <b>LOVE100</b> applied · guaranteed cashback on this recharge 🎉
          <br />
          <span style={{ fontWeight: 500, opacity: 0.85 }}>A scratch card is waiting after payment</span>
        </span>
      </div>

      <div className="rc-sec">Pay by any UPI app</div>
      <div className="rc-upi">
        {UPI_APPS.map((a) => (
          <button key={a.id} type="button" className={method === a.id ? "on" : ""} onClick={() => onMethod(a.id)} aria-pressed={method === a.id}>
            {method === a.id ? (
              <span className="rc-tick">
                <IconCheck size={10} stroke={3.4} />
              </span>
            ) : null}
            <i style={{ background: a.bg, overflow: "hidden" }}>{a.icon}</i>
            {a.label}
          </button>
        ))}
      </div>

      <div className="rc-sec">More ways to pay</div>
      <div>
        {OTHER.map((o) => (
          <button key={o.id} type="button" className="rc-method" onClick={() => onMethod(o.id)} aria-pressed={method === o.id}>
            <i>{o.icon}</i>
            <span style={{ minWidth: 0 }}>
              <b>{o.label}</b>
              <small>{o.sub}</small>
            </span>
            <span className={`rc-ring${method === o.id ? " on" : ""}`} aria-hidden="true" />
          </button>
        ))}
      </div>
    </Sheet>
  );
}

/* ── UPI PIN ──────────────────────────────────────────────────────────────── */

const HINTS = [
  "psst… any 4 digits work. it's love, not a bank 🤫",
  "hint: the number of times I think about you per minute",
  "forgot PIN? just say 'I love you' and try again",
];

export function PinScreen({
  data,
  plan,
  bank,
  onCancel,
  onDone,
}: {
  data: RechargeData;
  plan: Plan;
  bank: string;
  onCancel: () => void;
  onDone: () => void;
}) {
  const [pin, setPin] = useState("");
  const [show, setShow] = useState(false);
  const [hit, setHit] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [hint] = useState(() => HINTS[Math.floor(Math.random() * HINTS.length)]);
  const doneRef = useRef(false);

  const press = useCallback((k: string) => {
    setHit(k);
    window.setTimeout(() => setHit((h) => (h === k ? null : h)), 120);
    if (k === "del") setPin((p) => p.slice(0, -1));
    else setPin((p) => (p.length >= 4 ? p : p + k));
  }, []);

  const submit = useCallback(() => {
    if (doneRef.current) return;
    if (pin.length < 4) {
      setShake(true);
      window.setTimeout(() => setShake(false), 420);
      return;
    }
    doneRef.current = true;
    onDone();
  }, [pin, onDone]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) press(e.key);
      else if (e.key === "Backspace") press("del");
      else if (e.key === "Enter") submit();
      else if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [press, submit, onCancel]);

  const acct = "XXXX 1402";
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "del", "0", "ok"];

  return (
    <div className="rc-pin" role="dialog" aria-modal="true" aria-label="Enter UPI PIN">
      <div className="rc-pin-card">
        <div className="rc-pin-top">
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <button type="button" className="rc-icon-btn" onClick={onCancel} aria-label="Cancel payment" style={{ marginLeft: -8 }}>
              <IconClose size={20} />
            </button>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14.5 }}>{bank}</div>
              <div style={{ fontSize: 12, color: MUTED }}>{acct}</div>
            </div>
          </div>
          <span className="rc-upi-word" aria-label="UPI">
            UP<span>I</span>
            <svg width="14" height="16" viewBox="0 0 14 16" aria-hidden="true">
              <path d="M3 1 11 8 3 15Z" fill="#F08A24" />
              <path d="M6 1 13 8 6 15Z" fill="#18A058" opacity=".85" />
            </svg>
          </span>
        </div>

        <div className="rc-pin-band">
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11.5, opacity: 0.75 }}>To:</div>
            <div style={{ fontWeight: 700, fontSize: 15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {data.subscriber.name || "them"} 💗
            </div>
            <div style={{ fontSize: 11.5, opacity: 0.75, marginTop: 2 }}>Recharge · {OPERATOR_NAME}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11.5, opacity: 0.75 }}>Sending:</div>
            <Price price={plan.price} size={24} color="#fff" />
          </div>
        </div>

        <div className="rc-pin-mid">
          <div className="rc-pin-label">ENTER 4-DIGIT UPI PIN</div>
          <div className={`rc-pin-boxes${shake ? " rc-pin-shake" : ""}`} aria-live="polite" aria-label={`${pin.length} of 4 digits entered`}>
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className={`rc-pin-box${pin[i] ? " full" : ""}`}>
                {pin[i] ? show ? pin[i] : <i /> : null}
              </span>
            ))}
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="rc-link"
              style={{ alignSelf: "flex-end", marginLeft: -4, fontSize: 11.5, color: "#4F46A8", gap: 4 }}
              aria-label={show ? "Hide PIN" : "Show PIN"}
            >
              <IconEye size={15} /> {show ? "HIDE" : "SHOW"}
            </button>
          </div>
          <div style={{ fontSize: 12.5, color: FAINT, marginTop: 14, textAlign: "center", maxWidth: 280, lineHeight: 1.45 }}>{hint}</div>

          <div className="rc-warn">
            <IconAlert size={18} />
            <span>
              You are paying <b>{priceLabel(plan.price)}</b> to <b>{data.subscriber.name || "them"}</b>. Feelings once sent cannot be reversed.
            </span>
          </div>
        </div>

        <div className="rc-keys">
          {keys.map((k) =>
            k === "del" ? (
              <button key={k} type="button" className={`rc-key${hit === k ? " hit" : ""}`} onClick={() => press("del")} aria-label="Backspace">
                <IconBackspace size={24} />
              </button>
            ) : k === "ok" ? (
              <button
                key={k}
                type="button"
                className={`rc-key rc-key-ok${pin.length === 4 ? " ready" : ""}`}
                onClick={submit}
                aria-label="Submit PIN"
                disabled={pin.length < 4}
              >
                <IconCheck size={26} stroke={3} />
              </button>
            ) : (
              <button key={k} type="button" className={`rc-key${hit === k ? " hit" : ""}`} onClick={() => press(k)}>
                {k}
              </button>
            ),
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Processing ───────────────────────────────────────────────────────────── */

export function Processing({ data, plan, onDone }: { data: RechargeData; plan: Plan; onDone: () => void }) {
  const reduced = useReducedMotion();
  const name = data.subscriber.name || "them";
  const lines = [
    "Contacting your bank…",
    `Asking ${name}'s heart for approval…`,
    "Verifying butterflies 🦋",
    "Almost there. Don't blink 💗",
  ];
  const [i, setI] = useState(0);
  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
  }, [onDone]);

  useEffect(() => {
    const total = reduced ? 1400 : 3600;
    const step = window.setInterval(() => setI((n) => Math.min(n + 1, lines.length - 1)), total / lines.length);
    const end = window.setTimeout(() => done.current(), total);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.clearInterval(step);
      window.clearTimeout(end);
      document.body.style.overflow = prev;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  return (
    <div className="rc-proc" role="status" aria-live="polite">
      <div className="rc-spin">
        <span>
          <IconHeartFill size={34} />
        </span>
      </div>
      <div style={{ fontSize: 19, fontWeight: 700, marginTop: 26, color: INK }}>Processing payment</div>
      <div style={{ fontSize: 14, color: MUTED, marginTop: 4 }}>
        {priceLabel(plan.price)} to {name}
      </div>
      <div className="rc-proc-line">
        <span key={i}>{lines[i]}</span>
      </div>
      <div style={{ position: "absolute", bottom: "calc(28px + env(safe-area-inset-bottom, 0px))", left: 24, right: 24, fontSize: 12.5, color: FAINT }}>
        Please do not press back or close the app
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 8, color: PINK, fontWeight: 700 }}>
          <LogoMark size={16} /> dilpay · secured by UPI
        </div>
      </div>
    </div>
  );
}
