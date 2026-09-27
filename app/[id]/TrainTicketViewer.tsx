"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

import TrainTicket from "@/app/(templates)/train-ticket/components/TrainTicket";
import {
  dbToChartGate,
  dbToTrainTicketData,
} from "@/app/(templates)/train-ticket/components/types";
import { TRAIN_THEMES } from "@/app/(templates)/train-ticket/components/themes";
import { pickTheme } from "@/app/(templates)/_love/theme";
import { DATE_FONT_VARS } from "@/app/(templates)/date-invitation/components/fonts";
import { API_URL, IS_NGROK } from "@/lib/config";

const GROTESK = "var(--font-di-grotesk), 'Bricolage Grotesque', system-ui, sans-serif";
const BASE = `${API_URL}/train-ticket-pages`;

const jsonHeaders = () => ({
  "Content-Type": "application/json",
  ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}),
});

/** Password gate, dressed in the theme the sender picked. */
function TicketPasswordGate({ shareId, themeId, onUnlocked }: { shareId: string; themeId: unknown; onUnlocked: () => void }) {
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const theme = pickTheme(TRAIN_THEMES, typeof themeId === "string" ? themeId : "");
  const c = theme.colors;

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
        setError("Wrong passphrase — try again 🙈");
        setPw("");
      }
    } catch {
      setError("Couldn't reach the station. Try again.");
    } finally {
      setLoading(false);
    }
  }, [pw, shareId, onUnlocked]);

  return (
    <div
      className={DATE_FONT_VARS}
      style={{ minHeight: "100dvh", background: c.bg, display: "grid", placeItems: "center", padding: 16, fontFamily: GROTESK, color: c.ink }}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        style={{ width: "100%", maxWidth: 380, borderRadius: 26, padding: "26px 20px 22px", background: c.glass, border: `1px solid ${c.edge}`, backdropFilter: "blur(14px)", textAlign: "center" }}
      >
        <div style={{ fontSize: 44 }} aria-hidden>🎫</div>
        <h1 style={{ margin: "8px 0 0", fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em" }}>Reserved ticket</h1>
        <p style={{ margin: "6px 0 16px", fontSize: 14, color: c.soft }}>This PNR is locked. Enter the passphrase to board.</p>
        <input
          type="password"
          value={pw}
          autoFocus
          aria-label="Passphrase"
          onChange={(ev) => { setPw(ev.target.value); setError(""); }}
          onKeyDown={(ev) => { if (ev.key === "Enter") handleVerify(); }}
          placeholder="Passphrase"
          style={{ width: "100%", minHeight: 50, borderRadius: 16, border: `1.5px solid ${c.edge}`, background: "rgba(255,255,255,.9)", padding: "0 14px", fontSize: 16, color: "#1a1a1a", textAlign: "center" }}
        />
        {error && <p style={{ fontSize: 13, color: c.a1, margin: "8px 0 0", fontWeight: 700 }}>{error}</p>}
        <button
          type="button"
          onClick={handleVerify}
          disabled={loading || !pw.trim()}
          style={{
            marginTop: 14, width: "100%", minHeight: 52, borderRadius: 999, border: "none",
            background: `linear-gradient(115deg, ${c.a1}, ${c.a2}, ${c.a3})`, color: "#fff", fontFamily: GROTESK,
            fontSize: 16, fontWeight: 800, cursor: loading ? "default" : "pointer", opacity: pw.trim() ? 1 : 0.6,
          }}
        >
          {loading ? <Loader2 size={16} className="animate-spin" style={{ display: "inline", verticalAlign: "-3px" }} /> : "board the train 🚆"}
        </button>
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
    return <TicketPasswordGate shareId={shareId} themeId={rawData.theme} onUnlocked={() => setUnlocked(true)} />;
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
