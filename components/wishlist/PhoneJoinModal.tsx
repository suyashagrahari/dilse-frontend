"use client";

// ─── The phone step of joining the wishlist ──────────────────────────────────
//
// A small card in the middle of the screen: pick a country (flag + dial code,
// searchable), type the number, join. The number is checked as you type with
// the same rules the server applies (India: 10 digits starting 6–9; elsewhere
// a loose length range), and the server's answer is shown in place if it still
// disagrees. Escape, the ✕ and a tap outside all close it.

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Heart, Loader2, Lock, Search, X } from "lucide-react";
import { COUNTRIES, flagOf, guessCountry, type Country } from "@/lib/wishlist/countries";
import type { WishlistPhone } from "@/hooks/useWishlist";
import { VALENTINE_DISCOUNT } from "@/lib/wishlist/valentine";

const noop = () => () => {};

function check(c: Country, digits: string): string | null {
  if (!digits) return "Enter your phone number";
  if (c.iso === "IN") return /^[6-9]\d{9}$/.test(digits) ? null : "Enter a valid 10-digit mobile number";
  if (digits.length < c.min || digits.length > c.max) {
    return c.min === c.max ? `${c.name} numbers have ${c.min} digits` : `${c.name} numbers have ${c.min}–${c.max} digits`;
  }
  return null;
}

export default function PhoneJoinModal({
  open,
  mode = "join",
  name,
  onClose,
  onSubmit,
}: {
  open: boolean;
  /** "add" — already joined, just adding the number. */
  mode?: "join" | "add";
  name?: string;
  onClose: () => void;
  onSubmit: (phone: WishlistPhone) => Promise<{ ok: boolean; error?: string }>;
}) {
  // Nothing renders on the server (portal), so guessing from the browser here is safe.
  const [country, setCountry] = useState<Country>(() => (typeof window === "undefined" ? COUNTRIES[0] : guessCountry()));
  const [number, setNumber] = useState("");
  const [touched, setTouched] = useState(false);
  const [picking, setPicking] = useState(false);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => inputRef.current?.focus(), 250);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && !busy) onClose(); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; clearTimeout(t); window.removeEventListener("keydown", onKey); };
  }, [open, busy, onClose]);

  useEffect(() => {
    if (picking) setTimeout(() => searchRef.current?.focus(), 60);
  }, [picking]);

  const digits = number.replace(/\D/g, "").replace(/^0+/, "");
  const localError = check(country, digits);
  const shownError = serverError || (touched ? localError : null);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter((c) => c.name.toLowerCase().includes(q) || c.dial.includes(q.replace(/^\+?/, "+")) || c.iso.toLowerCase() === q);
  }, [query]);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setTouched(true);
    setServerError(null);
    if (localError || busy) { inputRef.current?.focus(); return; }
    setBusy(true);
    const r = await onSubmit({ country: country.iso, dialCode: country.dial, number: digits });
    setBusy(false);
    if (!r.ok && r.error) setServerError(r.error);
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div className="pjOverlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
          onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) onClose(); }}>
          <motion.div className="pjCard" role="dialog" aria-modal="true" aria-labelledby="pj-title"
            initial={{ opacity: 0, y: 24, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}>
            <button type="button" className="pjClose" onClick={onClose} disabled={busy} aria-label="Close"><X size={16} /></button>

            <div className="pjBadge" aria-hidden>
              <span className="pjBadgeEnv">💌</span>
              <span className="pjBadgeH h1">♥</span><span className="pjBadgeH h2">♥</span>
            </div>
            <h2 id="pj-title" className="pjTitle">
              {mode === "add" ? <>Add your <em>number</em></> : <>Almost there{name ? `, ${name.split(" ")[0]}` : ""} <em>💖</em></>}
            </h2>
            <p className="pjSub">
              {mode === "add"
                ? "So we can reach you the moment the Valentine's collection goes live."
                : <>Add your phone number to join the wishlist and lock in your <b>{VALENTINE_DISCOUNT}% off</b>.</>}
            </p>

            <form onSubmit={submit} noValidate>
              <label className="pjLabel" htmlFor="pj-number">Phone number</label>
              <div className={`pjField${shownError ? " is-bad" : ""}`}>
                <button type="button" className="pjCc" onClick={() => setPicking((v) => !v)} aria-haspopup="listbox" aria-expanded={picking}
                  aria-label={`Country: ${country.name} ${country.dial}. Change`}>
                  <span className="pjFlag">{flagOf(country.iso)}</span>
                  <span className="pjDial">{country.dial}</span>
                  <ChevronDown size={14} className={picking ? "pjChevOn" : ""} />
                </button>
                <input
                  ref={inputRef}
                  id="pj-number"
                  className="pjInput"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  placeholder={country.iso === "IN" ? "98765 43210" : "Phone number"}
                  value={number}
                  maxLength={18}
                  onChange={(e) => { setNumber(e.target.value.replace(/[^\d\s()-]/g, "")); setServerError(null); }}
                  onBlur={() => digits && setTouched(true)}
                  aria-invalid={!!shownError}
                  aria-describedby="pj-err"
                />
              </div>

              <AnimatePresence initial={false}>
                {picking && (
                  <motion.div className="pjPicker" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}>
                    <div className="pjSearch">
                      <Search size={14} aria-hidden />
                      <input ref={searchRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search country or code" aria-label="Search country" />
                    </div>
                    <ul className="pjList" role="listbox" aria-label="Country">
                      {list.map((c) => (
                        <li key={c.iso}>
                          <button type="button" role="option" aria-selected={c.iso === country.iso} className={c.iso === country.iso ? "is-on" : ""}
                            onClick={() => { setCountry(c); setPicking(false); setQuery(""); setServerError(null); setTimeout(() => inputRef.current?.focus(), 30); }}>
                            <span className="pjFlag">{flagOf(c.iso)}</span>
                            <span className="pjCName">{c.name}</span>
                            <span className="pjCDial">{c.dial}</span>
                          </button>
                        </li>
                      ))}
                      {list.length === 0 && <li className="pjNone">No country matches</li>}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>

              <p id="pj-err" className="pjErr" role="alert">{shownError ?? " "}</p>

              <motion.button type="submit" className="pjGo" disabled={busy} whileTap={busy ? undefined : { scale: 0.97 }}>
                {busy ? <><Loader2 size={17} className="pjSpin" /> Saving your spot…</>
                  : mode === "add" ? <><Heart size={16} fill="currentColor" /> Save my number</>
                  : <><Heart size={16} fill="currentColor" /> Join the wishlist</>}
              </motion.button>
              <p className="pjPriv"><Lock size={11} aria-hidden /> Only used for this wishlist. Never shared, never spammed.</p>
            </form>
          </motion.div>
          <style>{PJ_CSS}</style>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

const PJ_CSS = `
.pjOverlay { position: fixed; inset: 0; z-index: 200; display: grid; place-items: center; padding: 16px;
  background: rgba(30,6,10,.55); -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px); }
.pjCard { position: relative; width: min(100%, 380px); max-height: calc(100dvh - 32px); overflow-y: auto; padding: 26px 20px 18px; border-radius: 26px; text-align: center;
  background: radial-gradient(120% 70% at 50% 0%, #fff1ee 0%, #fffaf7 55%, #fffdfb 100%); border: 1px solid rgba(179,36,63,.18);
  box-shadow: 0 40px 80px -30px rgba(61,12,17,.75), 0 0 0 6px rgba(255,240,236,.35); }
.pjClose { position: absolute; top: 12px; right: 12px; width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center; cursor: pointer;
  border: none; background: rgba(61,12,17,.06); color: #6b4545; }
.pjClose:hover { background: rgba(61,12,17,.1); }
.pjBadge { position: relative; width: 64px; height: 64px; margin: 0 auto 10px; border-radius: 50%; display: grid; place-items: center;
  background: linear-gradient(140deg, #ffe3dd, #ffc9c0); box-shadow: 0 12px 24px -12px rgba(179,36,63,.6); }
.pjBadgeEnv { font-size: 30px; animation: pjFloat 3s ease-in-out infinite; }
@keyframes pjFloat { 0%, 100% { transform: translateY(0) rotate(-6deg); } 50% { transform: translateY(-4px) rotate(4deg); } }
.pjBadgeH { position: absolute; color: #e0435f; font-size: 12px; animation: pjPop 2.4s ease-in-out infinite; }
.pjBadgeH.h1 { top: -2px; right: 2px; } .pjBadgeH.h2 { bottom: 4px; left: -4px; font-size: 10px; animation-delay: 1.2s; }
@keyframes pjPop { 0%, 100% { opacity: .3; transform: scale(.7); } 50% { opacity: 1; transform: scale(1.15); } }
.pjTitle { margin: 0; color: #2a0a0e; font: 600 24px/1.15 'Playfair Display', serif; }
.pjTitle em { color: #b3243f; font-style: italic; }
.pjSub { margin: 8px auto 16px; max-width: 300px; color: #6b4545; font: 400 13.5px/1.5 'Inter', system-ui, sans-serif; }
.pjSub b { color: #7a1028; }
.pjLabel { display: block; text-align: left; margin: 0 0 6px 4px; color: #7a1028; font: 700 10.5px/1 'Inter', system-ui, sans-serif; letter-spacing: .14em; text-transform: uppercase; }
.pjField { display: flex; align-items: stretch; height: 52px; border-radius: 16px; background: #fff; border: 1.5px solid rgba(61,12,17,.14);
  transition: border-color .2s ease, box-shadow .2s ease; }
.pjField:focus-within { border-color: #b3243f; box-shadow: 0 0 0 4px rgba(179,36,63,.12); }
.pjField.is-bad { border-color: #c62828; }
.pjCc { display: inline-flex; align-items: center; gap: 6px; padding: 0 10px 0 12px; border: none; background: transparent; cursor: pointer;
  border-right: 1.5px solid rgba(61,12,17,.1); color: #2a0a0e; font: 700 15px/1 'Inter', system-ui, sans-serif; border-radius: 16px 0 0 16px; }
.pjCc:hover { background: rgba(179,36,63,.04); }
.pjCc svg { color: #9a7070; transition: transform .2s ease; }
.pjChevOn { transform: rotate(180deg); }
.pjFlag { font-size: 20px; line-height: 1; }
.pjInput { flex: 1; min-width: 0; padding: 0 14px; border: none; outline: none; background: transparent; color: #2a0a0e;
  font: 600 17px/1 'Inter', system-ui, sans-serif; letter-spacing: .04em; border-radius: 0 16px 16px 0; }
.pjInput::placeholder { color: #c4a9a9; font-weight: 500; }
.pjPicker { overflow: hidden; margin-top: 8px; border-radius: 16px; border: 1px solid rgba(61,12,17,.1); background: #fff; text-align: left; }
.pjSearch { display: flex; align-items: center; gap: 8px; padding: 10px 12px; border-bottom: 1px solid rgba(61,12,17,.08); color: #9a7070; }
.pjSearch input { flex: 1; min-width: 0; border: none; outline: none; background: transparent; font: 500 16px/1 'Inter', system-ui, sans-serif; color: #2a0a0e; }
.pjList { list-style: none; margin: 0; padding: 4px; max-height: 196px; overflow-y: auto; overscroll-behavior: contain; }
.pjList button { width: 100%; display: flex; align-items: center; gap: 10px; padding: 9px 10px; border: none; background: transparent; cursor: pointer; border-radius: 10px; text-align: left; }
.pjList button:hover, .pjList button.is-on { background: rgba(179,36,63,.07); }
.pjCName { flex: 1; color: #2a0a0e; font: 500 14px/1.2 'Inter', system-ui, sans-serif; }
.pjCDial { color: #9a7070; font: 600 13px/1 'Inter', system-ui, sans-serif; }
.pjNone { padding: 12px; color: #9a7070; font-size: 13px; text-align: center; }
.pjErr { min-height: 18px; margin: 7px 4px 10px; text-align: left; color: #c62828; font: 500 12.5px/1.4 'Inter', system-ui, sans-serif; }
.pjGo { width: 100%; height: 52px; display: inline-flex; align-items: center; justify-content: center; gap: 9px; border: none; border-radius: 99px; cursor: pointer;
  color: #fff4f1; background: linear-gradient(135deg, #d13a59, #8a1430 60%, #5a0d20); font: 800 15px/1 'Inter', system-ui, sans-serif;
  box-shadow: 0 16px 30px -14px rgba(138,20,48,.85), inset 0 1px 0 rgba(255,255,255,.2); }
.pjGo:disabled { opacity: .85; cursor: default; }
.pjGo:focus-visible { outline: 2px solid #b3243f; outline-offset: 3px; }
.pjSpin { animation: pjSpin .9s linear infinite; }
@keyframes pjSpin { to { transform: rotate(360deg); } }
.pjPriv svg { display: inline-block; vertical-align: -1px; margin-right: 4px; }
.pjPriv { text-wrap: balance; margin: 12px 0 0; color: #9a7070; font: 500 11.5px/1.3 'Inter', system-ui, sans-serif; }
@media (prefers-reduced-motion: reduce) { .pjBadgeEnv, .pjBadgeH, .pjSpin { animation: none; } }
`;
