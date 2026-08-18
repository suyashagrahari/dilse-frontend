"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { RB, BRAND_GRADIENT, CARD_BORDER, CARD_SHADOW } from "./theme";
import type { RakhiData } from "./types";
import { Rangoli, ThreadDivider, PetalBurst, Diya } from "./Ornaments";
import Stage, { BackLink, useIsDesktop } from "./Stage";

const MAX = 120;

/**
 * The vachan. He types it once and it goes back to her.
 *
 * This is the only thing on the page that travels in the other direction, and
 * it is why the template is worth making rather than posting a photo. It is
 * also write-once on the server (see `submitVachan`), so the field goes
 * read-only the moment it succeeds — and it is optional, with skipping offered
 * as a real button rather than a hidden link.
 */
export default function PromiseScreen({
  data,
  onSubmit,
  onContinue,
  onBack,
}: {
  data: RakhiData;
  /** Resolves to the stored promise, or null if it could not be saved. */
  onSubmit: (vachan: string) => Promise<string | null>;
  onContinue: () => void;
  onBack: () => void;
}) {
  const existing = data.vachan.trim();
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<string | null>(existing || null);
  const [failed, setFailed] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const isDesktop = useIsDesktop();

  const submit = async () => {
    const v = text.trim();
    if (!v || saving) return;
    setSaving(true);
    setFailed(false);
    const result = await onSubmit(v);
    setSaving(false);
    if (result) {
      setSaved(result);
      setCelebrate(true);
      navigator.vibrate?.(22);
      setTimeout(() => setCelebrate(false), 3000);
    } else {
      setFailed(true);
    }
  };

  const sister = data.sisterName || "she";

  return (
    <Stage
      behind={
        <>
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              zIndex: 0,
            }}
          >
            <Rangoli size={isDesktop ? 640 : 400} opacity={0.055} />
          </div>
          {celebrate && <PetalBurst count={22} />}
        </>
      }
      art={
        /* No GIF on this screen — the ceremony IS the verse. On desktop it
           becomes the left panel, which is the one place in the flow where the
           Sanskrit gets to be the size it deserves. */
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            textAlign: "center",
          }}
        >
          <Diya size={isDesktop ? 62 : 40} lit />

          <motion.p
            className="rb-deva"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            style={{
              fontSize: isDesktop ? 30 : 18,
              lineHeight: 1.75,
              color: RB.red,
              margin: 0,
              maxWidth: isDesktop ? 460 : 320,
            }}
          >
            येन बद्धो बली राजा
            <br />
            दानवेन्द्रो महाबलः
          </motion.p>

          <ThreadDivider
            colorA={data.rakhi.threadColorA}
            colorB={data.rakhi.threadColorB}
            width={isDesktop ? 250 : 160}
          />
        </div>
      }
      body={
        <>
        <p style={{ fontSize: 13.5, color: RB.muted, margin: 0, maxWidth: 340, lineHeight: 1.6 }}>
          The verse tied to King Bali, the mighty. It ends with a promise — and
          this is the part where you make yours.
        </p>

        {saved ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.34, 1.4, 0.64, 1] }}
            style={{
              width: "100%",
              maxWidth: 330,
              padding: "22px 20px",
              borderRadius: 19,
              background: RB.surface,
              border: CARD_BORDER,
              boxShadow: CARD_SHADOW,
              position: "relative",
            }}
          >
            <span
              aria-hidden
              style={{
                position: "absolute",
                top: -12,
                left: 18,
                fontSize: 44,
                lineHeight: 1,
                color: RB.brassSoft,
                fontFamily: "Georgia, serif",
              }}
            >
              “
            </span>
            <p className="rb-hand" style={{ fontSize: 20, lineHeight: 1.5, color: RB.ink, margin: 0 }}>
              {saved}
            </p>
            <p style={{ fontSize: 11.5, color: RB.muted, marginTop: 13, marginBottom: 0 }}>
              {sister === "she" ? "She" : sister} will see this.
            </p>
          </motion.div>
        ) : (
          <div style={{ width: "100%", maxWidth: 330, display: "flex", flexDirection: "column", gap: 9 }}>
            <label
              htmlFor="rb-vachan"
              style={{ fontSize: 12.5, fontWeight: 600, color: RB.muted, textAlign: "left" }}
            >
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
                padding: "14px 15px",
                borderRadius: 15,
                border: `1px solid ${RB.hairline}`,
                background: RB.surface,
                color: RB.ink,
                fontSize: 15.5,
                lineHeight: 1.5,
                resize: "none",
                fontFamily: "inherit",
                boxShadow: "inset 0 1px 3px rgba(61,35,23,0.05)",
              }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: RB.muted }}>
              <span aria-live="polite" style={{ color: failed ? RB.red : RB.muted }}>
                {failed ? "Couldn't save that — try again?" : ""}
              </span>
              <span>
                {text.length}/{MAX}
              </span>
            </div>

            <motion.button
              onClick={submit}
              whileTap={{ scale: 0.97 }}
              disabled={!text.trim() || saving}
              className={`rb-display ${text.trim() && !saving ? "rb-sheen" : ""}`}
              style={{
                position: "relative",
                overflow: "hidden",
                minHeight: 56,
                padding: "16px 30px",
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
            </motion.button>
          </div>
        )}

        <button
          onClick={onContinue}
          style={{
            minHeight: 44,
            padding: "10px 22px",
            borderRadius: 999,
            background: "transparent",
            border: `1px solid ${RB.hairline}`,
            color: RB.muted,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          {saved ? "See her photos →" : "Skip for now"}
        </button>

        {/* Back is safe here even after the vachan is saved: the promise is
            already on the server and this screen renders it read-only, so
            returning to the gift and coming forward again cannot rewrite it. */}
        <BackLink onClick={onBack} />
        </>
      }
    />
  );
}
