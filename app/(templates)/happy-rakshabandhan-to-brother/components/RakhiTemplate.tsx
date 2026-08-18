"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
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

/** The origin never changes without a navigation, so there is nothing to watch. */
const NO_SUBSCRIBE = () => () => {};

const ORDER: Screen[] = ["cover", "ritual", "gift", "promise", "memories"];

/**
 * Which end of a screen you arrive at.
 *
 * Two screens have internal steps — the ritual has four, the gift has three —
 * and walking back into one of them from the screen after it must not dump you
 * at its beginning. Going back from the gift lands on the tied rakhi, not on the
 * tilak you did four taps ago; otherwise "back" costs you the whole ritual and
 * nobody uses it twice.
 *
 * This is passed as a mount-time hint rather than lifted state on purpose. The
 * alternative is hoisting the ritual index and the gift beat into this
 * component, which would put four pieces of another screen's private state here
 * so that one button can work. The screens key off it on mount and own their
 * position from then on.
 */
export type Entry = "first" | "last";

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
  const [entry, setEntry] = useState<Entry>("first");
  const [vachan, setVachan] = useState(data.vachan);
  const [note, setNote] = useState<string | null>(null);

  /** Forward: always to the top of the next screen. */
  const go = useCallback((next: Screen) => {
    setEntry("first");
    setScreen(next);
  }, []);

  /** Back: to the END of the previous screen, so nothing has to be redone. */
  const goBack = useCallback(() => {
    setScreen((s) => {
      const i = ORDER.indexOf(s);
      return i <= 0 ? s : ORDER[i - 1];
    });
    setEntry("last");
  }, []);

  // ── The public URL of this page ──────────────────────────────────────────
  //
  // Read off `window` rather than an env var so it is right on localhost, on
  // stag.subhsandesh.in and in production without three code paths — but
  // `window` does not exist during the server render, so it cannot simply be
  // read in the body.
  //
  // `useSyncExternalStore` with a null server snapshot is the sanctioned way to
  // say "this value only exists on the client": React renders null on the
  // server and through hydration, then swaps in the real one without calling it
  // a mismatch. The subscribe is a no-op because the origin cannot change
  // without a navigation, which unmounts this anyway.
  //
  // Null in the builder preview: nothing is published yet, so there is no link
  // to print, and a QR pointing at a 404 is worse than no QR at all.
  const shareUrl = useSyncExternalStore(
    NO_SUBSCRIBE,
    () => (shareId && mode !== "preview" ? `${window.location.origin}/${shareId}` : null),
    () => null
  );

  // Everything the card renders.
  const card = useStoryCard({ ...data, vachan }, shareUrl);

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
            {screen === "cover" && <CoverScreen data={data} onBegin={() => go("ritual")} />}
            {screen === "ritual" && (
              <RitualScreen
                data={data}
                entry={entry}
                onComplete={() => go("gift")}
                onBack={goBack}
              />
            )}
            {screen === "gift" && (
              <GiftScreen
                data={data}
                entry={entry}
                onContinue={() => go("promise")}
                onBack={goBack}
              />
            )}
            {screen === "promise" && (
              <PromiseScreen
                data={{ ...data, vachan }}
                onSubmit={submitVachan}
                onContinue={() => go("memories")}
                onBack={goBack}
              />
            )}
            {screen === "memories" && (
              <MemoriesScreen
                data={{ ...data, vachan }}
                onSaveCard={saveCard}
                onDownload={downloadCard}
                saving={card.busy || !card.ready}
                onBack={goBack}
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
