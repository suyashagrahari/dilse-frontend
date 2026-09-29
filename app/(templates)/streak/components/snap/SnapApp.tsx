"use client";

// The parody camera-chat app. Phone: five tabs under a bottom bar, chat and
// the friendship profile slide in over them. Tablet/desktop: the web app's
// layout — an icon rail, the chat list, and a pane that holds the camera (in
// a phone-shaped frame), the conversation, the profile or a feed.
//
// The session (the ledger, the check-in, the both-in moment) lives in
// StreakTemplate; this file turns it into screens.

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import type { Ctx, Tab, ViewerSpec } from "./ctx";
import { C } from "./tokens";
import { SNAP_CSS } from "./styles";
import Bitmoji from "./Bitmoji";
import { AppMark, IcCamera, IcChat, IcMap, IcMemories, IcSpot, IcStories } from "./icons";
import Camera from "./Camera";
import Compose from "./Compose";
import Viewer from "./Viewer";
import ChatList from "./ChatList";
import Conversation from "./Conversation";
import Profile from "./Profile";
import MapView from "./MapView";
import { SpotlightTab, StoriesTab } from "./Stories";
import { Celebration, Memories, MilestoneLetter } from "./Overlays";
import LetterPop from "../../../_love/LetterPop";
import { bestFriendEmoji, handleFor, type StreakPageData } from "../skin";
import { noteViewFor, type Side } from "../types";
import type { MomentState, TodayView } from "../streakStore";

const WIDE_Q = "(min-width: 768px)";
const subWide = (cb: () => void) => {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const m = window.matchMedia(WIDE_Q);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};
const getWide = () => (typeof window !== "undefined" && !!window.matchMedia?.(WIDE_Q).matches);
const getWideServer = () => false;

export interface SnapAppProps {
  page: StreakPageData;
  me: Side;
  today: string;
  todayView: TodayView;
  moment: MomentState | null;
  mode: "demo" | "live";
  reduced: boolean;
  hideLetter?: boolean;
  onSend: (word: string, note: string, photoUrl?: string) => void;
  onMomentDone: () => void;
  onRestore: (date: string) => void;
  onOpenMilestone: (atDay: number) => void;
}

type Overlay =
  | { k: "compose"; photo: number; lens: number }
  | { k: "viewer"; spec: ViewerSpec }
  | { k: "memories" }
  | { k: "milestone"; atDay: number }
  | null;

export default function SnapApp(p: SnapAppProps) {
  const { page, me, today, todayView } = p;
  const wide = useSyncExternalStore(subWide, getWide, getWideServer);
  const [tab, setTab] = useState<Tab>("camera");
  const [pane, setPane] = useState<"camera" | "convo" | "profile" | "stories" | "spotlight" | "map">("camera");
  const [slide, setSlide] = useState<"convo" | "profile" | null>(null);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [openedToday, setOpenedToday] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ id: number; text: string } | null>(null);
  const [sent, setSent] = useState<number>(0);
  const [letterForce, setLetterForce] = useState(false);
  const [now] = useState(() => Date.now());

  const them: Side = me === "a" ? "b" : "a";
  const view = todayView.view;
  const photos = page.photos;

  const toast = useCallback((text: string) => {
    const id = Date.now();
    setToastMsg({ id, text });
    window.setTimeout(() => setToastMsg((t) => (t?.id === id ? null : t)), 2600);
  }, []);

  const go = useCallback(
    (t: Tab) => {
      setSlide(null);
      if (wide) setPane(t === "chat" ? "camera" : t);
      else setTab(t);
    },
    [wide],
  );

  const openConvo = useCallback(() => (wide ? setPane("convo") : setSlide("convo")), [wide]);
  const openProfile = useCallback(() => (wide ? setPane("profile") : setSlide("profile")), [wide]);

  const openTodaySnap = useCallback(() => {
    const day = page.checkIns.find((d) => d.date === today);
    const e = day?.[them];
    if (!e) {
      openConvo();
      return;
    }
    setOpenedToday(true);
    const nv = noteViewFor(day, me, page.pair);
    const pic = e.photoUrl
      ? photos.find((x) => x.url === e.photoUrl) ?? { url: e.photoUrl }
      : photos.length
        ? photos[(today.charCodeAt(9) || 0) % photos.length]
        : undefined;
    const items: ViewerSpec["items"] = [
      { photo: pic, bg: "linear-gradient(160deg,#FF8BB8,#7C5CFF)", caption: e.word || "🔥", secs: 6 },
    ];
    if (nv.state === "locked") items.push({ locked: true, bg: "linear-gradient(160deg,#3B2266,#A05DCD)" });
    if (nv.state === "open") items.push({ bg: "linear-gradient(160deg,#FF7AB6,#A05DCD 60%,#5B8CFF)", caption: nv.text, sub: "🔓 their secret line — unlocked because you snapped back", secs: 8 });
    setOverlay({ k: "viewer", spec: { kind: "snap", from: them, time: "today", items } });
  }, [page, today, them, me, photos, openConvo]);

  const letterBottom = wide ? 18 : tab === "camera" && !slide ? 176 : slide === "convo" ? 76 : 74;

  const ctx: Ctx = useMemo(
    () => ({
      data: page,
      me,
      them,
      meP: page.pair[me],
      themP: page.pair[them],
      meAvatar: me === "a" ? page.avatarA : page.avatarB,
      themAvatar: them === "a" ? page.avatarA : page.avatarB,
      meHandle: handleFor(me === "a" ? page.handleA : page.handleB, page.pair[me].name),
      themHandle: handleFor(them === "a" ? page.handleA : page.handleB, page.pair[them].name),
      today,
      todayView,
      view,
      now,
      photos,
      bff: bestFriendEmoji(view.record),
      hourglass: view.status === "active" && view.count > 0 && !(todayView.mineIn && todayView.theirsIn) && !todayView.covered,
      openedToday,
      wide,
      reduced: p.reduced,
      mode: p.mode,
      go,
      openConvo,
      openProfile,
      openTodaySnap,
      openViewer: (spec) => setOverlay({ k: "viewer", spec }),
      openMemories: () => setOverlay({ k: "memories" }),
      openCompose: (photo, lens) => setOverlay({ k: "compose", photo, lens }),
      send: (word, note, photoUrl) => {
        p.onSend(word, note, photoUrl);
        setSent(Date.now());
        window.setTimeout(() => setSent(0), 2400);
      },
      toast,
      openLetter: () => {
        setLetterForce(true);
        window.setTimeout(() => setLetterForce(false), 400);
      },
      openMilestone: (atDay) => {
        p.onOpenMilestone(atDay);
        setOverlay({ k: "milestone", atDay });
      },
      restore: () => {
        if (view.missedDay && (page.covers[me] ?? 0) > 0) {
          p.onRestore(view.missedDay);
          toast("❤️‍🩹 restored. the fire never went out");
        } else {
          go("camera");
          toast("no restores left — snap them and it picks right back up 🔥");
        }
      },
    }),
    [page, me, them, today, todayView, view, now, photos, openedToday, wide, p, go, openConvo, openProfile, openTodaySnap, toast],
  );

  const badge = todayView.theirsIn && !openedToday ? 1 : 0;
  const moment = p.moment && p.moment.phase !== "settled" ? p.moment : null;
  const letterAt = moment ? page.milestones.find((m) => m.atDay === moment.day && m.letter.trim())?.atDay : undefined;

  const NAVS: { id: Tab; label: string; color: string; icon: (on: boolean, c: string) => React.ReactNode }[] = [
    { id: "map", label: "Map", color: C.map, icon: (on, c) => <IcMap size={26} color={c} fill={on} /> },
    { id: "chat", label: "Chat", color: C.chat, icon: (on, c) => <IcChat size={26} color={c} fill={on} /> },
    { id: "camera", label: "Camera", color: C.yellow, icon: (on, c) => <IcCamera size={27} color={c} fill={on} /> },
    { id: "stories", label: "Stories", color: C.purple, icon: (on, c) => <IcStories size={26} color={c} fill={on} /> },
    { id: "spotlight", label: "For You", color: C.spot, icon: (on, c) => <IcSpot size={25} color={c} fill={on} /> },
  ];

  const overlays = (
    <>
      {overlay?.k === "compose" && <Compose ctx={ctx} photoIndex={overlay.photo} lens={overlay.lens} onClose={() => setOverlay(null)} />}
      {overlay?.k === "viewer" && <Viewer key={JSON.stringify(overlay.spec.items.length) + overlay.spec.kind} ctx={ctx} spec={overlay.spec} onClose={() => setOverlay(null)} />}
      {overlay?.k === "memories" && <Memories ctx={ctx} onClose={() => setOverlay(null)} />}
      {overlay?.k === "milestone" && <MilestoneLetter ctx={ctx} atDay={overlay.atDay} onClose={() => setOverlay(null)} />}
      {moment && (
        <Celebration key={moment.date} ctx={ctx} from={moment.from} to={moment.day} onDone={p.onMomentDone} letterAt={letterAt} />
      )}
      {sent > 0 && !moment && (
        <div className="snSentBanner" role="status">
          <Bitmoji preset={ctx.themAvatar} side={them} photoUrl={ctx.themP.photoUrl} size={30} />
          Sent to {ctx.themP.name || "them"} 🔥
        </div>
      )}
      {toastMsg && (
        <div key={toastMsg.id} className="snToast" role="status">
          {toastMsg.text}
        </div>
      )}
      {page.letter.trim() && !p.hideLetter && (
        <LetterPop
          letter={page.letter}
          from={page.pair.a.name || undefined}
          to={page.pair.b.name || undefined}
          question={page.lockQuestion || undefined}
          answer={page.lockAnswer || "obviously 🔥"}
          accent="#FF3B5C"
          accent2="#FFB020"
          paper="#FFFFFF"
          ink={C.ink}
          bottom={letterBottom}
          right={wide ? 22 : 14}
          delay={2600}
          teaser={`${page.pair.a.name || "someone"} sent you a snap 💌`}
          variant="streak"
          photos={photos.map((x) => x.url)}
          title="Streaks"
          handle={handleFor(page.handleA, page.pair.a.name)}
          sign="saved in chat forever 💛"
          forceOpen={letterForce}
        />
      )}
    </>
  );

  if (wide) {
    return (
      <div className="snApp">
        <style>{SNAP_CSS}</style>
        <div className="snWide">
          <nav className="snRailNav" aria-label="Sections">
            <span className="snMark"><AppMark size={40} /></span>
            {(
              [
                { id: "camera", label: "Camera", icon: <IcCamera size={24} />, c: "#111" },
                { id: "convo", label: "Chat", icon: <IcChat size={24} />, c: C.chat },
                { id: "stories", label: "Stories", icon: <IcStories size={24} />, c: C.purple },
                { id: "spotlight", label: "For You", icon: <IcSpot size={23} />, c: C.spot },
                { id: "map", label: "Map", icon: <IcMap size={24} />, c: C.map },
              ] as const
            ).map((n) => (
              <button
                key={n.id}
                type="button"
                className={pane === n.id ? "is-on" : ""}
                style={pane === n.id ? { color: n.c } : undefined}
                onClick={() => setPane(n.id)}
                aria-label={n.label}
                title={n.label}
              >
                {n.icon}
                {n.id === "convo" && badge > 0 && <span className="snNavBadge">{badge}</span>}
              </button>
            ))}
            <button type="button" onClick={() => setOverlay({ k: "memories" })} aria-label="Memories" title="Memories">
              <IcMemories size={24} />
            </button>
          </nav>
          <section className="snListCol">
            <ChatList ctx={ctx} embedded />
          </section>
          <main className="snPane">
            {pane === "camera" && (
              <>
                <div className="snPaneFrame"><Camera ctx={ctx} framed /></div>
              </>
            )}
            {pane === "convo" && <Conversation ctx={ctx} embedded onBack={() => setPane("camera")} />}
            {pane === "profile" && <Profile ctx={ctx} embedded onBack={() => setPane("convo")} />}
            {pane === "stories" && <StoriesTab ctx={ctx} />}
            {pane === "spotlight" && <div className="snPaneFrame"><SpotlightTab ctx={ctx} /></div>}
            {pane === "map" && <MapView ctx={ctx} />}
          </main>
        </div>
        {overlays}
      </div>
    );
  }

  const dark = tab === "camera" || tab === "spotlight" || tab === "map";
  return (
    <div className="snApp">
      <style>{SNAP_CSS}</style>
      <div className="snPhone">
        <div className={`snTab${tab === "camera" ? " is-full" : ""}`}>
          {tab === "camera" && <Camera ctx={ctx} />}
          {tab === "chat" && <ChatList ctx={ctx} />}
          {tab === "stories" && <StoriesTab ctx={ctx} />}
          {tab === "spotlight" && <SpotlightTab ctx={ctx} />}
          {tab === "map" && <MapView ctx={ctx} />}
        </div>
        <nav className={`snNav ${tab === "camera" ? "is-dark" : dark ? "is-solid-dark" : "is-light"}`} aria-label="Tabs">
          {NAVS.map((n) => {
            const on = tab === n.id;
            const c = on ? n.color : dark ? "rgba(255,255,255,.9)" : "#9A9CA0";
            return (
              <button key={n.id} type="button" onClick={() => go(n.id)} aria-label={n.label} aria-current={on ? "page" : undefined}>
                {n.icon(on, c)}
                {n.id === "chat" && badge > 0 && <span className="snNavBadge">{badge}</span>}
              </button>
            );
          })}
        </nav>
        {slide === "convo" && (
          <div className="snSlide">
            <Conversation ctx={ctx} onBack={() => setSlide(null)} />
          </div>
        )}
        {slide === "profile" && (
          <div className="snSlide">
            <Profile ctx={ctx} onBack={() => setSlide(null)} />
          </div>
        )}
      </div>
      {overlays}
    </div>
  );
}
