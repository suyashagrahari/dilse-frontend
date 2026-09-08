"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { CalendarDays, MapPin, Clock, Image as ImageIcon, Flower2, Sparkles } from "lucide-react";
import type { ReceptionData } from "./types";

interface Props {
  content: ReceptionData;
  shareUrl: string | null;
  isPersonalized: boolean;
}

function Avatar({ photo, fallback }: { photo: string; fallback: string }) {
  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center text-base overflow-hidden shrink-0"
      style={{ background: "rgba(212,165,116,0.15)", border: "2px solid rgba(212,165,116,0.3)" }}
    >
      {photo ? (
        <img src={photo} alt="" className="w-full h-full object-cover" />
      ) : (
        <span>{fallback}</span>
      )}
    </div>
  );
}

export default memo(function DesktopRightPanel({ content, shareUrl, isPersonalized }: Props) {
  const receptionDate = content.receptionDate
    ? new Date(content.receptionDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <motion.aside
      initial={{ x: 80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="hidden xl:flex flex-col fixed right-0 top-0 h-full w-72 z-40"
      style={{
        background: "var(--rec-sidebar-bg)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderLeft: "1px solid var(--rec-sidebar-border)",
      }}
    >
      {/* Header */}
      <div
        className="px-5 py-4 flex items-center gap-2"
        style={{ borderBottom: "1px solid var(--rec-sidebar-border)" }}
      >
        <Sparkles size={14} style={{ color: "var(--rec-accent)" }} />
        <div>
          <p className="text-xs font-semibold tracking-wider uppercase" style={{ color: "var(--rec-accent)" }}>
            Reception Details
          </p>
          <p className="text-[10px] mt-0.5" style={{ color: "hsl(var(--rec-muted-fg))" }}>
            {isPersonalized ? "Your invitation preview" : "Add your details to personalize"}
          </p>
        </div>
      </div>

      {/* Couple card */}
      <div className="p-4" style={{ borderBottom: "1px solid var(--rec-sidebar-border)" }}>
        <div
          className="rounded-2xl p-4 relative overflow-hidden"
          style={{ background: "rgba(212,165,116,0.06)", border: "1px solid rgba(212,165,116,0.14)" }}
        >
          {/* Top accent bar */}
          <div
            className="absolute top-0 left-0 right-0 h-0.5"
            style={{ background: "var(--rec-gradient-accent)" }}
          />

          {/* Couple avatars */}
          <div className="flex items-center gap-2 mb-3">
            <Avatar photo={content.bride?.photo || ""} fallback="👰" />
            <span
              className="text-sm font-light"
              style={{ color: "var(--rec-accent)", fontFamily: "'Cormorant Garamond', serif" }}
            >
              &amp;
            </span>
            <Avatar photo={content.groom?.photo || ""} fallback="🤵" />
          </div>

          {/* Names */}
          <h3
            className="text-sm font-bold leading-snug"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: "var(--rec-accent)" }}
          >
            {content.brideName || "Bride"} &amp; {content.groomName || "Groom"}
          </h3>

          {/* Tagline */}
          {content.tagline && (
            <p
              className="text-[11px] mt-1.5 italic leading-relaxed"
              style={{ color: "hsl(var(--rec-muted-fg))" }}
            >
              &ldquo;{content.tagline}&rdquo;
            </p>
          )}
        </div>
      </div>

      {/* Details scroll area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
        {/* Date */}
        {receptionDate && (
          <div className="flex items-start gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "rgba(212,165,116,0.1)" }}
            >
              <CalendarDays size={14} style={{ color: "var(--rec-accent)" }} />
            </div>
            <div>
              <p
                className="text-[10px] font-semibold uppercase tracking-wider mb-0.5"
                style={{ color: "hsl(var(--rec-muted-fg))" }}
              >
                Date
              </p>
              <p className="text-xs font-medium" style={{ color: "hsl(var(--rec-fg))" }}>
                {receptionDate}
              </p>
            </div>
          </div>
        )}

        {/* Timings */}
        {content.venueTimings && (
          <div className="flex items-start gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "rgba(212,165,116,0.1)" }}
            >
              <Clock size={14} style={{ color: "var(--rec-accent)" }} />
            </div>
            <div>
              <p
                className="text-[10px] font-semibold uppercase tracking-wider mb-0.5"
                style={{ color: "hsl(var(--rec-muted-fg))" }}
              >
                Timings
              </p>
              <p className="text-xs font-medium" style={{ color: "hsl(var(--rec-fg))" }}>
                {content.venueTimings}
              </p>
            </div>
          </div>
        )}

        {/* Venue */}
        {content.venue && (
          <div className="flex items-start gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "rgba(212,165,116,0.1)" }}
            >
              <MapPin size={14} style={{ color: "var(--rec-accent)" }} />
            </div>
            <div>
              <p
                className="text-[10px] font-semibold uppercase tracking-wider mb-0.5"
                style={{ color: "hsl(var(--rec-muted-fg))" }}
              >
                Venue
              </p>
              <p className="text-xs font-medium" style={{ color: "hsl(var(--rec-fg))" }}>
                {content.venue}
              </p>
              {content.venueAddress && (
                <p className="text-[11px] mt-0.5" style={{ color: "hsl(var(--rec-muted-fg))" }}>
                  {content.venueAddress}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="h-px" style={{ background: "var(--rec-sidebar-border)" }} />

        {/* Gallery count */}
        <div
          className="rounded-xl p-3 flex items-center gap-3"
          style={{ background: "var(--rec-glass)", border: "1px solid var(--rec-glass-border)" }}
        >
          <ImageIcon size={14} style={{ color: "hsl(var(--rec-muted-fg))" }} />
          <span className="text-xs" style={{ color: "hsl(var(--rec-muted-fg))" }}>
            {content.galleryImages.length}{" "}
            {content.galleryImages.length === 1 ? "gallery photo" : "gallery photos"}
          </span>
        </div>

        {/* Blessings count */}
        <div
          className="rounded-xl p-3 flex items-center gap-3"
          style={{ background: "var(--rec-glass)", border: "1px solid var(--rec-glass-border)" }}
        >
          <Flower2 size={14} style={{ color: "hsl(var(--rec-muted-fg))" }} />
          <span className="text-xs" style={{ color: "hsl(var(--rec-muted-fg))" }}>
            {content.wishes.length} {content.wishes.length === 1 ? "blessing" : "blessings"} received
          </span>
        </div>

        {/* Share URL */}
      </div>

      {/* Footer tip */}
      <div className="p-4" style={{ borderTop: "1px solid var(--rec-sidebar-border)" }}>
        <div
          className="rounded-xl p-3"
          style={{ background: "rgba(212,165,116,0.06)", border: "1px solid rgba(212,165,116,0.12)" }}
        >
          <p
            className="text-[10px] font-semibold uppercase tracking-wider mb-1"
            style={{ color: "var(--rec-accent)" }}
          >
            {isPersonalized ? "✓ Personalized" : "💡 Tip"}
          </p>
          <p className="text-[11px] leading-relaxed" style={{ color: "hsl(var(--rec-muted-fg))" }}>
            {isPersonalized
              ? shareUrl
                ? "Your reception page is live! Share the link with your guests."
                : "Looking great! Hit Publish to generate your shareable link."
              : "Click Edit Reception to add your couple details, venue, and gallery photos."}
          </p>
        </div>
      </div>
    </motion.aside>
  );
});
