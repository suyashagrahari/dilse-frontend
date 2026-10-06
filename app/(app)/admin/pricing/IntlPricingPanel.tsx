"use client";

// ─── International pricing: the switch, the rate, and a way to test it ──────
//
// OFF (the default): everybody pays INR exactly as before, but the server still
// detects countries, so "Your connection" below works and the share of foreign
// visitors can be measured first. ON: buyers outside India are quoted USD,
// which makes Razorpay offer PayPal. Switching it back off is the rollback.
//
// "Who pays" (off by default): with "Only visitors outside India", priced
// templates publish free for visitors the server places in India; visitors
// abroad still pay. Unknown locations pay. Switching it on takes a second tap,
// because it gives away every paid template to the largest audience.
//
// "Test checkout as" stores a country for THIS browser tab only and sends it as
// X-Debug-Country. The server honours that header only for a super admin, so a
// USD checkout can be tried from India without a VPN.

import { useCallback, useEffect, useState } from "react";
import { Globe, Loader2, Check, AlertTriangle, MapPin, FlaskConical, Users, Plane } from "lucide-react";
import { API_URL } from "@/lib/config";
import { getDebugCountry, setDebugCountry } from "@/lib/money";
import { A } from "../adminKit";

interface Settings {
  intlPricingEnabled: boolean;
  chargeOnlyAbroad: boolean;
  inrPerUsd: number;
  geoReady: boolean;
  updatedByEmail?: string;
}

interface GeoCheck {
  ip?: string;
  country: string | null;
  source: string;
  geoReady: boolean;
  wouldCharge: "INR" | "USD";
  wouldPublishFree?: boolean;
}

const TEST_COUNTRIES = [
  ["", "My real location"],
  ["US", "🇺🇸 United States"],
  ["GB", "🇬🇧 United Kingdom"],
  ["AE", "🇦🇪 UAE"],
  ["CA", "🇨🇦 Canada"],
  ["IN", "🇮🇳 India"],
] as const;

export default function IntlPricingPanel({
  headers,
  onRate,
}: {
  headers: () => Record<string, string>;
  /** Lets the price cards preview derived USD prices at the saved rate. */
  onRate: (inrPerUsd: number) => void;
}) {
  const [s, setS] = useState<Settings | null>(null);
  const [geo, setGeo] = useState<GeoCheck | null>(null);
  const [rate, setRate] = useState("");
  const [busy, setBusy] = useState<null | "toggle" | "rate" | "who">(null);
  /** First tap on "Only visitors outside India" arms it; the second saves. */
  const [armed, setArmed] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [testAs, setTestAs] = useState<string>(() => (typeof window === "undefined" ? "" : getDebugCountry() || ""));

  const apply = useCallback(
    (d: Settings) => {
      setS(d);
      setRate(String(d.inrPerUsd));
      onRate(d.inrPerUsd);
    },
    [onRate]
  );

  useEffect(() => {
    let alive = true;
    Promise.all([
      fetch(`${API_URL}/admin/super/payment-settings`, { headers: headers(), cache: "no-store" }).then((r) => r.json()),
      fetch(`${API_URL}/admin/super/geo-check`, { headers: headers(), cache: "no-store" }).then((r) => r.json()),
    ])
      .then(([a, b]) => {
        if (!alive) return;
        if (a?.success) apply(a.data);
        if (b?.success) setGeo(b.data);
      })
      .catch(() => alive && setMsg({ ok: false, text: "Could not load international pricing settings." }));
    return () => {
      alive = false;
    };
  }, [headers, apply]);

  const refreshGeo = useCallback(() => {
    fetch(`${API_URL}/admin/super/geo-check`, { headers: headers(), cache: "no-store" })
      .then((r) => r.json())
      .then((b) => b?.success && setGeo(b.data))
      .catch(() => {});
  }, [headers]);

  const save = async (patch: Partial<Pick<Settings, "intlPricingEnabled" | "chargeOnlyAbroad" | "inrPerUsd">>, which: "toggle" | "rate" | "who") => {
    setBusy(which);
    setMsg(null);
    try {
      const r = await fetch(`${API_URL}/admin/super/payment-settings`, {
        method: "PUT",
        headers: headers(),
        body: JSON.stringify(patch),
      });
      const d = await r.json();
      if (!d.success) throw new Error(d.error || "Failed to save");
      apply(d.data);
      setArmed(false);
      refreshGeo();
      setMsg({
        ok: true,
        text:
          which === "who"
            ? d.data.chargeOnlyAbroad
              ? "Only visitors outside India pay now — India publishes priced templates free (within 30 seconds)."
              : "Everyone pays again — India and abroad."
            : which === "toggle"
            ? d.data.intlPricingEnabled
              ? "International pricing is ON — buyers outside India now see USD."
              : "International pricing is OFF — everyone pays INR."
            : `Rate saved: ₹${d.data.inrPerUsd} = $1`,
      });
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Failed to save" });
    } finally {
      setBusy(null);
    }
  };

  const on = !!s?.intlPricingEnabled;
  const abroadOnly = !!s?.chargeOnlyAbroad;
  const pickWho = (abroad: boolean) => {
    if (!s || busy !== null || abroad === abroadOnly) return;
    if (abroad && !armed) {
      setArmed(true);
      return;
    }
    void save({ chargeOnlyAbroad: abroad }, "who");
  };

  return (
    <section className="ipp">
      <style>{CSS}</style>
      <div className="ipp-head">
        <span className="ipp-ic"><Globe size={16} /></span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <h2>International pricing</h2>
          <p>Buyers outside India are charged in USD, which makes Razorpay show PayPal. India and unknown locations always pay INR.</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          className={`ipp-switch ${on ? "on" : ""}`}
          disabled={!s || busy !== null}
          onClick={() => s && void save({ intlPricingEnabled: !on }, "toggle")}
        >
          {busy === "toggle" ? <Loader2 size={14} className="ipp-spin" /> : <span className="ipp-knob" />}
          <span className="ipp-switch-txt">{on ? "ON" : "OFF"}</span>
        </button>
      </div>

      <div className={`ipp-who ${abroadOnly ? "is-abroad" : ""}`}>
        <span className="ipp-label"><Users size={11} /> Who pays for priced templates</span>
        <div className="ipp-seg" role="radiogroup" aria-label="Who pays">
          <button type="button" role="radio" aria-checked={!abroadOnly} className={!abroadOnly ? "on" : ""}
            disabled={!s || busy !== null} onClick={() => pickWho(false)}>
            {busy === "who" && abroadOnly ? <Loader2 size={13} className="ipp-spin" /> : <Users size={13} />}
            <span><b>Everyone pays</b><small>India in ₹ · abroad in {on ? "$" : "₹"}</small></span>
          </button>
          <button type="button" role="radio" aria-checked={abroadOnly} className={`${abroadOnly ? "on" : ""} ${armed ? "armed" : ""}`}
            disabled={!s || busy !== null} onClick={() => pickWho(true)}>
            {busy === "who" && !abroadOnly ? <Loader2 size={13} className="ipp-spin" /> : <Plane size={13} />}
            <span>
              <b>{armed ? "Tap again to confirm" : "Only visitors outside India"}</b>
              <small>{armed ? "India will publish every priced template free" : "🇮🇳 India publishes free · abroad pays"}</small>
            </span>
          </button>
        </div>
        {armed && (
          <button type="button" className="ipp-cancel" onClick={() => setArmed(false)}>Cancel</button>
        )}
        <small>
          {abroadOnly
            ? <>On: visitors the server places in <b>India</b> publish priced templates free. Anyone abroad pays{on ? " in USD" : " in ₹ (International pricing is off)"}. An unknown location pays. Pages already published stay live if you switch back.</>
            : <>Off: everyone pays the template&apos;s price. Turn on to let India publish priced templates free while visitors abroad still pay.</>}
        </small>
      </div>

      {s && !s.geoReady && (
        <div className="ipp-warn">
          <AlertTriangle size={14} />
          The country database is not loaded on this server, so every visitor is treated as India (INR). It ships inside the
          server image; redeploy the backend to load it.
          {abroadOnly && " Until it loads, nobody gets the India discount — an unknown location pays."}
        </div>
      )}

      <div className="ipp-grid">
        <div className="ipp-box">
          <span className="ipp-label">Exchange rate (for derived USD prices and reports)</span>
          <div className="ipp-row">
            <span className="ipp-input">
              <b>₹</b>
              <input value={rate} inputMode="decimal" onChange={(e) => setRate(e.target.value.replace(/[^\d.]/g, ""))} aria-label="Rupees per US dollar" />
              <span>= $1</span>
            </span>
            <button
              type="button"
              className="adk-btn"
              data-v="primary"
              disabled={!s || busy !== null || Number(rate) === s.inrPerUsd || !Number(rate)}
              onClick={() => void save({ inrPerUsd: Number(rate) }, "rate")}
              style={{ height: 38, padding: "0 14px", fontSize: 12 }}
            >
              {busy === "rate" ? <Loader2 size={12} className="ipp-spin" /> : <Check size={12} />} Save
            </button>
          </div>
          <small>Templates without their own USD price use ₹ ÷ rate, rounded up to .99 (₹149 → $1.99).</small>
        </div>

        <div className="ipp-box">
          <span className="ipp-label"><MapPin size={11} /> Your connection</span>
          {geo ? (
            <div className="ipp-geo">
              <b>{geo.country ? flag(geo.country) + " " + geo.country : "Unknown"}</b>
              <span>
                {geo.wouldPublishFree ? <>publishes <b>free</b> (India)</> : <>would pay <b>{geo.wouldCharge}</b></>} · {geo.source === "ip" ? "from IP" : geo.source}
              </span>
              <code>{geo.ip}</code>
            </div>
          ) : (
            <span className="ipp-muted">Checking…</span>
          )}
        </div>

        <div className="ipp-box">
          <span className="ipp-label"><FlaskConical size={11} /> Test checkout as (this tab only)</span>
          <select
            value={testAs}
            onChange={(e) => {
              setTestAs(e.target.value);
              setDebugCountry(e.target.value || null);
            }}
            className="ipp-select"
          >
            {TEST_COUNTRIES.map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
          <small>Open any template and press Publish: the paywall and Razorpay use this country. Only works for super admins.</small>
        </div>
      </div>

      {msg && <p className={`ipp-msg ${msg.ok ? "ok" : ""}`}>{msg.text}</p>}
    </section>
  );
}

function flag(cc: string): string {
  return cc.toUpperCase().replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

const CSS = `
  .ipp { margin-top: 14px; padding: 16px; border-radius: 20px; background: ${A.paper}; border: 1px solid rgba(201,168,76,.4); box-shadow: 0 2px 10px rgba(61,12,17,.04); }
  .ipp-head { display: flex; align-items: flex-start; gap: 12px; }
  .ipp-ic { width: 36px; height: 36px; flex: none; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, ${A.maroon}, ${A.maroon2}); color: #f2cf74; }
  .ipp-head h2 { margin: 0; font-size: 15px; font-weight: 800; color: ${A.ink}; }
  .ipp-head p { margin: 2px 0 0; font-size: 12.5px; line-height: 1.45; color: ${A.soft}; }
  .ipp-switch { flex: none; position: relative; display: inline-flex; align-items: center; gap: 8px; height: 34px; padding: 0 12px 0 4px; border-radius: 99px; border: 1px solid ${A.edge}; background: rgba(61,12,17,.06); color: ${A.soft}; font-weight: 800; font-size: 12px; cursor: pointer; }
  .ipp-switch.on { background: ${A.ok}; border-color: ${A.ok}; color: #fff; padding: 0 4px 0 12px; flex-direction: row-reverse; }
  .ipp-knob { width: 26px; height: 26px; border-radius: 50%; background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,.25); }
  .ipp-switch:disabled { opacity: .6; cursor: wait; }
  .ipp-warn { display: flex; gap: 8px; align-items: flex-start; margin-top: 12px; padding: 10px 12px; border-radius: 12px; background: rgba(183,121,31,.1); color: ${A.warn}; font-size: 12.5px; line-height: 1.45; font-weight: 600; }
  .ipp-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr)); gap: 10px; margin-top: 12px; }
  .ipp-box { min-width: 0; display: flex; flex-direction: column; gap: 6px; padding: 12px; border-radius: 14px; background: rgba(61,12,17,.03); border: 1px solid ${A.edge}; }
  .ipp-box small { font-size: 11px; line-height: 1.4; color: ${A.muted}; }
  .ipp-label { display: flex; align-items: center; gap: 4px; font-size: 10.5px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; color: ${A.muted}; }
  .ipp-row { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
  .ipp-input { flex: 1 1 140px; min-width: 0; display: flex; align-items: center; gap: 4px; height: 38px; padding: 0 10px; border-radius: 10px; background: #fff; border: 1px solid ${A.edge}; }
  .ipp-input input { flex: 1; min-width: 0; border: none; outline: none; background: none; font-size: 16px; font-weight: 700; color: ${A.ink}; }
  .ipp-input b, .ipp-input span { color: ${A.muted}; font-size: 13px; flex: none; }
  .ipp-geo { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .ipp-geo > b { font-size: 16px; color: ${A.ink}; }
  .ipp-geo span { font-size: 12px; color: ${A.soft}; }
  .ipp-geo code { font-size: 11px; color: ${A.muted}; overflow-wrap: anywhere; }
  .ipp-muted { font-size: 12px; color: ${A.muted}; }
  .ipp-select { height: 38px; padding: 0 10px; border-radius: 10px; border: 1px solid ${A.edge}; background: #fff; font-size: 14px; font-weight: 600; color: ${A.ink}; }
  .ipp-who { position: relative; display: flex; flex-direction: column; gap: 8px; margin-top: 12px; padding: 12px; border-radius: 14px; background: rgba(61,12,17,.03); border: 1px solid ${A.edge}; }
  .ipp-who.is-abroad { background: rgba(30,122,75,.06); border-color: rgba(30,122,75,.3); }
  .ipp-who > small { font-size: 11.5px; line-height: 1.45; color: ${A.soft}; }
  .ipp-seg { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; }
  .ipp-seg button { display: flex; align-items: center; gap: 9px; min-width: 0; padding: 10px 12px; border-radius: 12px; border: 1px solid ${A.edge}; background: #fff; color: ${A.ink}; text-align: left; cursor: pointer; transition: border-color .2s ease, background .2s ease, box-shadow .2s ease; }
  .ipp-seg button > span { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .ipp-seg b { font-size: 13px; }
  .ipp-seg small { font-size: 11px; color: ${A.muted}; }
  .ipp-seg button.on { border-color: ${A.maroon2}; background: linear-gradient(135deg, ${A.maroon}, ${A.maroon2}); color: #fff4f1; box-shadow: 0 8px 18px -12px rgba(61,12,17,.9); }
  .ipp-seg button.on small { color: rgba(255,244,241,.75); }
  .ipp-seg button.armed { border-color: ${A.warn}; background: rgba(183,121,31,.12); animation: ippArm 1s ease-in-out infinite; }
  @keyframes ippArm { 50% { box-shadow: 0 0 0 3px rgba(183,121,31,.25); } }
  .ipp-seg button:disabled { opacity: .65; cursor: wait; }
  .ipp-cancel { align-self: flex-start; border: 0; background: none; padding: 0; font-size: 12px; font-weight: 700; color: ${A.soft}; text-decoration: underline; cursor: pointer; }
  @media (max-width: 520px) { .ipp-seg { grid-template-columns: minmax(0, 1fr); } }
  @media (prefers-reduced-motion: reduce) { .ipp-seg button.armed { animation: none; } }
  .ipp-msg { margin: 10px 0 0; font-size: 12.5px; font-weight: 700; color: ${A.danger}; }
  .ipp-msg.ok { color: ${A.ok}; }
  .ipp-spin { animation: spin 1s linear infinite; }
`;
