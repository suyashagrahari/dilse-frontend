"use client";

import { memo, useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  MapPin, Clock, Calendar, Navigation, Phone,
  X, ExternalLink, Copy, Check, Sparkles,
} from "lucide-react";
import type { ReceptionData } from "./types";

const MODAL_OVERLAY: React.CSSProperties = {
  background: "rgba(0,0,0,0.7)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
};

const MODAL_CARD: React.CSSProperties = {
  background:
    "linear-gradient(165deg, hsl(var(--rec-surface)) 0%, hsl(var(--rec-bg)) 100%)",
  border: "1px solid rgba(255,255,255,0.06)",
  boxShadow:
    "0 25px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04), 0 0 80px var(--rec-accent-glow)",
};

const PIN_ANIM = { y: -20, opacity: 0 } as const;
const PIN_ANIM_TO = { y: 0, opacity: 1 } as const;
const PIN_TRANSITION = { delay: 0.3, type: "spring" as const, stiffness: 200, damping: 15 };
const CARD_ANIM = { opacity: 0, y: 30 } as const;
const CARD_ANIM_TO = { opacity: 1, y: 0 } as const;
const CARD_TRANSITION = { delay: 0.5, duration: 0.6 };

const VenueModal = memo(function VenueModal({
  data,
  open,
  onClose,
}: {
  data: ReceptionData;
  open: boolean;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const dateStr = useMemo(() => {
    const d = new Date(data.receptionDate);
    return d.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, [data.receptionDate]);

  const directionsUrl = useMemo(
    () =>
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.venueMapQuery)}`,
    [data.venueMapQuery],
  );

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(data.venueAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [data.venueAddress]);

  const stopProp = useCallback((e: React.MouseEvent) => e.stopPropagation(), []);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end lg:items-center justify-center p-4"
          style={MODAL_OVERLAY}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-md rounded-3xl overflow-hidden"
            style={MODAL_CARD}
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            onClick={stopProp}
          >
            <div className="relative h-44 overflow-hidden">
              <Image
                src={data.heroImage}
                alt={data.venue}
                fill
                className="object-cover"
                sizes="(max-width:448px) 100vw, 448px"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(11,15,26,0.3) 0%, rgba(11,15,26,0.85) 100%)",
                }}
              />
              <div className="absolute bottom-4 left-5 right-5 z-10">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles size={12} style={{ color: "var(--rec-accent)" }} />
                  <span
                    className="text-[9px] tracking-[0.5em] uppercase"
                    style={{ color: "var(--rec-accent)" }}
                  >
                    Venue
                  </span>
                </div>
                <h2
                  className="text-2xl font-light"
                  style={{
                    color: "hsl(var(--rec-fg))",
                    fontFamily: "'Cormorant Garamond', serif",
                  }}
                >
                  {data.venue}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center z-10 transition-all active:scale-90"
                style={{
                  background: "rgba(0,0,0,0.4)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <X size={14} style={{ color: "hsl(var(--rec-fg))" }} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                  style={{
                    background: "rgba(212,165,116,0.1)",
                    border: "1px solid rgba(212,165,116,0.15)",
                  }}
                >
                  <MapPin size={15} style={{ color: "var(--rec-accent)" }} />
                </div>
                <div>
                  <p className="text-[9px] tracking-[0.3em] uppercase mb-0.5" style={{ color: "hsl(var(--rec-muted-fg))" }}>
                    Address
                  </p>
                  <p
                    className="text-sm font-light leading-relaxed"
                    style={{ color: "hsl(var(--rec-fg))", fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    {data.venueAddress}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                  style={{
                    background: "rgba(196,166,181,0.1)",
                    border: "1px solid rgba(196,166,181,0.15)",
                  }}
                >
                  <Calendar size={15} style={{ color: "var(--rec-rose)" }} />
                </div>
                <div>
                  <p className="text-[9px] tracking-[0.3em] uppercase mb-0.5" style={{ color: "hsl(var(--rec-muted-fg))" }}>
                    Date
                  </p>
                  <p
                    className="text-sm font-light"
                    style={{ color: "hsl(var(--rec-fg))", fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    {dateStr}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                  style={{
                    background: "rgba(127,184,176,0.1)",
                    border: "1px solid rgba(127,184,176,0.15)",
                  }}
                >
                  <Clock size={15} style={{ color: "var(--rec-sage)" }} />
                </div>
                <div>
                  <p className="text-[9px] tracking-[0.3em] uppercase mb-0.5" style={{ color: "hsl(var(--rec-muted-fg))" }}>
                    Timings
                  </p>
                  <p
                    className="text-sm font-light"
                    style={{ color: "hsl(var(--rec-fg))", fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    {data.venueTimings}
                  </p>
                </div>
              </div>

              <div className="h-px w-full" style={{ background: "rgba(255,255,255,0.04)" }} />

              <div className="flex gap-2">
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-medium transition-all active:scale-[0.97]"
                  style={{
                    background: "var(--rec-gradient-accent)",
                    color: "var(--rec-accent-fg)",
                    fontFamily: "'DM Sans', sans-serif",
                    boxShadow: "0 4px 20px var(--rec-accent-glow)",
                  }}
                >
                  <Navigation size={14} />
                  Get Directions
                </a>
                <button
                  onClick={handleCopy}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs transition-all active:scale-[0.97]"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "hsl(var(--rec-muted-fg))",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {copied ? (
                    <Check size={14} style={{ color: "var(--rec-sage)" }} />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>

             
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

const MapPlaceholder = memo(function MapPlaceholder() {
  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ background: "hsl(var(--rec-bg))" }}>
      <div className="flex flex-col items-center gap-3">
        <div
          className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "var(--rec-accent)", borderTopColor: "transparent" }}
        />
        <p className="text-xs" style={{ color: "hsl(var(--rec-muted-fg))", fontFamily: "'DM Sans', sans-serif" }}>
          Loading map…
        </p>
      </div>
    </div>
  );
});

const VenueCard = memo(function VenueCard({
  data,
  dateLabel,
  onOpen,
}: {
  data: ReceptionData;
  dateLabel: string;
  onOpen: () => void;
}) {
  return (
    <motion.div
      className="relative z-10 px-4 pb-28 lg:pb-8"
      initial={CARD_ANIM}
      animate={CARD_ANIM_TO}
      transition={CARD_TRANSITION}
    >
      <button
        onClick={onOpen}
        className="w-full max-w-md mx-auto block rounded-3xl p-5 transition-all active:scale-[0.98]"
        style={{
          background:
            "linear-gradient(165deg, hsl(var(--rec-surface)) 0%, hsl(var(--rec-bg) / 0.9) 100%)",
          border: "1px solid rgba(255,255,255,0.06)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          boxShadow:
            "0 12px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)",
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{
              background: "rgba(212,165,116,0.12)",
              border: "1px solid rgba(212,165,116,0.15)",
            }}
          >
            <MapPin size={14} style={{ color: "var(--rec-accent)" }} />
          </div>
          <h3
            className="text-base font-light text-left"
            style={{ color: "hsl(var(--rec-fg))", fontFamily: "'Cormorant Garamond', serif" }}
          >
            {data.venue}
          </h3>
        </div>

        <p
          className="text-xs font-light leading-relaxed mb-3"
          style={{ color: "hsl(var(--rec-muted-fg))", fontFamily: "'DM Sans', sans-serif" }}
        >
          {data.venueAddress}
        </p>

        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1.5">
            <Calendar size={11} style={{ color: "var(--rec-rose)" }} />
            <span className="text-[10px]" style={{ color: "hsl(var(--rec-muted-fg))", fontFamily: "'DM Sans', sans-serif" }}>
              {dateLabel}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={11} style={{ color: "var(--rec-sage)" }} />
            <span className="text-[10px]" style={{ color: "hsl(var(--rec-muted-fg))", fontFamily: "'DM Sans', sans-serif" }}>
              {data.venueTimings}
            </span>
          </div>
        </div>

        <div
          className="flex items-center justify-center gap-2 py-2.5 rounded-2xl text-xs"
          style={{
            background: "rgba(212,165,116,0.08)",
            border: "1px solid rgba(212,165,116,0.12)",
            color: "var(--rec-accent)",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <ExternalLink size={12} />
          Tap for full details &amp; directions
        </div>
      </button>
    </motion.div>
  );
});

const LocationSection = memo(function LocationSection({ data }: { data: ReceptionData }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    const timer = setTimeout(() => {
      if (mountedRef.current) setMapReady(true);
    }, 300);
    return () => {
      mountedRef.current = false;
      clearTimeout(timer);
    };
  }, []);

  const mapEmbedUrl = useMemo(
    () =>
      `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(data.venueMapQuery)}&zoom=15&maptype=roadmap`,
    [data.venueMapQuery],
  );

  const dateLabel = useMemo(
    () =>
      new Date(data.receptionDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    [data.receptionDate],
  );

  const openModal = useCallback(() => setModalOpen(true), []);
  const closeModal = useCallback(() => setModalOpen(false), []);
  const handleIframeLoad = useCallback(() => setIframeLoaded(true), []);

  return (
    <>
      <section className="min-h-screen relative flex flex-col overflow-hidden">
        <div className="absolute inset-0">
          {!iframeLoaded && <MapPlaceholder />}
          {mapReady && (
            <iframe
              src={mapEmbedUrl}
              className="w-full h-full border-0"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Venue Location"
              onLoad={handleIframeLoad}
              style={{
                filter: "saturate(0.4) brightness(0.55) contrast(1.2)",
                opacity: iframeLoaded ? 1 : 0,
                transition: "opacity 0.6s ease",
              }}
            />
          )}
          {/* Blocks iframe interaction — hides info popups & "View larger map" */}
          <div className="absolute inset-0 z-[1]" />
          <div
            className="absolute inset-0 pointer-events-none z-[2]"
            style={{
              background:
                "linear-gradient(180deg, rgba(11,15,26,0.4) 0%, transparent 30%, transparent 60%, rgba(11,15,26,0.85) 100%)",
            }}
          />
        </div>

        {/* Pin marker — pulse rings use pure CSS to avoid React re-renders */}
        <div className="flex-1 relative flex items-center justify-center pt-20 lg:pt-24">
          <motion.button
            onClick={openModal}
            className="relative z-10 flex flex-col items-center group cursor-pointer"
            initial={PIN_ANIM}
            animate={PIN_ANIM_TO}
            transition={PIN_TRANSITION}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="rec-pulse-ring rec-pulse-ring--outer" />
            <span className="rec-pulse-ring rec-pulse-ring--inner" />

            <div
              className="relative w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                background: "var(--rec-gradient-accent)",
                boxShadow: "0 6px 30px rgba(212,165,116,0.4), 0 0 60px rgba(212,165,116,0.15)",
                filter: "drop-shadow(0 4px 12px rgba(212,165,116,0.5))",
              }}
            >
              <div
                className="w-12 h-12 rounded-full overflow-hidden border-2"
                style={{ borderColor: "rgba(255,255,255,0.15)" }}
              >
                <Image
                  src={data.heroImage}
                  alt={data.venue}
                  width={48}
                  height={48}
                  className="object-cover w-full h-full"
                />
              </div>
            </div>

            <div
              className="w-3 h-3 rotate-45 -mt-2"
              style={{
                background: "var(--rec-gradient-accent)",
                boxShadow: "0 4px 12px rgba(212,165,116,0.3)",
              }}
            />
            <div
              className="w-6 h-1.5 rounded-full mt-2"
              style={{ background: "rgba(0,0,0,0.3)", filter: "blur(2px)" }}
            />
          </motion.button>
        </div>

        <VenueCard data={data} dateLabel={dateLabel} onOpen={openModal} />
      </section>

      <VenueModal data={data} open={modalOpen} onClose={closeModal} />
    </>
  );
});

export default LocationSection;
