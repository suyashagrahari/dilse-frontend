"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import type { MissYouData, Memory } from "./types";
import { NIGHT, LIGHT, FONT_HEADING, FONT_BODY, FONT_SCRIPT } from "./theme";

const TILTS = [-1.5, 1.1, -0.8, 1.4, -1.2, 0.9];

function PolaroidCard({ memory, index, onOpen }: { memory: Memory; index: number; onOpen: () => void }) {
  const hasImg = !!memory.image;
  const tilt = TILTS[index % TILTS.length];
  return (
    <button
      type="button"
      onClick={hasImg ? onOpen : undefined}
      aria-label={hasImg ? `Enlarge photo: ${memory.caption || "memory"}` : undefined}
      style={{
        background: LIGHT.surface, borderRadius: 16, padding: 10, border: `1px solid ${LIGHT.border}`,
        boxShadow: "0 10px 30px -12px rgba(0,0,0,.5)", transform: `rotate(${tilt}deg)`,
        cursor: hasImg ? "pointer" : "default", width: "100%", textAlign: "center", display: "block",
      }}
    >
      <div style={{ position: "relative", width: "100%", aspectRatio: "1 / 1", borderRadius: 10, overflow: "hidden", background: `linear-gradient(135deg,${NIGHT.base2},${NIGHT.raised})` }}>
        {hasImg ? (
          <Image src={memory.image} alt={memory.caption || "A shared memory"} fill sizes="(max-width:640px) 44vw, 260px" style={{ objectFit: "cover" }} />
        ) : (
          <span aria-hidden style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontSize: 30 }}>🌙</span>
        )}
      </div>
      <p style={{ fontFamily: FONT_SCRIPT, fontSize: "clamp(18px,5vw,22px)", color: LIGHT.text, margin: "10px 4px 4px", lineHeight: 1.15 }}>
        {memory.caption || "a moment with you"}
      </p>
    </button>
  );
}

function Lightbox({ memory, onClose }: { memory: Memory; onClose: () => void }) {
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
      role="dialog" aria-modal="true" aria-label="Memory photo"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 210, background: "rgba(10,8,20,.9)", backdropFilter: "blur(8px)", display: "grid", placeItems: "center", padding: 20 }}
    >
      <motion.div
        initial={reduce ? { opacity: 0 } : { scale: 0.92, opacity: 0 }}
        animate={reduce ? { opacity: 1 } : { scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
        style={{ position: "relative", maxWidth: 520, width: "100%" }}
      >
        <div style={{ position: "relative", width: "100%", aspectRatio: "1 / 1", borderRadius: 18, overflow: "hidden", background: NIGHT.base2 }}>
          {memory.image && <Image src={memory.image} alt={memory.caption || "A shared memory"} fill sizes="(max-width:640px) 90vw, 520px" style={{ objectFit: "contain" }} />}
        </div>
        {memory.caption && <p style={{ fontFamily: FONT_SCRIPT, fontSize: 24, color: NIGHT.pinkLt, textAlign: "center", marginTop: 12 }}>{memory.caption}</p>}
        <button ref={closeRef} type="button" onClick={onClose} aria-label="Close"
          style={{ position: "absolute", top: -14, right: -6, width: 40, height: 40, borderRadius: 999, display: "grid", placeItems: "center", background: NIGHT.raised, color: NIGHT.onNight, border: `1px solid ${NIGHT.hairline}`, cursor: "pointer" }}>
          <X size={18} />
        </button>
      </motion.div>
    </motion.div>
  );
}

/** §4 Our Memories — tilted polaroids + shared-element lightbox. */
export default function MemoryTimeline({ data }: { data: MissYouData }) {
  const [open, setOpen] = useState<number | null>(null);
  const memories = data.memories.length ? data.memories : [{ image: "", caption: "add your first memory" }];
  return (
    <div style={{ maxWidth: 600, margin: "0 auto", width: "100%" }}>
      <p style={{ fontFamily: FONT_BODY, fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: NIGHT.mutedNight, textAlign: "center", margin: 0 }}>❤ Our memories</p>
      <h2 style={{ fontFamily: FONT_HEADING, fontWeight: 600, fontSize: "clamp(22px,6vw,30px)", color: NIGHT.onNight, textAlign: "center", margin: "6px 0 24px" }}>Us, in little frames</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 18 }}>
        {memories.map((m, i) => (
          <PolaroidCard key={i} memory={m} index={i} onOpen={() => setOpen(i)} />
        ))}
      </div>
      <AnimatePresence>
        {open !== null && memories[open] && <Lightbox memory={memories[open]} onClose={() => setOpen(null)} />}
      </AnimatePresence>
    </div>
  );
}
