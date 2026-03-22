"use client";

import { memo, useMemo, useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Clock, Calendar, Sparkles } from "lucide-react";
import type { WeddingData, WeddingEvent } from "./types";
import { GLASS_CARD } from "./styles";

interface Props {
  data: WeddingData;
}

const MONTH_MAP: Record<string, number> = {
  jan: 0, january: 0,
  feb: 1, february: 1,
  mar: 2, march: 2,
  apr: 3, april: 3,
  may: 4,
  jun: 5, june: 5,
  jul: 6, july: 6,
  aug: 7, august: 7,
  sep: 8, sept: 8, september: 8,
  oct: 9, october: 9,
  nov: 10, november: 10,
  dec: 11, december: 11,
};

const parseTimeToMinutes = (time: string): number => {
  const cleaned = time.trim().toUpperCase();
  const match = cleaned.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/);
  if (!match) return Number.MAX_SAFE_INTEGER;
  const hourRaw = Number(match[1]);
  const minutes = Number(match[2] || "0");
  const ampm = match[3];
  let hour = hourRaw % 12;
  if (ampm === "PM") hour += 12;
  return hour * 60 + minutes;
};

const parseDateAndTimeToEpoch = (date: string, time: string): number => {
  const trimmedDate = date.trim();
  if (!trimmedDate) return Number.MAX_SAFE_INTEGER;
  const parts = trimmedDate.split(/\s+/);
  if (parts.length < 2) return Number.MAX_SAFE_INTEGER;
  const day = Number(parts[0]);
  const monthIdx = MONTH_MAP[parts[1].toLowerCase()];
  if (!Number.isFinite(day) || monthIdx === undefined) return Number.MAX_SAFE_INTEGER;
  const year = new Date().getFullYear();
  const d = new Date(year, monthIdx, day);
  d.setHours(0, 0, 0, 0);
  d.setMinutes(parseTimeToMinutes(time));
  return d.getTime();
};

const EVENT_WISDOM: Record<string, { verse: string; meaning: string }> = {
  Haldi: {
    verse: "हल्दी का रंग, सूरज सा तेज़ — शुभ की शुरुआत, प्रेम का सजावट",
    meaning: "The golden hue of turmeric symbolizes purity, prosperity & the auspicious beginning of a new journey.",
  },
  Mehendi: {
    verse: "मेहंदी तेरे नाम की, रचती हर एक हाथ — जितना गहरा रंग चढ़े, उतना गहरा साथ",
    meaning: "The deeper the colour of mehendi, the deeper the bond of love between the couple.",
  },
  Sangeet: {
    verse: "ढोल बाजे, शहनाई गाजे — नाचे सारा आँगन, खुशियों से साजे",
    meaning: "An evening of music & dance where both families come together in celebration and joy.",
  },
  Baraat: {
    verse: "ढोल नगाड़ों की धुन पर, सजधज कर आए दूल्हा राजा — दुल्हन के दर पे, प्रेम का पैग़ाम लाया",
    meaning: "The groom arrives with his procession — a grand celebration of love's promise.",
  },
  Wedding: {
    verse: "अग्नि के सात फेरे, सात वचन सात जन्म — धर्म, अर्थ, काम, मोक्ष — यही विवाह का मर्म",
    meaning: "Seven sacred vows around the holy fire bind two souls for seven lifetimes.",
  },
  Reception: {
    verse: "आज की शाम, दोनों के नाम — नई ज़िंदगी की शुरुआत, साथ मिलकर हर काम",
    meaning: "An evening to celebrate the newlyweds as they begin their journey together.",
  },
};

const MODAL_OVERLAY: React.CSSProperties = {
  background: "rgba(0,0,0,0.7)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
};

const GLOSSY_CARD: React.CSSProperties = {
  background:
    "linear-gradient(145deg, var(--wed-glass-strong) 0%, var(--wed-glass) 50%, var(--wed-glass-strong) 100%)",
  backdropFilter: "blur(40px)",
  WebkitBackdropFilter: "blur(40px)",
  border: "1px solid var(--wed-glass-border)",
  boxShadow:
    "0 25px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08), 0 0 80px var(--wed-gold-glow)",
};

function EventModal({
  event,
  onClose,
}: {
  event: WeddingEvent;
  onClose: () => void;
}) {
  const wisdom = EVENT_WISDOM[event.name];

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center p-6"
      style={MODAL_OVERLAY}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
    >
      <motion.div
        className="relative w-full max-w-sm rounded-3xl overflow-hidden"
        style={GLOSSY_CARD}
        initial={{ opacity: 0, scale: 0.85, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.85, y: 40 }}
        transition={{ type: "spring", damping: 28, stiffness: 350 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 50%, rgba(255,255,255,0.03) 100%)",
          }}
        />

        <div
          className={`relative bg-gradient-to-br ${event.accent} p-6 pb-8`}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full z-10 transition-all active:scale-90"
            style={GLASS_CARD}
          >
            <X size={14} style={{ color: "hsl(var(--wed-muted-fg))" }} />
          </button>

          <div className="flex items-center gap-3 mb-3">
            <span className="text-5xl">{event.icon}</span>
            <div>
              <h3
                className="text-2xl font-semibold"
                style={{ color: "hsl(var(--wed-fg))", fontFamily: "'Playfair Display', serif" }}
              >
                {event.name}
              </h3>
              <span
                className="text-sm"
                style={{ color: "hsl(var(--wed-muted-fg))", fontFamily: "'Noto Serif Devanagari', serif" }}
              >
                {event.hindi}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-2">
            <span
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
              style={GLASS_CARD}
            >
              <Calendar size={11} style={{ color: "var(--wed-accent-gold)" }} />
              <span style={{ color: "var(--wed-accent-gold)" }}>{event.date}</span>
            </span>
            <span
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
              style={GLASS_CARD}
            >
              <Clock size={11} style={{ color: "var(--wed-accent-gold)" }} />
              <span style={{ color: "var(--wed-accent-gold)" }}>{event.time}</span>
            </span>
            <span
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
              style={GLASS_CARD}
            >
              <MapPin size={11} style={{ color: "var(--wed-accent-gold)" }} />
              <span style={{ color: "hsl(var(--wed-muted-fg))" }}>{event.venue}</span>
            </span>
          </div>
        </div>

        {wisdom && (
          <div className="relative z-10 p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles size={11} style={{ color: "var(--wed-accent-gold)" }} />
              <p
                className="text-[10px] tracking-[0.3em] uppercase font-medium"
                style={{ color: "var(--wed-accent-gold)" }}
              >
                Significance
              </p>
              <Sparkles size={11} style={{ color: "var(--wed-accent-gold)" }} />
            </div>

            <p
              className="text-sm leading-relaxed mb-4"
              style={{ color: "var(--wed-accent-gold)", fontFamily: "'Noto Serif Devanagari', serif" }}
            >
              &ldquo;{wisdom.verse}&rdquo;
            </p>

            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-px w-10" style={{ background: "var(--wed-glass-border)" }} />
              <span style={{ color: "var(--wed-accent-gold)", fontSize: 10 }}>✦</span>
              <div className="h-px w-10" style={{ background: "var(--wed-glass-border)" }} />
            </div>

            <p className="text-xs leading-relaxed mb-5" style={{ color: "hsl(var(--wed-muted-fg))" }}>
              {wisdom.meaning}
            </p>

            <button
              className="mx-auto flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] tracking-widest uppercase font-semibold transition-all active:scale-95"
              style={{
                ...GLASS_CARD,
                color: "var(--wed-accent-gold)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.2), 0 0 30px var(--wed-gold-glow)",
              }}
            >
              <Calendar size={12} />
              Add to Calendar
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function MobileEventCard({ event, idx }: { event: WeddingEvent; idx: number }) {
  const [showModal, setShowModal] = useState(false);
  const open = useCallback(() => setShowModal(true), []);
  const close = useCallback(() => setShowModal(false), []);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.08 }}
      >
        <button
          onClick={open}
          className={`w-full text-left rounded-2xl bg-gradient-to-br ${event.accent} border p-5 backdrop-blur-sm transition-all active:scale-[0.98]`}
          style={{
            boxShadow: "0 4px 25px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{event.icon}</span>
              <div>
                <div className="flex items-baseline gap-2">
                  <h3
                    className="text-lg font-semibold"
                    style={{ color: "hsl(var(--wed-fg))", fontFamily: "'Playfair Display', serif" }}
                  >
                    {event.name}
                  </h3>
                  <span
                    className="text-xs"
                    style={{ color: "hsl(var(--wed-muted-fg))", fontFamily: "'Noto Serif Devanagari', serif" }}
                  >
                    {event.hindi}
                  </span>
                </div>
                <p className="text-xs font-medium mt-0.5" style={{ color: "var(--wed-accent-gold)" }}>
                  {event.date} · {event.time}
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: "hsl(var(--wed-muted-fg))" }}>
                  {event.venue}
                </p>
              </div>
            </div>
          </div>
        </button>
      </motion.div>

      {showModal && createPortal(
        <AnimatePresence>
          <EventModal event={event} onClose={close} />
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}

const EventsSection = memo(function EventsSection({ data }: Props) {
  const events = useMemo(
    () =>
      [...data.events]
        .filter((event) => !event.disabled)
        .sort((a, b) => {
          const aEpoch = parseDateAndTimeToEpoch(a.date, a.time);
          const bEpoch = parseDateAndTimeToEpoch(b.date, b.time);
          if (aEpoch === bEpoch) return a.name.localeCompare(b.name);
          return aEpoch - bEpoch;
        }),
    [data.events]
  );

  return (
    <section className="min-h-[calc(100vh-5rem)] lg:min-h-screen flex items-start lg:items-center py-8 lg:py-12 px-4">
      <div className="max-w-4xl mx-auto w-full">
        <motion.p
          className="text-[10px] md:text-xs tracking-[0.4em] uppercase text-center mb-2"
          style={{ color: "var(--wed-accent-gold)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Celebrations
        </motion.p>
        <motion.h2
          className="text-3xl md:text-5xl text-center mb-2 lg:mb-10"
          style={{ color: "hsl(var(--wed-fg))", fontFamily: "'Playfair Display', serif" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Wedding Events
        </motion.h2>

        <motion.p
          className="text-center text-xs italic mb-6 lg:hidden"
          style={{ color: "hsl(var(--wed-muted-fg))", fontFamily: "'Cormorant Garamond', serif" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Tap to discover the significance
        </motion.p>

        {/* MOBILE: vertical scrollable list */}
        <div className="lg:hidden space-y-3">
          {events.map((event, idx) => (
            <MobileEventCard key={event.name} event={event} idx={idx} />
          ))}
        </div>

        {/* DESKTOP: original grid */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-4">
          {events.map((event, idx) => (
            <motion.div
              key={event.name}
              className={`rounded-2xl bg-gradient-to-br ${event.accent} border p-6 backdrop-blur-sm transition-all hover:scale-[1.02]`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="text-4xl mb-4">{event.icon}</div>
              <div className="flex items-baseline gap-2 mb-1">
                <h3
                  className="text-xl"
                  style={{ color: "hsl(var(--wed-fg))", fontFamily: "'Playfair Display', serif" }}
                >
                  {event.name}
                </h3>
                <span
                  className="text-sm"
                  style={{ color: "hsl(var(--wed-muted-fg))", fontFamily: "'Noto Serif Devanagari', serif" }}
                >
                  {event.hindi}
                </span>
              </div>
              <div className="space-y-1 mt-3">
                <p className="text-sm font-medium" style={{ color: "var(--wed-accent-gold)" }}>
                  {event.date} · {event.time}
                </p>
                <p className="text-xs" style={{ color: "hsl(var(--wed-muted-fg))" }}>
                  {event.venue}
                </p>
              </div>
              <button
                className="mt-4 text-[10px] tracking-widest uppercase transition-colors hover:opacity-80"
                style={{ color: "var(--wed-accent-gold)" }}
              >
                Add to Calendar →
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
});

export default EventsSection;
