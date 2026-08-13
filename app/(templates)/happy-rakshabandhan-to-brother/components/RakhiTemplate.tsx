"use client";

import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { API_URL } from "@/lib/config";
import { PAPER_GRADIENT } from "./theme";
import type { RakhiData } from "./types";
import CoverScreen from "./CoverScreen";
import RitualScreen from "./RitualScreen";
import GiftScreen from "./GiftScreen";
import PromiseScreen from "./PromiseScreen";
import MemoriesScreen from "./MemoriesScreen";
import { useStoryCard } from "./StoryCard";
import "./rakhi.css";

// ─── The recipient experience ────────────────────────────────────────────────
//
//   cover → ritual (tilak, mithai, aarti, bandhan) → gift → promise → memories
//
// The order is load-bearing. The ritual is complete before the gift screen is
// reachable, and the gift screen is the only place `shagun` is read at all — so
// there is no arrangement of state in which asking for money comes before, or
// interrupts, the thing she actually made this for.
//
// `mode` tells the two screens with side effects whether they are real:
//   "share"   — her brother, on the published link. The vachan POSTs.
//   "preview" — her, in the builder. The vachan is held in memory only, so
//               testing the page cannot burn the write-once promise slot.

export type RakhiMode = "share" | "preview";

type Screen = "cover" | "ritual" | "gift" | "promise" | "memories";

export default function RakhiTemplate({
  data,
  mode = "share",
  shareId,
}: {
  data: RakhiData;
  mode?: RakhiMode;
  shareId?: string;
}) {
  const [screen, setScreen] = useState<Screen>("cover");
  const [vachan, setVachan] = useState(data.vachan);
  const [note, setNote] = useState<string | null>(null);

  // Everything the card renders, including the promise he just typed.
  const card = useStoryCard({ ...data, vachan });

  const submitVachan = useCallback(
    async (text: string): Promise<string | null> => {
      setVachan(text);

      // In the builder there is nothing to write to, and writing would consume
      // the one promise her brother is entitled to make.
      if (mode === "preview" || !shareId) return text;

      try {
        const res = await fetch(`${API_URL}/raksha-bandhan-pages/share/${shareId}/vachan`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vachan: text }),
        });
        const json = await res.json();
        if (!res.ok || !json?.success) return null;
        const stored = String(json.data?.vachan || text);
        setVachan(stored);
        return stored;
      } catch {
        return null;
      }
    },
    [mode, shareId]
  );

  const flash = useCallback((msg: string) => {
    if (!msg) return;
    setNote(msg);
    setTimeout(() => setNote(null), 4000);
  }, []);

  /** Native share sheet — Instagram is in it on a phone. Falls back to download. */
  const saveCard = useCallback(async () => {
    flash((await card.share()).message);
  }, [card, flash]);

  /** Straight download, for anyone who does not want the OS sheet. */
  const downloadCard = useCallback(async () => {
    flash((await card.download()).message);
  }, [card, flash]);

  return (
    <div style={{ background: PAPER_GRADIENT, minHeight: "100dvh" }}>
      {/* Letterboxed to a phone column on desktop — see .rb-stage. */}
      <div className="rb-stage">
        <AnimatePresence mode="wait">
          <motion.div
            key={screen}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
          >
            {screen === "cover" && (
              <CoverScreen data={data} onBegin={() => setScreen("ritual")} />
            )}
            {screen === "ritual" && (
              <RitualScreen data={data} onComplete={() => setScreen("gift")} />
            )}
            {screen === "gift" && (
              <GiftScreen data={data} onContinue={() => setScreen("promise")} />
            )}
            {screen === "promise" && (
              <PromiseScreen
                data={{ ...data, vachan }}
                onSubmit={submitVachan}
                onContinue={() => setScreen("memories")}
              />
            )}
            {screen === "memories" && (
              <MemoriesScreen
                data={{ ...data, vachan }}
                onSaveCard={saveCard}
                onDownload={downloadCard}
                saving={card.busy || !card.ready}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Off-screen 1080×1920 node the PNG is captured from. */}
      {card.element}

      <AnimatePresence>
        {note && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            role="status"
            style={{
              position: "fixed",
              left: "50%",
              transform: "translateX(-50%)",
              bottom: 26,
              zIndex: 200,
              padding: "11px 18px",
              borderRadius: 999,
              background: "rgba(61,35,23,0.94)",
              color: "#fdf8ee",
              fontSize: 13.5,
              maxWidth: "88vw",
              textAlign: "center",
            }}
          >
            {note}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
