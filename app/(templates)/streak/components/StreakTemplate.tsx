// ─── The template ────────────────────────────────────────────────────────────
//
// `mode: "demo"` is the gallery preview and the editor's live preview. It runs
// entirely on local state and is the only mode that renders the DEBUG controls.
//
// `mode: "live"` is the recipient's published page: no editor chrome, no debug,
// and the partner's side of today comes from the server.
//
// IDENTITY. In live mode the viewer's side is whatever the SERVER says it is,
// resolved from the link's `?k=` token. There is no `?side=` here and no
// client-side inference — see the note at the top of `liveApi.ts`, including
// the honest limitation about what a share-link token can and cannot promise.

"use client";

import {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import {
  COPY,
  PALETTE,
  TIMING,
  UI,
  checkInKey,
  type Side,
  type StreakData,
} from "./types";
import { pairIdOf } from "./demoData";
import {
  createSession,
  createStore,
  readToday,
  useReducedMotion,
  useStore,
  useToday,
  type MomentPhase,
  type StreakSession,
} from "./streakStore";
import { fetchToday, postCheckIn } from "./liveApi";
import StreakStyles from "./StreakStyles";
import CheckInScreen from "./CheckInScreen";

// Screen two and everything past it is lazy. The check-in screen is what gets
// opened every morning and it should not ship a calendar to do that.
const Archive = lazy(() => import("./Archive"));
const Poem = lazy(() => import("./Poem"));
const Letters = lazy(() => import("./Letters"));
const ShareScreen = lazy(() => import("./ShareScreen"));

type Screen = "checkin" | "archive" | "poem" | "letters" | "share";

interface UiState {
  screen: Screen;
  toast: string | null;
}

export interface StreakTemplateProps {
  data: StreakData;
  mode: "demo" | "live";
  shareId?: string;
  hasPassword?: boolean;
  /** The published link, offered on the card screen when there is one. */
  shareUrl?: string | null;
}

const NAV: { id: Screen; label: string }[] = [
  { id: "checkin", label: "today" },
  { id: "archive", label: "archive" },
  { id: "poem", label: "poem" },
  { id: "letters", label: "letters" },
  { id: "share", label: "card" },
];

/** TODO(realtime): delete this whole component when the socket lands. */
function DebugPanel({ session }: { session: StreakSession }) {
  const [open, setOpen] = useState(false);
  const chip: React.CSSProperties = {
    minHeight: 44,
    padding: "0 10px",
    fontFamily: UI,
    fontSize: 11,
    color: PALETTE.inkSoft,
    background: PALETTE.paperDeep,
    border: `1px dashed ${PALETTE.inkFaint}`,
    borderRadius: 8,
    textAlign: "left",
  };
  return (
    // Rendered INLINE at the end of the page rather than floating. A fixed
    // panel sat on top of the seven-day strip and the sealed note, which are
    // the two things the demo exists to show.
    <div className="w-full flex flex-col items-center gap-1 pt-6" style={{ maxWidth: 360 }}>
      {open && (
        <>
          <button type="button" style={chip} onClick={session.partnerCheckIn}>
            [DEBUG: partner checks in]
          </button>
          <button type="button" style={chip} onClick={session.photoFailed}>
            [DEBUG: photo upload fails]
          </button>
          <button type="button" style={chip} onClick={session.startHundred}>
            [DEBUG: day-100 canopy]
          </button>
          <button type="button" style={chip} onClick={() => session.demoSetStatus("repairable")}>
            [DEBUG: jump to repairable]
          </button>
          <button type="button" style={chip} onClick={() => session.demoSetStatus("dormant")}>
            [DEBUG: jump to dormant]
          </button>
        </>
      )}
      <button
        type="button"
        style={{ ...chip, minWidth: 44, opacity: open ? 1 : 0.55 }}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        [DEBUG]
      </button>
    </div>
  );
}

function StreakTemplateInner({ data, mode, shareId, shareUrl }: StreakTemplateProps) {
  const searchParams = useSearchParams();
  // The ONLY identity signal. Never a `side`.
  const token = searchParams.get("k");

  // The demo sender is side "a". In live mode this is a provisional value that
  // the server's answer replaces on the first poll.
  const initialSide: Side = mode === "demo" ? "a" : "b";
  const [session] = useState(() => createSession(data, initialSide));
  const [ui] = useState(() => createStore<UiState>({ screen: "checkin", toast: null }));

  const state = useStore(session.store);
  const uiState = useStore(ui);
  const reduced = useReducedMotion();
  const today = useToday(state.data.timezone);

  const todayView = useMemo(
    () => readToday(state.data, state.me, today),
    [state.data, state.me, today],
  );
  const view = todayView.view;

  const checkedInThisSession = state.applied.includes(
    checkInKey(pairIdOf(state.data), today, state.me),
  );

  const go = useCallback((screen: Screen) => ui.set({ ...ui.get(), screen }), [ui]);
  const toast = useCallback((message: string) => ui.set({ ...ui.get(), toast: message }), [ui]);

  // ── Toast lifetime. A store write, not `setState` in an effect. ──
  useEffect(() => {
    if (!uiState.toast) return;
    const t = setTimeout(() => ui.set({ ...ui.get(), toast: null }), 3200);
    return () => clearTimeout(t);
  }, [uiState.toast, ui]);

  // ── The transient notice clears itself. Nothing here is an error. ──
  useEffect(() => {
    if (!state.notice) return;
    const t = setTimeout(() => session.setNotice(null), 4200);
    return () => clearTimeout(t);
  }, [state.notice, session]);

  // ── THE MOMENT, on open. ─────────────────────────────────────────────────
  // The first tick runs immediately, which is the whole point: if the second
  // check-in happened at lunchtime and this partner opens the page at nine, the
  // full animation plays now. The moment is not forfeited by not looking.
  //
  // TODO(realtime): replace this poll with a socket subscription.
  useEffect(() => {
    session.poll();
    const id = setInterval(() => session.poll(), TIMING.pollMs);
    return () => clearInterval(id);
  }, [session]);

  // ── The live layer. Silent on every failure. ──
  useEffect(() => {
    if (mode !== "live" || !shareId) return;
    let cancelled = false;
    const run = async () => {
      const payload = await fetchToday(shareId, token);
      if (cancelled || !payload) return;
      if (payload.side) session.setMe(payload.side);
      // No day, or no token: the ordinary "nothing sealed today" state. Not an
      // error, not a locked envelope — a working page without a note on it.
      if (payload.day) session.mergeServerDay(payload.day);
    };
    void run();
    const id = setInterval(() => void run(), TIMING.pollMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [mode, shareId, token, session]);

  // ── Returning from dormancy: end the sweep once it has run. ──
  useEffect(() => {
    if (!state.relighting) return;
    const t = setTimeout(() => session.endRelight(), 2200);
    return () => clearTimeout(t);
  }, [state.relighting, session]);

  // ── Day 100. One-shot, and `hundredPlayed` is never cleared. ──
  useEffect(() => {
    if (view.record < 100 || state.hundredPlayed || state.hundredRunning) return;
    session.startHundred();
  }, [view.record, state.hundredPlayed, state.hundredRunning, session]);

  useEffect(() => {
    if (!state.hundredRunning) return;
    const t = setTimeout(() => {
      session.endHundred();
      // The canopy builds, then the letter opens.
      ui.set({ ...ui.get(), screen: "letters" });
    }, TIMING.hundredSequenceMs + 400);
    return () => clearTimeout(t);
  }, [state.hundredRunning, session, ui]);

  // ── Actions ──────────────────────────────────────────────────────────────

  const handleCheckIn = useCallback(() => {
    const result = session.checkIn();
    if (result.status !== "ok" || !result.entry) return;
    if (mode === "live" && shareId) {
      // Best effort. The day has already counted locally; a rejected request
      // leaves the key on the in-memory queue and never un-counts anything.
      void postCheckIn(shareId, token, result.key, result.entry).then((ok) => {
        if (ok) session.clearQueued(result.key);
      });
    }
  }, [session, mode, shareId, token]);

  const screen = uiState.screen;

  return (
    <div
      className="streak-root"
      style={{
        minHeight: "100dvh",
        background: PALETTE.paper,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <StreakStyles />

      {/* The top bar is `position: fixed` and the canopy's glow spills past its
          own box, so the first light needs room to clear it. */}
      <main
        className="w-full flex-1 flex flex-col items-center px-4"
        style={{
          paddingTop: "calc(76px + env(safe-area-inset-top, 0px))",
          paddingBottom: 104,
        }}
      >
        {screen === "checkin" && (
          <CheckInScreen
            data={state.data}
            me={state.me}
            today={today}
            todayView={todayView}
            moment={state.moment}
            freshLights={state.freshLights}
            relighting={state.relighting}
            canopy={state.hundredRunning}
            notice={state.notice}
            checkedInThisSession={checkedInThisSession}
            reduced={reduced}
            onCheckIn={handleCheckIn}
            onPatch={session.patchEntry}
            onPhotoFailed={session.photoFailed}
            onAdvanceMoment={session.advanceMoment as (p: MomentPhase) => void}
            onSpendCover={session.spendCover}
            onOpenArchive={() => go("archive")}
          />
        )}

        <Suspense
          fallback={
            screen === "checkin" ? null : (
              <p style={{ fontFamily: UI, fontSize: 13, color: PALETTE.inkFaint, paddingTop: 40 }}>…</p>
            )
          }
        >
          {screen === "archive" && (
            <Archive
              data={state.data}
              me={state.me}
              today={today}
              view={view}
              reduced={reduced}
              onBack={() => go("checkin")}
              onOpenPoem={() => go("poem")}
            />
          )}
          {screen === "poem" && (
            <Poem data={state.data} onBack={() => go("archive")} onToast={toast} />
          )}
          {screen === "letters" && (
            <Letters
              data={state.data}
              view={view}
              reduced={reduced}
              onBack={() => go("checkin")}
              onOpen={session.openMilestone}
            />
          )}
          {screen === "share" && (
            <ShareScreen
              data={state.data}
              view={view}
              today={today}
              shareUrl={shareUrl}
              onBack={() => go("checkin")}
              onToast={toast}
            />
          )}
        </Suspense>

        {/* ── DEBUG. Demo only; never rendered on a published page. ──────────
               TODO(realtime): every one of these disappears when the socket
               lands. They stand in for the partner's device doing something. */}
        {mode === "demo" && <DebugPanel session={session} />}
      </main>

      {/* ── Navigation. Text only, quiet, 44px targets. ── */}
      <nav
        className="fixed bottom-0 left-0 right-0 flex items-center justify-center"
        style={{
          background: PALETTE.paper,
          borderTop: `1px solid ${PALETTE.edge}`,
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
          gap: 2,
        }}
      >
        {NAV.map((n) => (
          <button
            key={n.id}
            type="button"
            onClick={() => go(n.id)}
            aria-current={screen === n.id ? "page" : undefined}
            className="px-3"
            style={{
              minHeight: 48,
              minWidth: 44,
              fontFamily: UI,
              fontSize: 12.5,
              color: screen === n.id ? PALETTE.ink : PALETTE.inkFaint,
              background: "transparent",
              border: "none",
              borderTop: `2px solid ${screen === n.id ? PALETTE.accent : "transparent"}`,
            }}
          >
            {n.label}
          </button>
        ))}
      </nav>

      {uiState.toast && (
        <div
          className="fixed left-1/2 -translate-x-1/2 rounded-full px-4 py-2"
          style={{
            bottom: 74,
            background: PALETTE.ink,
            color: PALETTE.paper,
            fontFamily: UI,
            fontSize: 12.5,
            zIndex: 60,
          }}
          role="status"
        >
          {uiState.toast}
        </div>
      )}

      <span className="sr-only" aria-live="polite">
        {state.queue.length > 0 ? COPY.queued : ""}
      </span>
    </div>
  );
}

export default function StreakTemplate(props: StreakTemplateProps) {
  // `useSearchParams` needs a boundary. Keeping it here means the published
  // viewer can drop this component in without knowing that.
  return (
    <Suspense fallback={<div className="streak-root" style={{ minHeight: "100dvh", background: PALETTE.paper }} />}>
      <StreakTemplateInner {...props} />
    </Suspense>
  );
}
