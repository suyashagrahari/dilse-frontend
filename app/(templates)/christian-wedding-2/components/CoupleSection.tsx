"use client";

import { memo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Users, X, Sparkles, ChevronRight } from "lucide-react";
import type { ShaadiData, CoupleInfo, FamilyInfo } from "@/app/(templates)/christian-wedding/components/types";

const C_ACCENT = "#546B57";
const C_MED = "#7A9B7E";
const C_DARK = "#2D3E32";

const F_CINZEL = "var(--font-cinzel), ui-serif, Georgia, serif";
const F_LORA = "var(--font-lora), Georgia, serif";
const F_DANCING = "var(--font-great-vibes), cursive";

const modalScrollHide =
  "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden";

function FamilyModal({
  open, onClose, person, family, accentLabel,
}: {
  open: boolean;
  onClose: () => void;
  person: CoupleInfo;
  family: FamilyInfo;
  accentLabel: string;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-6"
          style={{ background: "rgba(35,18,28,0.5)", backdropFilter: "blur(4px)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="family-modal-title"
            className={`relative w-full max-w-[min(92vw,400px)] max-h-[min(82dvh,600px)] overflow-y-auto overflow-x-hidden rounded-[26px] shadow-2xl ${modalScrollHide}`}
            style={{
              background: `linear-gradient(180deg, rgba(255,250,248,0.98) 0%, #FFF9F7 100%)`,
              border: `1px solid ${C_MED}30`,
              boxShadow: "0 20px 50px rgba(45,62,50,0.15)",
            }}
            initial={{ opacity: 0, scale: 0.94, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 6 }}
            transition={{ type: "spring", stiffness: 400, damping: 34 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="relative h-[min(36vh,220px)] overflow-hidden sm:h-52"
              style={{ background: `linear-gradient(145deg, ${C_MED}40 0%, ${C_ACCENT}28 50%, ${C_MED}32 100%)` }}
            >
              {person.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={person.photo} alt="" className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <div className="absolute inset-0 opacity-15" style={{
                    backgroundImage: `radial-gradient(circle, ${C_ACCENT} 1.5px, transparent 1.5px)`,
                    backgroundSize: "22px 22px",
                  }} />
                  <div
                    className="relative flex items-center justify-center rounded-full"
                    style={{
                      width: 96, height: 96,
                      background: "rgba(255,255,255,0.60)",
                      border: `2.5px solid ${C_ACCENT}38`,
                      boxShadow: `0 0 0 8px ${C_ACCENT}12, 0 0 0 16px ${C_ACCENT}06, 0 8px 28px ${C_ACCENT}22`,
                    }}
                  >
                    <span className="text-5xl leading-none sm:text-6xl">
                      {accentLabel === "bride" ? "👰" : "🤵"}
                    </span>
                  </div>
                  <span
                    className="relative text-[10px] font-bold uppercase tracking-[0.2em]"
                    style={{ fontFamily: F_CINZEL, color: "rgba(255,255,255,0.82)" }}
                  >
                    {accentLabel === "bride" ? "The Bride" : "The Groom"}
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={onClose}
                className="absolute right-2.5 top-2.5 flex h-9 w-9 items-center justify-center rounded-full shadow-md transition-transform active:scale-95"
                style={{ background: "rgba(255,255,255,0.95)", color: C_DARK }}
                aria-label="Close"
              >
                <X size={17} />
              </button>
              <div
                className="absolute bottom-0 left-0 right-0 px-4 py-2.5 sm:px-5 sm:py-3"
                style={{ background: "linear-gradient(transparent, rgba(253,245,240,0.98))" }}
              >
                <p className="mb-0.5 text-[9px] font-bold uppercase tracking-[0.2em] sm:text-[10px]"
                  style={{ fontFamily: F_CINZEL, color: C_ACCENT }}>
                  {person.roleHindi} · {person.role}
                </p>
                <h2 id="family-modal-title" className="text-lg font-bold sm:text-xl" style={{ fontFamily: F_LORA, color: C_DARK }}>
                  {person.name}
                </h2>
              </div>
            </div>

            <div className="space-y-3 px-4 py-4 sm:space-y-4 sm:px-5 sm:py-5">
              <div>
                <p className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold" style={{ fontFamily: F_CINZEL, color: C_MED }}>
                  <Sparkles size={11} /> About
                </p>
                <p className="text-[13px] leading-snug sm:text-sm sm:leading-relaxed" style={{ fontFamily: F_LORA, color: C_DARK }}>
                  {person.description}
                </p>
              </div>

              {person.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {person.tags.map((tag) => (
                    <span
                      key={tag.label}
                      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium sm:text-xs"
                      style={{ background: `${C_ACCENT}10`, color: C_DARK, border: `1px solid ${C_ACCENT}16`, fontFamily: F_LORA }}
                    >
                      {tag.emoji} {tag.label}
                    </span>
                  ))}
                </div>
              )}

              <div
                className="space-y-2 rounded-xl p-3 sm:rounded-2xl sm:p-4"
                style={{ background: `${C_ACCENT}06`, border: `1px solid ${C_ACCENT}16` }}
              >
                <div className="flex items-center gap-2">
                  <Users size={15} style={{ color: C_ACCENT }} />
                  <h3 className="text-xs font-bold sm:text-sm" style={{ fontFamily: F_CINZEL, color: C_DARK }}>
                    {family.title}
                  </h3>
                </div>
                <div className="space-y-1.5 text-[12px] sm:text-sm" style={{ fontFamily: F_LORA, color: C_DARK }}>
                  <p>
                    <span className="font-semibold" style={{ color: C_ACCENT }}>Parents</span>
                    <br />{family.parents || "—"}
                  </p>
                  {family.grandparents ? (
                    <p>
                      <span className="font-semibold" style={{ color: C_ACCENT }}>Grandparents</span>
                      <br /><span style={{ color: C_MED }}>{family.grandparents}</span>
                    </p>
                  ) : null}
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-xl py-2.5 text-xs font-bold text-white shadow-md transition active:scale-[0.99] sm:rounded-2xl sm:py-3 sm:text-sm"
                style={{ background: `linear-gradient(135deg, ${C_ACCENT}, ${C_MED})`, fontFamily: F_CINZEL }}
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default memo(function CoupleSection({ data }: Props) {
  const [modal, setModal] = useState<ModalSide>(null);
  const close = useCallback(() => setModal(null), []);

  return (
    <section className="relative isolate flex w-full flex-col items-center justify-center py-16 sm:py-20 lg:py-24">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative z-[4] mx-auto flex w-full max-w-md flex-col px-4 sm:max-w-lg sm:px-6 lg:max-w-5xl lg:px-8"
      >
        {/* Header */}
        <header className="mb-8 text-center sm:mb-10">
          <motion.div
            className="mb-3 inline-flex items-center gap-2 rounded-full px-4 py-1.5"
            style={{
              background: `linear-gradient(135deg, ${C_ACCENT}14, ${C_MED}10)`,
              border: `1px solid ${C_ACCENT}28`,
              boxShadow: `0 2px 12px ${C_ACCENT}10`,
            }}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Heart size={12} style={{ color: C_ACCENT }} fill={C_ACCENT} className="opacity-90" />
            <span className="text-[10px] font-bold uppercase tracking-[0.25em]" style={{ fontFamily: F_CINZEL, color: C_ACCENT }}>
              Us
            </span>
          </motion.div>

          <h2
            className="mb-2 leading-tight"
            style={{ fontFamily: F_DANCING, color: C_DARK, fontSize: "clamp(2rem, 7vw, 3rem)", fontWeight: 700 }}
          >
            {data.brideName}{" "}
            <span style={{ color: C_MED, fontWeight: 400 }}>&amp;</span>{" "}
            {data.groomName}
          </h2>
          <p className="mx-auto max-w-xs" style={{ fontFamily: F_LORA, fontSize: 11, fontWeight: 300, color: C_MED, opacity: 0.72, letterSpacing: "0.04em" }}>
            Tap a card — family &amp; story.
          </p>
        </header>

        {/* Cards — vertical on mobile, side-by-side on desktop */}
        <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-8">
          {(
            [
              { side: "bride" as const, person: data.bride, family: data.brideFamily },
              { side: "groom" as const, person: data.groom, family: data.groomFamily },
            ] as const
          ).map(({ side, person, family }, idx) => (
            <motion.button
              key={side}
              type="button"
              onClick={() => setModal(side)}
              className="group relative flex w-full flex-col overflow-hidden text-left"
              style={{
                borderRadius: 22,
                background: "rgba(255,252,250,0.94)",
                border: "1.5px solid rgba(255,255,255,0.95)",
                boxShadow: `0 8px 32px rgba(45,62,50,0.10), 0 2px 8px rgba(84,107,87,0.06), inset 0 1px 0 rgba(255,255,255,0.85)`,
                willChange: "transform",
              }}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: 0.08 + idx * 0.08, duration: 0.35 }}
              whileTap={{ scale: 0.985 }}
            >
              {/* Photo on top — full width */}
              <div className="relative w-full overflow-hidden h-64 sm:h-80 lg:h-96">
                {person.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={person.photo}
                    alt={person.name}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center gap-3"
                    style={{
                      background: `linear-gradient(160deg, ${C_MED}30 0%, ${C_ACCENT}18 60%, ${C_MED}22 100%)`,
                    }}
                  >
                    <div className="absolute inset-0 opacity-20" style={{
                      backgroundImage: `radial-gradient(circle, ${C_ACCENT} 1px, transparent 1px)`,
                      backgroundSize: "18px 18px",
                    }} />
                    <div
                      className="relative flex items-center justify-center rounded-full"
                      style={{
                        width: 84, height: 84,
                        background: "rgba(255,255,255,0.55)",
                        border: `2px solid ${C_ACCENT}30`,
                        boxShadow: `0 0 0 6px ${C_ACCENT}10, 0 4px 18px ${C_ACCENT}18`,
                      }}
                    >
                      <span className="text-5xl leading-none">
                        {side === "bride" ? "👰" : "🤵"}
                      </span>
                    </div>
                    <span
                      className="relative text-[10px] font-semibold uppercase tracking-[0.15em]"
                      style={{ fontFamily: F_CINZEL, color: C_ACCENT, opacity: 0.85 }}
                    >
                      {side === "bride" ? "Bride" : "Groom"}
                    </span>
                  </div>
                )}
                {/* Bottom edge fade into content */}
                <div
                  className="absolute inset-x-0 bottom-0 h-12 pointer-events-none"
                  style={{ background: "linear-gradient(to bottom, transparent, rgba(255,252,250,0.82))" }}
                />
              </div>

              {/* Content below — full width */}
              <div className="flex w-full flex-col gap-3 px-5 py-5 sm:px-6 sm:py-6">
                <div>
                  <span
                    className="mb-2 inline-block rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] sm:text-[10px]"
                    style={{
                      fontFamily: F_CINZEL,
                      color: C_ACCENT,
                      background: `${C_ACCENT}12`,
                      border: `1px solid ${C_ACCENT}20`,
                    }}
                  >
                    {person.roleHindi}
                  </span>

                  <p className="mb-1.5 text-xl font-bold leading-tight sm:text-2xl" style={{ fontFamily: F_LORA, color: C_DARK }}>
                    {person.name}
                  </p>
                  <p className="text-[12.5px] leading-relaxed sm:text-sm" style={{ fontFamily: F_LORA, color: C_MED }}>
                    {person.description}
                  </p>
                </div>

                {/* Open family strip */}
                <div
                  className="mt-1 flex items-center justify-between rounded-xl px-3.5 py-2.5"
                  style={{
                    background: `linear-gradient(135deg, ${C_ACCENT}09, ${C_MED}06)`,
                    border: `1px dashed ${C_ACCENT}28`,
                  }}
                >
                  <span className="text-[10px] font-semibold uppercase tracking-wider sm:text-[11px]" style={{ fontFamily: F_CINZEL, color: C_DARK }}>
                    {family.title}
                  </span>
                  <span
                    className="flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-wider sm:text-[11px]"
                    style={{ color: C_ACCENT }}
                  >
                    Open <ChevronRight size={12} />
                  </span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      <FamilyModal open={modal === "bride"} onClose={close} person={data.bride} family={data.brideFamily} accentLabel="bride" />
      <FamilyModal open={modal === "groom"} onClose={close} person={data.groom} family={data.groomFamily} accentLabel="groom" />
    </section>
  );
});

interface Props { data: ShaadiData; }
type ModalSide = "bride" | "groom" | null;
