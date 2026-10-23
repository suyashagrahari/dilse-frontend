"use client";

// ─── Christian Wedding — Scroll Edition: the guest's shared page ────────────
// Reads both shapes: pages published before `scrollExtras` existed are derived
// from their flat fields (see christian-wedding-2/lib/model.ts → fromDoc).
// The password gate comes first; the typed password is kept for the tab
// (page_pw_<shareId>) so the RSVP block can send it. Fonts come from the
// wedding kit (preload: false — this module is pulled into every share page,
// and font preloads overflowed nginx's header buffer, 2026-10-13).

import { useCallback, useMemo, useState } from "react";
import { API_URL, IS_NGROK } from "@/lib/config";
import { DayMusicProvider } from "@/app/(templates)/_valentine/music/DayMusic";
import Experience from "@/app/(templates)/christian-wedding-2/components/Experience";
import { CW2_SONGS, musicSettings } from "@/app/(templates)/christian-wedding-2/lib/music";
import type { Wish } from "@/app/(templates)/christian-wedding-2/components/Wishes";
import { fromDoc, namesOf } from "@/app/(templates)/christian-wedding-2/lib/model";

interface ChristianWedding2ViewerProps {
  rawData: Record<string, unknown>;
  shareId: string;
  hasPassword: boolean;
}

const GATE_CSS = `
.c2g { min-height:100dvh; display:grid; place-items:center; padding:24px 16px; background:linear-gradient(180deg,#fbe9ec,#f4ebe6 60%,#eef2ea); font-family:system-ui, sans-serif; color:#2f3a32; }
.c2g-card { width:100%; max-width:380px; background:#fffdf9; border:1px solid rgba(127,154,131,.3); border-radius:24px; padding:30px 22px 24px; text-align:center; box-shadow:0 24px 60px -30px rgba(60,72,58,.45); position:relative; }
.c2g-card h1 { font-family:Georgia, serif; font-weight:600; font-size:26px; margin:10px 0 4px; }
.c2g-card p { margin:0 0 18px; color:#66726a; font-size:15px; line-height:1.5; }
.c2g-ic { width:64px; height:64px; margin:0 auto; border-radius:20px; display:grid; place-items:center; background:linear-gradient(135deg,#4c6852,#7f9a83); color:#fff; }
.c2g input { width:100%; min-height:52px; border-radius:14px; border:1.5px solid #ddd6c8; padding:12px 14px; font-size:16px; background:#fff; color:#2f3a32; box-sizing:border-box; }
.c2g input:focus { outline:none; border-color:#7f9a83; box-shadow:0 0 0 4px rgba(127,154,131,.2); }
.c2g button { margin-top:12px; width:100%; min-height:52px; border-radius:999px; border:0; background:linear-gradient(135deg,#4c6852,#7f9a83); color:#fff; font-size:16px; font-weight:700; cursor:pointer; }
.c2g button[disabled] { opacity:.5; }
.c2g-err { color:#a8323f !important; margin:10px 0 0 !important; font-size:14px !important; }
.c2g-sr { position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0 0 0 0); }
`;

export default function ChristianWedding2Viewer({ rawData, shareId, hasPassword }: ChristianWedding2ViewerProps) {
  const data = useMemo(() => fromDoc(rawData), [rawData]);
  const wishes = useMemo<Wish[]>(
    () =>
      (Array.isArray(rawData.blessings) ? (rawData.blessings as Wish[]) : [])
        .map((b) => ({ name: String(b.name || "Guest"), message: String(b.message || ""), ...(b.voiceUrl ? { voiceUrl: String(b.voiceUrl) } : {}) }))
        .reverse(),
    [rawData.blessings],
  );
  const [locked, setLocked] = useState(() => {
    if (!hasPassword) return false;
    try {
      return !sessionStorage.getItem(`page_pw_${shareId}`);
    } catch {
      return true;
    }
  });
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [first, second] = namesOf(data);

  const verify = useCallback(async () => {
    if (!pw.trim() || busy) return;
    setBusy(true);
    setErr("");
    try {
      const res = await fetch(`${API_URL}/christian-wedding-pages/share/${encodeURIComponent(shareId)}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}) },
        body: JSON.stringify({ password: pw }),
      });
      const j = await res.json().catch(() => ({}));
      if (j.success && j.verified) {
        try {
          sessionStorage.setItem(`page_pw_${shareId}`, pw.trim());
        } catch {}
        setLocked(false);
      } else setErr("That password didn't open it — please check with the family.");
    } catch {
      setErr("No connection — please try again.");
    } finally {
      setBusy(false);
    }
  }, [pw, busy, shareId]);

  if (locked) {
    return (
      <div className="c2g">
        <style>{GATE_CSS}</style>
        <form
          className="c2g-card"
          onSubmit={(ev) => {
            ev.preventDefault();
            void verify();
          }}
        >
          <div className="c2g-ic" aria-hidden>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d="M8 11V8a4 4 0 0 1 8 0v3" />
            </svg>
          </div>
          <h1>
            {first} &amp; {second}
          </h1>
          <p>This invitation is private. Enter the password the family shared with you.</p>
          <label htmlFor="c2g-pw" className="c2g-sr">
            Password
          </label>
          <input id="c2g-pw" type="password" value={pw} autoComplete="off" onChange={(e) => setPw(e.target.value)} placeholder="Password" autoFocus />
          {err && (
            <p className="c2g-err" role="alert">
              {err}
            </p>
          )}
          <button type="submit" disabled={busy || !pw.trim()}>
            {busy ? "Checking…" : "Open the invitation"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <DayMusicProvider settings={musicSettings(data)} melody="garden" autoStart compact audioOnly songs={CW2_SONGS}>
      <Experience data={data} mode="live" shareId={shareId} wishes={wishes} brand />
    </DayMusicProvider>
  );
}
