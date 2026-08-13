"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { RB, BRAND_GRADIENT, CARD_BORDER, CARD_SHADOW } from "./theme";
import type { RakhiData } from "./types";

const MAX = 120;

/**
 * The vachan. He types it once and it goes back to her.
 *
 * This is the only thing on the page that travels in the other direction, and
 * it is the reason the template is worth making rather than posting a photo. It
 * is also write-once on the server — see `submitVachan` — so the field goes
 * read-only the moment it succeeds.
 *
 * It is optional. Skipping is a button, not a hidden link.
 */
export default function PromiseScreen({
  data,
  onSubmit,
  onContinue,
}: {
  data: RakhiData;
  /** Resolves to the stored promise, or null if it could not be saved. */
  onSubmit: (vachan: string) => Promise<string | null>;
  onContinue: () => void;
}) {
  const existing = data.vachan.trim();
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<string | null>(existing || null);
  const [failed, setFailed] = useState(false);

  const submit = async () => {
    const v = text.trim();
    if (!v || saving) return;
    setSaving(true);
    setFailed(false);
    const result = await onSubmit(v);
    setSaving(false);
    if (result) setSaved(result);
    else setFailed(true);
  };

  const sister = data.sisterName || "her";

  return (
    <div
      className="rb-root"
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "34px 22px",
        textAlign: "center",
        gap: 18,
      }}
    >
      <motion.p
        className="rb-deva"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
        style={{ fontSize: 17, lineHeight: 1.7, color: RB.red, margin: 0, maxWidth: 320 }}
      >
        येन बद्धो बली राजा
        <br />
        दानवेन्द्रो महाबलः
      </motion.p>

      <p style={{ fontSize: 13.5, color: RB.muted, margin: 0, maxWidth: 300, lineHeight: 1.6 }}>
        The verse tied to King Bali, the mighty. It ends with a promise, and this
        is the part where you make yours.
      </p>

      {saved ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          style={{
            width: "100%",
            maxWidth: 330,
            padding: "20px 18px",
            borderRadius: 18,
            background: RB.surface,
            border: CARD_BORDER,
            boxShadow: CARD_SHADOW,
          }}
        >
          <p
            className="rb-hand"
            style={{ fontSize: 19, lineHeight: 1.5, color: RB.ink, margin: 0 }}
          >
            “{saved}”
          </p>
          <p style={{ fontSize: 11.5, color: RB.muted, marginTop: 12, marginBottom: 0 }}>
            {sister} will see this.
          </p>
        </motion.div>
      ) : (
        <div style={{ width: "100%", maxWidth: 330, display: "flex", flexDirection: "column", gap: 9 }}>
          <label htmlFor="rb-vachan" style={{ fontSize: 13, color: RB.muted, textAlign: "left" }}>
            Your promise to her
          </label>
          <textarea
            id="rb-vachan"
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX))}
            rows={3}
            placeholder="I'll pick up the phone. Every time."
            style={{
              width: "100%",
              padding: "13px 14px",
              borderRadius: 14,
              border: `1px solid ${RB.hairline}`,
              background: RB.surface,
              color: RB.ink,
              fontSize: 15,
              lineHeight: 1.5,
              resize: "none",
              fontFamily: "inherit",
            }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: RB.muted }}>
            <span aria-live="polite">{failed ? "Couldn't save that — try again?" : ""}</span>
            <span>
              {text.length}/{MAX}
            </span>
          </div>

          <button
            onClick={submit}
            disabled={!text.trim() || saving}
            className="rb-display"
            style={{
              minHeight: 52,
              padding: "15px 30px",
              borderRadius: 999,
              background: BRAND_GRADIENT,
              color: "#fffdf8",
              border: CARD_BORDER,
              boxShadow: CARD_SHADOW,
              fontSize: 16.5,
              fontWeight: 700,
              cursor: text.trim() && !saving ? "pointer" : "default",
              opacity: !text.trim() || saving ? 0.55 : 1,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {saving && <Loader2 size={16} className="animate-spin" />}
            {saving ? "Sending…" : "I promise"}
          </button>
        </div>
      )}

      <button
        onClick={onContinue}
        style={{
          minHeight: 44,
          padding: "10px 20px",
          borderRadius: 999,
          background: "transparent",
          border: `1px solid ${RB.hairline}`,
          color: RB.muted,
          fontSize: 14,
          cursor: "pointer",
        }}
      >
        {saved ? "See her photos" : "Skip for now"}
      </button>
    </div>
  );
}
