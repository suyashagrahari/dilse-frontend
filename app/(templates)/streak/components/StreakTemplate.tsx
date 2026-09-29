// ─── The template ────────────────────────────────────────────────────────────
//
// `mode: "demo"` is the gallery preview and the editor's live preview: local
// state only. `mode: "live"` is the published page: the partner's side of
// today comes from the server, and a check-in is POSTed.
//
// IDENTITY. In live mode the viewer's side is whatever the SERVER says it is,
// resolved from the link's `?k=` token (a plain link is side "b" — the person
// the page was made for). The demo shows that same recipient's view.
//
// The session store (streakStore.ts) is unchanged: the number is always
// derived from the ledger, never stored, and never goes to zero. This file
// wires it to the parody camera-chat app in ./snap.

"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { TIMING, type Side } from "./types";
import { createSession, readToday, useReducedMotion, useStore, useToday } from "./streakStore";
import { fetchToday, postCheckIn } from "./liveApi";
import type { StreakPageData } from "./skin";
import SnapApp from "./snap/SnapApp";

export interface StreakTemplateProps {
  data: StreakPageData;
  mode: "demo" | "live";
  shareId?: string;
  hasPassword?: boolean;
  shareUrl?: string | null;
  /** Hide the corner letter while an editor sheet is over the page. */
  hideLetter?: boolean;
}

function StreakTemplateInner({ data, mode, shareId, hideLetter }: StreakTemplateProps) {
  const searchParams = useSearchParams();
  // The ONLY identity signal. Never a `side`.
  const token = searchParams.get("k");

  const initialSide: Side = "b";
  const [session] = useState(() => createSession(data, initialSide));
  const state = useStore(session.store);
  const reduced = useReducedMotion();
  const today = useToday(state.data.timezone);

  const todayView = useMemo(() => readToday(state.data, state.me, today), [state.data, state.me, today]);

  // The skin never changes inside a session; the ledger does. Merge them.
  const page = useMemo<StreakPageData>(() => ({ ...data, ...state.data }), [data, state.data]);

  // The both-in moment on open: if the day completed while this person was
  // away, the first poll (immediately) delivers the celebration now.
  useEffect(() => {
    session.poll();
    const id = setInterval(() => session.poll(), TIMING.pollMs);
    return () => clearInterval(id);
  }, [session]);

  // The live layer. Silent on every failure.
  useEffect(() => {
    if (mode !== "live" || !shareId) return;
    let cancelled = false;
    const run = async () => {
      const payload = await fetchToday(shareId, token);
      if (cancelled || !payload) return;
      if (payload.side) session.setMe(payload.side);
      if (payload.day) session.mergeServerDay(payload.day);
    };
    void run();
    const id = setInterval(() => void run(), Math.max(TIMING.pollMs, 6000));
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [mode, shareId, token, session]);

  const onSend = useCallback(
    (word: string, note: string, photoUrl?: string) => {
      const result = session.checkIn();
      if (result.status !== "ok" || !result.entry) return;
      session.patchEntry({ word, note, ...(photoUrl ? { photoUrl } : {}) });
      if (mode === "live" && shareId) {
        // Best effort. The day has already counted locally.
        const entry = { ...result.entry, word, ...(note ? { note } : {}), ...(photoUrl ? { photoUrl } : {}) };
        void postCheckIn(shareId, token, result.key, entry).then((ok) => {
          if (ok) session.clearQueued(result.key);
        });
      }
    },
    [session, mode, shareId, token],
  );

  const onMomentDone = useCallback(() => session.advanceMoment("settled"), [session]);

  return (
    <SnapApp
      page={page}
      me={state.me}
      today={today}
      todayView={todayView}
      moment={state.moment}
      mode={mode}
      reduced={reduced}
      hideLetter={hideLetter}
      onSend={onSend}
      onMomentDone={onMomentDone}
      onRestore={session.spendCover}
      onOpenMilestone={session.openMilestone}
    />
  );
}

export default function StreakTemplate(props: StreakTemplateProps) {
  return (
    <Suspense fallback={<div style={{ minHeight: "100dvh", background: "#000" }} />}>
      <StreakTemplateInner {...props} />
    </Suspense>
  );
}
