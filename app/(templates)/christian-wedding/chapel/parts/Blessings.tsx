"use client";

// ─── The blessings wall (this template's own server wall, with voice notes) ─
// Live: POST /christian-wedding-pages/share/:shareId/blessings ({ name,
// message, voiceDataUrl? }) answers with the whole list. Preview: the new
// blessing is added locally so the sender sees how it looks. A voice note can
// be recorded here or picked from the phone (bounded by readAudioFile, which
// says why when a file is too big).

import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";
import { Reveal } from "../../../_wedding";
import { API_URL, IS_NGROK } from "@/lib/config";
import { looksPickableAsAudio, readAudioFile } from "@/lib/media/readAudioFile";
import type { CwData } from "../model";
import { Heading } from "./Blocks";
import { ICON, Icon } from "./ShareBar";

type Wish = CwData["wishes"][number];

const MIC = "M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21";
const STOP = "M7 7h10v10H7z";
const UPLOAD = "M12 16V4M7.5 8.5 12 4l4.5 4.5M5 16v3h14v-3";

export default function Blessings({ wishes, shareId, mode, couple }: { wishes: Wish[]; shareId: string | null; mode: "preview" | "live"; couple: string }) {
  const [list, setList] = useState<Wish[]>(wishes);
  const [seen, setSeen] = useState(wishes);
  if (seen !== wishes) {
    setSeen(wishes);
    setList(wishes);
  }
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");
  const [recording, setRecording] = useState(false);
  const [voice, setVoice] = useState<Blob | null>(null);
  const [voiceLabel, setVoiceLabel] = useState("");
  const media = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const [canRecord, setCanRecord] = useState(false);
  useEffect(() => setCanRecord(typeof window !== "undefined" && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== "undefined"), []);

  const toggleRecord = useCallback(async () => {
    if (recording && media.current && media.current.state !== "inactive") {
      media.current.stop();
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
          setVoiceLabel("Voice note recorded");
        }
        media.current = null;
      };
      mr.start();
      media.current = mr;
      setRecording(true);
    } catch {
      setVoiceLabel("The microphone is not available — you can pick an audio file instead.");
    }
  }, [recording]);

  const onPick = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (!looksPickableAsAudio(f)) {
      setVoiceLabel("That does not look like an audio file.");
      return;
    }
    setVoice(f);
    setVoiceLabel(f.name);
  };

  const send = async () => {
    setErr("");
    if (!name.trim()) {
      setErr("Please add your name.");
      return;
    }
    if (!message.trim() && !voice) {
      setErr("Write a blessing or add a voice note.");
      return;
    }
    setBusy(true);
    try {
      let voiceDataUrl: string | undefined;
      if (voice) {
        const read = await readAudioFile(voice);
        if (!read.ok) {
          setVoice(null);
          setVoiceLabel(read.error);
          return;
        }
        voiceDataUrl = read.dataUrl;
      }
      if (mode !== "live" || !shareId) {
        setList((l) => [{ name: name.trim(), message: message.trim(), ...(voiceDataUrl ? { voiceUrl: voiceDataUrl } : {}) }, ...l]);
        setDone(true);
        return;
      }
      const res = await fetch(`${API_URL}/christian-wedding-pages/share/${encodeURIComponent(shareId)}/blessings`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}) },
        body: JSON.stringify({ name: name.trim(), message: message.trim(), ...(voiceDataUrl ? { voiceDataUrl } : {}) }),
      });
      const j = (await res.json().catch(() => ({}))) as { success?: boolean; data?: Wish[]; error?: string };
      if (j.success && Array.isArray(j.data)) {
        // Newest first on the wall.
        setList(
          [...j.data].reverse().map((b) => ({ name: b.name, message: b.message || "", ...(b.voiceUrl ? { voiceUrl: b.voiceUrl } : {}) })),
        );
        setDone(true);
      } else setErr(j.error || "Could not send your blessing — please try again.");
    } catch {
      setErr("No connection — please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="cw-sec cw-bless" id="blessings" aria-labelledby="cw-bless-h">
      <Heading eyebrow="Leave a prayer or a wish" title="Blessings for the couple" id="cw-bless-h" />
      <Reveal className="cw-bless-form">
        {done ? (
          <div className="cw-bless-done" role="status">
            <span aria-hidden>🕊️</span>
            <p>
              <b>Thank you for your blessing.</b>
              <br />
              {couple} will treasure it.
            </p>
          </div>
        ) : (
          <>
            <label className="cw-label" htmlFor="cw-bless-name">
              Your name
            </label>
            <input id="cw-bless-name" className="cw-input" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} autoComplete="name" placeholder="e.g. Aunty Lissy" />
            <label className="cw-label" htmlFor="cw-bless-msg">
              Your blessing
            </label>
            <textarea id="cw-bless-msg" className="cw-input cw-textarea" value={message} onChange={(e) => setMessage(e.target.value)} maxLength={500} rows={3} placeholder="May God bless your home with…" />
            <div className="cw-bless-voice">
              {canRecord && (
                <button type="button" className={`cw-pill${recording ? " is-rec" : ""}`} onClick={toggleRecord} aria-pressed={recording}>
                  <Icon d={recording ? STOP : MIC} size={16} /> {recording ? "Stop recording" : "Record a voice note"}
                </button>
              )}
              <button type="button" className="cw-pill" onClick={() => fileRef.current?.click()}>
                <Icon d={UPLOAD} size={16} /> Audio file
              </button>
              <input ref={fileRef} type="file" accept="audio/*" hidden onChange={onPick} />
              {voiceLabel && (
                <span className="cw-bless-vl" role="status">
                  {voiceLabel}
                  {voice && (
                    <button
                      type="button"
                      className="cw-x"
                      aria-label="Remove voice note"
                      onClick={() => {
                        setVoice(null);
                        setVoiceLabel("");
                      }}
                    >
                      ×
                    </button>
                  )}
                </span>
              )}
            </div>
            {err && (
              <p className="cw-err" role="alert">
                {err}
              </p>
            )}
            <button type="button" className="cw-btn cw-bless-send" onClick={send} disabled={busy} aria-busy={busy}>
              <Icon d={busy ? ICON.clock : "M4 12l16-8-6 16-3-6zM11 14l9-10"} size={17} /> {busy ? "Sending…" : "Send blessing"}
            </button>
          </>
        )}
      </Reveal>
      {list.length > 0 && (
        <ul className="cw-wall">
          {list.slice(0, 60).map((w, i) => (
            <Reveal as="li" key={`${w.name}-${i}`} className="cw-wish" delay={(i % 3) * 70}>
              <span className="cw-wish-q" aria-hidden>
                “
              </span>
              {w.message && <p className="cw-wish-m">{w.message}</p>}
              {w.voiceUrl && (
                <audio className="cw-wish-audio" controls preload="none" src={w.voiceUrl} />
              )}
              <p className="cw-wish-n">— {w.name}</p>
            </Reveal>
          ))}
        </ul>
      )}
    </section>
  );
}
