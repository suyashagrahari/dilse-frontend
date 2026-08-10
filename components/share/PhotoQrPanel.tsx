"use client";

// ─── PhotoQrPanel — "make the code look like us" ─────────────────────────────
//
// Pick a photo, and the QR is built out of it — the picture visible across the
// whole symbol, with the SubhSandesh mark on a white plate in the middle. The
// whole render happens on the device: the picture is never uploaded, never sent
// to the server, and is dropped the moment the sheet closes. That is worth
// saying on screen, because
// the natural assumption about "upload a photo" is the opposite, and the people
// using this are choosing pictures of themselves.
//
// ── THE STRENGTHS ARE THE WHOLE CONTROL SURFACE ──────────────────────────────
//
// Three chips, one tap, default already correct. The temptation is a slider —
// but the useful range is narrow and bounded by whether the thing still scans,
// and a slider invites people to the end of the range, which is exactly where
// it stops working. Three verified stops are the honest version of that
// control. See `lib/share/photoQr.ts` for how each one was fixed.
//
// ── WHY THE PREVIEW IS BIG ───────────────────────────────────────────────────
//
// The only question a sender has here is "can I tell it's us?", and that cannot
// be answered from a thumbnail. The preview is the largest thing in the panel.

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, ImagePlus, Loader2, RefreshCw, Share2 } from "lucide-react";

import { EVENTS } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";
import { dataUrlToFile, downloadDataUrl } from "@/lib/share/qrPng";
import { fileToScaledDataUrl, photoQrToPngDataUrl, type PhotoStrength } from "@/lib/share/photoQr";
import { photoCardToPngDataUrl } from "@/lib/share/photoCard";
import { alpha, readableInk, shade } from "./qrTheme";

/**
 * Two ways to send a photo with a link, and they are not variations of each
 * other — they are a real trade.
 *
 * `card` keeps the photograph perfect and the code plain. `code` fuses them,
 * which is the striking one, but a QR dictates the mean brightness of every
 * module it occupies, so a picture inside a symbol can never be more than
 * suggested. Card is the default because "can they see who it is" is the
 * question people are actually asking.
 */
type OutputMode = "card" | "code";

/** Rejected before it is read. A phone burst photo is ~5MB; this is generous. */
const MAX_BYTES = 15 * 1024 * 1024;

/** Same-origin, so it can be drawn into the canvas without tainting it. */
const LOGO_SRC = "/logo.webp";

const MODES: Array<{ key: OutputMode; label: string; hint: string }> = [
  { key: "card", label: "Photo + code", hint: "Picture stays perfect" },
  { key: "code", label: "Code from photo", hint: "One fused square" },
];

/** Preview width. The card is portrait 1080×1500; the code is square. */
const PREVIEW_W = 264;
const CARD_PREVIEW_H = Math.round((PREVIEW_W * 1500) / 1080);

const STRENGTHS: Array<{ key: PhotoStrength; label: string; hint: string }> = [
  { key: "soft", label: "Photo", hint: "Most like your picture" },
  { key: "balanced", label: "Balanced", hint: "Recommended" },
  { key: "sharp", label: "Crisp", hint: "Easiest to scan" },
];

export function PhotoQrPanel({
  url,
  accent,
  stem,
  say,
  title,
  recipientName,
  senderName,
}: {
  url: string;
  accent: string;
  /** Filename stem for the download. */
  stem: string;
  say: (message: string) => void;
  title?: string;
  recipientName?: string;
  senderName?: string;
}) {
  const [photo, setPhoto] = useState<string | null>(null);
  const [mode, setMode] = useState<OutputMode>("card");
  const [strength, setStrength] = useState<PhotoStrength>("balanced");
  const [rendered, setRendered] = useState<string | null>(null);
  const [working, setWorking] = useState(false);

  const fileRef = useRef<HTMLInputElement | null>(null);

  const ink = readableInk(accent);
  const deep = shade(accent, 0.45);
  const previewH = mode === "card" ? CARD_PREVIEW_H : PREVIEW_W;

  // Re-render whenever the photo, the strength or the link changes.
  //
  // The `cancelled` flag matters: switching strength twice quickly starts two
  // renders, and without it the slower one can land last and leave the preview
  // disagreeing with the chip that is lit.
  //
  // Every state write happens inside the async body rather than in the effect
  // itself, so the effect never re-renders synchronously on the way in. The
  // previous result is deliberately left on screen while a new one is being
  // built — with the spinner over it — because blanking to a placeholder on
  // every chip tap makes the three strengths impossible to compare.
  useEffect(() => {
    if (!photo || !url) return;
    let cancelled = false;

    const run = async () => {
      setWorking(true);
      const png =
        mode === "card"
          ? await photoCardToPngDataUrl(url, photo, {
              accent,
              logoSrc: LOGO_SRC,
              recipientName,
              senderName,
              title,
            })
          : await photoQrToPngDataUrl(url, photo, { strength, logoSrc: LOGO_SRC });
      if (cancelled) return;
      setRendered(png);
      setWorking(false);
      if (!png) say("That photo could not be read — try a different one.");
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [photo, url, mode, strength, accent, recipientName, senderName, title, say]);

  const pick = useCallback(() => fileRef.current?.click(), []);

  const onFile = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      // Cleared immediately so choosing the SAME file again still fires change.
      event.target.value = "";
      if (!file) return;

      if (file.size > MAX_BYTES) {
        say("That image is over 15MB — try a smaller one.");
        return;
      }

      setWorking(true);
      const scaled = await fileToScaledDataUrl(file);
      if (!scaled) {
        setWorking(false);
        say("That file is not an image we can read.");
        return;
      }
      track(EVENTS.SHARE, { method: "photo_qr_upload" });
      setPhoto(scaled);
    },
    [say],
  );

  const download = useCallback(() => {
    if (!rendered) return;
    track(EVENTS.SHARE, { method: "photo_qr_download" });
    downloadDataUrl(rendered, `${stem}-${mode === "card" ? "photo-card" : "photo-qr"}.png`);
    say(mode === "card" ? "Photo card saved to your downloads." : "Photo code saved to your downloads.");
  }, [rendered, stem, mode, say]);

  const share = useCallback(async () => {
    if (!rendered) return;
    const file = dataUrlToFile(rendered, `${stem}-${mode === "card" ? "photo-card" : "photo-qr"}.png`);
    const nav = typeof navigator !== "undefined" ? window.navigator : null;

    // Checked before the File is built: iOS Safari advertises `share` but
    // rejects a files payload, and the rejection loses the share silently.
    if (file && nav?.canShare?.({ files: [file] })) {
      try {
        track(EVENTS.SHARE, { method: "photo_qr_share" });
        await nav.share({ files: [file], title: title || "SubhSandesh", text: url });
        return;
      } catch {
        // Dismissed. Saving it is the next most useful thing.
      }
    }
    download();
  }, [rendered, stem, mode, title, url, download]);

  return (
    <div style={{ textAlign: "center" }}>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={onFile}
        style={{ display: "none" }}
        aria-hidden="true"
        tabIndex={-1}
      />

      {!photo ? (
        <button
          type="button"
          onClick={pick}
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            padding: "34px 20px",
            borderRadius: 20,
            cursor: "pointer",
            background: "#FFFFFF",
            border: `2px dashed ${alpha(accent, 0.4)}`,
            color: deep,
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 52,
              height: 52,
              borderRadius: 16,
              background: alpha(accent, 0.12),
              color: accent,
            }}
          >
            <ImagePlus size={24} />
          </span>
          <span style={{ fontSize: 15, fontWeight: 700 }}>Use your own photo</span>
          <span
            style={{
              fontSize: 12.5,
              lineHeight: "18px",
              maxWidth: 250,
              color: alpha(deep, 0.75),
              fontWeight: 400,
            }}
          >
            Your picture becomes the code itself — so they can see it&rsquo;s from you before
            they even scan it.
          </span>

          {/* The whole panel is the button, but a dashed box does not read as
              tappable on its own. This is the affordance; it is a <span> because
              it lives inside that button and a nested <button> is invalid. */}
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              marginTop: 4,
              padding: "9px 18px",
              borderRadius: 999,
              background: accent,
              color: ink,
              fontSize: 13.5,
              fontWeight: 600,
            }}
          >
            <ImagePlus size={15} />
            Choose a photo
          </span>
        </button>
      ) : (
        <>
          {/* The two outputs are a genuine trade, not a style toggle, so they
              sit above the preview and are labelled by what you get. */}
          <div
            role="group"
            aria-label="What to make from your photo"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 6,
              marginBottom: 12,
            }}
          >
            {MODES.map((m) => {
              const active = mode === m.key;
              return (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setMode(m.key)}
                  aria-pressed={active}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 12,
                    cursor: "pointer",
                    textAlign: "center",
                    background: active ? accent : "#FFFFFF",
                    color: active ? ink : alpha(deep, 0.82),
                    border: `1px solid ${active ? accent : alpha(accent, 0.28)}`,
                  }}
                >
                  <span style={{ display: "block", fontSize: 13, fontWeight: 700 }}>
                    {m.label}
                  </span>
                  <span
                    style={{
                      display: "block",
                      fontSize: 10.5,
                      fontWeight: 400,
                      marginTop: 1,
                      opacity: active ? 0.85 : 0.7,
                    }}
                  >
                    {m.hint}
                  </span>
                </button>
              );
            })}
          </div>

          <div
            style={{
              display: "inline-block",
              padding: 12,
              borderRadius: 22,
              background: "#FFFFFF",
              border: `1px solid ${alpha(accent, 0.26)}`,
              boxShadow: `0 10px 26px ${alpha(deep, 0.12)}`,
              position: "relative",
            }}
          >
            {rendered ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={rendered}
                alt={
                  mode === "card"
                    ? "Your photo above a scannable code"
                    : "Your photo rendered as a QR code"
                }
                width={PREVIEW_W}
                height={previewH}
                style={{ display: "block", width: PREVIEW_W, height: previewH, borderRadius: 12 }}
              />
            ) : (
              <div
                style={{
                  width: PREVIEW_W,
                  height: previewH,
                  borderRadius: 12,
                  background: alpha(accent, 0.07),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: alpha(deep, 0.6),
                }}
              >
                <Loader2 size={22} className="ss-spin" />
              </div>
            )}

            {working && rendered ? (
              <span
                style={{
                  position: "absolute",
                  inset: 12,
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.55)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: deep,
                }}
              >
                <Loader2 size={20} className="ss-spin" />
              </span>
            ) : null}
          </div>

          {mode === "code" ? (
          <div
            role="group"
            aria-label="How much the photo shows through"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 6,
              marginTop: 12,
            }}
          >
            {STRENGTHS.map((s) => {
              const active = strength === s.key;
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setStrength(s.key)}
                  aria-pressed={active}
                  title={s.hint}
                  style={{
                    height: 34,
                    borderRadius: 10,
                    cursor: "pointer",
                    fontSize: 12.5,
                    fontWeight: 600,
                    background: active ? accent : "#FFFFFF",
                    color: active ? ink : alpha(deep, 0.8),
                    border: `1px solid ${active ? accent : alpha(accent, 0.28)}`,
                  }}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
          ) : null}

          <button
            type="button"
            onClick={pick}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              marginTop: 10,
              padding: "6px 12px",
              borderRadius: 999,
              cursor: "pointer",
              background: "transparent",
              border: "none",
              color: alpha(deep, 0.8),
              fontSize: 12.5,
              fontWeight: 600,
            }}
          >
            <RefreshCw size={13} />
            Use a different photo
          </button>

          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button
              type="button"
              onClick={share}
              disabled={!rendered}
              style={{
                flex: 1,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
                height: 44,
                borderRadius: 13,
                border: "none",
                cursor: rendered ? "pointer" : "default",
                opacity: rendered ? 1 : 0.6,
                background: accent,
                color: ink,
                fontSize: 13.5,
                fontWeight: 600,
              }}
            >
              <Share2 size={15} />
              Share
            </button>
            <button
              type="button"
              onClick={download}
              disabled={!rendered}
              style={{
                flex: 1,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
                height: 44,
                borderRadius: 13,
                cursor: rendered ? "pointer" : "default",
                opacity: rendered ? 1 : 0.6,
                background: "#FFFFFF",
                border: `1px solid ${alpha(accent, 0.32)}`,
                color: deep,
                fontSize: 13.5,
                fontWeight: 600,
              }}
            >
              <Download size={15} />
              Save PNG
            </button>
          </div>
        </>
      )}

      <p
        style={{
          margin: "10px auto 0",
          maxWidth: 310,
          fontSize: 11.5,
          lineHeight: "16px",
          color: alpha(deep, 0.65),
        }}
      >
        Your photo stays on this device — it is never uploaded, and it is dropped when you close
        this sheet.
      </p>
    </div>
  );
}

export default PhotoQrPanel;
