"use client";

// ─── The blessings wall: written or spoken (voice notes) ────────────────────
// Posts to the page's own wall (POST /christian-wedding-pages/share/:id/blessings),
// the same one the tabs edition uses, so voice notes keep working. In the
// editor preview (no shareId) a blessing is shown locally and nothing is sent.

import { useCallback, useRef, useState, type ChangeEvent } from "react";
import { API_URL, IS_NGROK } from "@/lib/config";
import { looksPickableAsAudio, readAudioFile } from "@/lib/media/readAudioFile";
import { Icon, HEART } from "./Actions";

export interface Wish {
  name: string;
  message: string;
  voiceUrl?: string;
}

const MIC = "M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zM6 11a6 6 0 0 0 12 0M12 17v4M9 21h6";
const UP = "M12 16V5M8 9l4-4 4 4M5 19h14";

export default function Wishes({ initial, shareId }: { initial: Wish[]; shareId?: string | null }) {
  const [wishes, setWishes] = useState<Wish[]>(initial);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");
  const [recording, setRecording] = useState(false);
  const [voice, setVoice] = useState<Blob | null>(null);
  const [voiceLabel, setVoiceLabel] = useState<string | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const toggleRecord = useCallback(async () => {
    if (recording && mediaRef.current && mediaRef.current.state !== "inactive") {
      mediaRef.current.stop();
      setRecording(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4";
      const mr = new MediaRecorder(stream, { mimeType: mime });
      chunks.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size) chunks.current.push(e.data);
      };
      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunks.current, { type: mr.mimeType || mime });
        if (blob.size > 0) {
          setVoice(blob);
          setVoiceLabel("Voice note recorded ✓");
        }
        mediaRef.current = null;
      };
      mr.start();
      mediaRef.current = mr;
      setRecording(true);
    } catch {
      setErr("The microphone is blocked — you can upload an audio file instead.");
    }
  }, [recording]);

  const onPick = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!looksPickableAsAudio(f)) {
      setVoiceLabel("That does not look like an audio file.");
      e.target.value = "";
      return;
    }
    setVoice(f);
    setVoiceLabel(f.name);
  }, []);

  const clearVoice = () => {
    setVoice(null);
    setVoiceLabel(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const canSend = !!name.trim() && (!!message.trim() || !!voice);

  const submit = async () => {
    if (!canSend || busy) return;
    setBusy(true);
    setErr("");
    try {
      if (!shareId) {
        // Preview: show it, send nothing.
        setWishes((w) => [{ name: name.trim(), message: message.trim() }, ...w]);
        setDone(true);
        return;
      }
      let voiceDataUrl: string | undefined;
      if (voice) {
        const read = await readAudioFile(voice);
        if (!read.ok) {
          clearVoice();
          setErr(read.error);
          return;
        }
        voiceDataUrl = read.dataUrl;
      }
      const res = await fetch(`${API_URL}/christian-wedding-pages/share/${encodeURIComponent(shareId)}/blessings`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}) },
        body: JSON.stringify({ name: name.trim().slice(0, 60), message: message.trim().slice(0, 600), ...(voiceDataUrl ? { voiceDataUrl } : {}) }),
      });
      const j = await res.json().catch(() => ({}));
      if (j.success && Array.isArray(j.data)) {
        setWishes(
          (j.data as Wish[])
            .map((b) => ({ name: b.name, message: b.message || "", ...(b.voiceUrl ? { voiceUrl: b.voiceUrl } : {}) }))
            .reverse(),
        );
        setDone(true);
      } else setErr(typeof j.error === "string" ? j.error : "Could not send — please try again.");
    } catch {
      setErr("No connection — please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      {done ? (
        <div className="c2-card c2-wish-done" role="status">
          <p className="c2-h3">Thank you for your blessing</p>
          <p className="c2-small" style={{ margin: "8px 0 0" }}>
            {name.trim() ? `${name.trim()}, the` : "The"} couple will treasure it.
          </p>
        </div>
      ) : (
        <div className="c2-card c2-wish-form">
          <label className="c2-small" htmlFor="c2-wish-name" style={{ fontWeight: 600, color: "var(--c2-ink)" }}>
            Your name
          </label>
          <input id="c2-wish-name" className="c2-input" value={name} maxLength={60} autoComplete="name" onChange={(e) => setName(e.target.value)} placeholder="e.g. Aunty Leela" />
          <label className="c2-small" htmlFor="c2-wish-msg" style={{ fontWeight: 600, color: "var(--c2-ink)" }}>
            Your blessing
          </label>
          <textarea id="c2-wish-msg" className="c2-input" value={message} maxLength={600} onChange={(e) => setMessage(e.target.value)} placeholder="A prayer, a wish, a memory… (optional with a voice note)" />
          <div className="c2-wish-voice">
            <button type="button" className="c2-btn is-ghost is-sm" onClick={() => void toggleRecord()} aria-pressed={recording}>
              <Icon d={MIC} /> <span>{recording ? "Stop recording" : "Record a voice note"}</span>
            </button>
            <button type="button" className="c2-btn is-ghost is-sm" onClick={() => fileRef.current?.click()}>
              <Icon d={UP} /> <span>Upload audio</span>
            </button>
            <input ref={fileRef} type="file" accept="audio/*" hidden onChange={onPick} />
          </div>
          {recording && (
            <p className="c2-wish-rec" role="status">
              <i aria-hidden /> Recording… tap “Stop recording” when you are done
            </p>
          )}
          {voiceLabel && !recording && (
            <div className="c2-wish-att">
              <span>🎙 {voiceLabel}</span>
              <button type="button" className="c2-btn is-ghost is-sm" onClick={clearVoice} aria-label="Remove the voice note">
                Remove
              </button>
            </div>
          )}
          {err && (
            <p className="c2-small" style={{ color: "#a8323f", margin: 0 }} role="alert">
              {err}
            </p>
          )}
          <button type="button" className="c2-btn is-blush" onClick={() => void submit()} disabled={!canSend || busy}>
            <Icon d={HEART} fill /> <span>{busy ? "Sending…" : "Send my blessing"}</span>
          </button>
        </div>
      )}

      {wishes.length > 0 && (
        <div className="c2-wishes">
          {wishes.slice(0, 60).map((w, i) => (
            <figure key={i} className="c2-card c2-wish">
              {w.message && <p>{w.message}</p>}
              {w.voiceUrl && <audio controls preload="none" src={w.voiceUrl} aria-label={`Voice blessing from ${w.name}`} />}
              <figcaption className="c2-wish-by">
                <span aria-hidden>{w.name.slice(0, 1).toUpperCase()}</span>
                {w.name}
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
