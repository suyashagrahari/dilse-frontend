"use client";

import { memo, useState, useCallback, useRef, ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { HandHeart, Quote, Mic, MicOff, Send, Loader2, X, Music, Sparkles } from "lucide-react";
import type { ShaadiData, Wish } from "./types";

const C_ACCENT = "#AB1C3E";
const C_MED = "#CB6B82";
const C_DARK = "#6D2B3B";
const C_BG = "#FDFBF7";
const C_CARD = "#FFFAF8";

const F_CINZEL = "var(--font-cinzel), ui-serif, Georgia, serif";
const F_LORA = "var(--font-lora), Georgia, serif";
const F_DANCING = "var(--font-dancing), cursive";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// ── Shared background (identical to CoupleSection) ────────────────────────────
function HomeMatchBackground() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 z-0 min-h-full" style={{ background: C_BG }}>
        <Image src="https://cdn.subhsandesh.in/gifts-media/shaadi-card/image10.webp" alt="" fill className="object-cover" sizes="100vw" priority />
      </div>
      <div className="pointer-events-none absolute inset-0 z-[1]"
        style={{ background: "rgba(255,255,255,0.38)", mixBlendMode: "soft-light" }} aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2]"
        style={{ height: "55%", background: "linear-gradient(to top, rgba(253,244,248,0.42) 0%, transparent 100%)" }} aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-[32%] max-h-[280px]"
        style={{ background: "linear-gradient(to bottom, rgba(255,251,248,0.45) 0%, transparent 100%)" }} aria-hidden />
    </>
  );
}

function InvitationStyleCorners() {
  return (
    <>
      <div className="pointer-events-none absolute left-[-20px] top-0 z-[3] mix-blend-multiply"
        style={{ width: "clamp(120px,40vw,240px)", height: "clamp(110px,22vh,260px)", opacity: 0.88 }} aria-hidden>
        <div className="relative h-full w-full scale-x-[-1]">
          <Image src="https://cdn.subhsandesh.in/gifts-media/shaadi-card/image5.webp" alt="" fill sizes="240px" className="object-contain" style={{ objectPosition: "left top" }} />
        </div>
      </div>
      <div className="pointer-events-none absolute right-[-20px] top-0 z-[3] mix-blend-multiply"
        style={{ width: "clamp(120px,40vw,240px)", height: "clamp(110px,22vh,260px)", opacity: 0.88 }} aria-hidden>
        <div className="relative h-full w-full">
          <Image src="https://cdn.subhsandesh.in/gifts-media/shaadi-card/image4.webp" alt="" fill sizes="240px" className="object-contain" style={{ objectPosition: "right top" }} />
        </div>
      </div>
      <div className="pointer-events-none absolute bottom-[-20px] left-[-30px] z-[3] mix-blend-multiply"
        style={{ width: "clamp(180px,50vw,380px)", height: "clamp(140px,28vh,300px)", opacity: 0.95 }} aria-hidden>
        <div className="relative h-full w-full scale-x-[-1]">
          <Image src="https://cdn.subhsandesh.in/gifts-media/shaadi-card/image7.webp" alt="" fill sizes="380px" className="object-contain" style={{ objectPosition: "left bottom" }} />
        </div>
      </div>
      <div className="pointer-events-none absolute bottom-[-20px] right-[-30px] z-[3] mix-blend-multiply"
        style={{ width: "clamp(180px,50vw,380px)", height: "clamp(140px,28vh,300px)", opacity: 0.95 }} aria-hidden>
        <div className="relative h-full w-full">
          <Image src="https://cdn.subhsandesh.in/gifts-media/shaadi-card/image6.webp" alt="" fill sizes="380px" className="object-contain" style={{ objectPosition: "right bottom" }} />
        </div>
      </div>
    </>
  );
}

// ── Blessing input form ───────────────────────────────────────────────────────
function BlessingForm({
  shareId,
  onAdded,
}: {
  shareId: string;
  onAdded: (wishes: Wish[]) => void;
}) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [recording, setRecording] = useState(false);
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [voiceLabel, setVoiceLabel] = useState<string | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const blobToDataUrl = (blob: Blob) =>
    new Promise<string>((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result as string);
      r.onerror = rej;
      r.readAsDataURL(blob);
    });

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
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || mime });
        if (blob.size > 0) { setVoiceBlob(blob); setVoiceLabel("Voice note recorded ✓"); }
        mediaRef.current = null;
      };
      mr.start();
      mediaRef.current = mr;
      setRecording(true);
    } catch { /* mic denied */ }
  }, [recording]);

  const onPickFile = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || !f.type.startsWith("audio/")) { if (e.target) e.target.value = ""; return; }
    setVoiceBlob(f);
    setVoiceLabel(f.name);
  }, []);

  const clearVoice = useCallback(() => {
    setVoiceBlob(null);
    setVoiceLabel(null);
    if (fileRef.current) fileRef.current.value = "";
  }, []);

  const handleSubmit = async () => {
    if (!name.trim() || (!message.trim() && !voiceBlob)) return;
    setLoading(true);
    try {
      let voiceDataUrl: string | undefined;
      if (voiceBlob) voiceDataUrl = await blobToDataUrl(voiceBlob);
      const res = await fetch(`${API_URL}/shaadi-card-pages/share/${shareId}/blessings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), message: message.trim(), ...(voiceDataUrl ? { voiceDataUrl } : {}) }),
      });
      const result = await res.json();
      if (result.success && Array.isArray(result.data)) {
        onAdded(result.data.map((b: { name: string; message: string; voiceUrl?: string }) => ({
          name: b.name, message: b.message || "", ...(b.voiceUrl ? { voiceUrl: b.voiceUrl } : {}),
        })));
        setDone(true);
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-[22px] p-6 text-center"
        style={{ background: "rgba(255,252,250,0.82)", backdropFilter: "blur(18px)", border: "1.5px solid rgba(255,255,255,0.95)", boxShadow: `0 8px 32px rgba(109,43,59,0.10)` }}
      >
        <span className="text-4xl block mb-3">🙏</span>
        <p className="font-bold text-base" style={{ fontFamily: F_LORA, color: C_DARK }}>Blessing sent!</p>
        <p className="text-sm mt-1" style={{ fontFamily: F_LORA, color: C_MED }}>May the couple be blessed with endless joy.</p>
      </motion.div>
    );
  }

  const canSend = name.trim() && (message.trim() || voiceBlob);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-[22px] overflow-hidden"
      style={{ background: "rgba(255,252,250,0.88)", backdropFilter: "blur(18px)", border: "1.5px solid rgba(255,255,255,0.95)", boxShadow: `0 8px 32px rgba(109,43,59,0.10), inset 0 1px 0 rgba(255,255,255,0.85)` }}
    >
      {/* Form header */}
      <div className="px-4 pt-4 pb-3" style={{ borderBottom: `1px solid ${C_ACCENT}10` }}>
        <div className="flex items-center gap-2 mb-0.5">
          <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${C_ACCENT}18, ${C_MED}12)`, border: `1px solid ${C_ACCENT}25` }}>
            <HandHeart size={14} style={{ color: C_ACCENT }} />
          </div>
          <p className="font-bold text-sm" style={{ fontFamily: F_LORA, color: C_DARK }}>Leave a Blessing</p>
        </div>
        <p className="text-[10.5px] leading-relaxed" style={{ fontFamily: F_LORA, color: C_MED }}>
          Write a heartfelt message or record your voice — the couple will cherish it forever ♡
        </p>
      </div>

      <div className="p-4 space-y-2.5">
        {/* Name */}
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all"
          style={{
            fontFamily: F_LORA,
            background: `${C_ACCENT}06`,
            border: `1.5px solid ${name ? C_ACCENT + "40" : C_MED + "25"}`,
            color: C_DARK,
          }}
        />

        {/* Message */}
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Your heartfelt message… (optional if you send voice)"
          rows={3}
          className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none resize-none transition-all"
          style={{
            fontFamily: F_LORA,
            background: `${C_ACCENT}06`,
            border: `1.5px solid ${message ? C_ACCENT + "40" : C_MED + "25"}`,
            color: C_DARK,
          }}
        />

        {/* Voice controls */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={toggleRecord}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all"
            style={{
              fontFamily: F_CINZEL,
              border: recording ? "1.5px solid rgba(239,68,68,0.50)" : `1.5px solid ${C_MED}30`,
              color: recording ? "#dc2626" : C_DARK,
              background: recording ? "rgba(239,68,68,0.07)" : `${C_ACCENT}05`,
            }}
          >
            {recording ? <MicOff size={13} /> : <Mic size={13} />}
            {recording ? "Stop" : "Record Voice"}
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all"
            style={{ fontFamily: F_CINZEL, border: `1.5px solid ${C_MED}30`, color: C_DARK, background: `${C_ACCENT}05` }}
          >
            <Music size={13} />
            Upload Audio
          </button>
          <input ref={fileRef} type="file" accept="audio/*" className="hidden" onChange={onPickFile} />
        </div>

        {/* Recording pulse indicator */}
        {recording && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.20)" }}
          >
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 0.9 }}
              className="w-2 h-2 rounded-full bg-red-500"
            />
            <span className="text-[11px] font-semibold" style={{ fontFamily: F_CINZEL, color: "#dc2626" }}>
              Recording… tap Stop when done
            </span>
          </motion.div>
        )}

        {/* Voice attached */}
        {voiceLabel && !recording && (
          <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl"
            style={{ background: `${C_ACCENT}08`, border: `1px solid ${C_ACCENT}20` }}>
            <span className="text-[11px] font-medium truncate" style={{ fontFamily: F_LORA, color: C_DARK }}>
              🎙 {voiceLabel}
            </span>
            <button type="button" onClick={clearVoice}
              className="shrink-0 w-5 h-5 flex items-center justify-center rounded-full"
              style={{ background: `${C_ACCENT}15`, color: C_ACCENT }}>
              <X size={11} />
            </button>
          </div>
        )}

        {/* Send */}
        <motion.button
          type="button"
          onClick={handleSubmit}
          disabled={loading || !canSend}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 text-white transition-opacity"
          style={{
            fontFamily: F_CINZEL,
            background: canSend ? `linear-gradient(135deg, ${C_ACCENT}, ${C_MED})` : `${C_MED}40`,
            boxShadow: canSend ? `0 4px 18px ${C_ACCENT}30` : "none",
            opacity: loading ? 0.7 : 1,
            letterSpacing: "0.06em",
          }}
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          {loading ? "Sending…" : "Send Blessing"}
        </motion.button>
      </div>
    </motion.div>
  );
}

// ── Wish card ─────────────────────────────────────────────────────────────────
function WishCard({ wish, index }: { wish: Wish; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.06 * Math.min(index, 10), duration: 0.4 }}
      className="break-inside-avoid rounded-[20px] p-4 sm:p-5"
      style={{
        background: "rgba(255,252,250,0.82)",
        backdropFilter: "blur(18px)",
        border: "1.5px solid rgba(255,255,255,0.95)",
        boxShadow: `0 8px 28px rgba(109,43,59,0.08), inset 0 1px 0 rgba(255,255,255,0.85)`,
      }}
    >
      <Quote size={18} style={{ color: `${C_MED}60` }} className="mb-2.5" />
      {wish.message?.trim() ? (
        <p className="text-[13px] leading-relaxed mb-3" style={{ fontFamily: F_LORA, color: C_DARK }}>
          {wish.message}
        </p>
      ) : null}
      {wish.voiceUrl ? (
        <div className="mb-3 rounded-xl p-2.5" style={{ background: `${C_ACCENT}08`, border: `1px solid ${C_ACCENT}18` }}>
          <div className="flex items-center gap-2 mb-1.5">
            <Mic size={12} style={{ color: C_ACCENT }} />
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ fontFamily: F_CINZEL, color: C_ACCENT }}>Voice Note</span>
          </div>
          <audio controls className="w-full h-9" preload="metadata" src={wish.voiceUrl} />
        </div>
      ) : null}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
          style={{ background: `linear-gradient(135deg, ${C_ACCENT}20, ${C_MED}15)`, color: C_ACCENT, fontFamily: F_CINZEL }}>
          {wish.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-xs font-semibold leading-none" style={{ fontFamily: F_LORA, color: C_MED }}>
            {wish.name}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
interface Props {
  data: ShaadiData;
  shareId?: string;
}

export default memo(function WishesSection({ data, shareId }: Props) {
  const [wishes, setWishes] = useState<Wish[]>(data.wishes || []);

  const handleAdded = useCallback((updated: Wish[]) => setWishes(updated), []);

  return (
    <section
      className="relative isolate flex min-h-[100dvh] w-full flex-col overflow-hidden"
      style={{ background: C_BG }}
    >
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        <div className="relative h-full w-full">
          <HomeMatchBackground />
          <InvitationStyleCorners />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative z-[4] flex flex-col px-4 pt-16 pb-[calc(9.5rem+env(safe-area-inset-bottom,0px))] sm:px-5 sm:pt-20 lg:mx-auto lg:max-w-2xl lg:px-6 lg:pb-12 lg:pt-10"
      >
        {/* Header */}
        <header className="mb-6 text-center shrink-0">
          <motion.div
            className="mb-2 inline-flex items-center gap-2 rounded-full px-4 py-1.5"
            style={{ background: `linear-gradient(135deg, ${C_ACCENT}14, ${C_MED}10)`, border: `1px solid ${C_ACCENT}28`, boxShadow: `0 2px 12px ${C_ACCENT}10` }}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <HandHeart size={12} style={{ color: C_ACCENT }} />
            <span className="text-[10px] font-bold uppercase tracking-[0.25em]" style={{ fontFamily: F_CINZEL, color: C_ACCENT }}>
              Blessings
            </span>
          </motion.div>
          <h2 className="mb-1 text-[1.65rem] font-bold leading-tight sm:text-3xl" style={{ fontFamily: F_DANCING, color: C_DARK }}>
            Wishes &amp; Blessings
          </h2>
          <p className="mx-auto max-w-xs text-[11px] leading-snug sm:text-sm" style={{ fontFamily: F_LORA, color: C_MED }}>
            Messages and voice notes from loved ones
          </p>
        </header>

        {/* Blessing input (viewer only — shareId present) */}
        {shareId ? (
          <div className="mb-5">
            <BlessingForm shareId={shareId} onAdded={handleAdded} />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-5 flex items-center gap-2.5 rounded-[18px] px-4 py-3"
            style={{ background: `${C_ACCENT}08`, border: `1px dashed ${C_ACCENT}28` }}
          >
            <Sparkles size={14} style={{ color: C_ACCENT }} className="shrink-0" />
            <p className="text-[11px] leading-snug" style={{ fontFamily: F_LORA, color: C_DARK }}>
              After you publish, guests on your shared link can type a blessing or record a voice note here.
            </p>
          </motion.div>
        )}

        {/* Wishes wall */}
        {wishes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[22px] p-12 flex flex-col items-center gap-3 text-center"
            style={{ background: "rgba(255,252,250,0.72)", backdropFilter: "blur(12px)", border: `2px dashed ${C_MED}35` }}
          >
            <div className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${C_ACCENT}14, ${C_MED}10)`, border: `1px solid ${C_ACCENT}20` }}>
              <HandHeart size={28} style={{ color: `${C_MED}` }} />
            </div>
            <p className="text-sm font-medium" style={{ fontFamily: F_LORA, color: C_DARK }}>No blessings yet</p>
            <p className="text-[11px] max-w-xs leading-relaxed" style={{ fontFamily: F_LORA, color: C_MED }}>
              Be the first to send your love and blessings to the couple ♡
            </p>
          </motion.div>
        ) : (
          <AnimatePresence>
            <div className="columns-1 sm:columns-2 gap-4 space-y-3">
              {wishes.map((wish, i) => (
                <WishCard key={`${wish.name}-${i}`} wish={wish} index={i} />
              ))}
            </div>
          </AnimatePresence>
        )}
      </motion.div>
    </section>
  );
});
