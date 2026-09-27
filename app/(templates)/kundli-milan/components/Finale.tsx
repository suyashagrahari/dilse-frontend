"use client";

// ─── The certificate ─────────────────────────

import { useEffect, useRef, useState } from "react";

import { exportNodeToPng, fileSlug, toDataUrl } from "@/lib/exportPng";
import { CandyButton, GROTESK, ITALIC } from "../../_love/LoveKit";
import type { LoveTheme } from "../../_love/theme";
import { cropStyle, photoCrop } from "../../dedication/components/types";
import { ZodiacRing, initials } from "./CosmicKit";
import type { KundliPhoto } from "./types";

// ─── The certificate ─────────────────────────────────────────────────────────

const CERT_W = 380;
const CERT_H = 520;

export function Certificate({
  aName,
  bName,
  total,
  grade,
  issuedLabel,
  astrologer,
  photo,
  theme,
}: {
  theme: LoveTheme;
  aName: string;
  bName: string;
  total: number;
  grade: string;
  issuedLabel: string;
  astrologer: string;
  photo?: KundliPhoto;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [inlinePhoto, setInlinePhoto] = useState<string | null>(null);
  // Concrete colours, not CSS variables: this node is rasterised to a PNG.
  const c = theme.colors;
  const GOLD = c.a3;
  const MOON = c.ink;
  const MOON_SOFT = c.soft;
  const GRAD = `linear-gradient(115deg, ${c.a1}, ${c.a2}, ${c.a3})`;

  // Fit the fixed-size card to its column; never reflow it.
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const measure = () => setScale(Math.min(1, el.clientWidth / CERT_W));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // A cross-origin <img> would taint the export, so the photo is inlined first.
  useEffect(() => {
    let alive = true;
    if (!photo) return;
    void toDataUrl(photo.url).then((d) => alive && setInlinePhoto(d));
    return () => {
      alive = false;
    };
  }, [photo]);

  const save = async () => {
    setBusy(true);
    setMsg("");
    const res = await exportNodeToPng(cardRef.current, {
      width: CERT_W,
      height: CERT_H,
      filename: `kundli-milan-${fileSlug(`${aName}-${bName}`, "certificate")}`,
      backgroundColor: c.base,
      pixelRatio: 3,
    });
    setBusy(false);
    setMsg(res.message);
  };

  return (
    <div>
      <div ref={boxRef} style={{ width: "100%", maxWidth: CERT_W, margin: "0 auto" }}>
        <div style={{ width: CERT_W * scale, height: CERT_H * scale, margin: "0 auto", position: "relative" }}>
          <div style={{ position: "absolute", left: 0, top: 0, width: CERT_W, height: CERT_H, transform: `scale(${scale})`, transformOrigin: "top left" }}>
            <div
              ref={cardRef}
              style={{
                width: CERT_W,
                height: CERT_H,
                boxSizing: "border-box",
                position: "relative",
                overflow: "hidden",
                borderRadius: 22,
                padding: "30px 26px",
                background: `radial-gradient(70% 45% at 0% 0%, ${c.a1}80, transparent 70%), radial-gradient(70% 45% at 100% 100%, ${c.a2}80, transparent 70%), ${c.base}`,
                color: MOON,
                fontFamily: GROTESK,
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <span style={{ position: "absolute", inset: 10, borderRadius: 16, border: `1.5px solid ${GOLD}`, opacity: 0.7 }} />
              <span style={{ position: "absolute", inset: 15, borderRadius: 12, border: `1px dashed ${GOLD}`, opacity: 0.35 }} />
              <p style={{ margin: 0, fontSize: 10.5, fontWeight: 800, letterSpacing: ".26em", textTransform: "uppercase", color: GOLD }}>certificate of cosmic compatibility</p>

              <div style={{ marginTop: 16, position: "relative", width: 150, height: 150 }}>
                <ZodiacRing size={150} stroke={GOLD} glyphSize={11}>
                  <span style={{ position: "absolute", left: 30, top: 30, width: 90, height: 90, borderRadius: "50%", overflow: "hidden", border: `3px solid ${GOLD}`, background: GRAD }}>
                    {inlinePhoto && photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={inlinePhoto} alt="" style={cropStyle(photoCrop(photo))} />
                    ) : (
                      <span style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontSize: 28, fontWeight: 800, color: "#fff" }}>
                        {initials(aName)[0]}♥{initials(bName)[0]}
                      </span>
                    )}
                  </span>
                </ZodiacRing>
              </div>

              <p style={{ margin: "14px 0 0", fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.05 }}>
                {aName} <span style={{ fontFamily: ITALIC, fontStyle: "italic", fontWeight: 400, color: c.a1 }}>&amp;</span> {bName}
              </p>
              <p style={{ margin: "8px 0 0", fontFamily: ITALIC, fontStyle: "italic", fontSize: 16, color: MOON_SOFT, lineHeight: 1.3 }}>
                are hereby declared officially, cosmically, un-returnably compatible
              </p>

              <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
                <span style={{ background: GRAD, color: "#fff", borderRadius: 14, padding: "8px 14px", fontWeight: 800, fontSize: 22, letterSpacing: "-0.02em" }}>
                  {total}/36
                </span>
                <span style={{ background: c.chip, color: c.chipInk, borderRadius: 14, padding: "8px 12px", fontWeight: 800, fontSize: 12.5, display: "flex", alignItems: "center", maxWidth: 170, lineHeight: 1.15 }}>
                  {grade}
                </span>
              </div>

              <div style={{ marginTop: "auto", width: "100%", display: "flex", justifyContent: "space-between", alignItems: "flex-end", fontSize: 10.5, color: MOON_SOFT }}>
                <span style={{ textAlign: "left" }}>
                  issued
                  <br />
                  <b style={{ color: MOON, fontSize: 12 }}>{issuedLabel}</b>
                </span>
                <span
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    border: `2px solid ${GOLD}`,
                    color: GOLD,
                    display: "grid",
                    placeItems: "center",
                    fontSize: 9,
                    fontWeight: 800,
                    letterSpacing: ".08em",
                    textTransform: "uppercase",
                    transform: "rotate(-12deg)",
                    lineHeight: 1.1,
                  }}
                >
                  stars
                  <br />
                  approved
                  <br />✓
                </span>
                <span style={{ textAlign: "right" }}>
                  signed
                  <br />
                  <b style={{ color: MOON, fontSize: 12, fontFamily: ITALIC, fontStyle: "italic", fontWeight: 400 }}>{astrologer}</b>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <CandyButton onClick={() => void save()} disabled={busy} style={{ width: "auto", minWidth: 240 }}>
          {busy ? "saving…" : "save our certificate ⬇️"}
        </CandyButton>
        <p role="status" aria-live="polite" style={{ margin: 0, minHeight: 16, fontFamily: GROTESK, fontSize: 12.5, color: "var(--lv-soft)" }}>
          {msg}
        </p>
      </div>
    </div>
  );
}
