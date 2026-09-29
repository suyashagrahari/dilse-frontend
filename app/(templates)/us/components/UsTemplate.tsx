"use client";

// ─── Us — the shell ──────────────────────────────────────────────────────────
//
// A relationship with its own account. Under 768px it is the phone app (top
// bar, bottom tab bar, full-screen post feed and stories); from 768px it is the
// web app (left rail — collapsed until 1264px — the avatar-left header, the
// 4px grid, the post modal and the dark story stage). The layout switch is CSS;
// only overlays ask `matchMedia` which flavour to open.
//
// Every overlay is wired into the browser back stack (useOverlayHistory), so
// the phone's back gesture closes a post instead of leaving the page.

import { useCallback, useMemo, useState } from "react";
import LetterPop from "../../_love/LetterPop";
import { BottomNav, MobileTopBar, Rail, type NavKind } from "./Chrome";
import DMs, { DM_CSS } from "./DMs";
import PostViewer, { EMPTY_SOCIAL, POST_CSS, type Social } from "./PostViewer";
import { EmptyTab, Grid, Highlights, ProfileHeader, Tabs, WebFooter, type HeaderActions } from "./Profile";
import { FollowersSheet, FollowingMenu, FollowingSheet, OptionsMenu } from "./Sheets";
import StoryViewer, { STORY_CSS } from "./StoryViewer";
import { CSS } from "./styles";
import { useBodyLock, useMedia, useOverlayHistory, useTransient } from "./hooks";
import { BP, TIMING, orderedPosts, type ProfileData, type ProfileTab } from "./types";

export interface UsTemplateProps {
  data: ProfileData;
  /** "demo" = inside the editor (its floating bar sits at the bottom); "live" = the recipient's page. */
  mode: "demo" | "live";
  shareId?: string;
  hasPassword?: boolean;
}

type Overlay =
  | { kind: "post"; index: number }
  | { kind: "story"; index: number }
  | { kind: "dms" }
  | { kind: "following" }
  | { kind: "followers" }
  | { kind: "followingList" }
  | { kind: "options" };

const ALL_CSS = CSS + POST_CSS + STORY_CSS + DM_CSS;

export default function UsTemplate({ data, mode }: UsTemplateProps) {
  const web = useMedia(`(min-width: ${BP.web}px)`);
  const posts = useMemo(() => orderedPosts(data), [data]);
  const [tab, setTab] = useState<ProfileTab>("grid");
  const [overlay, setOverlay] = useState<Overlay | null>(null);
  const [storySeen, setStorySeen] = useState(false);
  const [dmRead, setDmRead] = useState(false);
  const [social, setSocialMap] = useState<Record<string, Social>>({});

  const [toastUp, fireToast] = useTransient(TIMING.toastMs);
  const [toastText, setToastText] = useState("");
  const toast = useCallback(
    (t: string) => {
      setToastText(t);
      fireToast();
    },
    [fireToast],
  );

  const close = useCallback(() => setOverlay(null), []);
  const requestClose = useOverlayHistory(overlay !== null, close);
  useBodyLock(overlay !== null);

  const open = useCallback((o: Overlay) => {
    if (o.kind === "dms") setDmRead(true);
    setOverlay(o);
  }, []);
  /** Swap one overlay for another without growing the back stack. */
  const swap = useCallback((o: Overlay) => setOverlay(o), []);

  const setSocial = useCallback((id: string, fn: (s: Social) => Social) => {
    setSocialMap((m) => ({ ...m, [id]: fn(m[id] ?? EMPTY_SOCIAL) }));
  }, []);

  const scrollToGrid = useCallback(() => {
    document.getElementById("us-tabs")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const onNav = useCallback(
    (k: NavKind) => {
      const who = data.from || "they";
      switch (k) {
        case "messages":
          return open({ kind: "dms" });
        case "notifications":
          return toast(`${data.handle} liked your existence ❤️`);
        case "home":
          return toast("home is wherever they are 🏠");
        case "search":
          return toast("stop searching. you found them 🔎");
        case "explore":
          return toast("nothing out there beats this 🧭");
        case "clips":
          setTab("clips");
          return scrollToGrid();
        case "create":
          return toast(`only ${who} gets to post here ✍️`);
        case "profile":
          return window.scrollTo({ top: 0, behavior: "smooth" });
        case "more":
        case "switch":
          return open({ kind: "options" });
      }
    },
    [data.from, data.handle, open, toast, scrollToGrid],
  );

  const actions: HeaderActions = {
    onStory: () => open({ kind: "story", index: 0 }),
    onFollowing: () => open({ kind: "following" }),
    onMessage: () => open({ kind: "dms" }),
    onFollowers: () => open({ kind: "followers" }),
    onFollowingList: () => open({ kind: "followingList" }),
    onPosts: scrollToGrid,
    onNote: () => toast(`💭 ${data.from ? `${data.from}: ` : ""}${data.note}`),
    onSuggest: () => toast("suggested for you: more of them 🫶"),
    onMore: () => open({ kind: "options" }),
    storySeen,
  };

  // Clear of the editor's floating bar in the editor, of the tab bar on phones.
  const letterBottom = web ? (mode === "demo" ? 84 : 28) : mode === "demo" ? 124 : 66;

  const body = (
    <>
      <ProfileHeader data={data} a={actions} />
      <Highlights items={data.highlights} onOpen={(i) => open({ kind: "story", index: i })} />
      <div id="us-tabs" style={{ scrollMarginTop: web ? 0 : 44 }}>
        <Tabs active={tab} onSelect={setTab} />
      </div>
      {tab === "grid" ? <Grid posts={posts} pinned={data.pinnedPostIds} onOpen={(i) => open({ kind: "post", index: i })} /> : <EmptyTab tab={tab} to={data.to} />}
    </>
  );

  return (
    <div className="us-app">
      <style dangerouslySetInnerHTML={{ __html: ALL_CSS }} />

      <MobileTopBar handle={data.handle} onNav={onNav} />
      <Rail avatarUrl={data.avatarUrl} avatarCrop={data.avatarCrop} onNav={onNav} unread={!dmRead && data.dms.length > 0} />

      <main
        className="us-web"
        style={{ paddingBottom: web ? 0 : `calc(${50 + (mode === "demo" ? 70 : 12)}px + env(safe-area-inset-bottom, 0px))` }}
      >
        <div className="us-wrap">{body}</div>
        <WebFooter from={data.from} />
      </main>

      <BottomNav avatarUrl={data.avatarUrl} avatarCrop={data.avatarCrop} onNav={onNav} />

      {overlay?.kind === "post" ? (
        <PostViewer
          data={data}
          posts={posts}
          start={overlay.index}
          web={web}
          social={social}
          setSocial={setSocial}
          onClose={requestClose}
          onToast={toast}
        />
      ) : null}
      {overlay?.kind === "story" ? (
        <StoryViewer
          data={data}
          highlights={data.highlights}
          start={overlay.index}
          web={web}
          onClose={requestClose}
          onToast={toast}
          onSeen={() => setStorySeen(true)}
        />
      ) : null}
      {overlay?.kind === "dms" ? <DMs data={data} web={web} onClose={requestClose} onToast={toast} /> : null}
      {overlay?.kind === "following" ? <FollowingMenu data={data} onClose={requestClose} onToast={toast} /> : null}
      {overlay?.kind === "followers" ? <FollowersSheet data={data} onClose={requestClose} onToast={toast} /> : null}
      {overlay?.kind === "followingList" ? <FollowingSheet data={data} onClose={requestClose} /> : null}
      {overlay?.kind === "options" ? (
        <OptionsMenu
          onClose={requestClose}
          items={[
            { label: "Messages", onClick: () => swap({ kind: "dms" }) },
            { label: "Close friends ★", onClick: () => toast("list: 1 person. you know who.") },
            { label: "Archive", onClick: () => toast("we don't archive. we keep everything 🗂️") },
            { label: "Your activity", onClick: () => toast("screen time: mostly staring at this profile") },
            { label: "Log out", red: true, onClick: () => toast("you can't log out of love. sorry 💍") },
          ]}
        />
      ) : null}

      {toastUp ? (
        <div role="status" className="us-toast" key={toastText}>
          {toastText}
        </div>
      ) : null}

      {data.letter.trim() ? (
        <LetterPop
          letter={data.letter}
          from={data.from || undefined}
          to={data.to || undefined}
          question={data.lockQuestion || undefined}
          answer={data.lockAnswer || undefined}
          accent="#FF3D7F"
          accent2="#FF9A6B"
          paper="#FFFAF7"
          ink="#26141B"
          bottom={letterBottom}
          right={web ? 24 : 14}
          teaser={`1 new letter${data.from ? ` from ${data.from}` : ""} 💌`}
          zIndex={overlay ? 20 : 155}
          variant="us"
          avatar={data.avatarUrl || undefined}
          handle={data.handle || undefined}
          photos={data.posts.map((p) => p.imageUrl)}
        />
      ) : null}
    </div>
  );
}
