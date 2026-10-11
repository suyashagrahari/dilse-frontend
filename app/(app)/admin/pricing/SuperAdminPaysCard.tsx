"use client";

// ─── "You publish free as super admin" · [Pay like a customer] ───────────────
//
// A super admin owns the prices, so by default they publish every priced
// template free (the server's gate answers `super_admin`). Switching this on
// sends THEM — only the account that flips it — through the paywall and a real
// checkout exactly like a customer, which is how a payment is tested end to end.
//
// Real money: Razorpay is live wherever this is switched on, so the ON state
// says so in plain words.

import { useEffect, useState } from "react";
import { Crown, CreditCard, Loader2 } from "lucide-react";
import { API_URL } from "@/lib/config";
import { useAppDispatch } from "@/store/hooks";
import { setPaysAsCustomer } from "@/store/authSlice";

export default function SuperAdminPaysCard({ headers }: { headers: () => Record<string, string> }) {
  const dispatch = useAppDispatch();
  const [pays, setPays] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(`${API_URL}/admin/super/me/pays`, { headers: headers(), cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        if (d?.success) setPays(!!d.data.paysAsCustomer);
        else setErr(d?.error || "Could not load your payment setting.");
      })
      .catch(() => alive && setErr("Could not load your payment setting."));
    return () => {
      alive = false;
    };
  }, [headers]);

  const flip = async () => {
    if (pays === null || busy) return;
    setBusy(true);
    setErr(null);
    try {
      const r = await fetch(`${API_URL}/admin/super/me/pays`, {
        method: "PUT",
        headers: headers(),
        body: JSON.stringify({ paysAsCustomer: !pays }),
      });
      const d = await r.json();
      if (!d?.success) throw new Error(d?.error || "Failed to save");
      setPays(!!d.data.paysAsCustomer);
      dispatch(setPaysAsCustomer(!!d.data.paysAsCustomer));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setBusy(false);
    }
  };

  const on = !!pays;
  return (
    <section className={`sapc ${on ? "is-on" : ""}`} aria-label="Your own publishing">
      <style>{CSS}</style>
      <span className="sapc-ic">{on ? <CreditCard size={16} /> : <Crown size={16} />}</span>
      <div className="sapc-txt">
        <b>{pays === null ? "Your own publishing" : on ? "You pay like a customer" : "You publish free as super admin"}</b>
        <small>
          {on
            ? "You see the paywall and a real Razorpay checkout on every priced template — real money. Switch off to publish free again."
            : "No paywall for you on any priced template. Switch on to test the real checkout yourself."}
        </small>
        {err && <small className="sapc-err">{err}</small>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label="Pay like a customer"
        className={`sapc-switch ${on ? "on" : ""}`}
        disabled={pays === null || busy}
        onClick={() => void flip()}
      >
        {busy ? <Loader2 size={14} className="sapc-spin" /> : <span className="sapc-knob" />}
        <span className="sapc-switch-txt">Pay like a customer</span>
      </button>
    </section>
  );
}

const CSS = `
.sapc{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:0 0 14px;padding:12px 14px;border-radius:14px;
  background:rgba(255,255,255,0.72);border:1px solid rgba(61,12,17,0.08);color:#2a0a0e}
.sapc.is-on{border-color:rgba(183,121,31,0.45);background:#fff8ec}
.sapc-ic{flex:none;width:32px;height:32px;border-radius:10px;display:grid;place-items:center;background:rgba(201,168,76,0.18);color:#8b5a2b}
.sapc.is-on .sapc-ic{background:rgba(183,121,31,0.16);color:#b7791f}
.sapc-txt{flex:1 1 220px;min-width:0;display:flex;flex-direction:column;gap:2px}
.sapc-txt b{font-size:14px}
.sapc-txt small{font-size:12px;color:#7f5f5f;line-height:1.45}
.sapc-err{color:#b3261e !important}
.sapc-switch{flex:none;display:inline-flex;align-items:center;gap:8px;min-height:36px;padding:4px 12px 4px 4px;border-radius:999px;
  border:1px solid rgba(61,12,17,0.14);background:#fff;color:#3d0c11;font-size:12.5px;font-weight:600;cursor:pointer}
.sapc-switch:disabled{opacity:.6;cursor:default}
.sapc-knob{width:26px;height:26px;border-radius:50%;background:#e7dcd6;transition:background .2s}
.sapc-switch.on{background:#3d0c11;color:#ffe3a3;border-color:#3d0c11}
.sapc-switch.on .sapc-knob{background:#c9a84c}
.sapc-spin{animation:sapc-r 1s linear infinite;margin:6px}
@keyframes sapc-r{to{transform:rotate(360deg)}}
@media (max-width:520px){.sapc-switch{width:100%;justify-content:flex-start}}
`;
