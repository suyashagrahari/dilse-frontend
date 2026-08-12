"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Flag, ArrowRight } from "lucide-react";
import { API_URL } from "@/lib/config";
import { wallCaption, wallDate, builderHref } from "@/lib/wall/format";
import type { WallEntry } from "@/lib/wall/types";
import WallPreview from "./WallPreview";
import { UI } from "./ui";

/**
 * The detail sheet.
 *
 * "Make one like this" is the largest thing in here on purpose — it is the
 * entire commercial reason the Wall exists. Everything else on this panel is
 * secondary to getting someone into a builder.
 */
export default function WallSheet({
  entry,
  now,
  onClose,
}: {
  entry: WallEntry | null;
  now: number;
  onClose: () => void;
}) {
  // Which entry has been reported, rather than a boolean reset by an effect.
  // Derived state cannot fall out of step with the sheet's contents: opening a
  // different card shows the report link again because the ids differ, not
  // because something remembered to clear a flag.
  const [reportedId, setReportedId] = useState<string | null>(null);
  const reported = Boolean(entry && reportedId === entry.id);

  useEffect(() => {
    if (!entry) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    // Stop the page behind from scrolling under the sheet.
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [entry, onClose]);

  async function report(id: string) {
    setReportedId(id);
    try {
      await fetch(`${API_URL}/wall/${id}/report`, { method: "POST" });
    } catch {
      // The card is hidden server-side on the first successful report. If the
      // call failed there is nothing useful to tell the reader — re-opening the
      // sheet lets them try again.
    }
  }

  const c = entry ? wallCaption(entry) : null;

  return (
    <AnimatePresence>
      {entry && c && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 90,
            background: "rgba(30,12,14,0.45)",
            backdropFilter: "blur(2px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`${c.lead}${c.joiner}${c.trail}`}
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.99 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(420px, 100%)",
              maxHeight: "calc(100dvh - 40px)",
              overflowY: "auto",
              background: UI.bgSoft,
              border: `1px solid ${UI.border}`,
              borderRadius: 16,
              padding: 20,
              position: "relative",
            }}
          >
            <button
              onClick={onClose}
              aria-label="Close"
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                width: 32,
                height: 32,
                borderRadius: 999,
                border: `1px solid ${UI.border}`,
                background: "rgba(255,255,255,0.8)",
                color: UI.textMuted,
                display: "grid",
                placeItems: "center",
                cursor: "pointer",
              }}
            >
              <X size={16} />
            </button>

            <div style={{ maxWidth: 260, margin: "4px auto 18px" }}>
              <WallPreview entry={entry} size="lg" />
            </div>

            <div style={{ textAlign: "center", marginBottom: 18 }}>
              <div
                style={{
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontSize: 21,
                  lineHeight: 1.3,
                  color: UI.text,
                  overflowWrap: "anywhere",
                }}
              >
                <strong style={{ fontWeight: 600 }}>{c.lead}</strong>
                <span style={{ color: UI.textMuted }}>{c.joiner}</span>
                <strong style={{ fontWeight: 600 }}>{c.trail}</strong>
              </div>
              <div style={{ marginTop: 8, fontSize: 12, color: UI.textFaint }}>
                {entry.templateName} · {wallDate(entry.createdAt, now)}
                {entry.isExample && " · Example"}
              </div>
            </div>

            <Link
              href={builderHref(entry.templateSlug)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                width: "100%",
                padding: "16px 20px",
                borderRadius: 12,
                background: UI.text,
                color: UI.bgSoft,
                fontSize: 16,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Make one like this
              <ArrowRight size={18} />
            </Link>

            <div style={{ marginTop: 14, textAlign: "center" }}>
              {reported ? (
                <span style={{ fontSize: 12, color: UI.textFaint }}>
                  Reported — this has been hidden while we look at it.
                </span>
              ) : (
                <button
                  onClick={() => report(entry.id)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    background: "none",
                    border: "none",
                    color: UI.textFaint,
                    fontSize: 12,
                    cursor: "pointer",
                    padding: 4,
                  }}
                >
                  <Flag size={12} />
                  Report this
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
