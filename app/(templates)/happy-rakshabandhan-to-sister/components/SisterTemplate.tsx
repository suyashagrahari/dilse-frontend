"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { API_URL } from "@/lib/config";
import { PAPER_GRADIENT } from "./theme";
import type { RakhiStyle, SisterData } from "./types";
import CoverScreen from "./CoverScreen";
import TieScreen from "./TieScreen";
import VowScreen from "./VowScreen";
import AccountScreen from "./AccountScreen";
import LifafaScreen from "./LifafaScreen";
import MemoriesScreen from "./MemoriesScreen";
import ReplyScreen from "./ReplyScreen";
import { useStoryCard } from "./StoryCard";
import "./sister.css";

// ─── The recipient experience ────────────────────────────────────────────────
//
//   cover → tie → vow → account → lifafa → memories → reply
//
// The order is load-bearing, in two places.
//
// THE VOW COMES BEFORE THE LIFAFA. The vow is what Raksha Bandhan is; the lifafa
// is money. Reversed, the page reads as a payment flow with a sentiment attached,
// and no arrangement of the rest recovers from that.
//
// THE ACCOUNT COMES BETWEEN THEM, and it is what joins them. The vow is the
// emotional peak and the lifafa is a transaction; adjacent, the second one feels
// like the price of the first. The statement of account in between is both the
// comic release and the bridge: it spends thirty seconds establishing, in a
// deadpan two-column ledger, that what he owes her cannot be paid — so the
// envelope that follows arrives as part payment against an unpayable debt, which
// is precisely what shagun is.
//
// `mode` tells the one screen with a side effect whether it is real:
//   "share"   — his sister, on the published link. The reply POSTs.
//   "preview" — him, in the builder. The reply is held in memory only, so testing
//               the page cannot burn the write-once slot that belongs to her.

export type SisterMode = "share" | "preview";

type Screen = "cover" | "tie" | "vow" | "account" | "lifafa" | "memories" | "reply";

const ORDER: Screen[] = [
  "cover",
  "tie",
  "vow",
  "account",
  "lifafa",
  "memories",
  "reply",
];

/** The origin never changes without a navigation, so there is nothing to watch. */
const NO_SUBSCRIBE = () => () => {};

/**
 * Which end of a screen you arrive at.
 *
 * Three screens have internal steps — the tie has three, the vow two, the lifafa
 * two — and walking back into one of them from the screen after it must not dump
 * you at its beginning. Going back from the vow lands on the tied rakhi, not on
 * the rakhi tray you chose from three taps ago; otherwise "back" costs the whole
 * ritual and nobody uses it twice.
 *
 * Passed as a mount-time hint rather than lifted state on purpose: the
 * alternative hoists three screens' private step indices into this component so
 * that one button can work. Each screen keys off it on mount and owns its
 * position from then on.
 */
export type Entry = "first" | "last";

export default function SisterTemplate({
  data,
  mode = "share",
  shareId,
}: {
  data: SisterData;
  mode?: SisterMode;
  shareId?: string;
}) {
  const [screen, setScreen] = useState<Screen>("cover");
  const [entry, setEntry] = useState<Entry>("first");

  // Hers, and the only two pieces of state on this page that can outlive the
  // session. Seeded from the document so a second visit shows what she already
  // wrote instead of offering her the box again.
  const [reply, setReply] = useState(data.reply);
  const [picked, setPicked] = useState<string>(data.rakhiPicked);

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

  /**
   * She chose a rakhi and tied it.
   *
   * Held in memory only. It is written to the server together with her reply, in
   * one request at the end — see `submitReply`. Two write-once endpoints would
   * mean a page that has recorded the rakhi but not the words, which is the one
   * state neither he nor she can do anything about.
   */
  const onTied = useCallback(
    (style: RakhiStyle) => {
      setPicked(style);
      go("vow");
    },
    [go]
  );

  // ── The public URL of this page ──────────────────────────────────────────
  //
  // Read off `window` rather than an env var so it is right on localhost, on
  // stag.subhsandesh.in and in production without three code paths — but
  // `window` does not exist during the server render, so it cannot simply be
  // read in the body.
  //
  // `useSyncExternalStore` with a null server snapshot is the sanctioned way to
  // say "this value only exists on the client": React renders null on the server
  // and through hydration, then swaps in the real one without calling it a
  // mismatch. The subscribe is a no-op because the origin cannot change without
  // a navigation, which unmounts this anyway.
  //
  // Null in the builder preview: nothing is published yet, so there is no link to
  // print, and a QR pointing at a 404 is worse than no QR at all.
  const shareUrl = useSyncExternalStore(
    NO_SUBSCRIBE,
    () => (shareId && mode !== "preview" ? `${window.location.origin}/${shareId}` : null),
    () => null
  );

  const card = useStoryCard({ ...data, reply, rakhiPicked: picked }, shareUrl);

  const submitReply = useCallback(
    async (text: string): Promise<string | null> => {
      setReply(text);

      // In the builder there is nothing to write to, and writing would consume
      // the one answer his sister is entitled to.
      if (mode === "preview" || !shareId) return text;

      try {
        const res = await fetch(
          `${API_URL}/raksha-bandhan-sister-pages/share/${shareId}/reply`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reply: text, rakhiPicked: picked }),
          }
        );
        const json = await res.json();
        if (!res.ok || !json?.success) return null;
        const stored = String(json.data?.reply || text);
        setReply(stored);
        return stored;
      } catch {
        return null;
      }
    },
    [mode, shareId, picked]
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

  const live = { ...data, reply, rakhiPicked: picked };

  return (
    <div style={{ background: PAPER_GRADIENT, minHeight: "100dvh" }}>
      {/* Letterboxed to a phone column on desktop — see .rs-stage. */}
      <div className="rs-stage">
        <AnimatePresence mode="wait">
          <motion.div
            key={screen}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
          >
            {screen === "cover" && <CoverScreen data={data} onBegin={() => go("tie")} />}

            {screen === "tie" && (
              <TieScreen data={data} entry={entry} picked={picked} onTied={onTied} onBack={goBack} />
            )}

            {screen === "vow" && (
              <VowScreen
                data={live}
                entry={entry}
                onContinue={() => go("account")}
                onBack={goBack}
              />
            )}

            {screen === "account" && (
              <AccountScreen data={live} onContinue={() => go("lifafa")} onBack={goBack} />
            )}

            {screen === "lifafa" && (
              <LifafaScreen
                data={live}
                entry={entry}
                onContinue={() => go("memories")}
                onBack={goBack}
              />
            )}

            {screen === "memories" && (
              <MemoriesScreen data={live} onContinue={() => go("reply")} onBack={goBack} />
            )}

            {screen === "reply" && (
              <ReplyScreen
                data={live}
                onSubmit={submitReply}
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
              background: "rgba(51,32,43,0.94)",
              color: "#fffaf2",
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
