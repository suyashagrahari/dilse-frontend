"use client";

// ─── PhotoQrPanel — "make the code look like us" ─────────────────────────────
//
// Pick a photo, and the QR is built out of it — dots over the picture, and a
// clear panel in the middle showing the subject untouched, so the person who
// receives it can see who it is from across a room. The whole render happens on
// the device: the picture is never uploaded, never sent to the server, and is
// dropped the moment the sheet closes. That is worth saying on screen, because
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
import { alpha, readableInk, shade } from "./qrTheme";

/** Rejected before it is read. A phone burst photo is ~5MB; this is generous. */
const MAX_BYTES = 15 * 1024 * 1024;

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
}: {
  url: string;
  accent: string;
  /** Filename stem for the download. */
  stem: string;
  say: (message: string) => void;
  title?: string;
}) {
  const [photo, setPhoto] = useState<string | null>(null);
  const [strength, setStrength] = useState<PhotoStrength>("balanced");
  const [rendered, setRendered] = useState<string | null>(null);
  const [working, setWorking] = useState(false);

  const fileRef = useRef<HTMLInputElement | null>(null);

  const ink = readableInk(accent);
  const deep = shade(accent, 0.45);

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
      const png = await photoQrToPngDataUrl(url, photo, { strength });
      if (cancelled) return;
      setRendered(png);
      setWorking(false);
      if (!png) say("That photo could not be read — try a different one.");
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [photo, url, strength, say]);

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
    downloadDataUrl(rendered, `${stem}-photo-qr.png`);
    say("Photo code saved to your downloads.");
  }, [rendered, stem, say]);

  const share = useCallback(async () => {
    if (!rendered) return;
    const file = dataUrlToFile(rendered, `${stem}-photo-qr.png`);
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
  }, [rendered, stem, title, url, download]);

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
            Your picture becomes the code, and shows through the middle — so they can see
            it&rsquo;s you before they even scan it.
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
                alt="Your photo rendered as a QR code"
                width={264}
                height={264}
                style={{ display: "block", width: 264, height: 264, borderRadius: 12 }}
              />
            ) : (
              <div
                style={{
                  width: 264,
                  height: 264,
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
