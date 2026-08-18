// ─── Caller ID — the three screens, in order ─────────────────────────────────
//
//   incoming → (dark) → connected → log
//
// This component owns the stage machine, the ringtone, the haptics and the
// decline joke; the three screens own their own layout and nothing else.
//
// ── THE DECLINE JOKE ─────────────────────────────────────────────────────────
//
// Decline and the screen goes dark for 800ms — and then the call comes straight
// back, labelled "Incoming call (2)". Third time it says she is not going to
// stop. After the fourth it answers itself, because she was always going to
// win, and being told so is funnier than being allowed to keep refusing.
//
// ── THE RING, AND THE TAB ────────────────────────────────────────────────────
//
// The AudioContext is built on the first pointer down anywhere on the frame —
// browsers will not give one out otherwise, and a context built without a
// gesture is silent forever rather than loud later. Until that happens the
// screen says "tap to answer" instead of pretending to ring.
//
// `visibilitychange` stops the tone AND the vibration on the same tick as the
// tab going away. A phone ringing out of a background tab is genuinely bad.

"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CallLogScreen from "./CallLogScreen";
import ConnectedScreen from "./ConnectedScreen";
import IncomingScreen from "./IncomingScreen";
import ShareCard from "./ShareCard";
import { Ringtone, makeHaptics } from "./ringtone";
import { DARK, FONT, LIGHT, PortraitFrame } from "./theme";
import { mergeTags, useLiveTags, copyText } from "./tagApi";
import type { CallData } from "./types";

type Stage = "incoming" | "dark" | "connected" | "log";

/** The decline that stops being a decline. */
const AUTO_ANSWER_AFTER = 4;

export interface CallTemplateProps {
  data: CallData;
  mode: "preview" | "live";
  shareId?: string | null;
  hasPassword?: boolean;
  /**
   * The friends' write link. Present in the editor, where the sender owns the
   * token; absent on the recipient's page, where the shared read deliberately
   * strips it.
   */
  contribLink?: string | null;
}

export default function CallTemplate({ data, mode, shareId, contribLink }: CallTemplateProps) {
  const [stage, setStage] = useState<Stage>("incoming");
  const [declines, setDeclines] = useState(0);
  const [audioReady, setAudioReady] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const ring = useRef<Ringtone | null>(null);
  const haptics = useRef<ReturnType<typeof makeHaptics> | null>(null);

  // ── Tags, live ─────────────────────────────────────────────────────────────
  // Runs wherever there is a published page to read — the recipient's view and
  // the sender's own preview both, so approving a tag is visible immediately in
  // the editor rather than after a reload.
  const { tags: published } = useLiveTags({ shareId: shareId ?? null, enabled: Boolean(shareId) });
  const tags = useMemo(() => mergeTags(data.tags, published), [data.tags, published]);

  // ── Toast ──────────────────────────────────────────────────────────────────
  const pushToast = useCallback((message: string) => setToast(message), []);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(id);
  }, [toast]);

  // ── Audio lifetime ─────────────────────────────────────────────────────────
  useEffect(() => {
    const r = new Ringtone();
    const h = makeHaptics();
    ring.current = r;
    haptics.current = h;
    return () => {
      h.stop();
      r.destroy();
      ring.current = null;
      haptics.current = null;
    };
  }, []);

  /** The first gesture. Builds the context, and starts the ring if it is due. */
  const unlock = useCallback(() => {
    const r = ring.current;
    if (!r) return;
    const built = r.ensureContext();
    if (built && !audioReady) setAudioReady(true);
  }, [audioReady]);

  // Ring while — and only while — the call is incoming and unmuted.
  useEffect(() => {
    const r = ring.current;
    const h = haptics.current;
    if (!r || !h) return;

    if (stage === "incoming" && audioReady && document.visibilityState === "visible") {
      r.pump();
      r.start();
      h.start();
    } else {
      r.stop();
      h.stop();
    }

    return () => {
      r.stop();
      h.stop();
    };
  }, [stage, audioReady]);

  // Backgrounded tab: silence, immediately. Returning resumes if still ringing.
  useEffect(() => {
    const onVisibility = () => {
      const r = ring.current;
      const h = haptics.current;
      if (!r || !h) return;
      if (document.visibilityState === "hidden") {
        r.stop();
        h.stop();
        return;
      }
      if (stage === "incoming" && audioReady) {
        r.pump();
        r.start();
        h.start();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [stage, audioReady]);

  // ── Stage transitions ──────────────────────────────────────────────────────
  // Both guard on the current stage rather than inside a state updater: an
  // updater that calls another setState runs twice under StrictMode and the
  // decline counter would advance by two.
  const answer = useCallback(() => {
    if (stage !== "incoming") return;
    setStage("connected");
  }, [stage]);

  const decline = useCallback(() => {
    if (stage !== "incoming") return;
    setDeclines((n) => n + 1);
    setStage("dark");
  }, [stage]);

  /**
   * The dark beat between a decline and the call coming back.
   *
   * Longer on the last one, because that screen has a line on it and 800ms is
   * not long enough to read "you were not going to win this."
   */
  const autoAnswering = declines >= AUTO_ANSWER_AFTER;
  useEffect(() => {
    if (stage !== "dark") return;
    const id = setTimeout(() => setStage(autoAnswering ? "connected" : "incoming"), autoAnswering ? 1600 : 800);
    return () => clearTimeout(id);
  }, [stage, autoAnswering]);

  const endCall = useCallback(() => setStage("log"), []);

  // ── The friends' link ──────────────────────────────────────────────────────
  const tagHer = useCallback(async () => {
    if (!contribLink) return;
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title: "Tag this number", text: "What would you call her?", url: contribLink });
        return;
      } catch {
        /* the share sheet was dismissed — fall through to the clipboard */
      }
    }
    pushToast((await copyText(contribLink)) ? "Tag link copied" : "Couldn't copy the link");
  }, [contribLink, pushToast]);

  const dark = stage !== "log";

  return (
    <PortraitFrame
      surround={dark ? DARK.surround : LIGHT.surround}
      background={dark ? DARK.bg : LIGHT.paper}
    >
      {/* One capture handler for the whole template — every first touch, no
          matter where it lands, is the gesture the AudioContext needs. */}
      <div onPointerDownCapture={unlock} style={{ minHeight: "100dvh" }}>
        {stage === "incoming" ? (
          <IncomingScreen
            data={data}
            tags={tags}
            declines={declines}
            needsGesture={!audioReady}
            onAnswer={answer}
            onDecline={decline}
            onToast={pushToast}
          />
        ) : null}

        {stage === "dark" ? (
          <div
            style={{
              minHeight: "100dvh",
              display: "grid",
              placeItems: "center",
              background: "#05070A",
              color: DARK.dim,
              fontFamily: FONT,
              padding: 30,
              textAlign: "center",
            }}
            aria-live="polite"
          >
            {autoAnswering ? (
              <p style={{ margin: 0, fontSize: 17, lineHeight: 1.6 }}>you were not going to win this.</p>
            ) : (
              <span aria-hidden="true" />
            )}
          </div>
        ) : null}

        {stage === "connected" ? <ConnectedScreen data={data} onEnd={endCall} /> : null}

        {stage === "log" ? (
          <CallLogScreen
            data={data}
            tags={tags}
            contribLink={contribLink}
            onTagHer={tagHer}
            onSaveCard={() => setShowCard(true)}
          />
        ) : null}
      </div>

      {/* Brand mark — and, on a recipient's page, their way to make one. */}
      {mode === "live" ? (
        <Link
          href="/templates"
          aria-label="SubhSandesh — make your own"
          style={{
            // Absolute, not fixed: on a desktop the template letterboxes into a
            // 400px column and a fixed badge would sit out in the surround,
            // detached from the phone it belongs to.
            position: "absolute",
            top: "calc(env(safe-area-inset-top, 0px) + 12px)",
            right: 14,
            zIndex: 200,
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            padding: "6px 12px 6px 8px",
            borderRadius: 999,
            textDecoration: "none",
            background: dark ? "rgba(26,31,38,0.86)" : "rgba(255,255,255,0.92)",
            border: `1px solid ${dark ? DARK.edge : LIGHT.rule}`,
            color: dark ? DARK.text : LIGHT.ink,
            fontFamily: FONT,
            fontSize: 12,
            fontWeight: 600,
            backdropFilter: "blur(6px)",
          }}
        >
          <Image src="/logo.webp" alt="" width={18} height={18} style={{ borderRadius: 5 }} />
          SubhSandesh
        </Link>
      ) : null}

      {showCard ? (
        <ShareCard data={data} tags={tags} onClose={() => setShowCard(false)} onToast={pushToast} />
      ) : null}

      {toast ? (
        <div
          role="status"
          style={{
            position: "fixed",
            left: "50%",
            transform: "translateX(-50%)",
            bottom: "calc(env(safe-area-inset-bottom, 0px) + 26px)",
            zIndex: 340,
            maxWidth: 320,
            padding: "11px 16px",
            borderRadius: 12,
            background: "rgba(16,20,24,0.94)",
            border: `1px solid ${DARK.edge}`,
            color: DARK.text,
            fontFamily: FONT,
            fontSize: 13.5,
            lineHeight: 1.45,
            textAlign: "center",
          }}
        >
          {toast}
        </div>
      ) : null}
    </PortraitFrame>
  );
}
