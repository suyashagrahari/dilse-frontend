"use client";

// ─── VoiceNoteRecorder — the sender's ≤60 s voice note (premium form) ────────
//
// MediaRecorder (webm/opus on Chrome/Android, mp4/aac on iOS Safari) with a
// file-upload fallback — the same pattern as the missyou-gf / apology-dashboard
// recorders, plus what the premium player needs: a hard 60 s stop, the
// duration, and 48 waveform peaks computed here (so the recipient's phone
// never decodes audio). Emits a data URL; the server sniffs the bytes,
// enforces type + 2 MB, and uploads it to the CDN on save.

import { useCallback, useEffect, useRef, useState } from "react";
import { PREMIUM_LIMITS } from "../premiumData";
import { formatClock } from "../music/youtube";
import { useDayMusic } from "../music/context";

export interface VoiceValue {
  voiceNote: string;
  voiceNoteSec: number;
  voicePeaks: number[];
}

const PEAKS = 48;
const ACCEPT = ["audio/webm", "audio/mp4", "audio/mpeg", "audio/ogg", "audio/wav", "audio/x-m4a", "audio/aac"];

const blobToDataUrl = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });

/** Duration + PEAKS bars (0–100) from the recording. Falls back to a flat wave if decoding fails. */
async function analyse(blob: Blob, fallbackSec: number): Promise<{ sec: number; peaks: number[] }> {
  try {
    const Ctor = (window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext) as typeof AudioContext;
    const ctx = new Ctor();
    const buf = await ctx.decodeAudioData(await blob.arrayBuffer());
    void ctx.close().catch(() => {});
    const d = buf.getChannelData(0);
    const step = Math.max(1, Math.floor(d.length / PEAKS));
    const raw: number[] = [];
    for (let i = 0; i < PEAKS; i++) {
      let m = 0;
      for (let j = i * step; j < Math.min(d.length, (i + 1) * step); j += 16) m = Math.max(m, Math.abs(d[j]));
      raw.push(m);
    }
    const top = Math.max(0.01, ...raw);
    return { sec: Math.min(PREMIUM_LIMITS.voiceSec, Math.round(buf.duration)), peaks: raw.map((v) => Math.round((v / top) * 100)) };
  } catch {
    return { sec: Math.min(PREMIUM_LIMITS.voiceSec, fallbackSec), peaks: [] };
  }
}

export default function VoiceNoteRecorder({ value, onChange }: { value: VoiceValue; onChange: (v: VoiceValue) => void }) {
  const music = useDayMusic();
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [playing, setPlaying] = useState(false);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<BlobPart[]>([]);
  const stream = useRef<MediaStream | null>(null);
  const timer = useRef<number | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const elapsedRef = useRef(0);

  const stopStream = useCallback(() => {
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
    if (timer.current != null) window.clearInterval(timer.current);
    timer.current = null;
  }, []);
  useEffect(() => () => stopStream(), [stopStream]);

  const accept = useCallback(
    async (blob: Blob, fallbackSec: number) => {
      if (blob.size > PREMIUM_LIMITS.voiceBytes) {
        setError("That recording is too big (2 MB max). Keep it under a minute.");
        return;
      }
      setBusy(true);
      try {
        const { sec, peaks } = await analyse(blob, fallbackSec);
        if (sec > PREMIUM_LIMITS.voiceSec + 1) {
          setError("Voice notes can be up to 60 seconds.");
          return;
        }
        onChange({ voiceNote: await blobToDataUrl(blob), voiceNoteSec: sec, voicePeaks: peaks });
        setError("");
      } catch {
        setError("Could not save the recording.");
      } finally {
        setBusy(false);
      }
    },
    [onChange],
  );

  const stop = useCallback(() => {
    if (recRef.current && recRef.current.state !== "inactive") recRef.current.stop();
    setRecording(false);
  }, []);

  const start = useCallback(async () => {
    setError("");
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError("Recording isn't supported here — upload a file instead.");
      return;
    }
    music?.pause();
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      stream.current = s;
      const mime = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find((m) => MediaRecorder.isTypeSupported?.(m)) ?? "";
      const rec = new MediaRecorder(s, mime ? { mimeType: mime, audioBitsPerSecond: 64000 } : { audioBitsPerSecond: 64000 });
      chunks.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };
      rec.onstop = () => {
        stopStream();
        const blob = new Blob(chunks.current, { type: rec.mimeType || mime || "audio/webm" });
        void accept(blob, elapsedRef.current);
      };
      recRef.current = rec;
      rec.start(250);
      setRecording(true);
      setElapsed(0);
      elapsedRef.current = 0;
      timer.current = window.setInterval(() => {
        elapsedRef.current += 1;
        setElapsed(elapsedRef.current);
        if (elapsedRef.current >= PREMIUM_LIMITS.voiceSec) stop();
      }, 1000);
    } catch {
      setError("Microphone permission was denied. You can upload a file instead.");
    }
  }, [accept, music, stop, stopStream]);

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    if (!ACCEPT.some((t) => f.type.startsWith(t.split(";")[0])) && !/\.(m4a|mp3|webm|ogg|wav|aac|mp4)$/i.test(f.name)) {
      setError("Use an audio file: m4a, mp3, webm, ogg or wav.");
      return;
    }
    await accept(f, 0);
  };

  const play = () => {
    if (!value.voiceNote) return;
    if (playing) {
      audio.current?.pause();
      return;
    }
    const a = new Audio(value.voiceNote);
    audio.current = a;
    a.onended = () => setPlaying(false);
    a.onpause = () => setPlaying(false);
    music?.pause();
    void a.play().then(() => setPlaying(true), () => setPlaying(false));
  };

  const remove = () => {
    audio.current?.pause();
    onChange({ voiceNote: "", voiceNoteSec: 0, voicePeaks: [] });
  };

  return (
    <div className="vs-voice">
      {value.voiceNote ? (
        <div className="vs-voiceRow">
          <button type="button" className="vs-voiceBtn" onClick={play} aria-label={playing ? "Pause your voice note" : "Play your voice note"}>{playing ? "❚❚" : "▶"}</button>
          <span className="vs-voiceWave" aria-hidden>
            {(value.voicePeaks.length ? value.voicePeaks : Array.from({ length: 32 }, () => 40)).map((v, i) => <i key={i} style={{ height: `${Math.max(10, v)}%` }} />)}
          </span>
          <span className="vs-voiceT">{formatClock(value.voiceNoteSec)}</span>
          <button type="button" className="vs-ghostBtn" onClick={remove}>Remove</button>
        </div>
      ) : recording ? (
        <div className="vs-voiceRow">
          <span className="vs-voiceRec" aria-hidden />
          <span className="vs-voiceT" aria-live="polite">Recording… {formatClock(elapsed)} / 1:00</span>
          <button type="button" className="vs-voiceBtn is-stop" onClick={stop}>■ Stop</button>
        </div>
      ) : (
        <div className="vs-voiceRow">
          <button type="button" className="vs-voiceBtn is-rec" onClick={start} disabled={busy}>🎙 {busy ? "Saving…" : "Record (up to 60 s)"}</button>
          <button type="button" className="vs-ghostBtn" onClick={() => fileRef.current?.click()} disabled={busy}>Upload a file</button>
          <input ref={fileRef} type="file" accept="audio/*" hidden onChange={(e) => void onFile(e.target.files?.[0])} />
        </div>
      )}
      {error && <p className="vs-err" role="alert">{error}</p>}
    </div>
  );
}

export const VOICE_CSS = `
.vs-voice { display: grid; gap: 8px; }
.vs-voiceRow { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.vs-voiceBtn { min-height: 44px; min-width: 44px; padding: 0 16px; border-radius: 99px; border: 0; cursor: pointer; font-weight: 700; font-size: 14px; font-family: inherit;
  background: var(--vw-accent); color: var(--vw-accent-ink, #fff); }
.vs-voiceBtn.is-stop { background: #b91c1c; color: #fff; }
.vs-voiceBtn:disabled { opacity: .6; }
.vs-voiceWave { flex: 1; min-width: 120px; height: 36px; display: flex; align-items: center; gap: 2px; }
.vs-voiceWave i { flex: 1; min-width: 2px; border-radius: 2px; background: var(--vw-accent); opacity: .7; }
.vs-voiceT { font-variant-numeric: tabular-nums; font-size: 13px; font-weight: 600; opacity: .8; }
.vs-voiceRec { width: 12px; height: 12px; border-radius: 50%; background: #e11d48; animation: vs-rec 1s ease-in-out infinite; }
@keyframes vs-rec { 50% { opacity: .3; } }
.vs-err { margin: 0; color: #b91c1c; font-size: 13px; }
@media (prefers-reduced-motion: reduce) { .vs-voiceRec { animation: none; } }
`;
