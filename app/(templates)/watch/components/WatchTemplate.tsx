"use client";

// ─── Watch ───────────────────────────────────────────────────────────────────
//
// A watch page made for one person. The layout follows a real watch page at
// every width:
//
//   • phone (<760): header scrolls away, the player sticks to the top, then
//     title → "...more" meta line → channel row → scrolling action pills →
//     comments teaser → up-next feed with the Moments shelf.
//   • tablet (760–999): theatre-style — the player in a full-bleed black band,
//     everything else in one column below, up-next as a two-column grid.
//   • desktop (≥1000): player left + a 402px right column (engagement panel,
//     chips, up next); a theatre toggle moves the player into a full-width
//     band. One CSS grid does all of it, so the player never remounts.
//
// Our chrome is ours: the "us." wordmark with a heart, a pink accent, glyphs
// drawn in icons.tsx. The only third-party marks are inside the embedded
// player in link mode, which are never covered.

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAppSelector } from "@/store/hooks";
import ModerationQueue from "@/components/contrib/ModerationQueue";
import LetterPop from "../../_love/LetterPop";
import ChannelActions, { CA_CSS, type BellLevel } from "./ChannelActions";
import Comments, { COMMENTS_CSS, CommentsTeaser } from "./Comments";
import DescriptionBox, { DESCRIPTION_CSS } from "./DescriptionBox";
import FilmPlayer, { FILM_CSS, type PlayerHandle, type UpNext as UpNextInfo } from "./FilmPlayer";
import MomentsViewer, { MOMENTS_CSS } from "./MomentsViewer";
import Panel, { PANEL_CSS } from "./Panel";
import Pic from "./Pic";
import PlayerFrame, { PLAYER_CSS, useWatchPlayer } from "./PlayerFrame";
import ShareCard, { SHARE_CARD_CSS, exportShareCard } from "./ShareCard";
import Sheet, { SHEET_CSS } from "./Sheet";
import UpNext, { UPNEXT_CSS, type MomentCard } from "./UpNext";
import { useWatchQueue, usePublishedComments } from "./contrib";
import { WATCH_FONT_VARS } from "./fonts";
import { FONT, T } from "./theme";
import { Avatar, BURST_CSS, compact, compactViews } from "./ui";
import {
  IBell,
  ICast,
  ICheck,
  IHome,
  IMail,
  IMenu,
  IMic,
  IMoments,
  IPlus,
  ISearch,
  ISubs,
  IYou,
  Mark,
} from "./icons";
import {
  FRAME_SECONDS,
  WORDMARK,
  displayChapters,
  filmFrames,
  formatTimestamp,
  isFilm,
  photoAt,
  publishedComments,
  type Chapter,
  type Comment,
  type Frame,
  type RelatedVideo,
  type WatchData,
} from "./types";

export interface WatchTemplateProps {
  data: WatchData;
  mode: "preview" | "live";
  shareId?: string | null;
  hasPassword?: boolean;
  /** The friends' WRITE link. Owner-side only. */
  contribToken?: string | null;
  /** Live, published link. The share sheet copies this when it exists. */
  shareUrl?: string | null;
}

interface ToastItem {
  id: number;
  message: string;
}

type PanelKind = null | "chapters" | "transcript" | "description" | "comments";
type SheetKind = null | "share" | "bell" | "save" | "more" | "subscription" | "unsub" | "search";

const MEMORY_SECONDS = 9;

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "");

export default function WatchTemplate({ data, mode, shareId, contribToken, shareUrl }: WatchTemplateProps) {
  const live = mode === "live";
  const { isAuthenticated, accessToken } = useAppSelector((s) => s.auth);

  // ── Toasts ────────────────────────────────────────────────────────────────
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastId = useRef(0);
  const pushToast = useCallback((message: string) => {
    const id = (toastId.current += 1);
    setToasts((prev) => [...prev.slice(-2), { id, message }]);
    window.setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 2800);
  }, []);

  // ── Page state ────────────────────────────────────────────────────────────
  const [theatre, setTheatre] = useState(false);
  const [panel, setPanel] = useState<PanelKind>(null);
  const [sheet, setSheet] = useState<SheetKind>(null);
  const [drawer, setDrawer] = useState(false);
  const [active, setActive] = useState<{ item: RelatedVideo; i: number } | null>(null);
  const [chapterIdx, setChapterIdx] = useState(-1);
  const [subscribed, setSubscribed] = useState(false);
  const [bell, setBell] = useState<BellLevel>("all");
  const [saved, setSaved] = useState<Record<string, boolean>>({ "Watch later (forever)": true });
  const [moment, setMoment] = useState<number | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [startAt, setStartAt] = useState<{ t: number; key: number } | null>(null);
  const [forceLetter, setForceLetter] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [startAtChecked, setStartAtChecked] = useState(false);

  const handle = useRef<PlayerHandle | null>(null);
  const playerSlot = useRef<HTMLDivElement | null>(null);
  const [playerEl, setPlayerEl] = useState<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1000px)");
    const on = () => setIsDesktop(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  // The desktop engagement panel is as tall as the player.
  useEffect(() => {
    const el = playerSlot.current;
    const shell = shellRef.current;
    if (!el || !shell || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => shell.style.setProperty("--wt-player-h", `${Math.round(el.getBoundingClientRect().height)}px`));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ── Derived ───────────────────────────────────────────────────────────────
  const film = isFilm(data);
  const frames: Frame[] = useMemo(() => filmFrames(data), [data]);
  const chapters: Chapter[] = useMemo(() => displayChapters(data), [data]);
  const channelAvatar = data.channel.avatarUrl ? null : photoAt(data, 0);
  const avatarUrl = data.channel.avatarUrl || undefined;
  const thumbFor = useCallback((i: number) => photoAt(data, i + 1), [data]);

  const memoryFrames: Frame[] | null = useMemo(() => {
    if (!active) return null;
    const { item, i } = active;
    const photo = item.thumbnailUrl ? { url: item.thumbnailUrl } : thumbFor(i);
    return [{ index: 0, start: 0, end: MEMORY_SECONDS, label: item.title, cc: item.note ?? "", photo }];
  }, [active, thumbFor]);

  const title = active ? active.item.title : data.video.title;
  const views = active ? active.item.views : data.video.views;
  const postedAgo = active ? active.item.ago : data.video.postedAgo;
  const hashtags = useMemo(
    () => ["us", slug(data.herName) ? `${slug(data.herName)}andme` : "forever", "notaprank"],
    [data.herName],
  );
  const duration = film ? frames.length * FRAME_SECONDS : 0;

  const liveComments = usePublishedComments(shareId, live);
  const shownComments: Comment[] = useMemo(
    () => (active ? [] : [...publishedComments(data), ...liveComments]),
    [active, data, liveComments],
  );
  const commentCount = shownComments.length + (data.pinnedComment && !active ? 1 : 0);

  const moments: MomentCard[] = useMemo(
    () =>
      data.photos.map((p, i) => ({
        photo: p,
        caption: p.caption || frames[i]?.label || "us",
        hearts: compact(1200 + ((i * 7919) % 8800)),
      })),
    [data.photos, frames],
  );

  // ── Player plumbing ───────────────────────────────────────────────────────
  const scrollToPlayer = useCallback(() => {
    const el = playerSlot.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.top < 0 || r.top > window.innerHeight * 0.6) {
      window.scrollTo({ top: Math.max(0, window.scrollY + r.top - 64), behavior: "smooth" });
    }
  }, []);

  const seek = useCallback(
    (s: number) => {
      setPanel((p) => (p === "description" || p === "comments" ? null : p));
      if (active) {
        setActive(null);
        setStartAt({ t: s, key: Date.now() });
      } else {
        handle.current?.seek(s);
      }
      scrollToPlayer();
    },
    [active, scrollToPlayer],
  );

  const pickMemory = useCallback(
    (item: RelatedVideo, i: number) => {
      setActive({ item, i });
      setChapterIdx(-1);
      setPanel((p) => (p === "chapters" || p === "transcript" ? null : p));
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [],
  );

  const backToMain = useCallback(() => {
    setActive(null);
    setStartAt(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const upNext: UpNextInfo | null = useMemo(() => {
    if (!active) {
      const r = data.related[0];
      return r ? { title: r.title, channel: r.channel || data.channel.name, photo: r.thumbnailUrl ? { url: r.thumbnailUrl } : thumbFor(0) } : null;
    }
    const n = data.related[active.i + 1];
    if (n) return { title: n.title, channel: n.channel || data.channel.name, photo: n.thumbnailUrl ? { url: n.thumbnailUrl } : thumbFor(active.i + 1) };
    return { title: data.video.title, channel: data.channel.name, photo: photoAt(data, 0) };
  }, [active, data, thumbFor]);

  const onUpNext = useCallback(() => {
    if (!active) {
      if (data.related[0]) pickMemory(data.related[0], 0);
      return;
    }
    const n = data.related[active.i + 1];
    if (n) pickMemory(n, active.i + 1);
    else backToMain();
  }, [active, data.related, pickMemory, backToMain]);

  const openLetter = useCallback(() => {
    setSheet(null);
    setForceLetter(true);
    window.setTimeout(() => setForceLetter(false), 60);
  }, []);

  // ── Owner-only ────────────────────────────────────────────────────────────
  const queue = useWatchQueue(shareId, accessToken, live && isAuthenticated);
  const showQueue = live && isAuthenticated && queue.items.length > 0;
  const friendsLink =
    contribToken && typeof window !== "undefined" ? `${window.location.origin}/watch/comment/${contribToken}` : null;

  const topThree = useMemo(
    () =>
      [...(data.pinnedComment ? [data.pinnedComment] : []), ...publishedComments(data)]
        .sort((a, b) => b.likes - a.likes)
        .slice(0, 3),
    [data],
  );

  const download = useCallback(async () => {
    setDownloading(true);
    const ok = await exportShareCard(cardRef.current, "watch-card.png");
    setDownloading(false);
    pushToast(ok ? "Downloaded ♥ — it's in your files" : "Couldn't make the card — try again.");
  }, [pushToast]);

  const link =
    shareUrl ?? (typeof window !== "undefined" ? window.location.href.split("?")[0] : "https://subhsandesh.in/watch");
  const startSeconds = chapterIdx >= 0 && chapters[chapterIdx] ? chapters[chapterIdx].seconds : 0;
  const shareLink = startAtChecked && startSeconds > 0 ? `${link}${link.includes("?") ? "&" : "?"}t=${startSeconds}` : link;

  const copy = useCallback(
    (text: string, done: string) => {
      navigator.clipboard
        .writeText(text)
        .then(() => pushToast(done))
        .catch(() => pushToast("Couldn't copy — long-press it instead."));
    },
    [pushToast],
  );

  // ── Player element ────────────────────────────────────────────────────────
  const endLine = data.letter.trim()
    ? `psst${data.herName ? ` ${data.herName}` : ""} — there's a letter waiting in the corner ↘`
    : "that's the whole thing. watch it again?";

  const player = memoryFrames ? (
    <FilmPlayer
      key={`mem-${active?.item.id}`}
      frames={memoryFrames}
      frameSeconds={MEMORY_SECONDS}
      title={title}
      theatre={theatre}
      onTheatre={isDesktop ? () => setTheatre((v) => !v) : undefined}
      onToast={pushToast}
      upNext={upNext}
      onUpNext={onUpNext}
      handleRef={handle}
      autoPlay
    />
  ) : film ? (
    <FilmPlayer
      key={`main-${startAt?.key ?? 0}-${frames.length}`}
      frames={frames}
      title={title}
      theatre={theatre}
      onTheatre={isDesktop ? () => setTheatre((v) => !v) : undefined}
      onChapter={setChapterIdx}
      onOpenChapters={() => setPanel("chapters")}
      onToast={pushToast}
      upNext={upNext}
      onUpNext={onUpNext}
      endLine={endLine}
      handleRef={handle}
      autoPlay={!!startAt}
      startAt={startAt?.t ?? 0}
    />
  ) : (
    <EmbedPlayer data={data} chapters={chapters} onChapter={setChapterIdx} handleRef={handle} title={title} />
  );

  // ── Panel contents ────────────────────────────────────────────────────────
  const chapterPhoto = useCallback((i: number) => (film ? frames[i]?.photo ?? null : photoAt(data, i)), [film, frames, data]);

  const panelBody =
    panel === "chapters" ? (
      <ol className="wt-pn-list">
        {chapters.map((c, i) => (
          <li key={`pc-${i}`}>
            <button type="button" className={`wt-pn-ch${i === chapterIdx ? " is-now" : ""}`} onClick={() => seek(c.seconds)}>
              <span className="wt-pn-ch-img">
                <Pic photo={chapterPhoto(i)} />
              </span>
              <span className="wt-pn-ch-t">
                <b>{c.label}</b>
                <small>{formatTimestamp(c.seconds)}</small>
              </span>
            </button>
          </li>
        ))}
      </ol>
    ) : panel === "transcript" ? (
      <ol className="wt-pn-list">
        {chapters.filter((c) => c.cc).map((c) => {
          const i = chapters.indexOf(c);
          return (
            <li key={`pt-${i}`}>
              <button type="button" className={`wt-pn-tr${i === chapterIdx ? " is-now" : ""}`} onClick={() => seek(c.seconds)}>
                <time>{formatTimestamp(c.seconds)}</time>
                <span>{c.cc}</span>
              </button>
            </li>
          );
        })}
      </ol>
    ) : panel === "description" ? (
      <DescriptionBox
        mode="sheet"
        title={title}
        likes={data.video.likes}
        views={views}
        postedAgo={postedAgo}
        hashtags={hashtags}
        intro={active ? [active.item.note ?? ""].filter(Boolean) : data.description.intro}
        chapters={active ? [] : chapters}
        outro={active ? [] : data.description.outro}
        chapterPhoto={chapterPhoto}
        activeChapter={chapterIdx}
        onSeek={seek}
        onViewChapters={() => setPanel("chapters")}
        onTranscript={film ? () => setPanel("transcript") : undefined}
        channelName={data.channel.name}
        channelAvatar={channelAvatar}
        channelAvatarUrl={avatarUrl}
        subscribers={data.channel.subscribers}
        maxSeek={film ? duration : undefined}
      />
    ) : panel === "comments" ? (
      <div className="wt-pn-pad">
        <Comments
          comments={shownComments}
          pinnedComment={active ? undefined : data.pinnedComment}
          channelName={data.channel.name}
          channelHandle={data.channel.handle}
          channelAvatar={channelAvatar}
          channelAvatarUrl={avatarUrl}
          onToast={pushToast}
          onSeek={seek}
          maxSeek={film ? duration : undefined}
          contributorPrompt={live && !active ? data.contributorPrompt : undefined}
          turnedOff={!!active}
          compactHead
        />
      </div>
    ) : null;

  const panelTitle =
    panel === "chapters"
      ? "Chapters"
      : panel === "transcript"
        ? "Transcript"
        : panel === "description"
          ? "Description"
          : panel === "comments"
            ? "Comments"
            : "";
  const panelSub = panel === "comments" ? compact(commentCount) : panel === "chapters" ? `${chapters.length}` : undefined;

  // Desktop shows description & comments inline; only chapters/transcript use the column panel.
  const columnPanel = isDesktop && (panel === "chapters" || panel === "transcript");
  const sheetPanel = !isDesktop && panel !== null;

  return (
    <div ref={shellRef} className={`wt-shell ${WATCH_FONT_VARS}${theatre ? " is-theatre" : ""}`}>
      <style>{CSS}</style>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="wt-bar">
        <button type="button" className="wt-bar-icon wt-only-desk" onClick={() => setDrawer(true)} aria-label="Guide">
          <IMenu size={24} color={T.ink} />
        </button>
        <a
          className="wt-logo"
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          aria-label={`${WORDMARK} home`}
        >
          <Mark size={27} />
          <span className="wt-logo-t">{WORDMARK}</span>
          <sup>IN</sup>
        </a>

        <form
          className="wt-search"
          onSubmit={(e) => {
            e.preventDefault();
            pushToast(`0 results for anyone else. only ${data.herName || "you"}.`);
          }}
          role="search"
        >
          <div className="wt-search-box">
            <input className="wt-search-input" placeholder="Search" aria-label="Search" />
          </div>
          <button type="submit" className="wt-search-go" aria-label="Search">
            <ISearch size={22} color={T.ink} />
          </button>
          <button type="button" className="wt-mic" aria-label="Search with your voice" onClick={() => pushToast("listening… you said “I love you”? same.")}>
            <IMic size={22} color={T.ink} />
          </button>
        </form>

        <span className="wt-bar-flex" />

        {live ? (
          <Link href="/templates" className="wt-brand" aria-label="Made with SubhSandesh — make your own">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.webp" alt="" width={20} height={20} />
            <span>SubhSandesh</span>
          </Link>
        ) : (
          <button type="button" className="wt-bar-icon wt-only-mob" aria-label="Cast" onClick={() => pushToast("casting to the TV in her heart…")}>
            <ICast size={24} color={T.ink} />
          </button>
        )}
        <button type="button" className="wt-create wt-only-desk" onClick={() => pushToast("you already made one. this one.")}>
          <IPlus size={22} color={T.ink} /> Create
        </button>
        <button type="button" className="wt-bar-icon wt-bell" onClick={() => setSheet("bell")} aria-label="Notifications, 1 new">
          <IBell size={24} color={T.ink} />
          <span className="wt-bell-dot" aria-hidden="true">1</span>
        </button>
        <button type="button" className="wt-bar-icon wt-only-mob" onClick={() => setSheet("search")} aria-label="Search">
          <ISearch size={24} color={T.ink} />
        </button>
        <button type="button" className="wt-bar-avatar" onClick={() => pushToast(`signed in as ${data.herName || "the one"} ♥`)} aria-label="Account">
          <span className="wt-bar-avatar-in">{(data.herName || "U").slice(0, 1).toUpperCase()}</span>
        </button>
      </header>

      {/* ── Body ───────────────────────────────────────────────────────── */}
      <main className="wt-main">
        <div className={`wt-grid${theatre ? " is-theatre" : ""}`}>
          <div
            className="wt-player-slot"
            ref={(el) => {
              playerSlot.current = el;
              setPlayerEl(el);
            }}
          >
            {player}
          </div>

          <div className="wt-info">
            <h1 className="wt-title">{title}</h1>

            {active ? (
              <button type="button" className="wt-back" onClick={backToMain}>
                ← back to “{data.video.title}”
              </button>
            ) : null}

            <button type="button" className="wt-metaline wt-only-mob-tab" onClick={() => setPanel("description")}>
              <span>{compactViews(views)}</span>
              <span>{postedAgo}</span>
              <span className="wt-metaline-tag">#{hashtags[0]}</span>
              <b>...more</b>
            </button>

            <ChannelActions
              name={data.channel.name}
              subscribers={data.channel.subscribers}
              avatar={channelAvatar}
              avatarUrl={avatarUrl}
              likes={data.video.likes}
              subscribed={subscribed}
              bell={bell}
              onSubscribe={() => {
                setSubscribed(true);
                pushToast("Subscription added ♥");
              }}
              onOpenSubscription={() => setSheet("subscription")}
              onShare={() => setSheet("share")}
              onDownload={download}
              downloading={downloading}
              onSave={() => setSheet("save")}
              onMore={() => setSheet("more")}
              onToast={pushToast}
            />

            <div className="wt-only-desk">
              <DescriptionBox
                key={active?.item.id ?? "main"}
                views={views}
                postedAgo={postedAgo}
                hashtags={hashtags}
                intro={active ? [active.item.note ?? ""].filter(Boolean) : data.description.intro}
                chapters={active ? [] : chapters}
                outro={active ? [] : data.description.outro}
                chapterPhoto={chapterPhoto}
                activeChapter={chapterIdx}
                onSeek={seek}
                onViewChapters={() => setPanel("chapters")}
                onTranscript={film ? () => setPanel("transcript") : undefined}
                channelName={data.channel.name}
                channelAvatar={channelAvatar}
                channelAvatarUrl={avatarUrl}
                subscribers={data.channel.subscribers}
                maxSeek={film ? duration : undefined}
              />
            </div>

            <div className="wt-only-mob-tab">
              <CommentsTeaser
                count={commentCount}
                top={data.pinnedComment ?? shownComments[0]}
                onOpen={() => setPanel("comments")}
                channelName={data.channel.name}
                channelAvatar={channelAvatar}
                channelAvatarUrl={avatarUrl}
                turnedOff={!!active}
              />
            </div>

            <div className="wt-only-desk">
              <Comments
                comments={shownComments}
                pinnedComment={active ? undefined : data.pinnedComment}
                channelName={data.channel.name}
                channelHandle={data.channel.handle}
                channelAvatar={channelAvatar}
                channelAvatarUrl={avatarUrl}
                onToast={pushToast}
                onSeek={seek}
                maxSeek={film ? duration : undefined}
                contributorPrompt={live && !active ? data.contributorPrompt : undefined}
                turnedOff={!!active}
              />
            </div>

            {friendsLink ? (
              <section className="wt-invite">
                <h3 className="wt-invite-title">Get her friends in the comments</h3>
                <p className="wt-invite-body">
                  One link, as many people as you like. Everything they write waits for you before it goes up.
                </p>
                <div className="wt-invite-row">
                  <code className="wt-invite-link">{friendsLink}</code>
                  <button type="button" className="wt-primary" onClick={() => copy(friendsLink, "Contributor link copied.")}>
                    Copy
                  </button>
                </div>
              </section>
            ) : null}

            {showQueue ? (
              <section className="wt-mod">
                <h3 className="wt-mod-title">Waiting for you</h3>
                <p className="wt-mod-note">Only you can see this. Nothing goes on the page until you say so.</p>
                <ModerationQueue
                  items={queue.items}
                  loading={queue.loading}
                  busyIds={queue.busyIds}
                  onApprove={queue.approve}
                  onReject={queue.reject}
                  onApproveAll={queue.approveAll}
                  approvingAll={queue.approvingAll}
                  emptyTitle="Nothing waiting yet"
                  emptyBody="When one of her friends leaves a comment, it lands here first — you see it before she does."
                  theme={{
                    paper: T.raised,
                    paperDeep: T.chip,
                    edge: T.line,
                    ink: T.ink,
                    inkSoft: T.inkSoft,
                    inkFaint: "#7A7A7A",
                    accent: T.accent,
                    accentInk: "#FFFFFF",
                    danger: "#C9584B",
                    ok: "#4E9C6B",
                    warn: "#C99A3C",
                    font: FONT,
                    serif: 'Georgia, "Times New Roman", Times, serif',
                  }}
                />
              </section>
            ) : null}
          </div>

          <aside className="wt-side">
            {columnPanel ? (
              <Panel variant="column" title={panelTitle} subtitle={panelSub} onClose={() => setPanel(null)}>
                {panelBody}
              </Panel>
            ) : null}
            <UpNext
              items={data.related}
              thumbFor={thumbFor}
              activeId={active?.item.id ?? null}
              onPick={pickMemory}
              onMore={() => setSheet("save")}
              channelName={data.channel.name}
              channelAvatar={channelAvatar}
              channelAvatarUrl={avatarUrl}
              herName={data.herName}
              moments={moments}
              onMoment={setMoment}
              onBackToMain={backToMain}
              mainTitle={data.video.title}
              mainThumb={photoAt(data, 0)}
              mainDuration={film ? formatTimestamp(duration) : ""}
            />
            <p className="wt-footnote">
              {data.herName ? `made for ${data.herName}, ` : "made "}with love by {data.channel.name} ♥
            </p>
          </aside>
        </div>
      </main>

      {sheetPanel ? (
        <>
          <button type="button" className="wt-pn-scrim" aria-label="Close panel" onClick={() => setPanel(null)} />
          <Panel variant="sheet" title={panelTitle} subtitle={panelSub} onClose={() => setPanel(null)} playerEl={playerEl}>
            {panelBody}
          </Panel>
        </>
      ) : null}

      {/* ── Desktop guide drawer ───────────────────────────────────────── */}
      {drawer ? (
        <div className="wt-drawer-root">
          <button type="button" className="wt-drawer-scrim" aria-label="Close guide" onClick={() => setDrawer(false)} />
          <nav className="wt-drawer" aria-label="Guide">
            <div className="wt-drawer-top">
              <button type="button" className="wt-bar-icon" onClick={() => setDrawer(false)} aria-label="Close guide">
                <IMenu size={24} color={T.ink} />
              </button>
              <span className="wt-logo">
                <Mark size={27} />
                <span className="wt-logo-t">{WORDMARK}</span>
                <sup>IN</sup>
              </span>
            </div>
            {[
              { icon: <IHome size={24} color={T.ink} />, label: "Home" },
              { icon: <IMoments size={24} color={T.ink} />, label: "Moments" },
              { icon: <ISubs size={24} color={T.ink} />, label: "Subscriptions" },
            ].map((it, i) => (
              <button
                key={it.label}
                type="button"
                className={`wt-drawer-item${i === 0 ? " is-on" : ""}`}
                onClick={() => {
                  setDrawer(false);
                  if (it.label === "Moments" && moments.length) setMoment(0);
                  else pushToast("every road leads back to this video.");
                }}
              >
                {it.icon}
                {it.label}
              </button>
            ))}
            <hr />
            <p className="wt-drawer-h">Subscriptions</p>
            <button type="button" className="wt-drawer-item" onClick={() => setDrawer(false)}>
              <Avatar photo={channelAvatar} url={avatarUrl} name={data.channel.name} size={24} />
              {data.channel.name}
              <span className="wt-drawer-dot" aria-hidden="true" />
            </button>
            <hr />
            <button type="button" className="wt-drawer-item" onClick={() => { setDrawer(false); openLetter(); }}>
              <IMail size={24} color={T.ink} /> Your letter
            </button>
            <button type="button" className="wt-drawer-item" onClick={() => { setDrawer(false); pushToast("history: just this, on repeat."); }}>
              <IYou size={24} color={T.ink} /> You
            </button>
          </nav>
        </div>
      ) : null}

      {/* ── Sheets ─────────────────────────────────────────────────────── */}
      <Sheet open={sheet === "bell"} title="Notifications" onClose={() => setSheet(null)}>
        {data.letter.trim() ? (
          <button type="button" className="wt-note is-new" onClick={openLetter}>
            <span className="wt-note-dot" aria-hidden="true" />
            <Avatar photo={channelAvatar} url={avatarUrl} name={data.channel.name} size={40} />
            <span className="wt-note-t">
              <b>{data.channel.name} sent you a private letter 💌</b>
              <small>just now · tap to open</small>
            </span>
          </button>
        ) : null}
        <button type="button" className="wt-note" onClick={() => { setSheet(null); handle.current?.play(); scrollToPlayer(); }}>
          <Avatar photo={channelAvatar} url={avatarUrl} name={data.channel.name} size={40} />
          <span className="wt-note-t">
            <b>{data.channel.name} premiered: {data.video.title}</b>
            <small>{data.video.postedAgo}</small>
          </span>
          <span className="wt-note-thumb">
            <Pic photo={photoAt(data, 0)} />
          </span>
        </button>
        {topThree[1] ? (
          <button type="button" className="wt-note" onClick={() => { setSheet(null); setPanel(isDesktop ? null : "comments"); }}>
            <Avatar name={topThree[1].author} size={40} />
            <span className="wt-note-t">
              <b>{topThree[1].author} commented: “{topThree[1].text.slice(0, 70)}{topThree[1].text.length > 70 ? "…" : ""}”</b>
              <small>{topThree[1].ago}</small>
            </span>
          </button>
        ) : null}
      </Sheet>

      <Sheet open={sheet === "share"} title="Share" onClose={() => setSheet(null)}>
        <div className="wt-share-row">
          {[
            { k: "wa", label: "WhatsApp", bg: "#25D366", href: `https://wa.me/?text=${encodeURIComponent(`${title} ♥ ${shareLink}`)}`, glyph: "✆" },
            { k: "mail", label: "Email", bg: "#888", href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(shareLink)}`, glyph: "✉" },
            { k: "irl", label: "Tell her IRL", bg: "#FF3E86", href: "", glyph: "♥" },
          ].map((t) =>
            t.href ? (
              <a key={t.k} className="wt-share-t" href={t.href} target="_blank" rel="noopener noreferrer">
                <span style={{ background: t.bg }}>{t.glyph}</span>
                {t.label}
              </a>
            ) : (
              <button key={t.k} type="button" className="wt-share-t" onClick={() => pushToast("best share option. go hug her.")}>
                <span style={{ background: t.bg }}>{t.glyph}</span>
                {t.label}
              </button>
            ),
          )}
        </div>
        <div className="wt-share-link">
          <input readOnly value={shareLink} aria-label="Link" onFocus={(e) => e.currentTarget.select()} />
          <button type="button" onClick={() => copy(shareLink, "Link copied to clipboard")}>
            Copy
          </button>
        </div>
        {film && startSeconds > 0 ? (
          <label className="wt-share-start">
            <input type="checkbox" checked={startAtChecked} onChange={(e) => setStartAtChecked(e.target.checked)} />
            Start at {formatTimestamp(startSeconds)}
          </label>
        ) : null}
      </Sheet>

      <Sheet open={sheet === "save"} title="Save video to…" onClose={() => setSheet(null)}>
        {["Watch later (forever)", "Favourites ♥", "Things to show our kids", "Proof he's romantic"].map((pl) => (
          <button
            key={pl}
            type="button"
            className="wt-sheet-item"
            role="menuitemcheckbox"
            aria-checked={!!saved[pl]}
            onClick={() => {
              setSaved((s) => ({ ...s, [pl]: !s[pl] }));
              pushToast(saved[pl] ? `Removed from ${pl}` : `Saved to ${pl}`);
            }}
          >
            <span className={`wt-check${saved[pl] ? " is-on" : ""}`}>{saved[pl] ? <ICheck size={16} color="#0F0F0F" /> : null}</span>
            {pl}
          </button>
        ))}
      </Sheet>

      <Sheet open={sheet === "more"} title="More" onClose={() => setSheet(null)}>
        {[
          ["Report", "reported for: being unreasonably cute. no action taken."],
          ["Not interested", "that option isn't available for this video."],
          ["Don't recommend channel", "the algorithm refuses. sorry."],
        ].map(([k, v]) => (
          <button key={k} type="button" className="wt-sheet-item" onClick={() => { setSheet(null); pushToast(v); }}>
            {k}
          </button>
        ))}
      </Sheet>

      <Sheet open={sheet === "subscription"} title="Notifications" onClose={() => setSheet(null)}>
        {(
          [
            ["all", "All", "every time I think of you (constantly)"],
            ["personalized", "Personalized", "only the important stuff. like you."],
            ["none", "None", "you'll still get them. sorry."],
          ] as const
        ).map(([k, label, note]) => (
          <button
            key={k}
            type="button"
            className={`wt-sheet-item wt-bellopt${bell === k ? " is-on" : ""}`}
            onClick={() => {
              setBell(k);
              setSheet(null);
              pushToast(k === "none" ? "notifications off… (they're still on)" : `You'll get ${label.toLowerCase()} notifications`);
            }}
          >
            <IBell size={22} color={T.ink} filled={k === "all"} />
            <span>
              <b>{label}</b>
              <small>{note}</small>
            </span>
          </button>
        ))}
        <button type="button" className="wt-sheet-item" onClick={() => setSheet("unsub")}>
          <span style={{ width: 22, textAlign: "center" }} aria-hidden="true">⊖</span>
          Unsubscribe
        </button>
      </Sheet>

      <Sheet open={sheet === "unsub"} title={`Unsubscribe from ${data.channel.name}?`} onClose={() => setSheet(null)}>
        <p className="wt-sheet-note">This is a lifetime plan. There is no cancel button. There never was.</p>
        <div className="wt-unsub-btns">
          <button type="button" className="wt-unsub-no" onClick={() => setSheet(null)}>
            Stay subscribed ♥
          </button>
          <button type="button" className="wt-unsub-yes" onClick={() => { setSheet(null); pushToast("nice try. still subscribed ♥"); }}>
            Unsubscribe
          </button>
        </div>
      </Sheet>

      <Sheet open={sheet === "search"} title="Search" onClose={() => setSheet(null)}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSheet(null);
            pushToast(`0 results for anyone else. only ${data.herName || "you"}.`);
          }}
          style={{ padding: "4px 12px 12px" }}
        >
          <input className="wt-search-input wt-search-input--sheet" placeholder="Search" aria-label="Search" autoFocus />
        </form>
      </Sheet>

      {moment !== null && moments.length ? (
        <MomentsViewer
          moments={moments}
          start={moment}
          onClose={() => setMoment(null)}
          channelName={data.channel.name}
          channelHandle={data.channel.handle}
          channelAvatar={channelAvatar}
          channelAvatarUrl={avatarUrl}
          subscribed={subscribed}
          onSubscribe={() => {
            setSubscribed(true);
            pushToast("Subscription added ♥");
          }}
          onShare={() => {
            setMoment(null);
            setSheet("share");
          }}
          onToast={pushToast}
        />
      ) : null}

      {/* ── Recipient-only chrome ──────────────────────────────────────── */}
      {live ? (
        <Link href="/templates" className="wt-make">
          <Mark size={16} /> Make your own
        </Link>
      ) : null}

      <div className="wt-toasts" aria-live="polite">
        {toasts.map((t) => (
          <p key={t.id} className="wt-toast">
            {t.message}
          </p>
        ))}
      </div>

      <LetterPop
        letter={data.letter}
        from={data.channel.name}
        to={data.herName || undefined}
        question={data.lockQuestion || undefined}
        answer={data.lockAnswer || undefined}
        accent="#FF3E86"
        accent2="#FF8A5C"
        paper="#FFF8F4"
        ink="#2A1A1F"
        bottom={live ? 18 : 18}
        zIndex={150}
        delay={3200}
        teaser={data.herName ? `${data.herName}, you have 1 new letter 💌` : "you have 1 new letter 💌"}
        forceOpen={forceLetter}
      />

      {/* Off-screen, and the only thing on this page a capture can see. */}
      <ShareCard data={data} topComments={topThree} nodeRef={cardRef} />
    </div>
  );
}

/* ── Link mode: the embedded player ─────────────────────────────────────── */

function EmbedPlayer({
  data,
  chapters,
  onChapter,
  handleRef,
  title,
}: {
  data: WatchData;
  chapters: Chapter[];
  onChapter: (i: number) => void;
  handleRef: { current: PlayerHandle | null };
  title: string;
}) {
  const player = useWatchPlayer(data.video.youtubeId);
  const { seekTo, start, phase, currentTime } = player;

  useEffect(() => {
    handleRef.current = { seek: seekTo, play: () => start() };
    return () => {
      handleRef.current = null;
    };
  }, [handleRef, seekTo, start]);

  const idx = useMemo(() => {
    if (phase === "poster" || phase === "starting") return -1;
    let found = -1;
    for (let i = 0; i < chapters.length; i += 1) {
      if (chapters[i].seconds <= currentTime + 0.25) found = i;
      else break;
    }
    return found;
  }, [chapters, phase, currentTime]);

  useEffect(() => {
    onChapter(idx);
  }, [idx, onChapter]);

  return (
    <PlayerFrame
      player={player}
      videoId={data.video.youtubeId}
      title={title}
      description={data.description}
      related={[]}
      onPickRelated={() => undefined}
      nowLabel={idx >= 0 ? chapters[idx]?.label ?? "" : ""}
    />
  );
}

const CSS = `
${FILM_CSS}
${PLAYER_CSS}
${CA_CSS}
${DESCRIPTION_CSS}
${COMMENTS_CSS}
${UPNEXT_CSS}
${PANEL_CSS}
${MOMENTS_CSS}
${SHEET_CSS}
${SHARE_CARD_CSS}
${BURST_CSS}

.wt-shell {
  min-height: 100dvh; background: ${T.page}; color: ${T.ink}; overflow-x: clip;
  font-family: ${FONT}; -webkit-font-smoothing: antialiased; -webkit-tap-highlight-color: transparent;
}
.wt-shell *, .wt-shell *::before, .wt-shell *::after { box-sizing: border-box; }
.wt-shell h1, .wt-shell h2, .wt-shell h3, .wt-shell h4 { font-family: inherit; letter-spacing: normal; }
.wt-shell button { -webkit-tap-highlight-color: transparent; }

/* Header */
.wt-bar {
  position: relative; z-index: 120; height: 48px; display: flex; align-items: center; gap: 4px;
  padding: 0 4px 0 12px; background: ${T.page};
}
.wt-bar-icon {
  position: relative; width: 40px; height: 40px; flex: none; border: 0; border-radius: 50%;
  background: transparent; display: grid; place-items: center; cursor: pointer;
}
.wt-bar-icon:hover { background: rgba(255,255,255,.1); }
.wt-logo { display: inline-flex; align-items: center; gap: 3px; color: ${T.ink}; text-decoration: none; flex: none; position: relative; padding: 4px 14px 4px 0; }
.wt-logo-t { font-size: 21px; font-weight: 700; letter-spacing: -0.06em; line-height: 1; }
.wt-logo sup { position: absolute; top: 2px; right: 0; font-size: 9px; color: ${T.inkSoft}; font-weight: 400; letter-spacing: 0; }
.wt-bar-flex { flex: 1 1 auto; }
.wt-bell-dot {
  position: absolute; top: 3px; right: 1px; min-width: 15px; height: 15px; padding: 0 3px; border-radius: 8px;
  background: ${T.accent}; color: #fff; font-size: 9.5px; font-weight: 700; line-height: 15px; text-align: center;
  box-shadow: 0 0 0 2px ${T.page};
}
.wt-bar-avatar {
  width: 32px; height: 32px; flex: none; border: 0; border-radius: 50%; padding: 0; margin: 0 8px 0 6px; cursor: pointer;
  background: linear-gradient(135deg, #FF6FA5, #8E5CFF);
}
.wt-bar-avatar-in { display: grid; place-items: center; width: 100%; height: 100%; color: #fff; font-size: 14px; font-weight: 500; }
.wt-brand {
  display: inline-flex; align-items: center; gap: 6px; height: 30px; padding: 0 10px 0 6px; border-radius: 15px; margin-right: 2px;
  background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.14); color: ${T.ink};
  font-size: 12px; font-weight: 500; text-decoration: none; white-space: nowrap;
}
.wt-brand img { border-radius: 4px; }
.wt-create {
  display: inline-flex; align-items: center; gap: 4px; height: 36px; padding: 0 14px 0 8px; border-radius: 18px; border: 0;
  background: rgba(255,255,255,.1); color: ${T.ink}; font-family: inherit; font-size: 14px; font-weight: 500; cursor: pointer; margin-right: 4px;
}
.wt-create:hover { background: rgba(255,255,255,.2); }
.wt-search { display: none; }
.wt-search-input {
  flex: 1; min-width: 0; height: 38px; padding: 0 4px 0 16px; background: transparent; border: 0;
  color: ${T.ink}; font-family: inherit; font-size: 16px; outline: none;
}
.wt-search-input::placeholder { color: #888; }
.wt-search-input--sheet { width: 100%; border: 1px solid ${T.line}; border-radius: 20px; background: ${T.page}; }
.wt-search-go {
  width: 64px; height: 40px; flex: none; border: 1px solid #303030; border-left: 0; background: #222;
  display: grid; place-items: center; cursor: pointer; border-radius: 0 20px 20px 0;
}
.wt-mic { width: 40px; height: 40px; flex: none; border: 0; border-radius: 50%; background: #181818; display: grid; place-items: center; cursor: pointer; margin-left: 12px; }
.wt-mic:hover { background: #303030; }
.wt-only-desk { display: none; }
.wt-only-mob, .wt-only-mob-tab { display: block; }
.wt-bar .wt-only-mob { display: grid; }
.wt-bar .wt-only-desk { display: none; }

/* Grid */
.wt-main { padding: 0 12px 88px; margin: 0 auto; max-width: 1754px; }
.wt-grid { display: block; }
.wt-player-slot {
  position: sticky; top: 0; z-index: 110; margin: 0 -12px; background: #000;
}
.wt-player-slot .wt-frame { border-radius: 0; }
.wt-player-slot:has(.wtp-menu), .wt-player-slot:has(.is-pseudo-fs) { z-index: 300 !important; }
.wt-info { min-width: 0; position: relative; z-index: 2; }
.wt-side { min-width: 0; margin-top: 24px; position: relative; z-index: 2; }
.wt-title {
  margin: 12px 0 0; font-size: 18px; line-height: 24px; font-weight: 700; color: ${T.ink}; overflow-wrap: anywhere;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.wt-back {
  margin-top: 8px; max-width: 100%; height: 32px; padding: 0 12px; border: 0; border-radius: 16px; background: rgba(255,62,134,.16);
  color: #FFB3CF; font-family: inherit; font-size: 13px; font-weight: 500; cursor: pointer; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.wt-metaline {
  display: flex !important; flex-wrap: wrap; gap: 0 8px; margin: 6px 0 0; padding: 0; border: 0; background: none;
  color: ${T.inkSoft}; font-family: inherit; font-size: 12px; line-height: 18px; text-align: left; cursor: pointer;
}
.wt-metaline b { color: ${T.ink}; font-weight: 500; }
.wt-metaline-tag { color: ${T.inkSoft}; }
.wt-footnote { margin: 24px 0 0; font-size: 12px; color: #717171; text-align: center; }

.wt-invite, .wt-mod { margin-top: 28px; padding: 16px; border-radius: 12px; border: 1px solid ${T.line}; background: ${T.raised}; }
.wt-invite-title, .wt-mod-title { margin: 0; font-size: 15px; font-weight: 700; color: ${T.ink}; }
.wt-invite-body, .wt-mod-note { margin: 6px 0 12px; font-size: 13px; line-height: 18px; color: ${T.inkSoft}; }
.wt-invite-row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.wt-invite-link { flex: 1; min-width: 0; font-size: 12px; color: ${T.inkSoft}; background: ${T.chip}; padding: 8px 10px; border-radius: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.wt-primary { height: 36px; padding: 0 16px; border-radius: 18px; border: 0; background: ${T.link}; color: #0F0F0F; font-family: inherit; font-size: 14px; font-weight: 500; cursor: pointer; }

.wt-pn-scrim { position: fixed; inset: 0; z-index: 240; border: 0; padding: 0; background: rgba(0,0,0,.35); cursor: default; animation: wtp-in .2s ease both; }

/* Drawer */
.wt-drawer-root { position: fixed; inset: 0; z-index: 270; }
.wt-drawer-scrim { position: absolute; inset: 0; border: 0; padding: 0; background: rgba(0,0,0,.5); cursor: default; animation: wtp-in .2s ease both; }
.wt-drawer { position: absolute; left: 0; top: 0; bottom: 0; width: 240px; background: ${T.page}; padding: 0 12px 12px; overflow-y: auto; animation: wt-drawer-in .22s cubic-bezier(.2,.8,.2,1) both; }
@keyframes wt-drawer-in { from { transform: translateX(-100%); } to { transform: none; } }
.wt-drawer-top { display: flex; align-items: center; gap: 12px; height: 56px; margin-left: -4px; }
.wt-drawer-item {
  display: flex; align-items: center; gap: 24px; width: 100%; height: 40px; padding: 0 12px; border: 0; border-radius: 10px;
  background: none; color: ${T.ink}; font-family: inherit; font-size: 14px; cursor: pointer; text-align: left;
}
.wt-drawer-item:hover { background: rgba(255,255,255,.1); }
.wt-drawer-item.is-on { background: rgba(255,255,255,.1); font-weight: 500; }
.wt-drawer-dot { width: 4px; height: 4px; border-radius: 50%; background: ${T.link}; margin-left: auto; }
.wt-drawer hr { border: 0; border-top: 1px solid rgba(255,255,255,.2); margin: 12px 0; }
.wt-drawer-h { margin: 4px 12px 6px; font-size: 16px; font-weight: 500; }

/* Sheets content */
.wt-note { position: relative; display: flex; align-items: flex-start; gap: 12px; width: 100%; padding: 12px 12px 12px 22px; border: 0; background: none; border-radius: 10px; color: ${T.ink}; font-family: inherit; text-align: left; cursor: pointer; }
.wt-note:hover { background: ${T.chip}; }
.wt-note.is-new { background: rgba(255,62,134,.1); }
.wt-note-dot { position: absolute; left: 8px; top: 28px; width: 5px; height: 5px; border-radius: 50%; background: ${T.link}; }
.wt-note-t { display: flex; flex-direction: column; gap: 3px; min-width: 0; flex: 1; }
.wt-note-t b { font-size: 14px; line-height: 20px; font-weight: 400; }
.wt-note-t small { font-size: 12px; color: ${T.inkSoft}; }
.wt-note-thumb { position: relative; width: 86px; flex: none; aspect-ratio: 16/9; border-radius: 6px; overflow: hidden; }
.wt-share-row { display: flex; gap: 18px; padding: 8px 12px 16px; overflow-x: auto; }
.wt-share-t { display: flex; flex-direction: column; align-items: center; gap: 8px; border: 0; background: none; color: ${T.ink}; font-family: inherit; font-size: 12px; text-decoration: none; cursor: pointer; flex: none; }
.wt-share-t span { width: 60px; height: 60px; border-radius: 50%; display: grid; place-items: center; color: #fff; font-size: 26px; }
.wt-share-link { display: flex; align-items: center; gap: 8px; margin: 0 12px; padding: 6px 6px 6px 12px; border: 1px solid ${T.line}; border-radius: 12px; background: #181818; }
.wt-share-link input { flex: 1; min-width: 0; border: 0; background: none; color: ${T.ink}; font-family: inherit; font-size: 14px; outline: none; }
.wt-share-link button { height: 36px; padding: 0 16px; border-radius: 18px; border: 0; background: ${T.link}; color: #0F0F0F; font-family: inherit; font-size: 14px; font-weight: 500; cursor: pointer; }
.wt-share-start { display: flex; align-items: center; gap: 10px; margin: 14px 12px 4px; font-size: 14px; color: ${T.ink}; }
.wt-share-start input { width: 18px; height: 18px; accent-color: ${T.link}; }
.wt-check { width: 22px; height: 22px; border-radius: 4px; border: 2px solid ${T.ink}; display: grid; place-items: center; flex: none; }
.wt-check.is-on { background: ${T.ink}; }
.wt-bellopt span { display: flex; flex-direction: column; }
.wt-bellopt b { font-weight: 500; font-size: 14px; }
.wt-bellopt small { font-size: 12px; color: ${T.inkSoft}; }
.wt-bellopt.is-on { background: ${T.chip}; }
.wt-unsub-btns { display: flex; justify-content: flex-end; gap: 8px; padding: 12px; }
.wt-unsub-no, .wt-unsub-yes { height: 36px; padding: 0 16px; border-radius: 18px; border: 0; font-family: inherit; font-size: 14px; font-weight: 500; cursor: pointer; }
.wt-unsub-no { background: ${T.accent}; color: #fff; }
.wt-unsub-yes { background: none; color: ${T.link}; }

/* Recipient chrome */
.wt-make {
  position: fixed; left: 12px; bottom: calc(14px + env(safe-area-inset-bottom, 0px)); z-index: 140;
  display: inline-flex; align-items: center; gap: 6px; height: 34px; padding: 0 14px 0 10px; border-radius: 17px;
  background: rgba(33,33,33,.94); border: 1px solid rgba(255,255,255,.14); color: ${T.ink}; font-size: 12.5px; font-weight: 500;
  text-decoration: none; box-shadow: 0 6px 18px rgba(0,0,0,.45);
}
.wt-toasts {
  position: fixed; left: 50%; transform: translateX(-50%); bottom: calc(64px + env(safe-area-inset-bottom, 0px)); z-index: 330;
  display: flex; flex-direction: column; gap: 8px; align-items: center; width: min(92vw, 420px); pointer-events: none;
}
.wt-toast {
  margin: 0; padding: 12px 16px; border-radius: 8px; background: #F1F1F1; color: #0F0F0F; font-size: 14px; line-height: 20px;
  box-shadow: 0 6px 20px rgba(0,0,0,.4); overflow-wrap: anywhere; animation: wt-toast-in .25s cubic-bezier(.2,1.2,.4,1) both;
}
@keyframes wt-toast-in { from { opacity: 0; transform: translateY(12px) scale(.96); } to { opacity: 1; transform: none; } }

/* Tablet: theatre band, single column */
@media (min-width: 760px) {
  .wt-bar { position: sticky; top: 0; height: 56px; padding: 0 16px; gap: 6px; }
  .wt-bar .wt-only-desk { display: none; }
  .wt-search { display: flex; align-items: center; flex: 0 1 600px; min-width: 0; margin: 0 auto 0 32px; }
  .wt-search-box { flex: 1; min-width: 0; display: flex; height: 40px; border: 1px solid #303030; border-right: 0; border-radius: 20px 0 0 20px; background: #121212; padding-left: 4px; }
  .wt-search-box:focus-within { border-color: #1C62B9; }
  .wt-bar .wt-only-mob[aria-label="Search"] { display: none; }
  .wt-bar-flex { display: none; }
  .wt-main { padding: 0 24px 88px; }
  .wt-player-slot { position: relative; top: auto; z-index: 1; margin: 0 -24px; padding: 0; display: flex; justify-content: center; }
  .wt-player-slot > * { width: min(100%, calc((100dvh - 190px) * 16 / 9)); }
  .wt-title { font-size: 20px; line-height: 28px; }
  .wt-side { margin-top: 28px; }
}
/* Desktop: player + right column */
@media (min-width: 1000px) {
  .wt-bar .wt-only-desk { display: grid; }
  .wt-bar .wt-create.wt-only-desk { display: inline-flex; }
  .wt-bar .wt-only-mob { display: none !important; }
  .wt-only-desk { display: block; }
  .wt-only-mob, .wt-only-mob-tab { display: none !important; }
  .wt-main { padding: 24px 24px 88px; }
  .wt-grid {
    display: grid; grid-template-columns: minmax(0, 1fr) 402px; grid-template-rows: auto 1fr; column-gap: 24px;
    max-width: 1754px; margin: 0 auto;
  }
  .wt-player-slot { grid-column: 1; grid-row: 1; margin: 0; background: transparent; display: block; }
  .wt-player-slot > * { width: 100%; }
  .wt-player-slot .wt-frame, .wt-player-slot .wtp { border-radius: 12px; }
  .wt-info { grid-column: 1; grid-row: 2; }
  .wt-side { grid-column: 2; grid-row: 1 / span 2; margin-top: 0; }
  .wt-grid.is-theatre .wt-player-slot {
    grid-column: 1 / -1; margin: -24px -24px 24px; background: #000; display: flex; justify-content: center;
  }
  .wt-grid.is-theatre .wt-player-slot > * { width: min(100%, calc((100dvh - 56px - 110px) * 16 / 9)); }
  .wt-grid.is-theatre .wt-player-slot .wtp { border-radius: 0; }
  .wt-grid.is-theatre .wt-info { grid-row: 2; }
  .wt-grid.is-theatre .wt-side { grid-row: 2; }
  .wt-grid.is-theatre .wtp-ambient { display: none; }
  .wt-toasts { left: 24px; transform: none; align-items: flex-start; bottom: 24px; }
}
@media (min-width: 1000px) and (max-width: 1100px) {
  .wt-grid { grid-template-columns: minmax(0, 1fr) 340px; }
}

@media (prefers-reduced-motion: reduce) {
  .wt-toast, .wt-drawer, .wt-drawer-scrim, .wt-pn-scrim { animation: none; }
  .wt-shell * { scroll-behavior: auto !important; }
}
`;
