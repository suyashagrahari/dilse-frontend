"use client";

// ─── /[id] — a published Searched page ───────────────────────────────────────
//
// The password gate is dressed as the search engine's own sign-in card (the
// parody wordmark, "Enter your password", a pill Next button), so the unlock
// reads as the front door of the same thing.

import { useCallback, useState } from "react";
import SearchedTemplate from "@/app/(templates)/searched/components/SearchedTemplate";
import { dbToSearchData } from "@/app/(templates)/searched/components/coerce";
import { Wordmark } from "@/app/(templates)/searched/components/Doodle";
import { API_URL, IS_NGROK } from "@/lib/config";

function SearchedPasswordGate({ shareId, name, onUnlocked }: { shareId: string; name: string; onUnlocked: () => void }) {
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const verify = useCallback(async () => {
    if (!pw.trim()) {
      setError("Enter a password");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/searched-pages/share/${shareId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}) },
        body: JSON.stringify({ password: pw }),
      });
      const result = await res.json();
      if (result.success && result.verified) {
        try {
          sessionStorage.setItem(`searched_unlocked_${shareId}`, "true");
        } catch {}
        onUnlocked();
      } else {
        setError("Wrong password. Try again or ask the person who sent it.");
        setPw("");
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }, [pw, shareId, onUnlocked]);

  return (
    <div className="sgWrap">
      <style>{GATE_CSS}</style>
      <div className="sgCard">
        <div className="sgLogo"><Wordmark name={name || "Love"} size={34} /></div>
        <h1 className="sgH">Sign in</h1>
        <p className="sgSub">to continue to your search results</p>
        <div className={`sgField${error ? " is-err" : ""}`}>
          <input
            id="sg-pw"
            type={show ? "text" : "password"}
            value={pw}
            autoFocus
            placeholder=" "
            onChange={(e) => {
              setPw(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && verify()}
          />
          <label htmlFor="sg-pw">Enter the password</label>
        </div>
        {error && <p className="sgErr">⚠ {error}</p>}
        <label className="sgShow">
          <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} /> Show password
        </label>
        <p className="sgHint">Hint: someone who thinks about you a lot set this.</p>
        <div className="sgActs">
          <span />
          <button type="button" className="sgNext" onClick={verify} disabled={loading}>
            {loading ? "Checking…" : "Next"}
          </button>
        </div>
      </div>
      <p className="sgFoot">English (India) · Help · Privacy · Terms</p>
    </div>
  );
}

const GATE_CSS = `
.sgWrap { min-height: 100dvh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; padding: 20px 16px; background: #f0f4f9; font-family: Arial, "Helvetica Neue", sans-serif; color: #1f1f1f; }
.sgCard { width: 100%; max-width: 450px; background: #fff; border-radius: 28px; padding: 36px 32px 28px; animation: sgIn .4s cubic-bezier(.2,.9,.3,1) both; }
@keyframes sgIn { from { opacity: 0; transform: translateY(12px); } }
.sgLogo { margin-bottom: 18px; }
.sgH { margin: 0; font: 400 34px/1.2 var(--font-outfit), "Outfit", Arial, sans-serif; }
.sgSub { margin: 10px 0 28px; font-size: 16px; color: #444746; }
.sgField { position: relative; }
.sgField input { width: 100%; height: 56px; padding: 18px 15px 6px; border: 1px solid #747775; border-radius: 6px; font-size: 16px; outline: none; background: #fff; color: #1f1f1f; box-sizing: border-box; }
.sgField input:focus { border: 2px solid #0b57d0; padding-left: 14px; }
.sgField label { position: absolute; left: 12px; top: 17px; padding: 0 4px; background: #fff; color: #444746; font-size: 16px; pointer-events: none; transition: all .15s; }
.sgField input:focus + label, .sgField input:not(:placeholder-shown) + label { top: -9px; font-size: 12px; color: #0b57d0; }
.sgField.is-err input { border-color: #b3261e; }
.sgField.is-err label { color: #b3261e !important; }
.sgErr { margin: 8px 0 0; font-size: 12px; color: #b3261e; }
.sgShow { display: flex; align-items: center; gap: 12px; margin-top: 16px; font-size: 14px; cursor: pointer; }
.sgShow input { width: 18px; height: 18px; accent-color: #0b57d0; }
.sgHint { margin: 22px 0 0; font-size: 13px; color: #444746; }
.sgActs { display: flex; justify-content: space-between; align-items: center; margin-top: 30px; }
.sgNext { height: 40px; padding: 0 24px; border: 0; border-radius: 99px; background: #0b57d0; color: #fff; font: 500 14px/1 var(--font-outfit), "Outfit", Arial, sans-serif; cursor: pointer; }
.sgNext:disabled { opacity: .6; }
.sgFoot { font-size: 12px; color: #444746; }
@media (max-width: 480px) { .sgWrap { background: #fff; justify-content: flex-start; padding-top: 40px; } .sgCard { padding: 12px 8px; } }
`;

export default function SearchedViewer({ rawData, hasPassword, shareId }: { rawData: Record<string, unknown>; hasPassword: boolean; shareId: string }) {
  const [unlocked, setUnlocked] = useState(() => {
    if (!hasPassword) return true;
    if (typeof window === "undefined") return false;
    try {
      return sessionStorage.getItem(`searched_unlocked_${shareId}`) === "true";
    } catch {
      return false;
    }
  });

  // The coercer clamps and repairs everything — the payload is untrusted, and
  // pages saved before the rebuild are converted here.
  const data = dbToSearchData(rawData);

  if (hasPassword && !unlocked) {
    return <SearchedPasswordGate shareId={shareId} name={data.recipient.name} onUnlocked={() => setUnlocked(true)} />;
  }
  return <SearchedTemplate data={data} mode="live" shareId={shareId} hasPassword={hasPassword} />;
}
