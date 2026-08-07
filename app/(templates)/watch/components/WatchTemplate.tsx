"use client";

// ─── Watch ───────────────────────────────────────────────────────────────────
//
// A watch page for one relationship, with a real player in it.
//
// ── OUR CHROME IS OURS ───────────────────────────────────────────────────────
//
// Every pixel this file draws is this product's: the wordmark is "us." with a
// heart, the accent is a deep coral, the glyphs are drawn from primitives, and
// nothing here carries another company's name, abbreviation, product or device.
// The embedded player draws its own marks inside its own frame, which is the
// platform identifying itself on its own surface — required, correct, and never
// covered, cropped or sized away by anything on this page.
//
// ── LAYOUT ───────────────────────────────────────────────────────────────────
//
// One column under 1000px, two above it: a fluid player column capped at 1280px
// and a fixed 400px rail, 24px apart. On a phone the rail goes BELOW the
// comments — DOM order is player → title → metadata → description → comments →
// rail, which is the mobile reading order, and the media query only moves the
// rail sideways.
//
// ── STATE THAT MATTERS ───────────────────────────────────────────────────────
//
// `active` is the related video currently loaded in the player, or null for the
// main one. Everything that reads as "the video" — title, description, chapters,
// comments — switches with it, and switches back.

import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";
import { useAppSelector } from "@/store/hooks";
import ModerationQueue from "@/components/contrib/ModerationQueue";
import Comments, { COMMENTS_CSS } from "./Comments";
import DescriptionBox, { DESCRIPTION_CSS } from "./DescriptionBox";
import MetaRow, { META_CSS } from "./MetaRow";
import PlayerFrame, { PLAYER_CSS, useWatchPlayer } from "./PlayerFrame";
import RelatedRail, { RAIL_CSS } from "./RelatedRail";
import Sheet, { SHEET_CSS } from "./Sheet";
import ShareCard, { SHARE_CARD_CSS, exportShareCard } from "./ShareCard";
import { useWatchQueue, usePublishedComments } from "./contrib";
import {
  BellGlyph,
  CreateGlyph,
  FONT,
  InitialsAvatar,
  MenuGlyph,
  SafeImage,
  SearchGlyph,
  T,
  Wordmark,
} from "./theme";
import {
  WORDMARK,
  WORDMARK_GLYPH,
  publishedComments,
  type Comment,
  type RelatedVideo,
  type WatchData,
  type WatchDescription,
} from "./types";

export interface WatchTemplateProps {
  data: WatchData;
  mode: "preview" | "live";
  shareId?: string | null;
  hasPassword?: boolean;
  /**
   * The friends' WRITE link. Owner-side only — it never reaches the recipient's
   * share payload, so on a live page this is null and the invite row is hidden.
   */
  contribToken?: string | null;
  /** Live, published link. The share sheet copies this when it exists. */
  shareUrl?: string | null;
}

interface ToastItem {
  id: number;
  message: string;
}

export default function WatchTemplate({
  data,
  mode,
  shareId,
  contribToken,
  shareUrl,
}: WatchTemplateProps) {
  const live = mode === "live";
  const { isAuthenticated, accessToken } = useAppSelector((s) => s.auth);

  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastId = useRef(0);
  const pushToast = useCallback((message: string) => {
    const id = (toastId.current += 1);
    setToasts((prev) => [...prev, { id, message }]);
    window.setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 2600);
  }, []);

  const [menu, setMenu] = useState<null | "nav" | "bell" | "search">(null);
  const [chip, setChip] = useState("All");
  const [active, setActive] = useState<RelatedVideo | null>(null);
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const topRef = useRef<HTMLDivElement | null>(null);

  const videoId = active?.youtubeId ?? data.video.youtubeId;
  const player = useWatchPlayer(videoId);

  // ── What "the video" currently means ───────────────────────────────────────
  const title = active ? active.title : data.video.title;
  const views = active ? active.views : data.video.views;
  const postedAgo = active ? active.ago : data.video.postedAgo;

  const description: WatchDescription = useMemo(
    () =>
      active
        ? {
            intro: [
              `${active.title} — ${active.channel}.`,
              "A different one. The chapters below belong to the main video, so they are waiting for you back there.",
            ],
            chapters: [],
            outro: [],
          }
        : data.description,
    [active, data.description],
  );

  const liveComments = usePublishedComments(shareId, live);

  const baseComments: readonly Comment[] = useMemo(
    () => (active ? [] : publishedComments(data)),
    [active, data],
  );

  const shownComments = useMemo(
    () => (active ? [] : [...baseComments, ...liveComments]),
    [active, baseComments, liveComments],
  );

  // ── The chapter that matches playback ──────────────────────────────────────
  const activeChapter = useMemo(() => {
    if (active) return -1;
    const chapters = data.description.chapters;
    if (chapters.length === 0) return -1;
    if (player.phase === "poster" || player.phase === "starting") return -1;
    let index = -1;
    for (let i = 0; i < chapters.length; i += 1) {
      if (chapters[i].seconds <= player.currentTime + 0.25) index = i;
      else break;
    }
    return index;
  }, [active, data.description.chapters, player.phase, player.currentTime]);

  const nowLabel =
    activeChapter >= 0 ? data.description.chapters[activeChapter]?.label ?? "" : "";

  const pickRelated = useCallback(
    (item: RelatedVideo) => {
      if (!item.youtubeId) {
        pushToast("that one is private.");
        return;
      }
      setActive(item);
      player.loadVideo(item.youtubeId);
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [player, pushToast],
  );

  const backToMain = useCallback(() => {
    setActive(null);
    player.loadVideo(data.video.youtubeId);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [player, data.video.youtubeId]);

  const topThree = useMemo(
    () =>
      [...(data.pinnedComment ? [data.pinnedComment] : []), ...publishedComments(data)]
        .slice()
        .sort((a, b) => b.likes - a.likes)
        .slice(0, 3),
    [data],
  );

  const download = useCallback(async () => {
    setDownloading(true);
    const ok = await exportShareCard(cardRef.current, "watch-card.png");
    setDownloading(false);
    pushToast(ok ? "Saved to your downloads." : "Couldn't make the card — try again.");
  }, [pushToast]);

  const queue = useWatchQueue(shareId, accessToken, live && isAuthenticated);
  // The queue endpoint answers an empty list for somebody else's page, so a
  // signed-in stranger is shown nothing at all rather than an empty panel that
  // implies this page is theirs.
  const showQueue = live && isAuthenticated && queue.items.length > 0;

  const friendsLink =
    contribToken && typeof window !== "undefined"
      ? `${window.location.origin}/watch/comment/${contribToken}`
      : null;

  return (
    <div className="wt-shell">
      <style>{CSS}</style>

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <header className="wt-bar">
        <button type="button" className="wt-bar-icon" onClick={() => setMenu("nav")} aria-label="Menu">
          <MenuGlyph size={24} color={T.ink} />
        </button>
        <span className="wt-bar-mark">
          <Wordmark text={WORDMARK} glyph={WORDMARK_GLYPH} size={21} />
        </span>

        <form
          className="wt-search"
          onSubmit={(e) => {
            e.preventDefault();
            pushToast("no results. this is the only one.");
          }}
        >
          <input
            className="wt-search-input"
            placeholder="search for a better one (no results)"
            aria-label="Search"
          />
          <button type="submit" className="wt-search-go" aria-label="Search">
            <SearchGlyph size={19} color={T.ink} />
          </button>
        </form>

        <span className="wt-bar-spacer" />

        <button
          type="button"
          className="wt-bar-icon wt-search-only"
          onClick={() => setMenu("search")}
          aria-label="Search"
        >
          <SearchGlyph size={21} color={T.ink} />
        </button>
        <button
          type="button"
          className="wt-bar-icon"
          onClick={() => pushToast("you already made one. this one.")}
          aria-label="Create"
        >
          <CreateGlyph size={22} color={T.ink} />
        </button>
        <button
          type="button"
          className="wt-bar-icon wt-bell"
          onClick={() => setMenu("bell")}
          aria-label="Notifications, 1 new"
        >
          <BellGlyph size={22} color={T.ink} />
          <span className="wt-bell-dot" aria-hidden="true">
            1
          </span>
        </button>
        <button
          type="button"
          className="wt-bar-avatar"
          onClick={() => pushToast("signed in. permanently.")}
          aria-label="Account"
        >
          <SafeImage
            src={data.channel.avatarUrl}
            alt=""
            fallback={<InitialsAvatar name={data.channel.name} size={32} />}
            style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", display: "block" }}
          />
        </button>
      </header>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div ref={topRef} />
      <main className="wt-main">
        <div className="wt-col">
          <PlayerFrame
            player={player}
            videoId={videoId}
            title={title}
            description={description}
            related={data.related}
            onPickRelated={pickRelated}
            nowLabel={nowLabel}
          />

          <h1 className="wt-title">{title}</h1>

          {active ? (
            <button type="button" className="wt-back" onClick={backToMain}>
              ← Back to the main video
            </button>
          ) : null}

          <MetaRow
            channel={data.channel}
            likes={data.video.likes}
            shareUrl={shareUrl ?? (live && typeof window !== "undefined" ? window.location.href : null)}
            onToast={pushToast}
            onDownload={download}
            downloading={downloading}
          />

          <DescriptionBox
            views={views}
            postedAgo={postedAgo}
            description={description}
            activeChapter={activeChapter}
            onSeek={player.seekTo}
            chaptersDisabled={Boolean(active)}
          />

          <Comments
            comments={shownComments}
            pinnedComment={active ? undefined : data.pinnedComment}
            channelName={data.channel.name}
            onToast={pushToast}
            contributorPrompt={live && !active ? data.contributorPrompt : undefined}
          />

          {friendsLink ? (
            <section className="wt-invite">
              <h3 className="wt-invite-title">Get her friends in the comments</h3>
              <p className="wt-invite-body">
                One link, as many people as you like. Everything they write waits for you before it
                goes up.
              </p>
              <div className="wt-invite-row">
                <code className="wt-invite-link">{friendsLink}</code>
                <button
                  type="button"
                  className="wt-primary"
                  onClick={() => {
                    navigator.clipboard
                      .writeText(friendsLink)
                      .then(() => pushToast("Contributor link copied."))
                      .catch(() => pushToast("Couldn't copy — long-press it instead."));
                  }}
                >
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

        <div className="wt-side">
          <RelatedRail
            items={data.related}
            onPick={pickRelated}
            activeId={active?.id ?? null}
            chip={chip}
            onChip={setChip}
          />
        </div>
      </main>

      {/* ── Recipient-only chrome ────────────────────────────────────────── */}
      {live ? (
        <>
          <Link href="/templates" className="wt-brand" aria-label="Make one of these — SubhSandesh">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.webp" alt="" width={20} height={20} />
            SubhSandesh
          </Link>
          <Link href="/templates" className="wt-make">
            Make one
          </Link>
        </>
      ) : null}

      {/* ── Sheets ───────────────────────────────────────────────────────── */}
      <Sheet open={menu === "nav"} title="us." onClose={() => setMenu(null)}>
        <p className="wt-sheet-note">One channel. One video. One subscriber who matters.</p>
        {["Home", "Subscriptions", "History"].map((item) => (
          <button
            key={item}
            type="button"
            className="wt-sheet-item"
            onClick={() => {
              setMenu(null);
              pushToast("it all leads back here.");
            }}
          >
            {item}
          </button>
        ))}
      </Sheet>

      <Sheet open={menu === "bell"} title="Notifications" onClose={() => setMenu(null)}>
        <button
          type="button"
          className="wt-sheet-item"
          onClick={() => {
            setMenu(null);
            player.start();
          }}
        >
          <InitialsAvatar name={data.channel.name} size={32} />
          <span style={{ minWidth: 0 }}>
            <span style={{ display: "block", fontWeight: 600 }}>{data.channel.name} uploaded</span>
            <span className="wt-sheet-link">{data.video.title}</span>
          </span>
        </button>
      </Sheet>

      <Sheet open={menu === "search"} title="Search" onClose={() => setMenu(null)}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setMenu(null);
            pushToast("no results. this is the only one.");
          }}
          style={{ padding: "4px 12px 12px" }}
        >
          <input
            className="wt-search-input wt-search-input--sheet"
            placeholder="search for a better one (no results)"
            aria-label="Search"
            autoFocus
          />
        </form>
      </Sheet>

      {/* ── Toasts ───────────────────────────────────────────────────────── */}
      <div className="wt-toasts" aria-live="polite">
        {toasts.map((t) => (
          <p key={t.id} className="wt-toast">
            {t.message}
          </p>
        ))}
      </div>

      {/* Off-screen, and the only thing on this page a capture can see. */}
      <ShareCard data={data} topComments={topThree} nodeRef={cardRef} />
    </div>
  );
}

const CSS = `
${PLAYER_CSS}
${META_CSS}
${DESCRIPTION_CSS}
${COMMENTS_CSS}
${RAIL_CSS}
${SHEET_CSS}
${SHARE_CARD_CSS}

.wt-shell {
  min-height: 100dvh; background: ${T.page}; color: ${T.ink};
  font-family: ${FONT}; -webkit-font-smoothing: antialiased;
}
.wt-shell *, .wt-shell *::before, .wt-shell *::after { box-sizing: border-box; }

.wt-bar {
  position: sticky; top: 0; z-index: 120; height: 56px;
  display: flex; align-items: center; gap: 6px;
  padding: 0 10px; background: ${T.page};
}
.wt-bar-icon {
  width: 40px; height: 40px; flex: none; border: 0; border-radius: 50%;
  background: transparent; display: grid; place-items: center; cursor: pointer; position: relative;
}
.wt-bar-icon:hover { background: ${T.chip}; }
.wt-bar-mark { margin-left: 4px; margin-right: 8px; flex: none; }
.wt-bar-spacer { flex: 1 1 auto; }
.wt-bar-avatar {
  width: 32px; height: 32px; flex: none; border: 0; border-radius: 50%; padding: 0;
  background: transparent; cursor: pointer; margin-left: 4px; overflow: hidden;
}
.wt-bell-dot {
  position: absolute; top: 5px; right: 5px; min-width: 15px; height: 15px; padding: 0 4px;
  border-radius: 999px; background: ${T.accent}; color: #FFFFFF;
  font-size: 10px; font-weight: 700; line-height: 15px; text-align: center;
}

.wt-search { display: none; }
.wt-search-only { display: grid; }
.wt-search-input {
  flex: 1; min-width: 0; height: 40px; padding: 0 16px;
  background: transparent; border: 0; color: ${T.ink}; font-family: ${FONT}; font-size: 15px;
  outline: none;
}
.wt-search-input::placeholder { color: ${T.inkSoft}; }
.wt-search-input--sheet {
  width: 100%; border: 1px solid ${T.line}; border-radius: 20px; background: ${T.page};
}
.wt-search-go {
  width: 64px; flex: none; border: 0; border-left: 1px solid ${T.line};
  background: #222222; color: ${T.ink}; display: grid; place-items: center; cursor: pointer;
  border-top-right-radius: 40px; border-bottom-right-radius: 40px;
}

.wt-main {
  display: flex; flex-direction: column; gap: 24px;
  padding: 12px 12px 72px; max-width: 1760px; margin: 0 auto;
}
.wt-col { min-width: 0; }
.wt-side { min-width: 0; }

.wt-title {
  margin: 12px 0 0; font-size: 20px; line-height: 28px; font-weight: 700; color: ${T.ink};
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  overflow-wrap: anywhere;
}
.wt-back {
  margin-top: 8px; height: 32px; padding: 0 12px; border: 0; border-radius: 16px;
  background: ${T.chip}; color: ${T.ink}; font-family: ${FONT}; font-size: 13px; cursor: pointer;
}

.wt-invite, .wt-mod {
  margin-top: 28px; padding: 16px; border-radius: 12px;
  border: 1px solid ${T.line}; background: ${T.raised};
}
.wt-invite-title, .wt-mod-title { margin: 0; font-size: 15px; font-weight: 700; color: ${T.ink}; }
.wt-invite-body, .wt-mod-note { margin: 6px 0 12px; font-size: 13px; line-height: 18px; color: ${T.inkSoft}; }
.wt-invite-row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.wt-invite-link {
  flex: 1; min-width: 0; font-size: 12px; color: ${T.inkSoft}; background: ${T.chip};
  padding: 8px 10px; border-radius: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

.wt-brand {
  position: fixed; top: 64px; right: 12px; z-index: 140;
  display: inline-flex; align-items: center; gap: 7px; height: 32px; padding: 0 12px 0 8px;
  border-radius: 16px; background: rgba(33,33,33,0.92); border: 1px solid ${T.line};
  color: ${T.ink}; font-family: ${FONT}; font-size: 12px; font-weight: 600; text-decoration: none;
  backdrop-filter: blur(6px);
}
.wt-brand img { border-radius: 4px; }
.wt-make {
  position: fixed; right: 12px; bottom: calc(12px + env(safe-area-inset-bottom, 0px)); z-index: 140;
  display: inline-flex; align-items: center; height: 36px; padding: 0 16px; border-radius: 18px;
  background: ${T.accent}; color: #FFFFFF; font-family: ${FONT}; font-size: 13px; font-weight: 700;
  text-decoration: none; box-shadow: 0 6px 18px rgba(0,0,0,0.45);
}

.wt-toasts {
  position: fixed; left: 50%; transform: translateX(-50%);
  bottom: calc(58px + env(safe-area-inset-bottom, 0px)); z-index: 300;
  display: flex; flex-direction: column; gap: 8px; align-items: center;
  width: min(92vw, 420px); pointer-events: none;
}
.wt-toast {
  margin: 0; padding: 10px 16px; border-radius: 10px;
  background: ${T.raised}; border: 1px solid ${T.line}; color: ${T.ink};
  font-family: ${FONT}; font-size: 13.5px; text-align: center; overflow-wrap: anywhere;
  animation: wt-toast-in 200ms ease-out both;
}
@keyframes wt-toast-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }

@media (min-width: 760px) {
  .wt-search {
    display: flex; align-items: center; flex: 1 1 auto; min-width: 0;
    max-width: 640px; height: 40px; margin: 0 16px;
    border: 1px solid ${T.line}; border-radius: 40px; overflow: hidden;
  }
  .wt-search-only { display: none; }
  .wt-bar-spacer { flex: 0 0 auto; }
}

@media (min-width: 1000px) {
  .wt-main { flex-direction: row; align-items: flex-start; padding: 24px 24px 80px; gap: 24px; }
  .wt-col { flex: 1 1 auto; max-width: 1280px; }
  .wt-side { flex: 0 0 400px; width: 400px; }
}

@media (prefers-reduced-motion: reduce) {
  .wt-toast { animation: none; }
  .wt-shell * { scroll-behavior: auto !important; }
}
`;
