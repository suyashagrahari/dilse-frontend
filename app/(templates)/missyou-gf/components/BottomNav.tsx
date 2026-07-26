"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Heart, Clock, Sparkles, MoreHorizontal, Lock, Gift } from "lucide-react";
import { NIGHT, FONT_BODY } from "./theme";

export type SectionId = "cover" | "letter" | "distance" | "memories" | "secret" | "openwhen" | "finale";

const SLOTS: { id: SectionId; icon: typeof Mail; label: string }[] = [
  { id: "cover", icon: Mail, label: "Cover" },
  { id: "letter", icon: Heart, label: "Letter" },
  { id: "distance", icon: Clock, label: "Distance" },
  { id: "memories", icon: Sparkles, label: "Memories" },
];

const MORE: { id: SectionId; icon: typeof Lock; label: string }[] = [
  { id: "secret", icon: Lock, label: "A secret" },
  { id: "openwhen", icon: Mail, label: "Open when…" },
  { id: "finale", icon: Gift, label: "Send it back" },
];

/** Mobile section nav (5 slots) + desktop dot-rail. Hidden until the envelope opens. */
export default function BottomNav({ active, onGo, accent }: { active: SectionId; onGo: (id: SectionId) => void; accent: string }) {
  const [moreOpen, setMoreOpen] = useState(false);
  const moreActive = active === "secret" || active === "openwhen" || active === "finale";

  const go = (id: SectionId) => { setMoreOpen(false); onGo(id); };

  return (
    <>
      <AnimatePresence>
        {moreOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMoreOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 47, background: "rgba(10,8,20,.5)" }} />
            <motion.div
              initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
              style={{ position: "fixed", left: 12, right: 12, bottom: 84, zIndex: 48, background: NIGHT.base2, border: `1px solid ${NIGHT.hairline}`, borderRadius: 20, padding: 8, boxShadow: "0 30px 60px -20px rgba(0,0,0,.7)" }}
            >
              {MORE.map((m) => (
                <button key={m.id} type="button" onClick={() => go(m.id)}
                  style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "12px 14px", background: "transparent", border: "none", cursor: "pointer", color: NIGHT.onNight, fontFamily: FONT_BODY, fontSize: 15, fontWeight: 600, borderRadius: 12 }}>
                  <m.icon size={18} color={accent} /> {m.label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <nav
        aria-label="Sections"
        style={{
          position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 49,
          display: "flex", justifyContent: "space-around", alignItems: "center",
          background: "rgba(18,16,31,.82)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
          borderTop: `1px solid ${NIGHT.borderNight}`,
          paddingBottom: "env(safe-area-inset-bottom, 0px)", height: 64,
        }}
      >
        {SLOTS.map((s) => {
          const on = active === s.id;
          return (
            <button key={s.id} type="button" onClick={() => go(s.id)} aria-label={s.label} aria-current={on ? "true" : undefined}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "transparent", border: "none", cursor: "pointer", minWidth: 48, minHeight: 48, justifyContent: "center", color: on ? accent : NIGHT.mutedNight }}>
              <span style={{ display: "grid", placeItems: "center", width: 34, height: 26, borderRadius: 10, background: on ? "rgba(108,92,231,.18)" : "transparent" }}>
                <s.icon size={19} />
              </span>
              <span style={{ fontFamily: FONT_BODY, fontSize: 10, fontWeight: 600 }}>{s.label}</span>
            </button>
          );
        })}
        <button type="button" onClick={() => setMoreOpen((o) => !o)} aria-label="More sections" aria-expanded={moreOpen} aria-current={moreActive ? "true" : undefined}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "transparent", border: "none", cursor: "pointer", minWidth: 48, minHeight: 48, justifyContent: "center", color: moreActive || moreOpen ? accent : NIGHT.mutedNight }}>
          <span style={{ display: "grid", placeItems: "center", width: 34, height: 26, borderRadius: 10, background: moreActive ? "rgba(108,92,231,.18)" : "transparent" }}>
            <MoreHorizontal size={19} />
          </span>
          <span style={{ fontFamily: FONT_BODY, fontSize: 10, fontWeight: 600 }}>More</span>
        </button>
      </nav>
    </>
  );
}
