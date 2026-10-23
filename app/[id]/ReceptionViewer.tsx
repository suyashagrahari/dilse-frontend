"use client";

// ─── A published Reception Night invitation, as the guest sees it ────────────
// The password gate (when the couple set one) in the same champagne ballroom
// language, then the invitation itself: the doors, the music after the first
// tap, the brand mark top-right and "Create your own" at the very end.
//
// Every page ever published with this template comes through here, so the
// stored data goes through normalizeReception: an older page (no events, no
// story, no music choice) renders its one reception and its original waltz.

import { useCallback, useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_URL, IS_NGROK } from "@/lib/config";
import { DayMusicProvider } from "@/app/(templates)/_valentine/music/DayMusic";
import { WeddingRoot } from "@/app/(templates)/_wedding";
import ReceptionExperience from "@/app/(templates)/reception/components/ReceptionExperience";
import { normalizeReception } from "@/app/(templates)/reception/components/model";
import { RECEPTION_DAY_TRACK, musicSettings } from "@/app/(templates)/reception/components/music";
import { RECEPTION_SONGS } from "@/app/(templates)/reception/components/types";

interface ReceptionViewerProps {
  rawData: Record<string, unknown>;
  shareId: string;
  hasPassword: boolean;
}

const GATE_CSS = `
.rcv-gate { min-height: 100dvh; display: grid; place-items: center; padding: 24px 16px; background: radial-gradient(70% 50% at 50% 30%, #FFF8EA, #F6E7CF 70%, #EFDCBE); font-family: var(--wk-font-sans), system-ui, sans-serif; color: #2E2216; }
.rcv-card { width: 100%; max-width: 400px; padding: 30px 24px 26px; border-radius: 28px; background: #FFFDF8; border: 1px solid #E6D7BC; box-shadow: 0 30px 60px -30px rgba(96,64,20,.5); text-align: center; position: relative; }
.rcv-card::before { content: ""; position: absolute; inset: 10px; border-radius: 20px; border: 1px solid rgba(184,137,46,.3); pointer-events: none; }
.rcv-k { margin: 0 0 6px; font: 600 12px/1.5 var(--wk-font-caps), serif; letter-spacing: .24em; text-transform: uppercase; color: #84601C; }
.rcv-names { margin: 0 0 8px; font: 400 clamp(40px, 12vw, 54px)/1.1 var(--wk-font-script), cursive; color: #6E3F2C; }
.rcv-p { margin: 0 0 18px; font: 400 15.5px/1.5 var(--wk-font-sans), system-ui, sans-serif; color: #6F5F4B; }
.rcv-in { position: relative; z-index: 1; display: flex; align-items: center; }
.rcv-in input { width: 100%; min-height: 52px; padding: 0 74px 0 16px; border-radius: 14px; border: 1.5px solid #E6D7BC; background: #FFFEFB; font: 400 16px var(--wk-font-sans), system-ui, sans-serif; color: #2E2216; outline: none; box-sizing: border-box; }
.rcv-in input:focus { border-color: #B8892E; box-shadow: 0 0 0 4px rgba(230,200,120,.35); }
.rcv-in button { position: absolute; right: 4px; min-height: 44px; padding: 0 12px; border: 0; background: none; font: 600 14px var(--wk-font-sans), system-ui, sans-serif; color: #84601C; cursor: pointer; }
.rcv-err { margin: 10px 0 0; min-height: 1.4em; font: 500 14px var(--wk-font-sans), system-ui, sans-serif; color: #A4432C; }
.rcv-go { position: relative; z-index: 1; width: 100%; min-height: 52px; margin-top: 8px; border: 0; border-radius: 999px; font: 700 16px var(--wk-font-sans), system-ui, sans-serif; color: #3A2608; background: linear-gradient(135deg, #8A6420 0%, #D9B45E 30%, #F6E2A6 50%, #C9993F 70%, #8A6420 100%); box-shadow: 0 14px 28px -14px rgba(110,70,10,.7); cursor: pointer; }
.rcv-go:disabled { opacity: .6; cursor: default; }
.rcv-brand { position: fixed; z-index: 57; top: max(10px, env(safe-area-inset-top)); right: 12px; display: grid; place-items: center; width: 44px; height: 44px; border-radius: 12px; background: #FFFDF8; border: 1px solid rgba(184,137,46,.4); box-shadow: 0 8px 20px -10px rgba(60,40,10,.45); }
.rcv-brand img { width: 28px; height: 28px; object-fit: contain; }
`;

export default function ReceptionViewer({ rawData, shareId, hasPassword }: ReceptionViewerProps) {
  const router = useRouter();
  const data = useMemo(() => normalizeReception(rawData), [rawData]);
  const settings = useMemo(() => musicSettings(data.music), [data.music]);
  const [locked, setLocked] = useState(() => {
    if (!hasPassword) return false;
    try {
      return !sessionStorage.getItem(`page_pw_${shareId}`);
    } catch {
      return true;
    }
  });
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const verify = useCallback(async () => {
    if (!pw.trim() || busy) return;
    setBusy(true);
    setErr("");
    try {
      const res = await fetch(`${API_URL}/reception-pages/share/${encodeURIComponent(shareId)}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}) },
        body: JSON.stringify({ password: pw }),
      });
      const result = await res.json().catch(() => ({}));
      if (result.verified) {
        // RSVPs on a protected page carry the password (the wedding kit reads it from here).
        try {
          sessionStorage.setItem(`page_pw_${shareId}`, pw.trim());
        } catch {}
        setLocked(false);
      } else setErr("That password isn't right — please try again.");
    } catch {
      setErr("Couldn't check it — please try again.");
    } finally {
      setBusy(false);
    }
  }, [pw, busy, shareId]);

  if (locked) {
    return (
      <WeddingRoot theme="champagne" background={false}>
        <style>{GATE_CSS}</style>
        <main className="rcv-gate">
          <form
            className="rcv-card"
            onSubmit={(e) => {
              e.preventDefault();
              void verify();
            }}
          >
            <p className="rcv-k">The wedding reception of</p>
            <h1 className="rcv-names">
              {data.brideName} &amp; {data.groomName}
            </h1>
            <p className="rcv-p">This invitation is private. Enter the password the family shared with you.</p>
            <label className="rcv-in">
              <span className="sr-only">Password</span>
              <input type={show ? "text" : "password"} value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Password" autoComplete="off" autoFocus />
              <button type="button" onClick={() => setShow((s) => !s)}>
                {show ? "Hide" : "Show"}
              </button>
            </label>
            <p className="rcv-err" aria-live="polite">
              {err}
            </p>
            <button type="submit" className="rcv-go" disabled={busy || !pw.trim()}>
              {busy ? "Checking…" : "Open the invitation 🥂"}
            </button>
          </form>
        </main>
      </WeddingRoot>
    );
  }

  return (
    <div style={{ "--rc-music-right": "52px", minHeight: "100dvh", background: "#FBF4E8" } as CSSProperties}>
      <style>{GATE_CSS}</style>
      <Link className="rcv-brand" href="/" aria-label="SubhSandesh home">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.webp" alt="SubhSandesh" />
      </Link>
      <div className="rc-music-host" style={{ display: "contents" }}>
        <DayMusicProvider settings={settings} melody="velvet" autoStart compact audioOnly songs={RECEPTION_SONGS} track={RECEPTION_DAY_TRACK}>
          <ReceptionExperience data={data} mode="live" shareId={shareId} brand onCreate={() => router.push("/reception")} />
        </DayMusicProvider>
      </div>
    </div>
  );
}
