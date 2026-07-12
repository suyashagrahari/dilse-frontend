"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, Square, Play, Pause, Upload, Trash2 } from "lucide-react";

interface Props {
  /** Existing recording (base64 data URL or S3 URL). */
  value?: string;
  /** Emits the recording as a base64 data URL, or "" when removed. */
  onChange: (dataUrl: string) => void;
}

const blobToDataUrl = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

/**
 * MediaRecorder-based voice apology recorder with a file-upload fallback.
 * Record → stop → preview → re-record. Returns audio as a base64 data URL.
 */
export default function VoiceRecorder({ value, onChange }: Props) {
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState("");

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => () => stopStream(), [stopStream]);

  const startRecording = useCallback(async () => {
    setError("");
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setError("Recording isn't supported here — upload a file instead.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "";
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" });
        stopStream();
        try {
          const dataUrl = await blobToDataUrl(blob);
          onChange(dataUrl);
        } catch {
          setError("Could not save the recording.");
        }
      };
      recorderRef.current = rec;
      rec.start();
      setRecording(true);
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    } catch {
      setError("Microphone permission denied. You can upload a file instead.");
    }
  }, [onChange, stopStream]);

  const stopRecording = useCallback(() => {
    const rec = recorderRef.current;
    if (rec && rec.state !== "inactive") rec.stop();
    setRecording(false);
  }, []);

  const handleFile = useCallback(
    async (file: File | undefined) => {
      if (!file) return;
      if (file.size > 10 * 1024 * 1024) {
        setError("Audio too large. Please keep it under 10MB.");
        return;
      }
      setError("");
      try {
        onChange(await blobToDataUrl(file));
      } catch {
        setError("Could not read that file.");
      }
    },
    [onChange],
  );

  const togglePlay = () => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      el.pause();
    } else {
      el.play().catch(() => {});
    }
  };

  const remove = () => {
    audioRef.current?.pause();
    setPlaying(false);
    onChange("");
  };

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  return (
    <div className="space-y-2">
      {value ? (
        <div className="rounded-2xl p-3 flex items-center gap-3" style={{ background: "#fff0f4", border: "1px solid #ffd6e2" }}>
          <button
            type="button"
            onClick={togglePlay}
            className="w-10 h-10 rounded-full grid place-items-center text-white shrink-0"
            style={{ background: "linear-gradient(135deg,#ff7aa8,#e64072)" }}
          >
            {playing ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <div className="flex-1 text-sm font-medium" style={{ color: "#e64072" }}>
            Voice apology ready 🎙️
          </div>
          <button type="button" onClick={() => fileRef.current?.click()} className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ color: "#e64072", border: "1px solid #ffd6e2" }}>
            Replace
          </button>
          <button type="button" onClick={remove} className="w-8 h-8 rounded-full grid place-items-center" style={{ color: "#e64072", border: "1px solid #ffd6e2" }}>
            <Trash2 size={14} />
          </button>
          <audio
            ref={audioRef}
            src={value}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={() => setPlaying(false)}
            className="hidden"
          />
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          {recording ? (
            <button
              type="button"
              onClick={stopRecording}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-white font-semibold text-sm"
              style={{ background: "linear-gradient(135deg,#ff7aa8,#e64072)" }}
            >
              <Square size={14} /> Stop · {mm}:{ss}
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            </button>
          ) : (
            <button
              type="button"
              onClick={startRecording}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold text-sm"
              style={{ color: "#e64072", background: "#fff0f4", border: "1.5px solid #ffd0dc" }}
            >
              <Mic size={15} /> Record voice apology
            </button>
          )}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold text-sm"
            style={{ color: "#8a6b78", background: "#fff", border: "1px solid #ffe4ea" }}
          >
            <Upload size={14} /> Upload audio
          </button>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      {error && <p className="text-xs" style={{ color: "#e64072" }}>{error}</p>}
    </div>
  );
}
