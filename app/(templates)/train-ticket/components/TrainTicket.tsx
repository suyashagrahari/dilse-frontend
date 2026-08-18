"use client";

// ─── Train Ticket — the template ─────────────────────────────────────────────
// Three screens, one entry point. Screen 1 (the PNR check) is the product; the
// slip and the running status are what you get once it pays off, and in live
// mode they do not exist as destinations until the status resolves to CNF.

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { templateMediaBase } from "@/lib/templateMedia";

/** Animation set for this template — served from S3, never bundled. */
const ASSET = templateMediaBase("train-ticket");
import {
  type ChartGate,
  type Screen,
  type TicketData,
  buildSmsCopy,
} from "./types";
import { DOC_W, MONO, PAPER, Scaler, TicketStyles } from "./Paper";
import PnrStatusScreen from "./PnrStatusScreen";
import ReservationSlip from "./ReservationSlip";
import RunningStatus from "./RunningStatus";
import Loop from "./Loop";

const BG = "#e9e8e4";

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1,
        minHeight: 40,
        padding: "0 6px",
        border: "1px solid #111",
        borderLeftWidth: 0,
        background: active ? "#111" : "#f4f3ef",
        color: active ? "#f4f3ef" : "#111",
        fontFamily: MONO,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.08em",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function DownloadButton({ onClick, busy, children }: { onClick: () => void; busy: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      style={{
        minHeight: 42,
        padding: "0 14px",
        border: "1px solid #111",
        background: busy ? "#ddd" : "#f4f3ef",
        color: "#111",
        fontFamily: MONO,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.08em",
        cursor: busy ? "default" : "pointer",
      }}
    >
      {busy ? "[ SAVING... ]" : children}
    </button>
  );
}

/** The recipient's "create your own" path. Required on every live viewer. */
function BrandBadge() {
  return (
    <Link
      href="/templates"
      style={{
        position: "fixed",
        top: "calc(10px + env(safe-area-inset-top, 0px))",
        right: 10,
        zIndex: 90,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 10px 5px 6px",
        background: "rgba(255,255,255,.92)",
        border: "1px solid #cfccc4",
        textDecoration: "none",
      }}
    >
      <Image src="/logo.webp" alt="SubhSandesh" width={18} height={18} style={{ display: "block" }} />
      <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.06em", color: "#111" }}>SubhSandesh</span>
    </Link>
  );
}

export default function TrainTicket({
  data,
  gate,
  mode,
  onCheck,
}: {
  data: TicketData;
  /** The server's chart verdict. In preview the sender always sees their own data. */
  gate: ChartGate;
  mode: "preview" | "live";
  onCheck?: () => Promise<{ data: TicketData; gate: ChartGate }>;
}) {
  const live = mode === "live";
  const [screen, setScreen] = useState<Screen>("pnr");
  // In preview the sender needs to inspect the slip without sitting through the
  // reveal; in live mode the slip does not exist until the status says CNF.
  const [revealed, setRevealed] = useState(!live);
  const [saving, setSaving] = useState<string | null>(null);
  const [smsOpen, setSmsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hugSeen, setHugSeen] = useState(false);
  const [hugOpen, setHugOpen] = useState(false);

  const slipRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const terminusRef = useRef<HTMLDivElement>(null);

  const pnrSlug = (data.pnr || "ticket").replace(/[^0-9A-Za-z]+/g, "") || "ticket";

  // Full-screen hug, once, only after the recipient actually reaches Terminus.
  //
  // The observer is armed on a delay on purpose: on a tall screen the whole
  // timeline is visible the instant the tab opens, so an eager observer fires
  // over the route before anyone has read a single stop. The hug has to land
  // after "no ETA. no rush.", not on top of it.
  useEffect(() => {
    if (screen !== "route" || hugSeen) return;
    let io: IntersectionObserver | null = null;
    const arm = setTimeout(() => {
      const el = terminusRef.current;
      if (!el) return;
      io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            setHugSeen(true);
            setHugOpen(true);
            io?.disconnect();
          }
        },
        { threshold: 0.9 },
      );
      io.observe(el);
    }, 3200);
    return () => { clearTimeout(arm); io?.disconnect(); };
  }, [screen, hugSeen]);

  useEffect(() => {
    if (!hugOpen) return;
    const id = setTimeout(() => setHugOpen(false), 3600);
    return () => clearTimeout(id);
  }, [hugOpen]);

  /**
   * PNG export.
   *
   * `document.fonts.ready` is not optional: without it html-to-image captures
   * before Courier Prime has loaded and the export silently falls back to a
   * generic sans, which looks nothing like the screen. Explicit width/height are
   * passed because the node lives inside a `transform: scale()` wrapper.
   */
  const download = useCallback(async (node: HTMLDivElement | null, filename: string, key: string) => {
    if (!node) return;
    setSaving(key);
    try {
      if (typeof document !== "undefined" && document.fonts?.ready) await document.fonts.ready;
      const { toPng } = await import("html-to-image");
      const url = await toPng(node, {
        pixelRatio: 3,
        cacheBust: true,
        backgroundColor: PAPER,
        width: DOC_W,
        height: node.offsetHeight,
      });
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
    } catch {
      /* export blocked or unavailable — the screen is still the artefact */
    } finally {
      setSaving(null);
    }
  }, []);

  const sms = buildSmsCopy(data);
  const copySms = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(sms);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      /* clipboard denied — the text is selectable on screen */
    }
  }, [sms]);

  return (
    <div style={{ minHeight: "100dvh", background: BG, fontFamily: MONO }}>
      <TicketStyles />
      {live && <BrandBadge />}

      <div style={{ maxWidth: 460, margin: "0 auto", padding: "66px 10px 72px" }}>
        {/* screen switcher — only once there is something to switch to */}
        {revealed && (
          <div style={{ display: "flex", marginBottom: 14, borderLeft: "1px solid #111" }}>
            <TabButton active={screen === "pnr"} onClick={() => setScreen("pnr")}>PNR</TabButton>
            <TabButton active={screen === "ticket"} onClick={() => setScreen("ticket")}>TICKET</TabButton>
            <TabButton active={screen === "route"} onClick={() => setScreen("route")}>ROUTE</TabButton>
          </div>
        )}

        {/* ── SCREEN 1 ─────────────────────────────────────────────────────── */}
        {screen === "pnr" && (
          <PnrStatusScreen
            data={data}
            gate={gate}
            onCheck={onCheck}
            onViewSlip={() => { setRevealed(true); setScreen("ticket"); }}
          />
        )}

        {/* ── SCREEN 2 ─────────────────────────────────────────────────────── */}
        {screen === "ticket" && (
          <>
            <Scaler>
              <ReservationSlip ref={slipRef} data={data} />
            </Scaler>

            <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
              <DownloadButton busy={saving === "slip"} onClick={() => download(slipRef.current, `ticket-${pnrSlug}.png`, "slip")}>
                [ SAVE TICKET PNG ]
              </DownloadButton>
              <button
                type="button"
                onClick={() => setScreen("route")}
                style={{
                  minHeight: 42, padding: "0 14px", border: "1px solid #111", background: "#f4f3ef",
                  color: "#111", fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", cursor: "pointer",
                }}
              >
                [ RUNNING STATUS → ]
              </button>
            </div>

            {/* ── SMS copy ─────────────────────────────────────────────────
                Forwards into a chat with no image at all, and reads uncannily
                real in a WhatsApp bubble. */}
            <div style={{ marginTop: 16, border: "1px solid #111", background: "#f4f3ef" }}>
              <button
                type="button"
                onClick={() => setSmsOpen((v) => !v)}
                style={{
                  width: "100%", minHeight: 42, padding: "0 10px", display: "flex", alignItems: "center",
                  justifyContent: "space-between", background: "none", border: "none", cursor: "pointer",
                  fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#111",
                }}
              >
                <span>SMS COPY</span>
                <span>{smsOpen ? "[ − ]" : "[ + ]"}</span>
              </button>
              {smsOpen && (
                <div style={{ borderTop: "1px solid #111", padding: 10 }}>
                  <pre
                    style={{
                      margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word",
                      fontFamily: MONO, fontSize: 10.5, lineHeight: 1.55, color: "#111",
                    }}
                  >
                    {sms}
                  </pre>
                  <button
                    type="button"
                    onClick={copySms}
                    style={{
                      marginTop: 10, minHeight: 40, padding: "0 14px", border: "1px solid #111",
                      background: copied ? "#111" : "#fff", color: copied ? "#f4f3ef" : "#111",
                      fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", cursor: "pointer",
                    }}
                  >
                    {copied ? "[ COPIED ]" : "[ COPY ]"}
                  </button>
                </div>
              )}
            </div>

            {/* ── the letter ───────────────────────────────────────────────
                Outside the box, in plain readable type. The drop from
                bureaucratic density to someone just saying it IS the payload,
                so it gets a lot of air above it and no decoration at all. */}
            {data.letter.trim() && (
              <div style={{ marginTop: 56, paddingBottom: 8 }}>
                {data.letter.split("\n").filter((p) => p.trim()).map((p, i) => (
                  <p
                    key={i}
                    style={{
                      fontFamily: "var(--font-tinos), Times, serif",
                      fontSize: 16,
                      lineHeight: 1.65,
                      color: "#23211d",
                      margin: "0 0 14px",
                    }}
                  >
                    {p}
                  </p>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── SCREEN 3 ─────────────────────────────────────────────────────── */}
        {screen === "route" && (
          <>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
              <Loop src={`${ASSET}/bunnyonatrain.webm`} width={140} />
            </div>

            <Scaler>
              <RunningStatus ref={statusRef} data={data} terminusRef={terminusRef} />
            </Scaler>

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
              <Loop src={`${ASSET}/cryingpuddle.webm`} width={76} />
              <p style={{ flex: 1, fontSize: 10.5, lineHeight: 1.5, color: "#444", margin: 0 }}>
                Delay compensation is not admissible. We looked into it.
              </p>
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
              <DownloadButton
                busy={saving === "status"}
                onClick={() => download(statusRef.current, `running-status-${pnrSlug}.png`, "status")}
              >
                [ SAVE STATUS PNG ]
              </DownloadButton>
              <button
                type="button"
                onClick={() => setScreen("ticket")}
                style={{
                  minHeight: 42, padding: "0 14px", border: "1px solid #111", background: "#f4f3ef",
                  color: "#111", fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", cursor: "pointer",
                }}
              >
                [ ← TICKET ]
              </button>
            </div>
          </>
        )}
      </div>

      {/* ── the hug ─────────────────────────────────────────────────────────
          Fires once, and only once the recipient has actually scrolled to
          Terminus — the stop with no ETA. */}
      <AnimatePresence>
        {hugOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setHugOpen(false)}
            style={{
              position: "fixed", inset: 0, zIndex: 200, display: "grid", placeItems: "center",
              background: "rgba(233,232,228,.94)", cursor: "pointer",
            }}
          >
            <div style={{ textAlign: "center", padding: 24 }}>
              <div style={{ border: "1px solid #111", background: "#fff", padding: 6, display: "inline-block" }}>
                <Loop src={`${ASSET}/hug.webm`} width={190} style={{ margin: "0 auto" }} />
              </div>
              <p style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.08em", color: "#111", marginTop: 12 }}>
                NO ETA. NO RUSH.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
