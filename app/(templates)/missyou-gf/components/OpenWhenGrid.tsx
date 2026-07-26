"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, Mail } from "lucide-react";
import type { MissYouData, OpenWhenNote } from "./types";
import { NIGHT, FONT_HEADING, FONT_BODY } from "./theme";

const TILTS = [-1.4, 1.2, -0.9, 1.1];

function NoteModal({ note, onClose }: { note: OpenWhenNote; onClose: () => void }) {
  const reduce = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <motion.div
      role="dialog" aria-modal="true" aria-label={`Note: ${note.label}`}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 210, background: "rgba(10,8,20,.88)", backdropFilter: "blur(8px)", display: "grid", placeItems: "center", padding: 22 }}
    >
      <motion.div
        initial={reduce ? { opacity: 0 } : { scale: 0.9, opacity: 0, y: 20 }}
        animate={reduce ? { opacity: 1 } : { scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
        style={{ position: "relative", maxWidth: 440, width: "100%", background: NIGHT.base2, borderRadius: 24, border: `1px solid ${NIGHT.hairline}`, padding: "28px 24px", boxShadow: "0 40px 80px -20px rgba(0,0,0,.7)" }}
      >
        <h3 style={{ fontFamily: FONT_HEADING, fontWeight: 600, fontSize: 20, color: NIGHT.pinkLt, margin: "0 0 12px", textTransform: "lowercase" }}>{note.label}</h3>
        <p style={{ fontFamily: FONT_BODY, fontSize: 16, lineHeight: 1.65, color: NIGHT.onNight, margin: 0 }}>{note.text}</p>
        <button ref={closeRef} type="button" onClick={onClose} aria-label="Close note"
          style={{ position: "absolute", top: 12, right: 12, width: 40, height: 40, borderRadius: 999, display: "grid", placeItems: "center", background: NIGHT.raised, color: NIGHT.onNight, border: `1px solid ${NIGHT.hairline}`, cursor: "pointer" }}>
          <X size={18} />
        </button>
      </motion.div>
    </motion.div>
  );
}

/** §6 Open When… — labelled note-envelopes; tap opens the matching note. */
export default function OpenWhenGrid({ data }: { data: MissYouData }) {
  const [open, setOpen] = useState<number | null>(null);
  const notes = data.openWhen.length ? data.openWhen : [{ label: "open when you miss me", text: "I miss you too. Always." }];
  return (
    <div style={{ maxWidth: 560, margin: "0 auto", width: "100%" }}>
      <p style={{ fontFamily: FONT_BODY, fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: NIGHT.mutedNight, textAlign: "center", margin: 0 }}>✉ Open when…</p>
      <h2 style={{ fontFamily: FONT_HEADING, fontWeight: 600, fontSize: "clamp(22px,6vw,30px)", color: NIGHT.onNight, textAlign: "center", margin: "6px 0 24px" }}>Little notes for your hard moments</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>
        {notes.map((n, i) => (
          <button key={i} type="button" onClick={() => setOpen(i)} aria-label={`Open note: ${n.label}`}
            style={{ background: NIGHT.base2, borderRadius: 18, border: `1px solid ${NIGHT.hairline}`, padding: "20px 16px", minHeight: 96, cursor: "pointer", textAlign: "left", transform: `rotate(${TILTS[i % TILTS.length]}deg)`, display: "flex", flexDirection: "column", gap: 12 }}>
            <span aria-hidden style={{ width: 34, height: 34, borderRadius: 10, display: "grid", placeItems: "center", background: NIGHT.raised, color: NIGHT.indigoLt }}><Mail size={17} /></span>
            <span style={{ fontFamily: FONT_HEADING, fontWeight: 600, fontSize: 15, color: NIGHT.onNight, lineHeight: 1.25, textTransform: "lowercase" }}>{n.label}</span>
          </button>
        ))}
      </div>
      <AnimatePresence>
        {open !== null && notes[open] && <NoteModal note={notes[open]} onClose={() => setOpen(null)} />}
      </AnimatePresence>
    </div>
  );
}
