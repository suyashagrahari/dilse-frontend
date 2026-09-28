"use client";

// ─── The coupon ──────────────────────────────────────────────────────────────
//
// Printed paper, not a dialog. Pre-printed labels are set in Tinos, everything
// typed by the machine is Courier — the serif/typewriter split is what makes a
// fake document read as a real one.
//
// Nothing animated may live inside `paperRef`: paper cannot play a video, and
// html-to-image serialises a <video> as a blank box. The reading loop sits above
// the paper, outside the captured node.

import { templateMedia } from "@/lib/templateMedia";
import { COUPON_W, C, MONO, OSWALD, SERIF } from "./machine";
import { MACHINE_SERIAL, couponSerial, type Slot } from "./types";

const SCROLL_AT = 300;

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 3 }}>
      <span
        style={{
          fontFamily: SERIF,
          fontSize: 9.5,
          letterSpacing: "0.1em",
          color: "#4a463c",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
      <span
        aria-hidden="true"
        style={{ flex: 1, borderBottom: "1px dotted #a9a294", transform: "translateY(-2px)" }}
      />
      <span style={{ fontFamily: MONO, fontSize: 10, color: C.paperInk, whiteSpace: "nowrap" }}>
        {value}
      </span>
    </div>
  );
}

interface CouponProps {
  slot: Slot;
  machineName: string;
  issued: string;
  redeemed: boolean;
  onRedeem: () => void;
  onDownload: () => void;
  onClose: () => void;
  /** The node handed to exportNodeToPng. Paper only. */
  paperRef: React.RefObject<HTMLDivElement | null>;
  /** Scroll clamps are lifted while capturing so the PNG is never cropped. */
  exporting: boolean;
  reducedMotion: boolean;
  saving: boolean;
}

export default function Coupon({
  slot,
  machineName,
  issued,
  redeemed,
  onRedeem,
  onDownload,
  onClose,
  paperRef,
  exporting,
  reducedMotion,
  saving,
}: CouponProps) {
  const long = slot.payload.length > SCROLL_AT;

  return (
    <section aria-label={`Coupon ${slot.code}`} style={{ paddingTop: 4 }}>
      {!reducedMotion && (
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 2 }}>
          <video
            src={templateMedia("vending-machine", "coupon-reading.webm")}
            autoPlay
            loop
            muted
            playsInline
            aria-hidden="true"
            style={{ width: 96, height: 96, objectFit: "cover", borderRadius: 20, boxShadow: "0 10px 24px -12px rgba(0,0,0,.5)" }}
          />
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "center" }}>
        <div
          ref={paperRef}
          style={{
            position: "relative",
            width: COUPON_W,
            background: C.paper,
            border: "1px solid #3a372f",
            padding: "14px 16px 16px 22px",
            boxShadow: "0 6px 18px rgba(0,0,0,.35)",
          }}
        >
          {/* perforated left edge */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 7,
              width: 6,
              backgroundImage:
                "repeating-radial-gradient(circle at 3px 5px, #3a372f 0 1.3px, rgba(0,0,0,0) 1.4px 5px)",
              backgroundSize: "6px 10px",
              opacity: 0.55,
            }}
          />

          <header
            style={{
              borderBottom: "1px solid #cdc6b3",
              paddingBottom: 7,
              marginBottom: 9,
            }}
          >
            <div
              style={{
                fontFamily: OSWALD,
                fontSize: 10,
                letterSpacing: "0.3em",
                color: "#5b564a",
                textTransform: "uppercase",
              }}
            >
              {machineName}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginTop: 3,
              }}
            >
              <span
                style={{
                  fontFamily: OSWALD,
                  fontSize: 21,
                  letterSpacing: "0.06em",
                  color: C.paperInk,
                }}
              >
                {slot.code}
              </span>
              <span
                style={{
                  fontFamily: SERIF,
                  fontSize: 10,
                  letterSpacing: "0.14em",
                  color: "#5b564a",
                  textTransform: "uppercase",
                }}
              >
                {slot.kind}
              </span>
            </div>
          </header>

          <div
            style={{
              fontFamily: OSWALD,
              fontSize: 9,
              letterSpacing: "0.16em",
              color: "#6a6456",
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            {slot.label}
          </div>

          <div
            className="vm-coupon-body"
            style={{
              fontFamily: SERIF,
              fontSize: 14,
              lineHeight: 1.62,
              color: C.paperInk,
              maxHeight: long && !exporting ? 208 : undefined,
              overflowY: long && !exporting ? "auto" : "visible",
              paddingRight: long && !exporting ? 6 : 0,
            }}
          >
            {slot.payload}
          </div>

          <div style={{ borderTop: "1px solid #cdc6b3", marginTop: 11, paddingTop: 7 }}>
            <Row label="Serial" value={couponSerial(MACHINE_SERIAL, slot.code)} />
            <Row label="Issued" value={issued} />
            <Row label="Expiry" value="NONE" />
            <Row label="Transferable" value="NO" />
          </div>

          <div
            style={{
              marginTop: 9,
              fontFamily: SERIF,
              fontSize: 8,
              letterSpacing: "0.08em",
              color: "#8a8375",
              textTransform: "uppercase",
            }}
          >
            Issued by the Registrar of Hearts · not legal tender
          </div>

          {redeemed && (
            <div
              aria-label="Redeemed"
              className={exporting ? undefined : "vm-stamp-in"}
              style={{
                position: "absolute",
                right: 14,
                bottom: 30,
                transform: "rotate(-6deg)",
                padding: "3px 10px 4px",
                border: `2px solid rgba(192,57,43,.55)`,
                borderRadius: 2,
                color: "rgba(192,57,43,.78)",
                fontFamily: OSWALD,
                fontSize: 19,
                fontWeight: 700,
                letterSpacing: "0.2em",
                // uneven ink, without a mask html-to-image would drop
                backgroundImage:
                  "repeating-linear-gradient(74deg, rgba(250,247,238,.42) 0 2px, rgba(250,247,238,0) 2px 5px), repeating-linear-gradient(8deg, rgba(250,247,238,.3) 0 1px, rgba(250,247,238,0) 1px 4px)",
                boxShadow: "inset 0 0 0 1px rgba(192,57,43,.18)",
                pointerEvents: "none",
              }}
            >
              REDEEMED
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: 8,
          marginTop: 12,
        }}
      >
        <button
          type="button"
          onClick={onRedeem}
          disabled={redeemed}
          style={{
            height: 44,
            padding: "0 14px",
            fontFamily: OSWALD,
            fontSize: 12,
            letterSpacing: "0.12em",
            color: redeemed ? "var(--lv-faint)" : "#fff",
            background: redeemed ? "transparent" : "linear-gradient(115deg, var(--lv-a1), var(--lv-a2))",
            border: redeemed ? "1px solid var(--lv-edge)" : "none",
            borderRadius: 999,
            cursor: redeemed ? "default" : "pointer",
            touchAction: "manipulation",
          }}
        >
          {redeemed ? "REDEEMED" : "STAMP REDEEMED"}
        </button>
        <button
          type="button"
          onClick={onDownload}
          disabled={saving}
          style={{
            height: 44,
            padding: "0 14px",
            fontFamily: OSWALD,
            fontSize: 12,
            letterSpacing: "0.12em",
            color: "var(--lv-ink)",
            background: "var(--lv-glass)",
            border: "1px solid var(--lv-edge)",
            borderRadius: 999,
            touchAction: "manipulation",
          }}
        >
          {saving ? "SAVING…" : "SAVE PNG"}
        </button>
        <button
          type="button"
          onClick={onClose}
          style={{
            height: 44,
            padding: "0 14px",
            fontFamily: OSWALD,
            fontSize: 12,
            letterSpacing: "0.12em",
            color: "var(--lv-soft)",
            border: "1px solid var(--lv-edge)",
            borderRadius: 999,
            touchAction: "manipulation",
          }}
        >
          PUT BACK
        </button>
      </div>
    </section>
  );
}
