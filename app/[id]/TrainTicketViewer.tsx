"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

import TrainTicket from "@/app/(templates)/train-ticket/components/TrainTicket";
import {
  dbToChartGate,
  dbToTrainTicketData,
} from "@/app/(templates)/train-ticket/components/types";
import { API_URL, IS_NGROK } from "@/lib/config";

const MONO = "var(--font-courier-prime), 'Courier New', monospace";
const BASE = `${API_URL}/train-ticket-pages`;

const jsonHeaders = () => ({
  "Content-Type": "application/json",
  ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}),
});

/**
 * Password gate, kept in the same ugly-official register as the rest of the
 * template — a rounded pastel card here would give the game away before the
 * recipient has even seen the PNR box.
 */
function TicketPasswordGate({ shareId, onUnlocked }: { shareId: string; onUnlocked: () => void }) {
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = useCallback(async () => {
    if (!pw.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${BASE}/share/${shareId}/verify`, {
        method: "POST",
        headers: jsonHeaders(),
        body: JSON.stringify({ password: pw }),
      });
      const result = await res.json();
      if (result.success && result.verified) {
        sessionStorage.setItem(`train-ticket_unlocked_${shareId}`, "true");
        onUnlocked();
      } else {
        setError("AUTHENTICATION FAILED. TRY AGAIN.");
        setPw("");
      }
    } catch {
      setError("SERVICE UNAVAILABLE. TRY AGAIN.");
    } finally {
      setLoading(false);
    }
  }, [pw, shareId, onUnlocked]);

  return (
    <div style={{ minHeight: "100dvh", background: "#e9e8e4", display: "grid", placeItems: "center", padding: 16, fontFamily: MONO }}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        style={{ width: "100%", maxWidth: 380, border: "1px solid #111", background: "#fff" }}
      >
        <div style={{ background: "#dcdcdc", borderBottom: "1px solid #111", padding: "6px 10px", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", color: "#111" }}>
          RESTRICTED ENQUIRY
        </div>
        <div style={{ padding: 14 }}>
          <p style={{ fontSize: 11, color: "#333", margin: "0 0 10px", lineHeight: 1.5 }}>
            This PNR enquiry is protected. Enter the passphrase to continue.
          </p>
          <input
            type="password"
            value={pw}
            autoFocus
            onChange={(ev) => { setPw(ev.target.value); setError(""); }}
            onKeyDown={(ev) => { if (ev.key === "Enter") handleVerify(); }}
            placeholder="Passphrase"
            style={{
              width: "100%", minHeight: 44, border: "1px solid #111", background: "#fff",
              padding: "0 10px", fontFamily: MONO, fontSize: 14, letterSpacing: "0.12em", color: "#111",
            }}
          />
          {error && <p style={{ fontSize: 10.5, color: "#8a1c1c", margin: "8px 0 0", letterSpacing: "0.06em" }}>{error}</p>}
          <button
            type="button"
            onClick={handleVerify}
            disabled={loading || !pw.trim()}
            style={{
              marginTop: 12, width: "100%", minHeight: 44, border: "1px solid #111",
              background: loading ? "#ddd" : "#f0f0f0", fontFamily: MONO, fontSize: 13, fontWeight: 700,
              letterSpacing: "0.1em", color: "#111", cursor: loading ? "default" : "pointer", opacity: pw.trim() ? 1 : 0.55,
            }}
          >
            {loading ? <Loader2 size={14} className="animate-spin" style={{ display: "inline", verticalAlign: "-2px" }} /> : "[ SUBMIT ]"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Train Ticket Viewer (published page)
───────────────────────────────────────── */
export default function TrainTicketViewer({
  rawData,
  hasPassword,
  shareId,
}: {
  rawData: Record<string, unknown>;
  hasPassword: boolean;
  shareId: string;
}) {
  const [unlocked, setUnlocked] = useState(() => {
    if (typeof window === "undefined") return !hasPassword;
    if (!hasPassword) return true;
    return sessionStorage.getItem(`train-ticket_unlocked_${shareId}`) === "true";
  });

  /**
   * Every GET STATUS press is a real poll of the shared endpoint.
   *
   * This is what makes the chart gate hold: before `chartPreparedAt` the server
   * sends an empty passenger array and an empty letter, so the names and seat
   * numbers are not merely hidden in the UI — they have never been transmitted
   * to this browser at all. Pressing CHECK AGAIN after the chart time simply
   * receives a fuller payload.
   */
  const onCheck = useCallback(async () => {
    const res = await fetch(`${BASE}/share/${shareId}`, { headers: jsonHeaders(), cache: "no-store" });
    const result = await res.json();
    const src = (result?.data ?? {}) as Record<string, unknown>;
    return { data: dbToTrainTicketData(src), gate: dbToChartGate(src) };
  }, [shareId]);

  if (hasPassword && !unlocked) {
    return <TicketPasswordGate shareId={shareId} onUnlocked={() => setUnlocked(true)} />;
  }

  return (
    <TrainTicket
      data={dbToTrainTicketData(rawData)}
      gate={dbToChartGate(rawData)}
      mode="live"
      onCheck={onCheck}
    />
  );
}
