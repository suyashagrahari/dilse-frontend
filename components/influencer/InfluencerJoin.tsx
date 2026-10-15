"use client";

// ─── Become an influencer ────────────────────────────────────────────────────
//
// Instant: no approval. The one decision that matters is the link name, which
// IS the user's subdomain — so somebody who already has one keeps it, and
// somebody who doesn't picks it here with a live availability check.

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2, Link2, Instagram, Wallet, Sparkles, AlertCircle } from "lucide-react";
import { parseInstagramHandle } from "@/lib/instagramHandle";
import { BRAND } from "@/lib/brand";
import { API_URL, ROOT_DOMAIN, SITE_URL } from "@/lib/config";
import { sanitizeSubdomain, validateSubdomainLocal, firstNameSlug } from "@/lib/subdomain";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { checkAuth } from "@/store/authSlice";

type Availability = { state: "idle" | "checking" | "ok" | "taken" | "invalid"; message?: string; alternative?: string | null };

export default function InfluencerJoin({ onJoined }: { onJoined: () => void }) {
  const dispatch = useAppDispatch();
  const { user, accessToken } = useAppSelector((s) => s.auth);
  const hasSubdomain = !!user?.subdomain;

  const [terms, setTerms] = useState<{ defaultCommissionPercent: number; attributionDays: number } | null>(null);
  const [name, setName] = useState(() => user?.subdomain || firstNameSlug(user?.name) || "");
  const [instagram, setInstagram] = useState("");
  /** Show the Instagram error only once they've left the field or tried to submit. */
  const [igTouched, setIgTouched] = useState(false);
  const [upiId, setUpiId] = useState("");
  const [agree, setAgree] = useState(false);
  const [avail, setAvail] = useState<Availability>({ state: "idle" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<{ field?: string; message: string } | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/influencer/program`)
      .then((r) => r.json())
      .then((d) => d.success && setTerms(d.data))
      .catch(() => {});
  }, []);

  // Live availability, debounced. Skipped entirely when the user already owns a name.
  useEffect(() => {
    if (hasSubdomain) return;
    const local = validateSubdomainLocal(name);
    if (local) {
      setAvail({ state: name ? "invalid" : "idle", message: name ? local : undefined });
      return;
    }
    setAvail({ state: "checking" });
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`${API_URL}/auth/subdomain/check?name=${encodeURIComponent(name)}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const d = await r.json();
        setAvail(d.available ? { state: "ok" } : { state: "taken", message: d.reason, alternative: d.alternative });
      } catch {
        setAvail({ state: "idle" });
      }
    }, 380);
    return () => clearTimeout(t);
  }, [name, hasSubdomain, accessToken]);

  const preview = useMemo(() => {
    const n = name || "yourname";
    return ROOT_DOMAIN ? `${n}.${ROOT_DOMAIN}` : `${SITE_URL.replace(/^https?:\/\//, "")}/r/${n}`;
  }, [name]);

  const canSubmit = agree && !submitting && (hasSubdomain || avail.state === "ok");

  const ig = parseInstagramHandle(instagram);
  const igError = igTouched && !ig.ok ? ig.message : error?.field === "instagram" ? error.message : null;

  const submit = async () => {
    setError(null);
    if (!ig.ok) {
      // Compulsory: say so next to the field rather than a silent disabled button.
      setIgTouched(true);
      document.getElementById("ij-instagram")?.focus();
      return;
    }
    setInstagram(ig.handle);
    setSubmitting(true);
    try {
      const r = await fetch(`${API_URL}/influencer/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ subdomain: hasSubdomain ? undefined : name, instagram: ig.handle, upiId }),
      });
      const d = await r.json();
      if (!r.ok || !d.success) {
        setError({ field: d.field, message: d.error || "Something went wrong" });
        if (d.alternative) setAvail({ state: "taken", message: d.error, alternative: d.alternative });
        return;
      }
      await dispatch(checkAuth());
      onJoined();
    } catch {
      setError({ message: "Network error. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const pct = terms?.defaultCommissionPercent ?? 30;

  return (
    <div className="ij" id="join">
      <style>{CSS}</style>

      <motion.section className="ij-card" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.08 }}>
        <span className="ij-kick"><Sparkles size={12} /> Takes 30 seconds</span>
        <h2>Claim your influencer link</h2>
        <p className="ij-sub">You&apos;ll earn <b>{pct}%</b> of every premium template your referrals buy, for life.</p>

        <label className="ij-label"><Link2 size={14} /> Your link name</label>
        {hasSubdomain ? (
          <div className="ij-fixed">
            <Check size={15} color={BRAND.ok} /> <b>{preview}</b>
            <span>This is your existing name. Change it anytime under Profile → My Link.</span>
          </div>
        ) : (
          <>
            <div className={`ij-input-wrap ${error?.field === "subdomain" || avail.state === "taken" || avail.state === "invalid" ? "bad" : avail.state === "ok" ? "good" : ""}`}>
              <input
                value={name}
                onChange={(e) => setName(sanitizeSubdomain(e.target.value))}
                placeholder="yourname"
                maxLength={30}
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                aria-label="Link name"
              />
              <span className="ij-status">
                {avail.state === "checking" && <Loader2 size={15} className="ij-spin" />}
                {avail.state === "ok" && <Check size={15} color={BRAND.ok} />}
                {(avail.state === "taken" || avail.state === "invalid") && <AlertCircle size={15} color={BRAND.danger} />}
              </span>
            </div>
            <p className="ij-hint">
              Your link: <b>{preview}</b>
            </p>
            {(avail.state === "taken" || avail.state === "invalid") && (
              <p className="ij-err">
                {avail.message}
                {avail.alternative && (
                  <>
                    {" "}Try{" "}
                    <button type="button" className="ij-alt" onClick={() => setName(avail.alternative!)}>{avail.alternative}</button>
                  </>
                )}
              </p>
            )}
          </>
        )}

        <label className="ij-label" htmlFor="ij-instagram">
          <Instagram size={14} /> Instagram username <span className="ij-req" aria-hidden>*</span>
        </label>
        <div className={`ij-input-wrap ${igError ? "bad" : igTouched && ig.ok ? "good" : ""}`}>
          <span className="ij-prefix">@</span>
          <input
            id="ij-instagram"
            value={instagram}
            onChange={(e) => {
              setInstagram(e.target.value.replace(/\s/g, ""));
              if (error?.field === "instagram") setError(null);
            }}
            onBlur={() => {
              // A pasted profile link or "@name" becomes the bare handle.
              if (ig.ok && ig.handle !== instagram) setInstagram(ig.handle);
              if (instagram) setIgTouched(true);
            }}
            placeholder="yourhandle"
            maxLength={120}
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            required
            aria-required="true"
            aria-invalid={igError ? true : undefined}
            aria-describedby="ij-instagram-msg"
          />
        </div>
        {igError ? (
          <p className="ij-err" id="ij-instagram-msg" role="alert"><AlertCircle size={13} /> {igError}</p>
        ) : (
          <p className="ij-hint" id="ij-instagram-msg">Shown on your invite page so followers know it&apos;s really you. You can paste your profile link.</p>
        )}

        <label className="ij-label"><Wallet size={14} /> UPI ID for payouts <em>(optional, add later)</em></label>
        <div className={`ij-input-wrap ${error?.field === "upiId" ? "bad" : ""}`}>
          <input value={upiId} onChange={(e) => setUpiId(e.target.value.trim())} placeholder="name@okaxis" maxLength={80} autoCapitalize="off" />
        </div>
        <p className="ij-hint">Where we send your earnings. Only the SubhSandesh team can see it.</p>

        <label className="ij-check">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
          <span>
            I understand commission is earned only on real payments by new users who sign up through my link, never on my own
            purchases or points, and that SubhSandesh may pause accounts that misuse the program.
          </span>
        </label>

        {error && !error.field && <p className="ij-err">{error.message}</p>}
        {error?.field && error.field !== "subdomain" && error.field !== "instagram" && <p className="ij-err">{error.message}</p>}

        <button type="button" className="ij-submit" disabled={!canSubmit} onClick={submit}>
          {submitting ? <Loader2 size={17} className="ij-spin" /> : <Sparkles size={17} />}
          {submitting ? "Creating…" : "Get my influencer link"}
        </button>
      </motion.section>
    </div>
  );
}

const CSS = `
  .ij { max-width: 600px; margin: clamp(36px, 6vw, 64px) auto 0; scroll-margin-top: 110px; }
  .ij-kick { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 99px; background: rgba(201,168,76,.16); color: ${BRAND.accent}; font-size: 11px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
  .ij-sub { margin: 0 0 4px; font-size: 14px; color: ${BRAND.muted}; }
  .ij-sub b { color: ${BRAND.ok}; }
  .ij-hero { position: relative; overflow: hidden; padding: 28px 26px; border-radius: 24px; background: ${BRAND.gradient}; color: #f5ede6; box-shadow: ${BRAND.shadowElevated}; }
  .ij-shine { position: absolute; inset: -40% auto auto -20%; width: 60%; height: 180%; background: linear-gradient(90deg, transparent, rgba(255,255,255,.08), transparent); transform: rotate(18deg); pointer-events: none; }
  .ij-kicker { display: inline-flex; align-items: center; gap: 6px; margin: 0; font-size: 11px; font-weight: 800; letter-spacing: .2em; text-transform: uppercase; color: #f2cf74; }
  .ij-hero h1 { margin: 10px 0 10px; font-family: 'Playfair Display', serif; font-size: clamp(24px, 3.4vw, 34px); line-height: 1.15; }
  .ij-lead { margin: 0; font-size: 14.5px; line-height: 1.6; color: rgba(245,237,230,.85); }
  .ij-points { display: grid; gap: 10px; margin-top: 20px; }
  .ij-points > div { display: grid; grid-template-columns: 34px 1fr; grid-template-rows: auto auto; column-gap: 10px; align-items: center; padding: 10px 12px; border-radius: 14px; background: rgba(255,255,255,.07); border: 1px solid rgba(242,207,116,.18); }
  .ij-points svg { grid-row: span 2; width: 34px; height: 34px; padding: 8px; border-radius: 10px; background: rgba(242,207,116,.16); color: #f2cf74; box-sizing: border-box; }
  .ij-points b { font-size: 14px; }
  .ij-points span { font-size: 12px; color: rgba(245,237,230,.7); }
  .ij-example { margin: 16px 0 0; padding: 10px 12px; border-radius: 12px; background: rgba(0,0,0,.18); font-size: 13px; line-height: 1.5; color: rgba(245,237,230,.85); }
  .ij-example b { color: #f2cf74; }
  .ij-card { padding: clamp(20px, 4vw, 32px); border-radius: 24px; background: ${BRAND.surface}; border: 1px solid ${BRAND.border}; box-shadow: ${BRAND.shadow}; }
  .ij-card h2 { margin: 10px 0 4px; font-family: 'Playfair Display', serif; font-size: clamp(22px, 3vw, 28px); color: ${BRAND.text}; }
  .ij-label { display: flex; align-items: center; gap: 6px; margin: 16px 0 6px; font-size: 12.5px; font-weight: 800; color: ${BRAND.text}; }
  .ij-label em { font-style: normal; font-weight: 600; color: ${BRAND.faint}; }
  .ij-input-wrap { display: flex; align-items: center; gap: 6px; padding: 0 12px; height: 46px; border-radius: 12px; background: ${BRAND.bgAlt}; border: 1.5px solid ${BRAND.border}; transition: border-color .2s; }
  .ij-input-wrap:focus-within { border-color: ${BRAND.accent}; }
  .ij-input-wrap.good { border-color: ${BRAND.ok}; }
  .ij-input-wrap.bad { border-color: ${BRAND.danger}; }
  .ij-input-wrap input { flex: 1; min-width: 0; border: none; outline: none; background: transparent; font-size: 15px; color: ${BRAND.text}; }
  .ij-prefix { color: ${BRAND.faint}; font-weight: 700; }
  .ij-status { display: flex; }
  .ij-hint { margin: 6px 2px 0; font-size: 12px; color: ${BRAND.muted}; overflow-wrap: anywhere; }
  .ij-hint b { color: ${BRAND.accent}; }
  .ij-fixed { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; padding: 12px; border-radius: 12px; background: rgba(58,167,109,.07); border: 1px solid rgba(58,167,109,.25); font-size: 14px; color: ${BRAND.text}; overflow-wrap: anywhere; }
  .ij-fixed span { flex-basis: 100%; font-size: 12px; color: ${BRAND.muted}; }
  .ij-err { margin: 6px 2px 0; font-size: 12.5px; color: ${BRAND.danger}; font-weight: 600; display: flex; align-items: flex-start; gap: 5px; line-height: 1.4; }
  .ij-err svg { flex: none; margin-top: 2px; }
  .ij-req { color: ${BRAND.danger}; font-weight: 800; margin-left: -3px; }
  .ij-alt { border: none; background: rgba(139,90,43,.1); color: ${BRAND.accent}; font-weight: 800; padding: 2px 8px; border-radius: 99px; cursor: pointer; }
  .ij-check { display: flex; gap: 10px; align-items: flex-start; margin-top: 18px; font-size: 12.5px; line-height: 1.5; color: ${BRAND.muted}; cursor: pointer; }
  .ij-check input { margin-top: 3px; accent-color: ${BRAND.accentStrong}; width: 16px; height: 16px; flex-shrink: 0; }
  .ij-submit { margin-top: 18px; width: 100%; height: 50px; display: flex; align-items: center; justify-content: center; gap: 8px; border: none; border-radius: 99px; background: ${BRAND.gradient}; color: #f5ede6; font-weight: 800; font-size: 15px; cursor: pointer; box-shadow: 0 14px 30px -14px rgba(61,12,17,.6); }
  .ij-submit:disabled { opacity: .45; cursor: not-allowed; box-shadow: none; }
  .ij-spin { animation: ij-spin 1s linear infinite; }
  @keyframes ij-spin { to { transform: rotate(360deg); } }
`;
