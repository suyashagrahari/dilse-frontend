"use client";

// ─── Aashirwad: the blessings wall (written or a voice note) ────────────────
//
// The template's own wall (POST /shaadi-card-pages/share/:id/blessings, kept
// from the first version, voice notes stored by the server). On the live page
// a guest's blessing joins the wall at once; in the editor preview the form
// works but nothing is sent.

import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";
import { Reveal } from "../../../_wedding";
import { API_URL, IS_NGROK } from "@/lib/config";
import { looksPickableAsAudio, readAudioFile } from "@/lib/media/readAudioFile";
import type { Lang, Strings, Wish } from "../model";
import { ICON, Icon } from "./ShareBar";

export interface BlessingsProps {
  mode: "preview" | "live";
  shareId?: string;
  wishes: Wish[];
  s: Strings;
  lang: Lang;
  guest: string;
  onUpdated?: (w: Wish[]) => void;
}

const MAX_SHOWN = 24;

export default function Blessings({ mode, shareId, wishes, s, lang, guest, onUpdated }: BlessingsProps) {
  const [list, setList] = useState<Wish[]>(wishes);
  useEffect(() => setList(wishes), [wishes]);
  const [name, setName] = useState(guest);
  const [message, setMessage] = useState("");
  const [voice, setVoice] = useState<Blob | null>(null);
  const [voiceLabel, setVoiceLabel] = useState("");
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const rec = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const file = useRef<HTMLInputElement>(null);

  useEffect(() => () => rec.current?.stream.getTracks().forEach((t) => t.stop()), []);

  const toggleRecord = useCallback(async () => {
    if (recording) {
      rec.current?.stop();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4";
      const mr = new MediaRecorder(stream, { mimeType: mime });
      chunks.current = [];
      mr.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunks.current, { type: mime });
        setVoice(blob);
        setVoiceLabel(lang === "hi" ? "आपका वॉइस नोट" : "Your voice note");
        setRecording(false);
      };
      mr.start();
      rec.current = mr;
      setRecording(true);
    } catch {
      setNote({ ok: false, text: lang === "hi" ? "माइक नहीं मिला। लिखकर भेजिए या ऑडियो फ़ाइल चुनिए।" : "No microphone access. Write it, or pick an audio file." });
    }
  }, [recording, lang]);

  const onPick = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (!looksPickableAsAudio(f)) {
      setNote({ ok: false, text: "That does not look like an audio file." });
      return;
    }
    setVoice(f);
    setVoiceLabel(f.name);
  };

  const canSend = !!name.trim() && (!!message.trim() || !!voice) && !busy;

  const send = async () => {
    if (!canSend) return;
    setNote(null);
    if (mode === "preview" || !shareId) {
      setList((l) => [{ name: name.trim(), message: message.trim() }, ...l]);
      setMessage("");
      setVoice(null);
      setVoiceLabel("");
      setNote({ ok: true, text: "Preview: guests' blessings appear here on your published page." });
      return;
    }
    setBusy(true);
    try {
      let voiceDataUrl: string | undefined;
      if (voice) {
        const read = await readAudioFile(voice);
        if (!read.ok) {
          setVoice(null);
          setVoiceLabel("");
          setNote({ ok: false, text: read.error });
          return;
        }
        voiceDataUrl = read.dataUrl;
      }
      const res = await fetch(`${API_URL}/shaadi-card-pages/share/${encodeURIComponent(shareId)}/blessings`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}) },
        body: JSON.stringify({ name: name.trim(), message: message.trim(), ...(voiceDataUrl ? { voiceDataUrl } : {}) }),
      });
      const j = await res.json().catch(() => ({}));
      if (j?.success && Array.isArray(j.data)) {
        const next: Wish[] = (j.data as Wish[]).map((b) => ({ name: b.name, message: b.message || "", ...(b.voiceUrl ? { voiceUrl: b.voiceUrl } : {}) })).reverse();
        setList(next);
        onUpdated?.(next);
        setMessage("");
        setVoice(null);
        setVoiceLabel("");
        setNote({ ok: true, text: lang === "hi" ? "🙏 आपका आशीर्वाद पहुँच गया।" : "🙏 Your blessing has reached the couple." });
      } else {
        setNote({ ok: false, text: (j && typeof j.error === "string" && j.error) || "Could not send. Please try again." });
      }
    } catch {
      setNote({ ok: false, text: "No connection. Please try again." });
    } finally {
      setBusy(false);
    }
  };

  const shown = list.slice(0, MAX_SHOWN);
  return (
    <div className="sc-bless">
      <Reveal className="sc-card sc-bless-form">
        <div className="sc-field">
          <label className="sc-label" htmlFor="sc-b-name" lang={lang}>
            {lang === "hi" ? "आपका नाम" : "Your name"}
          </label>
          <input id="sc-b-name" className="sc-input" value={name} maxLength={60} autoComplete="name" onChange={(e) => setName(e.target.value)} placeholder={lang === "hi" ? "जैसे शर्मा परिवार" : "e.g. Sharma family"} />
        </div>
        <div className="sc-field">
          <label className="sc-label" htmlFor="sc-b-msg" lang={lang}>
            {lang === "hi" ? "आशीर्वाद" : "Your blessing"}
          </label>
          <textarea id="sc-b-msg" className="sc-input sc-area" rows={3} value={message} maxLength={500} onChange={(e) => setMessage(e.target.value)} placeholder={lang === "hi" ? "सदा सुखी रहो…" : "May your home always be full of laughter…"} />
        </div>
        <div className="sc-bless-voice">
          <button type="button" className={`sc-pill${recording ? " is-rec" : ""}`} onClick={toggleRecord} aria-pressed={recording}>
            <Icon d={ICON.mic} size={16} /> {recording ? (lang === "hi" ? "रिकॉर्डिंग रोकें" : "Stop recording") : lang === "hi" ? "वॉइस नोट" : "Record a voice note"}
          </button>
          <button type="button" className="sc-pill" onClick={() => file.current?.click()}>
            <Icon d={ICON.upload} size={16} /> {lang === "hi" ? "ऑडियो चुनें" : "Upload audio"}
          </button>
          <input ref={file} type="file" accept="audio/*" hidden onChange={onPick} />
        </div>
        {voiceLabel && (
          <p className="sc-bless-chip">
            <span>🎙️ {voiceLabel}</span>
            <button
              type="button"
              className="sc-link"
              onClick={() => {
                setVoice(null);
                setVoiceLabel("");
              }}
            >
              {lang === "hi" ? "हटाएँ" : "Remove"}
            </button>
          </p>
        )}
        <button type="button" className="sc-btn" onClick={send} disabled={!canSend} aria-busy={busy}>
          <Icon d={ICON.send} size={17} /> {busy ? (lang === "hi" ? "भेज रहे हैं…" : "Sending…") : lang === "hi" ? "आशीर्वाद भेजें" : "Send your blessing"}
        </button>
        {note && (
          <p className={`sc-note${note.ok ? " is-ok" : ""}`} role="status">
            {note.text}
          </p>
        )}
      </Reveal>

      {shown.length > 0 && (
        <ul className="sc-bless-wall">
          {shown.map((w, i) => (
            <Reveal as="li" key={`${w.name}-${i}`} className="sc-card sc-bless-i" delay={(i % 3) * 70}>
              <p className="sc-bless-msg">{w.message || "🎙️"}</p>
              {w.voiceUrl && (
                <audio className="sc-bless-audio" controls preload="none" src={w.voiceUrl}>
                  <track kind="captions" />
                </audio>
              )}
              <p className="sc-bless-from">— {w.name}</p>
            </Reveal>
          ))}
        </ul>
      )}
    </div>
  );
}
