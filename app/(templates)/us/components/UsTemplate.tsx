"use client";

// ─── Us — the shell ──────────────────────────────────────────────────────────
//
// A relationship with its own account. One screen, two overlays, and a
// deliberate refusal to be responsive.
//
// THE DESKTOP RULE. On a wide screen this is letterboxed into a centred 420px
// column with a neutral surround. That is the design, not a fallback: the whole
// point of the joke is that you are looking at a phone app, and a profile grid
// stretched to 1440px stops being funny and starts being a bug report. Nothing
// in this template reflows — there is no breakpoint that changes a layout, only
// the one that draws the frame around the column.
//
// STATE. Two overlays, both wired into the browser's back stack through
// `useOverlayHistory`, both closed by exactly one path (`history.back()`), so
// the in-app chevron and the OS gesture cannot disagree. The grid underneath is
// never unmounted, and its scroll offset is restored on the way back.
//
// The story viewer's clock lives in an external store rather than an effect —
// see storyMachine.ts. No effect in this template calls a setter.

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import BottomNav from "./BottomNav";
import HighlightStrip from "./HighlightStrip";
import PostDetail from "./PostDetail";
import PostGrid from "./PostGrid";
import ProfileHeader from "./ProfileHeader";
import SaveCardSheet from "./SaveCardSheet";
import StoryViewer from "./StoryViewer";
import TabBar from "./TabBar";
import TopBar from "./TopBar";
import { ClipsTabIcon, TaggedTabIcon } from "./icons";
import { useOverlayHistory, useReducedMotion, useScrollMemory, useTransient } from "./hooks";
import { StoryMachine } from "./storyMachine";
import { KEYFRAMES, TEXT_BASE, anim } from "./styles";
import {
  COPY,
  METRICS,
  PALETTE,
  SYSTEM_FONT,
  TAB_EMPTY_COPY,
  TIMING,
  orderedPosts,
  type ProfileData,
  type ProfileTab,
} from "./types";

/** The neutral surround on wide screens. Not part of the app; the desk it sits on. */
const SURROUND = "#EFEFEF";

/** Only the frame is a breakpoint. Wide enough that the 420px column plus its
 *  1px outline can never crowd the content. Outline, not border — an outline
 *  takes no space, so the column stays exactly 420 and the grid maths holds. */
const FRAME_CSS = `
@media (min-width: 480px) {
  .us-column { outline: 1px solid ${PALETTE.border}; }
}
`;

export interface UsTemplateProps {
  data: ProfileData;
  /** "demo" is the gallery preview; "live" is the recipient's published page. */
  mode: "demo" | "live";
  shareId?: string;
  hasPassword?: boolean;
}

function EmptyTab({ tab }: { tab: Exclude<ProfileTab, "grid"> }) {
  const Icon = tab === "clips" ? ClipsTabIcon : TaggedTabIcon;
  return (
    <div
      style={{
        minHeight: 280,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        padding: "40px 32px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 62,
          height: 62,
          borderRadius: "50%",
          border: `1.5px solid ${PALETTE.ink}`,
          display: "grid",
          placeItems: "center",
        }}
      >
        <Icon size={28} color={PALETTE.ink} />
      </div>
      <div style={{ fontSize: 14, lineHeight: "19px", color: PALETTE.grey, maxWidth: 240 }}>
        {TAB_EMPTY_COPY[tab]}
      </div>
    </div>
  );
}

export default function UsTemplate({ data, mode }: UsTemplateProps) {
  const reduced = useReducedMotion();
  const [tab, setTab] = useState<ProfileTab>("grid");
  const [saveOpen, setSaveOpen] = useState(false);

  const posts = useMemo(() => orderedPosts(data), [data]);

  /* ── Toast ───────────────────────────────────────────────────────────── */
  const [toastUp, fireToast] = useTransient(TIMING.toastMs);
  const [toastText, setToastText] = useState<string>(COPY.nothingElse);
  const showToast = useCallback(
    (message: string) => {
      setToastText(message);
      fireToast();
    },
    [fireToast],
  );
  const onNothing = useCallback(() => showToast(COPY.nothingElse), [showToast]);

  /* ── Post detail ─────────────────────────────────────────────────────── */
  const { remember, restore } = useScrollMemory();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const closePost = useCallback(() => {
    setOpenIndex(null);
    restore();
  }, [restore]);

  const requestClosePost = useOverlayHistory(openIndex !== null, closePost);

  const openPost = useCallback(
    (index: number) => {
      remember();
      setOpenIndex(index);
    },
    [remember],
  );

  /* ── Story highlights ────────────────────────────────────────────────── */
  const [machine] = useState(() => new StoryMachine());
  const story = useSyncExternalStore(machine.subscribe, machine.getSnapshot, machine.getServerSnapshot);

  const counts = useMemo(() => data.highlights.map((h) => h.slides.length), [data.highlights]);

  const closeStory = useCallback(() => machine.close(), [machine]);
  const requestCloseStory = useOverlayHistory(story.open, closeStory);

  // Configuration only — none of these publish a snapshot, so no effect here
  // ever causes a render. The machine owns its own timer.
  useEffect(() => machine.setCounts(counts), [machine, counts]);
  useEffect(() => machine.setAuto(!reduced), [machine, reduced]);
  useEffect(() => machine.setExhausted(requestCloseStory), [machine, requestCloseStory]);
  useEffect(() => () => machine.dispose(), [machine]);

  const openStory = useCallback((index: number) => machine.open(index), [machine]);

  const activePost = openIndex !== null ? posts[openIndex] : undefined;

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: SURROUND,
        display: "flex",
        justifyContent: "center",
        fontFamily: SYSTEM_FONT,
        color: PALETTE.ink,
        ...TEXT_BASE,
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: KEYFRAMES + FRAME_CSS }} />

      <div
        className="us-column"
        style={{
          position: "relative",
          width: "100%",
          maxWidth: METRICS.desktopColumn,
          minHeight: "100dvh",
          background: PALETTE.bg,
        }}
      >
        <TopBar
          handle={data.handle}
          onBack={onNothing}
          onMenu={() => setSaveOpen(true)}
          onNothing={onNothing}
        />

        {/* In the editor the site's floating Back / Create pills sit above the
            bottom nav, so the scroll content has to clear both or the last row
            of the grid is permanently under a button. The published page has no
            such chrome and gets the tighter number. */}
        <main
          style={{
            paddingBottom: `calc(${METRICS.bottomNavH + (mode === "demo" ? 76 : 20)}px + env(safe-area-inset-bottom, 0px))`,
          }}
        >
          <ProfileHeader data={data} reduced={reduced} />
          <HighlightStrip highlights={data.highlights} onOpen={openStory} />
          <TabBar active={tab} onSelect={setTab} />

          {tab === "grid" ? (
            <PostGrid posts={posts} pinnedIds={data.pinnedPostIds} onOpen={openPost} />
          ) : (
            <EmptyTab tab={tab} />
          )}

          {/* No site chrome in either mode. The published page's viewer supplies
              its own mark and Create CTA, and a second one here would double up. */}
        </main>

        <BottomNav avatarUrl={data.avatarUrl} onNothing={onNothing} />

        {toastUp ? (
          <div
            role="status"
            style={{
              position: "fixed",
              left: "50%",
              transform: "translateX(-50%)",
              bottom: `calc(${METRICS.bottomNavH + 18}px + env(safe-area-inset-bottom, 0px))`,
              zIndex: 170,
              maxWidth: 320,
              padding: "10px 16px",
              borderRadius: 8,
              background: "rgba(0,0,0,0.86)",
              color: "#FFFFFF",
              fontSize: 13,
              lineHeight: "17px",
              textAlign: "center",
              pointerEvents: "none",
              animation: anim(reduced, "us-toast-in", 180),
            }}
          >
            {toastText}
          </div>
        ) : null}
      </div>

      {activePost ? (
        <PostDetail
          key={activePost.id}
          post={activePost}
          handle={data.handle}
          avatarUrl={data.avatarUrl}
          reduced={reduced}
          onBack={requestClosePost}
          onNothing={onNothing}
        />
      ) : null}

      {story.open ? (
        <StoryViewer
          highlights={data.highlights}
          state={story}
          reduced={reduced}
          onNext={machine.next}
          onPrev={machine.prev}
          onHold={machine.setHeld}
          onClose={requestCloseStory}
        />
      ) : null}

      {saveOpen ? (
        <SaveCardSheet
          data={data}
          posts={posts}
          reduced={reduced}
          onClose={() => setSaveOpen(false)}
          onToast={showToast}
        />
      ) : null}
    </div>
  );
}
