"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Instagram, Loader2 } from "lucide-react";
import { RS, BRAND_GRADIENT, CARD_BORDER, CARD_SHADOW } from "./theme";
import { sisterWord, type SisterData } from "./types";
import { Rangoli, Seal, ThreadRule } from "./Ornaments";
import Stage, { BackLink, useIsDesktop } from "./Stage";

// ─── His letter, and her one answer ──────────────────────────────────────────
//
// The last screen. He wrote the whole page; this is the only thing on it that
// travels back, and it is the reason the template is worth making rather than
// posting a photo to a group.
//
// ── WRITE-ONCE, AND WHY THE BOX DISAPPEARS RATHER THAN GREYING OUT ──────────
//
// The server accepts one reply per page. A second attempt does not error — it
// returns what she wrote the first time — which means the honest UI is not a
// disabled textarea with her old words in it, but no textarea at all. A field she
// can still click into is a field she will edit, and then discover that her edit
// went nowhere. So the moment there is a stored answer, the box is gone and the
// answer is rendered as the artefact it is.
//
// `data.reply` arrives already filled on a second visit (SisterTemplate seeds its
// state from the document), so the same branch covers "she answered a week ago"
// and "she answered thirty seconds ago".
//
// ── THE FAILURE PATH IS THE ONE THAT MATTERS ────────────────────────────────
//
// `onSubmit` resolving to null means the write did not land. Her text stays in the
// box, untouched, and the error says so in words rather than as a red border. She
// may have spent five minutes on it; losing that to a dropped connection is the
// single worst thing this page could do to anyone, and it is exactly what a
// "clear the form on error" reflex would cause. Never clear `text` here.
//
// ── 400 CHARACTERS, MATCHING THE SERVER ─────────────────────────────────────
//
// The route caps the stored reply at 400. The limit is enforced here as well, and
// with a visible counter, because the alternative is that she types 600, presses
// send, and the page silently keeps two thirds — a truncation she has no way to
// see and no way to undo. (400 rather than the brother template's 120 on purpose:
// there he sends a one-line promise, here she is answering a letter, and a letter
// answered in a tweet reads as a shrug.)

const MAX = 400;

/** The point at which the counter stops being furniture and starts warning. */
const NEAR = MAX - 60;

export default function ReplyScreen({
  data,
  onSubmit,
  onSaveCard,
  onDownload,
  saving,
  onBack,
}: {
  data: SisterData;
  /** Resolves to the stored reply, or null if it could not be saved. */
  onSubmit: (text: string) => Promise<string | null>;
  onSaveCard: () => void;
  onDownload: () => void;
  saving: boolean;
  onBack: () => void;
}) {
  const existing = data.reply.trim();

  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [saved, setSaved] = useState<string | null>(existing || null);
  const [failed, setFailed] = useState(false);
  const isDesktop = useIsDesktop();

  const him = data.brotherName || "Bhai";
  const word = sisterWord(data);
  const letter = data.letter.trim();

  const submit = async () => {
    const v = text.trim();
    if (!v || sending) return;
    setSending(true);
    setFailed(false);
    // Whatever comes back is authoritative — on an already-answered page the route
    // returns her original words rather than an error, and rendering those is
    // correct. Only a null means the write genuinely did not happen.
    const stored = await onSubmit(v);
    setSending(false);
    if (stored) {
      setSaved(stored);
      navigator.vibrate?.(22);
    } else {
      setFailed(true);
    }
  };

  const over = text.length >= NEAR;

  return (
    <Stage
      className="rs-tall"
      behind={
        <div
          style={{
            position: "absolute",
            top: "24%",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 0,
          }}
        >
          <Rangoli size={isDesktop ? 620 : 390} opacity={0.05} />
        </div>
      }
      head={
        <>
          <p
            className="rs-deva"
            style={{ fontSize: 13, color: RS.brass, margin: 0 }}
          >
            जवाब
          </p>
          <h2
            className="rs-display rs-name"
            style={{
              fontSize: isDesktop ? 40 : 27,
              fontWeight: 700,
              color: RS.rani,
              margin: "6px 0 0",
            }}
          >
            {saved ? "Sent" : `Your turn, ${word}`}
          </h2>
          <p
            style={{
              fontSize: 13.5,
              color: RS.muted,
              margin: "7px 0 0",
              lineHeight: 1.55,
              maxWidth: 320,
            }}
          >
            {saved
              ? `${him} has this now. It does not change.`
              : "One answer. He gets exactly one, which is more than he deserves."}
          </p>
        </>
      }
      art={
        /* His letter, laid out as a letter — the thing she is answering has to be
           the largest object on the screen or the textarea below it reads as a
           feedback form. On desktop it moves to the left column and the reply box
           sits beside it, which is the whole reason this screen passes an `art`
           slot instead of collapsing to one column. */
        letter ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            style={{
              width: "100%",
              maxWidth: isDesktop ? 420 : 330,
              padding: "24px 22px 20px",
              borderRadius: 4,
              background: RS.surface,
              border: CARD_BORDER,
              boxShadow: CARD_SHADOW,
              position: "relative",
            }}
          >
            <p
              className="rs-display"
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: RS.brass,
                letterSpacing: 1.8,
                margin: "0 0 12px",
              }}
            >
              FROM {him.toUpperCase()}
            </p>

            <p
              className="rs-hand"
              style={{
                fontSize: isDesktop ? 22 : 20,
                lineHeight: 1.55,
                color: RS.ink,
                margin: 0,
                overflowWrap: "anywhere",
              }}
            >
              {letter}
            </p>

            <div style={{ marginTop: 16, display: "grid", placeItems: "center" }}>
              <ThreadRule width={isDesktop ? 240 : 190} knot={false} />
            </div>

            <p
              className="rs-display"
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: RS.rani,
                textAlign: "right",
                margin: "10px 0 0",
              }}
            >
              — {him}
            </p>
          </motion.div>
        ) : undefined
      }
      body={
        <>
          {saved ? (
            /* ── Her answer, as an artefact ──────────────────────────────── */
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.48, ease: [0.34, 1.4, 0.64, 1] }}
              style={{
                width: "100%",
                maxWidth: 330,
                padding: "24px 20px 20px",
                borderRadius: 19,
                background: RS.surface,
                border: CARD_BORDER,
                boxShadow: CARD_SHADOW,
                position: "relative",
              }}
            >
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  top: -14,
                  left: 18,
                  fontSize: 46,
                  lineHeight: 1,
                  color: RS.brassSoft,
                  fontFamily: "Georgia, serif",
                }}
              >
                &ldquo;
              </span>

              <p
                className="rs-hand"
                style={{
                  fontSize: 20,
                  lineHeight: 1.5,
                  color: RS.ink,
                  margin: 0,
                  overflowWrap: "anywhere",
                }}
              >
                {saved}
              </p>

              <div style={{ display: "grid", placeItems: "center", marginTop: 16 }}>
                <Seal size={64} color={RS.mehendi} text="bhej diya" stamped />
              </div>
            </motion.div>
          ) : (
            <div
              style={{
                width: "100%",
                maxWidth: 330,
                display: "flex",
                flexDirection: "column",
                gap: 9,
              }}
            >
              <label
                htmlFor="rs-reply"
                style={{ fontSize: 12.5, fontWeight: 600, color: RS.muted, textAlign: "left" }}
              >
                What you want to say back
              </label>

              <textarea
                id="rs-reply"
                value={text}
                // Sliced as well as capped by `maxLength`, because a paste can
                // exceed the attribute on some engines and the server would be
                // the one to notice.
                maxLength={MAX}
                onChange={(e) => setText(e.target.value.slice(0, MAX))}
                rows={5}
                placeholder="Everything you are not going to say on the phone."
                style={{
                  width: "100%",
                  padding: "14px 15px",
                  borderRadius: 15,
                  border: `1px solid ${failed ? RS.rani : RS.hairline}`,
                  background: RS.surface,
                  color: RS.ink,
                  fontSize: 15.5,
                  lineHeight: 1.55,
                  resize: "none",
                  fontFamily: "inherit",
                  boxShadow: "inset 0 1px 3px rgba(51,32,43,0.05)",
                }}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                  fontSize: 11.5,
                  color: RS.muted,
                }}
              >
                <span aria-live="polite" style={{ color: failed ? RS.rani : RS.muted, textAlign: "left" }}>
                  {failed ? "That did not send. Your words are still here — try again." : ""}
                </span>
                {/* Always in the accessibility tree — a counter she cannot read
                    is the same problem as no counter. Not a live region, though:
                    announcing a number on every keystroke is unusable. */}
                <span
                  style={{ flexShrink: 0, color: over ? RS.rani : RS.muted, fontWeight: over ? 700 : 400 }}
                >
                  {text.length}/{MAX}
                </span>
              </div>

              <motion.button
                type="button"
                onClick={submit}
                whileTap={{ scale: 0.97 }}
                disabled={!text.trim() || sending}
                className={`rs-display ${text.trim() && !sending ? "rs-sheen" : ""}`}
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
                  cursor: text.trim() && !sending ? "pointer" : "default",
                  opacity: !text.trim() || sending ? 0.55 : 1,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                {sending && <Loader2 size={16} className="animate-spin" />}
                {sending ? "Bhej rahe hain…" : "Send it"}
              </motion.button>

              <p style={{ fontSize: 11.5, color: RS.muted, margin: 0, textAlign: "left" }}>
                Once. Then it is his.
              </p>
            </div>
          )}

          {/* ── The card ──────────────────────────────────────────────────────
           *
           * Offered whether or not she wrote back, because the image is the part
           * of this page that actually travels — a link in a family group gets
           * one tap and a picture gets forwarded. Both actions are disabled while
           * the PNG is being composed; `saving` covers "not ready yet" as well as
           * "currently capturing", which is why it is a single flag. */}
          <div
            style={{
              width: "100%",
              maxWidth: 330,
              display: "flex",
              flexDirection: "column",
              gap: 10,
              marginTop: 6,
            }}
          >
            <motion.button
              type="button"
              onClick={onSaveCard}
              whileTap={{ scale: 0.97 }}
              disabled={saving}
              className="rs-display"
              style={{
                minHeight: 52,
                padding: "14px 24px",
                borderRadius: 999,
                background: RS.surface,
                color: RS.ink,
                border: CARD_BORDER,
                boxShadow: CARD_SHADOW,
                fontSize: 15.5,
                fontWeight: 700,
                cursor: saving ? "default" : "pointer",
                opacity: saving ? 0.6 : 1,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 9,
              }}
            >
              {saving ? <Loader2 size={17} className="animate-spin" /> : <Instagram size={17} />}
              {saving ? "Making the card…" : "Share the card"}
            </motion.button>

            <button
              type="button"
              onClick={onDownload}
              disabled={saving}
              style={{
                minHeight: 46,
                padding: "12px 22px",
                borderRadius: 999,
                background: "transparent",
                border: `1px solid ${RS.hairline}`,
                color: RS.muted,
                fontSize: 13.5,
                cursor: saving ? "default" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
              }}
            >
              <Download size={14} /> Just download the PNG
            </button>
          </div>

          {/* Back is safe even once the reply has landed: it is on the server and
              this screen renders it read-only, so walking back to the photos and
              forward again cannot rewrite it. */}
          <BackLink onClick={onBack} label="Phir se dekho" />

          <p style={{ fontSize: 11.5, color: RS.muted, margin: 0, letterSpacing: 0.6 }}>
            subhsandesh.in
          </p>
        </>
      }
    />
  );
}
