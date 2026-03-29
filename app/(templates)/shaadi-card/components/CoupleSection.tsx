"use client";

import { memo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Heart, Users, X, Sparkles, ChevronRight } from "lucide-react";
import type { ShaadiData, CoupleInfo, FamilyInfo } from "./types";

const C_ACCENT = "#AB1C3E";
const C_MED = "#CB6B82";
const C_DARK = "#6D2B3B";
const C_BG = "#FDFBF7";

const F_CINZEL = "var(--font-cinzel), ui-serif, Georgia, serif";
const F_LORA = "var(--font-lora), Georgia, serif";
const F_DANCING = "var(--font-dancing), cursive";

/** True-corner floral overlays — flush top-0/bottom-0 so blooms sit in actual corners */
function InvitationStyleCorners() {
  return (
    <>
      {/* Top left */}
      <div
        className="pointer-events-none absolute left-[-20px] top-0 z-[3] mix-blend-multiply"
        style={{ width: "clamp(120px, 40vw, 240px)", height: "clamp(110px, 22vh, 260px)", opacity: 0.88 }}
        aria-hidden
      >
        <div className="relative h-full w-full scale-x-[-1]">
          <Image
            src="/shaadi-card/image5.webp"
            alt=""
            fill
            sizes="240px"
            className="object-contain"
            style={{ objectPosition: "left top" }}
          />
        </div>
      </div>

      {/* Top right */}
      <div
        className="pointer-events-none absolute right-[-20px] top-0 z-[3] mix-blend-multiply"
        style={{ width: "clamp(120px, 40vw, 240px)", height: "clamp(110px, 22vh, 260px)", opacity: 0.88 }}
        aria-hidden
      >
        <div className="relative h-full w-full">
          <Image
            src="/shaadi-card/image4.webp"
            alt=""
            fill
            sizes="240px"
            className="object-contain"
            style={{ objectPosition: "right top" }}
          />
        </div>
      </div>

      {/* Bottom left */}
      <div
        className="pointer-events-none absolute bottom-[-20px] left-[-30px] z-[3] mix-blend-multiply"
        style={{ width: "clamp(180px, 50vw, 380px)", height: "clamp(140px, 28vh, 300px)", opacity: 0.95 }}
        aria-hidden
      >
        <div className="relative h-full w-full scale-x-[-1]">
          <Image
            src="/shaadi-card/image7.webp"
            alt=""
            fill
            sizes="380px"
            className="object-contain"
            style={{ objectPosition: "left bottom" }}
          />
        </div>
      </div>

      {/* Bottom right */}
      <div
        className="pointer-events-none absolute bottom-[-20px] right-[-30px] z-[3] mix-blend-multiply"
        style={{ width: "clamp(180px, 50vw, 380px)", height: "clamp(140px, 28vh, 300px)", opacity: 0.95 }}
        aria-hidden
      >
        <div className="relative h-full w-full">
          <Image
            src="/shaadi-card/image6.webp"
            alt=""
            fill
            sizes="380px"
            className="object-contain"
            style={{ objectPosition: "right bottom" }}
          />
        </div>
      </div>
    </>
  );
}

function HomeMatchBackground() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 z-0 min-h-full" style={{ background: C_BG }}>
        <Image
          src="/shaadi-card/image10.webp"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
      </div>
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{ background: "rgba(255,255,255,0.38)", mixBlendMode: "soft-light" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[2]"
        style={{ height: "55%", background: "linear-gradient(to top, rgba(253,244,248,0.42) 0%, transparent 100%)" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-[32%] max-h-[280px]"
        style={{ background: "linear-gradient(to bottom, rgba(255,251,248,0.45) 0%, transparent 100%)" }}
        aria-hidden
      />
    </>
  );
}

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
              boxShadow: "0 20px 50px rgba(109,43,59,0.15)",
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
                <Image src={person.photo} alt="" fill className="object-cover" sizes="(max-width:640px) 92vw, 400px" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  {/* Dot pattern bg */}
                  <div className="absolute inset-0 opacity-15" style={{
                    backgroundImage: `radial-gradient(circle, ${C_ACCENT} 1.5px, transparent 1.5px)`,
                    backgroundSize: "22px 22px",
                  }} />
                  {/* Petal rings */}
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
    <section
      className="relative isolate flex min-h-[100dvh] w-full flex-col overflow-hidden lg:min-h-[100dvh] lg:py-10"
      style={{ background: C_BG }}
    >
      {/* Background + corner florals — corners flush to edges */}
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
        className="relative z-[4] flex min-h-0 flex-1 flex-col px-4 pb-[calc(9.5rem+env(safe-area-inset-bottom,0px))] pt-16 sm:px-5 sm:pt-20 lg:mx-auto lg:max-w-lg lg:px-6 lg:pb-8 lg:pt-8"
      >
        {/* Header */}
        <header className="mb-5 shrink-0 text-center sm:mb-6">
          <motion.div
            className="mb-2 inline-flex items-center gap-2 rounded-full px-4 py-1.5"
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
            className="mb-1 text-[1.65rem] font-bold leading-tight sm:text-3xl lg:text-4xl"
            style={{ fontFamily: F_DANCING, color: C_DARK }}
          >
            {data.brideName}{" "}
            <span style={{ color: C_MED }}>&amp;</span>{" "}
            {data.groomName}
          </h2>
          <p className="mx-auto max-w-xs text-[11px] leading-snug sm:text-sm" style={{ fontFamily: F_LORA, color: C_MED }}>
            Tap a card — family &amp; story.
          </p>
        </header>

        {/* Cards */}
        <div className="flex min-h-0 flex-1 flex-col gap-3 sm:gap-4">
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
              className="group relative flex flex-[1] overflow-hidden text-left"
              style={{
                borderRadius: 22,
                background: "rgba(255,252,250,0.82)",
                backdropFilter: "blur(18px)",
                WebkitBackdropFilter: "blur(18px)",
                border: "1.5px solid rgba(255,255,255,0.95)",
                boxShadow: `0 8px 32px rgba(109,43,59,0.10), 0 2px 8px rgba(171,28,62,0.06), inset 0 1px 0 rgba(255,255,255,0.85)`,
              }}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + idx * 0.1, duration: 0.42 }}
              whileTap={{ scale: 0.985 }}
            >
              {/* Photo column */}
              <div
                className="relative shrink-0"
                style={{ width: "42%", maxWidth: 180 }}
              >
                {person.photo ? (
                  <Image
                    src={person.photo}
                    alt={person.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width:768px) 42vw, 180px"
                  />
                ) : (
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center gap-2"
                    style={{
                      background: `linear-gradient(160deg, ${C_MED}30 0%, ${C_ACCENT}18 60%, ${C_MED}22 100%)`,
                    }}
                  >
                    {/* Decorative dots pattern */}
                    <div className="absolute inset-0 opacity-20" style={{
                      backgroundImage: `radial-gradient(circle, ${C_ACCENT} 1px, transparent 1px)`,
                      backgroundSize: "18px 18px",
                    }} />
                    {/* Petal ring */}
                    <div
                      className="relative flex items-center justify-center rounded-full"
                      style={{
                        width: 68, height: 68,
                        background: "rgba(255,255,255,0.55)",
                        border: `2px solid ${C_ACCENT}30`,
                        boxShadow: `0 0 0 6px ${C_ACCENT}10, 0 4px 18px ${C_ACCENT}18`,
                      }}
                    >
                      <span className="text-4xl leading-none">
                        {side === "bride" ? "👰" : "🤵"}
                      </span>
                    </div>
                    <span
                      className="relative text-[9px] font-semibold uppercase tracking-[0.15em]"
                      style={{ fontFamily: F_CINZEL, color: C_ACCENT, opacity: 0.85 }}
                    >
                      {side === "bride" ? "Dulhan" : "Dulha"}
                    </span>
                  </div>
                )}
                {/* Right edge fade */}
                <div
                  className="absolute inset-y-0 right-0 w-8 pointer-events-none"
                  style={{ background: "linear-gradient(to right, transparent, rgba(255,252,250,0.82))" }}
                />
              </div>

              {/* Content column */}
              <div className="flex min-w-0 flex-1 flex-col justify-between px-3 py-3.5 sm:px-4 sm:py-4">
                <div>
                  {/* Role badge */}
                  <span
                    className="mb-1.5 inline-block rounded-full px-2.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.18em] sm:text-[9px]"
                    style={{
                      fontFamily: F_CINZEL,
                      color: C_ACCENT,
                      background: `${C_ACCENT}12`,
                      border: `1px solid ${C_ACCENT}20`,
                    }}
                  >
                    {person.roleHindi}
                  </span>

                  <p className="mb-1 line-clamp-1 text-base font-bold leading-tight sm:text-lg" style={{ fontFamily: F_LORA, color: C_DARK }}>
                    {person.name}
                  </p>
                  <p className="line-clamp-3 text-[10.5px] leading-relaxed sm:text-xs" style={{ fontFamily: F_LORA, color: C_MED }}>
                    {person.description}
                  </p>
                </div>

                {/* Open family strip */}
                <div
                  className="mt-3 flex items-center justify-between rounded-xl px-3 py-2"
                  style={{
                    background: `linear-gradient(135deg, ${C_ACCENT}09, ${C_MED}06)`,
                    border: `1px dashed ${C_ACCENT}28`,
                  }}
                >
                  <span className="text-[9px] font-semibold uppercase tracking-wider sm:text-[10px]" style={{ fontFamily: F_CINZEL, color: C_DARK }}>
                    {family.title}
                  </span>
                  <span
                    className="flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider sm:text-[10px]"
                    style={{ color: C_ACCENT }}
                  >
                    Open <ChevronRight size={11} />
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
