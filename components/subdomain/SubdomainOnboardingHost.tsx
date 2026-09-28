"use client";

// ─── The subdomain picker ────────────────────────────────────────────────────
//
// Every page a creator publishes lives at `{their-name}.subhsandesh.in/{id}`,
// so the name is asked for when they MAKE a page — the moment it is published
// (see lib/subdomainRequest.ts) — and only if they have none yet. Simply
// arriving, browsing or signing in never raises it. Once raised it is
// mandatory: no close button, no Escape, no click-outside; the only other way
// out is "Not you? Log out".
//
// ── WHY IT HANGS OFF THE PUBLISH, NOT OFF EACH EDITOR ──────────────────────
//
// Forty-four editors publish, each its own way (some after an AuthModal whose
// deferred publish resumes on the sign-in flip). The one thing they all share
// is the publish toast, so that is what raises the request, and this host —
// mounted once per route group — shows the picker over everything. The link
// the publish returned may predate the name; the share sheet rewrites it onto
// the name picked here (see `withUserSubdomain`), so the creator still sends
// their pretty link.
//
// Not shown during an impersonation session: the server blocks subdomain
// changes there, and a super admin viewing as somebody must not pick one for
// them.

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Heart, Loader2, Lock, LogOut, PenLine, Sparkles, X } from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logoutUser, setSubdomain } from "@/store/authSlice";
import { getImpersonation } from "@/lib/impersonation";
import { clearSubdomainRequest, useSubdomainRequested } from "@/lib/subdomainRequest";
import { API_URL, IS_NGROK } from "@/lib/config";
import {
  LINK_DOMAIN,
  SUBDOMAIN_MAX,
  firstNameSlug,
  sanitizeSubdomain,
  suggestSubdomains,
  validateSubdomainLocal,
} from "@/lib/subdomain";

type Status = "idle" | "invalid" | "checking" | "available" | "taken";

const noop = () => () => {};
const useHydrated = () => useSyncExternalStore(noop, () => true, () => false);

export default function SubdomainOnboardingHost() {
  const hydrated = useHydrated();
  const { isAuthenticated, user, accessToken } = useAppSelector((s) => s.auth);
  const requested = useSubdomainRequested();
  // A publish by somebody who already has a name must not leave a request
  // behind for whoever signs in next in this tab. (Not keyed on "signed out":
  // right after a reload the session is still being restored, and that would
  // drop a real request.)
  useEffect(() => {
    if (requested && user?.subdomain) clearSubdomainRequest();
  }, [requested, user?.subdomain]);
  // Kept open for the success beat after the name is saved, even though the
  // store then says the user has a subdomain.
  const [celebrating, setCelebrating] = useState<string | null>(null);

  if (!hydrated || !isAuthenticated || !user || !accessToken) return null;
  if (getImpersonation()) return null;
  // Only when a page was just made (or during the success beat after saving).
  if (!celebrating && (!requested || user.subdomain)) return null;

  return (
    <SubdomainPicker
      key={user.id || user.email}
      userName={user.name || ""}
      token={accessToken}
      celebrating={celebrating}
      onSaved={(name) => {
        clearSubdomainRequest();
        setCelebrating(name);
        window.setTimeout(() => setCelebrating(null), 2600);
      }}
    />
  );
}

function SubdomainPicker({
  userName,
  token,
  celebrating,
  onSaved,
}: {
  userName: string;
  token: string;
  celebrating: string | null;
  onSaved: (name: string) => void;
}) {
  const dispatch = useAppDispatch();
  const [partner, setPartner] = useState("");
  const [value, setValue] = useState(() => {
    const s = firstNameSlug(userName);
    return s && s.length >= 3 ? `${s}-loves-you` : "";
  });
  const [status, setStatus] = useState<Status>("idle");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  // Free names from the server, in suggestion order. Each taken idea arrives
  // already swapped for its first free numbered variant, so every chip works.
  const [freeIdeas, setFreeIdeas] = useState<{ name: string; from: string }[] | null>(null);
  // The server's free alternative for a typed name that is taken.
  const [alternative, setAlternative] = useState<string | null>(null);
  // Until they type, the field follows the first free suggestion.
  const [touched, setTouched] = useState(false);
  // Bumped to force a fresh availability check (after a lost race on save).
  const [recheck, setRecheck] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const headers = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}),
    }),
    [token]
  );

  const ideas = useMemo(() => suggestSubdomains(userName, partner), [userName, partner]);

  // Lock the page behind the modal.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Live availability of what is typed, debounced. The local rules answer
  // instantly; only a name that passes them costs a request. Every setState
  // happens inside the timer callback, never synchronously in the effect.
  const localError = value ? validateSubdomainLocal(value) : null;
  useEffect(() => {
    let live = true;
    const t = window.setTimeout(async () => {
      if (live) setAlternative(null);
      if (!value) { if (live) { setStatus("idle"); setReason(""); } return; }
      if (localError) { if (live) { setStatus("invalid"); setReason(localError); } return; }
      if (live) setStatus("checking");
      try {
        const res = await fetch(`${API_URL}/auth/subdomain/check?name=${encodeURIComponent(value)}`, { headers });
        const data = await res.json();
        if (!live) return;
        if (data.available) { setStatus("available"); setReason(""); }
        else { setStatus("taken"); setReason(data.reason || "Already taken"); setAlternative(data.alternative || null); }
      } catch {
        if (live) { setStatus("idle"); setReason(""); }
      }
    }, value && !localError ? 380 : 0);
    return () => { live = false; window.clearTimeout(t); };
  }, [value, localError, headers, recheck]);

  // One request for every idea: the server answers with names that are free,
  // swapping a taken idea for its first free numbered variant. Re-run after a
  // lost race too, so the chip that just got taken is swapped out.
  useEffect(() => {
    let live = true;
    const t = window.setTimeout(async () => {
      try {
        const res = await fetch(`${API_URL}/auth/subdomain/suggest?names=${encodeURIComponent(ideas.join(","))}`, { headers });
        const data = await res.json();
        if (!live || !data.success) return;
        const list: { name: string; from: string }[] = data.data || [];
        setFreeIdeas(list);
        if (!touched && list[0]) setValue(list[0].name);
      } catch {
        if (live) setFreeIdeas(ideas.map((n) => ({ name: n, from: n })));
      }
    }, 300);
    return () => { live = false; window.clearTimeout(t); };
  }, [ideas, headers, touched, recheck]);

  const pick = (name: string) => { setTouched(true); setSaveError(""); setValue(name); inputRef.current?.focus(); };

  const save = async () => {
    if (status !== "available" || saving) return;
    setSaving(true);
    setSaveError("");
    try {
      await dispatch(setSubdomain(value)).unwrap();
      onSaved(value);
    } catch (e) {
      // Most often somebody claimed it a moment ago. Re-check so the server's
      // free alternative shows up as a one-tap fix.
      setSaveError(typeof e === "string" ? e : "Couldn't save that name — try again.");
      setStatus("taken");
      setRecheck((n) => n + 1);
    } finally {
      setSaving(false);
    }
  };

  const shown = celebrating || value || "your-name";

  return (
    <div className="sdScrim" role="presentation">
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sd-title"
        className="sdCard"
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
      >
        {/* ── Maroon header with the live link preview ───────────────────── */}
        <div className="sdHero">
          <span className="sdShine" aria-hidden="true" />
          <span className="sdOrb" aria-hidden="true" />
          <span className="sdFloat f1" aria-hidden="true">♥</span>
          <span className="sdFloat f2" aria-hidden="true">✦</span>
          <span className="sdFloat f3" aria-hidden="true">♥</span>

          <p className="sdBadge"><Sparkles size={12} /> One quick step</p>
          <h2 id="sd-title" className="sdTitle">
            {celebrating ? <>Your love link is <em>ready!</em></> : <>Claim your <em>love link</em> 💌</>}
          </h2>
          <p className="sdLead">
            Every page you make will open at your own address — pick something sweet they&rsquo;ll smile at.
          </p>

          {/* Browser-bar preview: exactly what the recipient will see. */}
          <div className="sdBrowser" aria-live="polite">
            <div className="sdDots" aria-hidden="true"><i /><i /><i /></div>
            <div className="sdUrl">
              <Lock size={11} className="sdLock" aria-hidden="true" />
              <span className="sdUrlName">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.b
                    key={shown}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                    className={value || celebrating ? "" : "is-ph"}
                  >
                    {shown}
                  </motion.b>
                </AnimatePresence>
              </span>
              <span className="sdUrlDom">.{LINK_DOMAIN}</span>
              <span className="sdUrlId">/8f3a…c21</span>
            </div>
          </div>
        </div>

        {celebrating ? (
          <div className="sdDone">
            <motion.span
              className="sdDoneIc"
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 14 }}
            >
              <Heart size={26} fill="currentColor" />
            </motion.span>
            <p className="sdDoneTx">
              From now on, every page you publish opens at <b>{celebrating}.{LINK_DOMAIN}</b>
            </p>
            {Array.from({ length: 10 }).map((_, i) => (
              <span key={i} className="sdConfetti" style={{ left: `${8 + i * 9}%`, animationDelay: `${i * 60}ms` }} aria-hidden="true">
                {i % 3 === 0 ? "♥" : i % 3 === 1 ? "✦" : "❀"}
              </span>
            ))}
          </div>
        ) : (
          <div className="sdBody">
            {/* The name field, with the domain fixed on the right. */}
            <label className="sdLabel" htmlFor="sd-name">Your link name</label>
            <div className={`sdField is-${status}`}>
              <input
                id="sd-name"
                ref={inputRef}
                value={value}
                onChange={(e) => { setTouched(true); setSaveError(""); setValue(sanitizeSubdomain(e.target.value)); }}
                onKeyDown={(e) => e.key === "Enter" && void save()}
                placeholder="aarav-loves-riya"
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                maxLength={SUBDOMAIN_MAX}
                aria-describedby="sd-status"
              />
              <span className="sdSuffix">.{LINK_DOMAIN}</span>
              <span className="sdState" aria-hidden="true">
                {status === "checking" ? <Loader2 size={16} className="sdSpin" /> :
                 status === "available" ? <Check size={16} strokeWidth={3} /> :
                 status === "taken" || status === "invalid" ? <X size={16} strokeWidth={3} /> : null}
              </span>
            </div>
            <p id="sd-status" className={`sdStatus is-${status}`}>
              {saveError || (status === "available" ? "Lovely — it’s yours if you want it!" :
                status === "checking" ? "Checking…" :
                reason || `Letters, numbers and hyphens · ${value.length}/${SUBDOMAIN_MAX}`)}
            </p>
            <AnimatePresence initial={false}>
              {status === "taken" && alternative && alternative !== value && (
                <motion.button
                  key={alternative}
                  type="button"
                  className="sdAlt"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  onClick={() => pick(alternative)}
                >
                  <Sparkles size={13} /> Use <b>{alternative}</b> instead — it&rsquo;s free
                </motion.button>
              )}
            </AnimatePresence>

            {/* Their name makes the suggestions personal. Optional. */}
            <div className="sdPartner">
              <Heart size={13} className="sdPartnerIc" aria-hidden="true" />
              <input
                value={partner}
                onChange={(e) => setPartner(e.target.value.slice(0, 20))}
                placeholder="Who's it for? (optional) e.g. Riya"
                aria-label="Who your pages are for (optional)"
                autoComplete="off"
              />
            </div>

            <p className="sdLabel sdIdeas">Try one of these</p>
            <div className="sdChips">
              {freeIdeas === null
                ? ideas.map((n) => <span key={n} className="sdChip is-ghost" aria-hidden="true">{n}</span>)
                : freeIdeas.map(({ name, from }, i) => (
                    <motion.button
                      key={name}
                      type="button"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className={`sdChip${name === value ? " is-on" : ""}`}
                      title={name !== from ? `${from} is taken — ${name} is free` : `Use ${name}`}
                      onClick={() => pick(name)}
                    >
                      {name}
                      {name !== from && <span className="sdChipNew">free</span>}
                    </motion.button>
                  ))}
            </div>

            <p className="sdNote">
              <PenLine size={12} aria-hidden="true" />
              <span>You can change it any time from <b>Profile → My Link</b></span>
            </p>

            <button type="button" className="sdCta" disabled={status !== "available" || saving} onClick={() => void save()}>
              {saving ? <Loader2 size={16} className="sdSpin" /> : <Sparkles size={16} />}
              {saving ? "Saving…" : "Claim my link"}
            </button>

            <button type="button" className="sdOut" onClick={() => { clearSubdomainRequest(); void dispatch(logoutUser()); }}>
              <LogOut size={12} /> Not you? Log out
            </button>
          </div>
        )}
      </motion.div>

      <style>{`
        .sdScrim { position: fixed; inset: 0; z-index: 400; display: flex; align-items: flex-end; justify-content: center;
          background: rgba(26,5,7,0.55); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); padding: 0; }
        @media (min-width: 640px) { .sdScrim { align-items: center; padding: 20px } }
        .sdCard { position: relative; width: 100%; max-width: 480px; max-height: 94dvh; overflow-y: auto; overscroll-behavior: contain;
          border-radius: 26px 26px 0 0; background: #fffaf4; box-shadow: 0 30px 80px -20px rgba(26,5,7,0.6);
          padding-bottom: env(safe-area-inset-bottom, 0px); }
        @media (min-width: 640px) { .sdCard { border-radius: 26px } }

        .sdHero { position: relative; overflow: hidden; padding: 22px 18px 18px; color: #f5ede6;
          background: radial-gradient(120% 140% at 0% 0%, #6b1a22 0%, #3d0c11 55%, #240609 100%); }
        .sdShine { position: absolute; top: -60px; bottom: -60px; width: 70px; pointer-events: none;
          background: linear-gradient(90deg, transparent, rgba(255,236,190,0.16), transparent); animation: sdShine 5s ease-in-out infinite; }
        @keyframes sdShine { from { transform: translateX(-160%) rotate(12deg) } to { transform: translateX(900%) rotate(12deg) } }
        .sdOrb { position: absolute; right: -80px; top: -100px; width: 260px; height: 260px; border-radius: 50%; pointer-events: none;
          background: radial-gradient(circle, rgba(201,168,76,0.28), transparent 65%); }
        .sdFloat { position: absolute; pointer-events: none; color: #ffb3c4; opacity: .6; animation: sdFloat 4.5s ease-in-out infinite }
        .sdFloat.f1 { top: 16px; right: 22px; font-size: 16px }
        .sdFloat.f2 { top: 54px; right: 60px; font-size: 11px; color: #ffe3a3; animation-delay: 1s }
        .sdFloat.f3 { top: 30px; right: 100px; font-size: 10px; animation-delay: 2s }
        @keyframes sdFloat { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-7px) } }
        .sdBadge { position: relative; display: inline-flex; align-items: center; gap: 6px; margin: 0 0 10px; padding: 5px 11px; border-radius: 99px;
          font-size: 11px; font-weight: 800; letter-spacing: .04em; color: #ffe3a3; background: rgba(255,227,163,0.12); border: 1px solid rgba(255,227,163,0.3) }
        .sdTitle { position: relative; margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: clamp(25px, 7vw, 30px); line-height: 1.08; font-weight: 800; color: #fff6e6 }
        .sdTitle em { font-style: italic; color: #ffe3a3 }
        .sdLead { position: relative; margin: 8px 0 14px; font-size: 13px; line-height: 1.55; color: rgba(255,236,210,0.82) }

        .sdBrowser { position: relative; display: flex; align-items: center; gap: 10px; padding: 9px 11px; border-radius: 14px;
          background: rgba(255,255,255,0.08); border: 1px solid rgba(255,236,190,0.2); box-shadow: inset 0 1px 0 rgba(255,255,255,0.06) }
        .sdDots { display: flex; gap: 4px; flex: none }
        .sdDots i { width: 7px; height: 7px; border-radius: 50%; background: rgba(255,236,190,0.35) }
        .sdDots i:first-child { background: #ff8fa8 }
        /* The whole name always shows — it is the point of the preview — so the
           line wraps rather than ellipsising, and the fake page id is the
           first thing to go on a narrow phone. */
        .sdUrl { flex: 1; min-width: 0; display: flex; flex-wrap: wrap; align-items: center; row-gap: 2px; padding: 6px 10px; border-radius: 10px;
          background: rgba(0,0,0,0.22); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; line-height: 1.35 }
        .sdLock { flex: none; color: #7ddc96; margin-right: 5px }
        .sdUrlName { min-width: 0; display: inline-flex; overflow-wrap: anywhere; word-break: break-all }
        .sdUrlName b { color: #ffe3a3; font-weight: 800 }
        .sdUrlName b.is-ph { color: rgba(255,236,210,0.45); font-weight: 600 }
        .sdUrlDom { color: #fff6e6; flex: none }
        .sdUrlId { color: rgba(255,236,210,0.45); flex: none }
        @media (max-width: 420px) { .sdUrlId { display: none } }

        .sdBody { padding: 16px 18px 18px }
        .sdLabel { display: block; margin: 0 0 6px; font-size: 10.5px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; color: #8b5a2b }
        .sdField { display: flex; align-items: center; height: 50px; border-radius: 14px; background: #fff; border: 1.5px solid rgba(61,12,17,0.14);
          padding: 0 12px 0 14px; transition: border-color .2s, box-shadow .2s }
        .sdField:focus-within { border-color: #c9a84c; box-shadow: 0 0 0 4px rgba(201,168,76,0.16) }
        .sdField.is-available { border-color: #3aa76d; box-shadow: 0 0 0 4px rgba(58,167,109,0.12) }
        .sdField.is-taken, .sdField.is-invalid { border-color: #c2413d }
        .sdField input { flex: 1; min-width: 0; height: 100%; border: none; outline: none; background: transparent;
          font-size: 16px; font-weight: 800; color: #2a0a0e; letter-spacing: .01em }
        .sdField input::placeholder { color: rgba(61,12,17,0.28); font-weight: 600 }
        .sdSuffix { flex: none; font-size: 13px; font-weight: 700; color: #9a7070; margin-left: 2px }
        .sdState { flex: none; width: 22px; display: grid; place-items: center; margin-left: 6px }
        .sdField.is-available .sdState { color: #3aa76d }
        .sdField.is-taken .sdState, .sdField.is-invalid .sdState { color: #c2413d }
        .sdField.is-checking .sdState { color: #c9a84c }
        .sdSpin { animation: sdSpin .8s linear infinite }
        @keyframes sdSpin { to { transform: rotate(360deg) } }
        .sdStatus { margin: 6px 2px 0; min-height: 17px; font-size: 12px; font-weight: 600; color: #9a7070 }
        .sdStatus.is-available { color: #2f8a57 }
        .sdStatus.is-taken, .sdStatus.is-invalid { color: #b3261e }

        .sdPartner { display: flex; align-items: center; gap: 8px; margin-top: 12px; height: 42px; padding: 0 12px; border-radius: 12px;
          background: #fff3f5; border: 1px dashed rgba(194,85,122,0.4) }
        .sdPartnerIc { flex: none; color: #c2557a }
        .sdPartner input { flex: 1; min-width: 0; border: none; outline: none; background: transparent; font-size: 16px; font-weight: 600; color: #2a0a0e }
        .sdPartner input::placeholder { color: rgba(122,85,85,0.6); font-size: 13.5px }

        .sdIdeas { margin-top: 14px }
        .sdChips { display: flex; flex-wrap: wrap; gap: 6px }
        .sdChip { position: relative; display: inline-flex; align-items: center; gap: 5px; padding: 7px 12px; border-radius: 99px; cursor: pointer;
          font-size: 12.5px; font-weight: 800; color: #5a1520; background: linear-gradient(180deg, #fffdfb, #fff3e6);
          border: 1px solid rgba(201,168,76,0.4); transition: transform .15s, background .2s, color .2s, box-shadow .2s }
        .sdChip:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 16px -10px rgba(61,12,17,0.5) }
        .sdChip.is-on { color: #fff6e6; background: linear-gradient(135deg, #5a1520, #3d0c11); border-color: transparent }
        .sdChip.is-ghost { color: transparent; background: linear-gradient(90deg, #f6ece2, #fbf4ec, #f6ece2); background-size: 200% 100%;
          border-color: rgba(201,168,76,0.2); animation: sdShimmer 1.2s linear infinite; cursor: default }
        @keyframes sdShimmer { from { background-position: 200% 0 } to { background-position: -200% 0 } }
        .sdChipNew { font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: .06em; padding: 1px 5px; border-radius: 99px; background: rgba(58,167,109,0.14); color: #2f8a57 }
        .sdChip.is-on .sdChipNew { background: rgba(255,255,255,0.18); color: #bff0d2 }
        .sdAlt { display: inline-flex; align-items: center; gap: 6px; margin: 6px 0 0; padding: 7px 12px; border-radius: 99px; cursor: pointer;
          font-size: 12.5px; font-weight: 700; color: #2f8a57; background: rgba(58,167,109,0.1); border: 1px solid rgba(58,167,109,0.35) }
        .sdAlt b { color: #1e6b43 }
        .sdAlt:hover { background: rgba(58,167,109,0.18) }

        .sdNote { display: flex; align-items: center; gap: 6px; margin: 14px 0 0; padding: 9px 11px; border-radius: 12px; font-size: 12px; color: #6f4c4c;
          background: rgba(201,168,76,0.1); border: 1px solid rgba(201,168,76,0.25) }
        .sdNote svg { flex: none; color: #8b5a2b }
        .sdNote b { color: #3d0c11 }

        .sdCta { width: 100%; height: 50px; margin-top: 14px; border: none; border-radius: 14px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          font-size: 15px; font-weight: 800; color: #fff6e6; background: linear-gradient(135deg, #5a1520, #3d0c11);
          box-shadow: 0 14px 30px -14px rgba(61,12,17,0.8); transition: transform .15s, opacity .2s }
        .sdCta svg { color: #ffe3a3 }
        .sdCta:hover:not(:disabled) { transform: translateY(-2px) }
        .sdCta:disabled { opacity: .45; cursor: not-allowed }
        .sdOut { display: flex; align-items: center; gap: 5px; margin: 10px auto 0; padding: 4px 8px; border: none; background: none; cursor: pointer;
          font-size: 11.5px; font-weight: 700; color: #9a7070 }
        .sdOut:hover { color: #3d0c11 }

        .sdDone { position: relative; overflow: hidden; padding: 26px 20px 30px; text-align: center }
        .sdDoneIc { width: 58px; height: 58px; margin: 0 auto 12px; border-radius: 50%; display: grid; place-items: center; color: #fff;
          background: linear-gradient(135deg, #ff8fa8, #c2557a); box-shadow: 0 12px 26px -10px rgba(194,85,122,0.7) }
        .sdDoneTx { margin: 0; font-size: 14px; line-height: 1.55; color: #5a3a3a; overflow-wrap: anywhere }
        .sdDoneTx b { color: #3d0c11 }
        .sdConfetti { position: absolute; bottom: -10px; font-size: 14px; color: #c9a84c; animation: sdUp 1.8s ease-out forwards }
        .sdConfetti:nth-child(odd) { color: #ff8fa8 }
        @keyframes sdUp { from { transform: translateY(0) rotate(0); opacity: 1 } to { transform: translateY(-190px) rotate(200deg); opacity: 0 } }

        @media (prefers-reduced-motion: reduce) {
          .sdShine, .sdFloat, .sdConfetti, .sdSpin { animation: none }
        }
      `}</style>
    </div>
  );
}
