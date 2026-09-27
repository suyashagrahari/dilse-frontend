"use client";

// ─── The boarding pass ───────────────────────────────────────────────────────
//
// The hero of the ticket stage: a two-part pass (the ticket + a tear-off stub)
// with punched notches, stacked on a phone and side by side from 760px. It
// paints with CONCRETE theme colours rather than CSS variables because the same
// node is rasterised to a PNG, and every date is printed only after hydration
// (the server's ICU and the phone's disagree on month abbreviations).

import { useCallback, useRef, useState } from "react";

import { CandyButton, GROTESK, ITALIC } from "../../_love/LoveKit";
import type { LoveTheme } from "../../_love/theme";
import { useCountdown, useMounted } from "../hooks/useTicketClock";
import { Barcode, PnrGlyphs } from "./marks";
import { MONO } from "./StatusCheck";
import { type TicketData, fmtDate, fmtTime, seatAllotmentLine } from "./types";

const PASS_CSS = `
.tt-pass { display: flex; flex-direction: column; width: 100%; max-width: 760px; margin: 0 auto; filter: drop-shadow(0 30px 40px rgba(0,0,0,.32)); }
.tt-pass-main { position: relative; padding: 20px 18px 22px; border-radius: 26px 26px 0 0;
  -webkit-mask: radial-gradient(circle 16px at 0 100%, #0000 98%, #000) left / 51% 100% no-repeat, radial-gradient(circle 16px at 100% 100%, #0000 98%, #000) right / 51% 100% no-repeat;
          mask: radial-gradient(circle 16px at 0 100%, #0000 98%, #000) left / 51% 100% no-repeat, radial-gradient(circle 16px at 100% 100%, #0000 98%, #000) right / 51% 100% no-repeat; }
.tt-pass-stub { position: relative; padding: 20px 18px; border-radius: 0 0 26px 26px; border-top: 2px dashed rgba(255,255,255,.55);
  -webkit-mask: radial-gradient(circle 16px at 0 0, #0000 98%, #000) left / 51% 100% no-repeat, radial-gradient(circle 16px at 100% 0, #0000 98%, #000) right / 51% 100% no-repeat;
          mask: radial-gradient(circle 16px at 0 0, #0000 98%, #000) left / 51% 100% no-repeat, radial-gradient(circle 16px at 100% 0, #0000 98%, #000) right / 51% 100% no-repeat; }
.tt-codes { display: grid; grid-template-columns: minmax(0,1fr) auto minmax(0,1fr); align-items: center; gap: 10px; }
@media (min-width: 760px) {
  .tt-pass { flex-direction: row; }
  .tt-pass-main { flex: 1 1 0; min-width: 0; padding: 24px 26px; border-radius: 26px 0 0 26px;
    -webkit-mask: radial-gradient(circle 16px at 100% 0, #0000 98%, #000) top / 100% 51% no-repeat, radial-gradient(circle 16px at 100% 100%, #0000 98%, #000) bottom / 100% 51% no-repeat;
            mask: radial-gradient(circle 16px at 100% 0, #0000 98%, #000) top / 100% 51% no-repeat, radial-gradient(circle 16px at 100% 100%, #0000 98%, #000) bottom / 100% 51% no-repeat; }
  .tt-pass-stub { flex: 0 0 250px; border-radius: 0 26px 26px 0; border-top: none; border-left: 2px dashed rgba(255,255,255,.55);
    -webkit-mask: radial-gradient(circle 16px at 0 0, #0000 98%, #000) top / 100% 51% no-repeat, radial-gradient(circle 16px at 0 100%, #0000 98%, #000) bottom / 100% 51% no-repeat;
            mask: radial-gradient(circle 16px at 0 0, #0000 98%, #000) top / 100% 51% no-repeat, radial-gradient(circle 16px at 0 100%, #0000 98%, #000) bottom / 100% 51% no-repeat; }
}
`;

export default function BoardingPass({ data, theme, gif }: { data: TicketData; theme: LoveTheme; gif?: string }) {
  const c = theme.colors;
  const mounted = useMounted();
  const countdown = useCountdown(data.departureAt);
  const passRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const seats = data.passengers;
  const seatLine = seatAllotmentLine(seats);
  const coach = Array.from(new Set(seats.map((p) => p.coach).filter(Boolean))).join("/") || "—";
  const seatNos = seats.map((p) => p.seat).filter(Boolean).join(" & ") || "—";
  const grad = `linear-gradient(135deg, ${c.a1} 0%, ${c.a2} 55%, ${c.a3} 100%)`;

  /** PNG export — waits for fonts, captures the pass only (not the GIF sticker). */
  const save = useCallback(async () => {
    const node = passRef.current;
    if (!node) return;
    setSaving(true);
    setMsg("");
    try {
      if (document.fonts?.ready) await document.fonts.ready;
      const { toPng } = await import("html-to-image");
      const url = await toPng(node, { pixelRatio: 3, cacheBust: true, width: node.offsetWidth, height: node.offsetHeight });
      const a = document.createElement("a");
      a.href = url;
      a.download = `ticket-${(data.pnr || "ticket").replace(/[^0-9A-Za-z]+/g, "") || "ticket"}.png`;
      a.click();
      setMsg("Saved to your downloads 🎫");
    } catch {
      setMsg("Couldn't save here — take a screenshot instead 📸");
    } finally {
      setSaving(false);
    }
  }, [data.pnr]);

  return (
    <div style={{ position: "relative" }}>
      <style>{PASS_CSS}</style>
      <div ref={passRef} className="tt-pass" style={{ fontFamily: GROTESK }}>
        {/* ── the ticket ─────────────────────────────────────────────────── */}
        <div className="tt-pass-main" style={{ background: c.paper, color: c.paperInk }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".2em", textTransform: "uppercase", color: c.a1 }}>🚆 IHRCTC · e-ticket</span>
            <span style={{ display: "inline-flex", gap: 6 }}>
              {[data.classCode, data.quota].filter(Boolean).map((t) => (
                <span key={t} style={{ padding: "3px 9px", borderRadius: 999, background: `${c.a1}18`, color: c.a1, fontSize: 11, fontWeight: 800, letterSpacing: ".08em" }}>
                  {t}
                </span>
              ))}
            </span>
          </div>
          <p style={{ margin: "6px 0 0", fontSize: 13, fontWeight: 700, color: c.paperSoft }}>
            {data.trainNo} · {data.trainName}
          </p>

          <div className="tt-codes" style={{ marginTop: 14 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: "clamp(40px, 12vw, 60px)", fontWeight: 800, lineHeight: 0.9, letterSpacing: "-0.04em" }}>{data.from.code}</div>
              <div style={{ marginTop: 4, fontSize: 13, fontWeight: 600, color: c.paperSoft, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{data.from.name}</div>
            </div>
            <div aria-hidden style={{ display: "grid", placeItems: "center", gap: 2 }}>
              <span style={{ fontSize: 26 }}>🚆</span>
              <span style={{ width: 56, height: 3, borderRadius: 3, background: grad }} />
              <span style={{ fontSize: 13 }}>💞</span>
            </div>
            <div style={{ minWidth: 0, textAlign: "right" }}>
              <div style={{ fontSize: "clamp(40px, 12vw, 60px)", fontWeight: 800, lineHeight: 0.9, letterSpacing: "-0.04em" }}>{data.to.code}</div>
              <div style={{ marginTop: 4, fontSize: 13, fontWeight: 600, color: c.paperSoft, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{data.to.name}</div>
            </div>
          </div>

          <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 8 }}>
            <Cell label="departs" value={mounted ? fmtTime(data.departureAt) : "--:--"} sub={mounted ? fmtDate(data.departureAt) : ""} c={c} />
            <Cell label="arrives" value={mounted ? fmtTime(data.arrivalAt) : "--:--"} sub={mounted ? fmtDate(data.arrivalAt) : ""} c={c} />
            <Cell label="pnr" value={<PnrGlyphs pnr={data.pnr} />} mono c={c} />
          </div>

          {seats.length > 0 && (
            <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 6 }}>
              {seats.map((p, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 14, background: `${c.paperInk}0d` }}>
                  <span style={{ width: 30, height: 30, borderRadius: "50%", display: "grid", placeItems: "center", background: grad, color: "#fff", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
                    {(p.name.trim()[0] || "♥").toUpperCase()}
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <b style={{ display: "block", fontSize: 15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name || "Passenger"}</b>
                    <span style={{ fontSize: 11.5, color: c.paperSoft }}>
                      {[p.age ? `${p.age}` : "", p.gender, p.berth].filter(Boolean).join(" · ")}
                    </span>
                  </span>
                  <span style={{ textAlign: "right", flexShrink: 0 }}>
                    <span style={{ display: "block", fontFamily: MONO, fontWeight: 700, fontSize: 13 }}>
                      {p.coach} {p.seat}
                    </span>
                    <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: ".06em" }}>
                      <s style={{ color: c.paperSoft }}>{p.bookingStatus}</s> → <span style={{ color: c.a1 }}>{p.currentStatus || "CNF"}</span>
                    </span>
                  </span>
                </div>
              ))}
            </div>
          )}
          {seatLine && <p style={{ margin: "10px 0 0", fontFamily: MONO, fontWeight: 700, fontSize: 11.5, letterSpacing: ".05em", color: c.paperSoft }}>{seatLine}</p>}
        </div>

        {/* ── the stub ───────────────────────────────────────────────────── */}
        <div className="tt-pass-stub" style={{ background: grad, color: "#fff", display: "flex", flexDirection: "column", gap: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".22em", textTransform: "uppercase", opacity: 0.85 }}>boarding pass · admit two</span>
          <div style={{ display: "flex", gap: 16, alignItems: "flex-end" }}>
            <span>
              <span style={{ display: "block", fontSize: 10.5, fontWeight: 800, letterSpacing: ".16em", opacity: 0.8 }}>COACH</span>
              <b style={{ fontSize: 30, lineHeight: 1, letterSpacing: "-0.02em" }}>{coach}</b>
            </span>
            <span style={{ minWidth: 0 }}>
              <span style={{ display: "block", fontSize: 10.5, fontWeight: 800, letterSpacing: ".16em", opacity: 0.8 }}>SEATS</span>
              <b style={{ fontSize: 30, lineHeight: 1, letterSpacing: "-0.02em" }}>{seatNos}</b>
            </span>
          </div>
          <div style={{ padding: "10px 12px", borderRadius: 16, background: "rgba(0,0,0,.18)" }}>
            <span style={{ display: "block", fontSize: 10.5, fontWeight: 800, letterSpacing: ".16em", opacity: 0.85 }}>{countdown.elapsed ? "STATUS" : "DEPARTS IN"}</span>
            <b style={{ fontFamily: MONO, fontSize: 19, letterSpacing: ".04em" }}>{!countdown.ready ? "--d --h --m --s" : countdown.elapsed ? "DEPARTED 💨" : countdown.text}</b>
          </div>
          <div style={{ marginTop: "auto", padding: "8px 10px 6px", borderRadius: 12, background: "#fff", color: "#111", overflow: "hidden" }}>
            <Barcode seed={data.pnr} height={34} />
            <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".3em", marginTop: 3, textAlign: "center" }}>{data.pnr.replace(/\s/g, "")}</div>
          </div>
          <span style={{ fontFamily: ITALIC, fontStyle: "italic", fontSize: 17, lineHeight: 1.2 }}>window seat reserved for you ✨</span>
        </div>
      </div>

      {gif && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={gif}
          alt=""
          className="lv-float"
          style={{ position: "absolute", right: -6, top: -34, width: 88, height: 88, objectFit: "contain", borderRadius: 20, background: "#fff", border: "4px solid #fff", boxShadow: "0 16px 30px -14px rgba(0,0,0,.6)", transform: "rotate(9deg)", zIndex: 2 }}
        />
      )}

      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <CandyButton onClick={() => void save()} disabled={saving} style={{ width: "auto", minWidth: 230 }}>
          {saving ? "printing…" : "save my ticket ⬇️"}
        </CandyButton>
        <p role="status" aria-live="polite" style={{ margin: 0, minHeight: 16, fontSize: 12.5, color: "var(--lv-soft)" }}>
          {msg}
        </p>
      </div>
    </div>
  );
}

function Cell({ label, value, sub, mono, c }: { label: string; value: React.ReactNode; sub?: string; mono?: boolean; c: LoveTheme["colors"] }) {
  return (
    <div style={{ minWidth: 0, padding: "8px 10px", borderRadius: 14, border: `1px dashed ${c.paperInk}33` }}>
      <span style={{ display: "block", fontSize: 10, fontWeight: 800, letterSpacing: ".16em", textTransform: "uppercase", color: c.paperSoft }}>{label}</span>
      <b style={{ display: "block", fontFamily: mono ? MONO : undefined, fontSize: mono ? 13 : 20, letterSpacing: mono ? ".08em" : "-0.02em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{value}</b>
      {sub && <span style={{ display: "block", fontSize: 11, color: c.paperSoft, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sub}</span>}
    </div>
  );
}
