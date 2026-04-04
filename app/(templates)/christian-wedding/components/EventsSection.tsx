"use client";

import { memo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Clock,
  CalendarDays,
  ExternalLink,
  X,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import type { ShaadiData, WeddingEvent } from "./types";

const C_ACCENT = "#546B57";
const C_MED = "#7A9B7E";
const C_DARK = "#2D3E32";
const F_CINZEL = "var(--font-cinzel), ui-serif, Georgia, serif";
const F_LORA = "var(--font-lora), Georgia, serif";
const F_DANCING = "var(--font-great-vibes), cursive";

interface Props {
  data: ShaadiData;
}

function EventDetailModal({
  ev,
  cityHint,
  onClose,
}: {
  ev: WeddingEvent;
  cityHint: string;
  onClose: () => void;
}) {
  const mapsQuery = [ev.venue, cityHint].filter(Boolean).join(" ");

  return (
    <motion.div
      className="fixed inset-0 z-[85] flex items-center justify-center p-4"
      style={{ background: "rgba(45,20,30,0.62)", backdropFilter: "blur(4px)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-modal-title"
        className="w-full max-w-sm max-h-[88vh] overflow-y-auto rounded-[28px] shadow-2xl [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        style={{
          background: "rgba(255,252,250,0.98)",
          border: "1.5px solid rgba(255,255,255,0.95)",
          boxShadow: `0 24px 60px rgba(45,62,50,0.22), 0 4px 16px rgba(84,107,87,0.10)`,
        }}
        initial={{ opacity: 0, scale: 0.92, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 6 }}
        transition={{ type: "spring", stiffness: 380, damping: 32 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gradient header */}
        <div
          className="relative flex flex-col items-center px-5 pt-8 pb-5"
          style={{
            background: `linear-gradient(160deg, ${C_MED}30 0%, ${C_ACCENT}20 50%, ${C_MED}25 100%)`,
            borderBottom: `1px solid ${C_MED}18`,
          }}
        >
          {/* Close button top-right */}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full shadow-sm transition-transform active:scale-95"
            style={{ background: "rgba(255,255,255,0.90)", color: C_DARK }}
            aria-label="Close"
          >
            <X size={17} />
          </button>

          {/* Icon circle */}
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full mb-3"
            style={{
              background: `linear-gradient(145deg, rgba(255,255,255,0.80), rgba(255,240,245,0.90))`,
              border: `2px solid ${C_ACCENT}28`,
              boxShadow: `0 0 0 8px ${C_ACCENT}10, 0 8px 24px ${C_ACCENT}18`,
              fontSize: "2.6rem",
              lineHeight: 1,
            }}
            aria-hidden
          >
            {ev.icon}
          </div>

          <h2
            id="event-modal-title"
            className="text-xl font-bold text-center leading-tight mb-0.5"
            style={{ fontFamily: F_LORA, color: C_DARK }}
          >
            {ev.name}
          </h2>
          {ev.hindi && (
            <p className="text-sm text-center" style={{ fontFamily: F_CINZEL, color: C_ACCENT }}>
              {ev.hindi}
            </p>
          )}
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Date / time pills */}
          <div className="flex flex-wrap gap-2">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
              style={{ background: `${C_ACCENT}12`, color: C_ACCENT, fontFamily: F_CINZEL }}
            >
              <CalendarDays size={12} /> {ev.date || "Date TBA"}
            </span>
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: `${C_MED}12`, color: C_DARK, fontFamily: F_LORA }}
            >
              <Clock size={12} /> {ev.time}
            </span>
          </div>

          {/* Venue */}
          {ev.venue ? (
            <div
              className="rounded-2xl p-4"
              style={{ background: `${C_ACCENT}06`, border: `1px solid ${C_ACCENT}14` }}
            >
              <p
                className="text-[10px] font-bold uppercase tracking-wider mb-1.5"
                style={{ fontFamily: F_CINZEL, color: C_MED }}
              >
                Venue
              </p>
              <div className="flex items-start justify-between gap-2">
                <p
                  className="text-sm font-medium flex items-start gap-2 leading-snug"
                  style={{ fontFamily: F_LORA, color: C_DARK }}
                >
                  <MapPin size={14} className="shrink-0 mt-0.5" style={{ color: C_ACCENT }} />
                  {ev.venue}
                </p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg"
                  style={{ color: C_ACCENT, background: `${C_ACCENT}10`, fontFamily: F_CINZEL }}
                >
                  Maps <ExternalLink size={11} />
                </a>
              </div>
            </div>
          ) : null}

          {/* Details */}
          <div>
            <p
              className="text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1"
              style={{ fontFamily: F_CINZEL, color: C_MED }}
            >
              <Sparkles size={11} /> Details
            </p>
            <p
              className="text-sm leading-relaxed whitespace-pre-wrap"
              style={{ fontFamily: F_LORA, color: C_DARK }}
            >
              {ev.details?.trim()
                ? ev.details
                : "The hosts will share dress code, parking, and timing updates closer to the date. We can't wait to celebrate with you!"}
            </p>
          </div>

          {/* Gradient close button */}
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-2xl text-sm font-bold text-white"
            style={{
              background: `linear-gradient(135deg, ${C_ACCENT}, ${C_MED})`,
              fontFamily: F_CINZEL,
              boxShadow: `0 4px 16px ${C_ACCENT}30`,
            }}
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default memo(function EventsSection({ data }: Props) {
  const [selected, setSelected] = useState<WeddingEvent | null>(null);
  const close = useCallback(() => setSelected(null), []);

  const activeEvents = data.events.filter((ev) => !ev.disabled);
  const disabledEvents = data.events.filter((ev) => ev.disabled);

  return (
    <section
      className="relative isolate flex min-h-[100dvh] w-full flex-col"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="relative z-[4] max-w-4xl mx-auto w-full px-4 sm:px-5 pt-16 pb-[calc(9.5rem+env(safe-area-inset-bottom,0px))] lg:pt-10 lg:pb-12"
      >
        {/* Section header */}
        <div className="text-center mb-8 sm:mb-10">
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
            style={{
              background: `linear-gradient(135deg, ${C_ACCENT}14, ${C_MED}10)`,
              border: `1px solid ${C_ACCENT}28`,
              boxShadow: `0 2px 12px ${C_ACCENT}10`,
            }}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <CalendarDays size={13} style={{ color: C_ACCENT }} />
            <span
              className="text-[10px] font-bold uppercase tracking-[0.25em]"
              style={{ fontFamily: F_CINZEL, color: C_ACCENT }}
            >
              Celebrations
            </span>
          </motion.div>

          <h2
            className="text-[1.85rem] sm:text-3xl lg:text-4xl font-bold leading-tight mb-1"
            style={{ fontFamily: F_DANCING, color: C_DARK }}
          >
            Wedding Events
          </h2>
          <p className="text-sm max-w-md mx-auto" style={{ fontFamily: F_LORA, color: C_MED }}>
            Tap any card for the full story — timings, venue, and notes from the hosts.
          </p>
        </div>

        {/* Event cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {activeEvents.map((ev, idx) => (
            <motion.button
              key={ev.name + idx}
              type="button"
              onClick={() => setSelected(ev)}
              className="text-left group"
              style={{
                borderRadius: 22,
                background: "rgba(255,252,250,0.82)",
                backdropFilter: "blur(18px)",
                WebkitBackdropFilter: "blur(18px)",
                border: "1.5px solid rgba(255,255,255,0.95)",
                boxShadow: `0 8px 32px rgba(45,62,50,0.10), 0 2px 8px rgba(84,107,87,0.06), inset 0 1px 0 rgba(255,255,255,0.85)`,
                padding: "1.25rem",
              }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 * idx, duration: 0.4 }}
              whileTap={{ scale: 0.99 }}
              whileHover={{ boxShadow: `0 12px 40px rgba(45,62,50,0.15), 0 4px 12px rgba(84,107,87,0.09), inset 0 1px 0 rgba(255,255,255,0.90)` }}
            >
              {/* Top row: icon badge + name + date pill */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Circular icon badge */}
                  <div
                    className="shrink-0 flex items-center justify-center rounded-full"
                    style={{
                      width: 60,
                      height: 60,
                      background: `linear-gradient(145deg, ${C_MED}22 0%, ${C_ACCENT}14 100%)`,
                      border: `1.5px solid ${C_ACCENT}20`,
                      boxShadow: `0 2px 10px ${C_ACCENT}10`,
                      fontSize: "1.75rem",
                      lineHeight: 1,
                    }}
                    aria-hidden
                  >
                    {ev.icon}
                  </div>

                  <div className="min-w-0">
                    <h3
                      className="text-base font-bold leading-tight truncate"
                      style={{ fontFamily: F_LORA, color: C_DARK }}
                    >
                      {ev.name}
                    </h3>
                    {ev.hindi && (
                      <p
                        className="text-xs mt-0.5"
                        style={{ fontFamily: F_CINZEL, color: C_ACCENT }}
                      >
                        {ev.hindi}
                      </p>
                    )}
                  </div>
                </div>

                {/* Date pill */}
                <span
                  className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold"
                  style={{
                    background: `${C_ACCENT}12`,
                    color: C_ACCENT,
                    fontFamily: F_CINZEL,
                    border: `1px solid ${C_ACCENT}18`,
                  }}
                >
                  {ev.date || "TBA"}
                </span>
              </div>

              {/* Time + venue row */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs mb-3" style={{ color: C_DARK }}>
                <span className="inline-flex items-center gap-1" style={{ fontFamily: F_LORA }}>
                  <Clock size={11} style={{ color: C_MED }} />
                  {ev.time}
                </span>
                {ev.venue ? (
                  <span
                    className="inline-flex items-center gap-1 min-w-0"
                    style={{ fontFamily: F_LORA }}
                  >
                    <MapPin size={11} style={{ color: C_MED }} className="shrink-0" />
                    <span className="truncate">{ev.venue}</span>
                  </span>
                ) : null}
              </div>

              {/* Details preview + chevron */}
              <div className="flex items-end justify-between gap-2">
                <p
                  className="text-xs line-clamp-2 leading-relaxed flex-1"
                  style={{ fontFamily: F_LORA, color: `${C_MED}cc` }}
                >
                  {ev.details?.trim() ? ev.details : "Tap for full details, directions, and host notes →"}
                </p>
                <ChevronRight
                  size={15}
                  className="shrink-0 mb-0.5 transition-transform group-hover:translate-x-0.5"
                  style={{ color: C_ACCENT }}
                />
              </div>
            </motion.button>
          ))}
        </div>

       
      </motion.div>

      <AnimatePresence>
        {selected && (
          <EventDetailModal
            key={selected.name + selected.date}
            ev={selected}
            cityHint={data.venue}
            onClose={close}
          />
        )}
      </AnimatePresence>
    </section>
  );
});
