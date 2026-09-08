"use client";

// ─── The video wall ──────────────────────────────────────────────────────────
//
// Twelve cards. Each one holds the same walkthrough from three sources, and the
// viewer picks which. See data/video-showcase.ts for where the list comes from
// and app/(app)/showcase/page.tsx for why the page is unlisted.
//
// ── WHY OUR OWN MP4 IS THE DEFAULT AND THE EMBEDS ARE CLICK-TO-LOAD ─────────
//
// Twelve YouTube iframes and twelve Instagram iframes on one page is roughly
// 24 third-party documents, each with its own scripts, cookies and layout
// thrash. Measured on the guide pages, one YouTube iframe alone costs more
// transfer than the entire rest of that page. Instagram's embed is worse: it
// ships a script that rewrites the node after load, so twelve of them fight for
// the main thread and the page janks while you scroll.
//
// So nothing third-party loads until it is asked for:
//
//   · The CDN mp4 is `preload="none"` behind its poster, so a card costs one
//     WebP (28–80 KB) until somebody presses play. Twelve posters is the whole
//     initial media budget.
//   · YouTube and Instagram render a FACADE — the same poster, the source's own
//     mark, and a play button. The iframe is created on the first click, and
//     only for that card. A visitor who never touches them never loads them,
//     and never gets a cookie from either.
//
// That is also why the tabs are per-card rather than one global switch: a
// global "show YouTube" would mount twelve iframes in one go, which is the
// thing being avoided.
//
// ── WHY THE LAYOUT IS WIDTH-DRIVEN AND NOT DEVICE-DRIVEN ────────────────────
//
// One `auto-fit` grid with a 340px floor, so the column count is decided by the
// space available rather than by guesses about phones and tablets: 1 up on a
// phone, 2 on most tablets and small laptops, 3 on a desktop, 4 on a wide
// monitor. There is no breakpoint to get wrong, and a card never goes narrower
// than the width its 16:9 player needs to stay legible.
//
// The players are 16:9 because that is what these recordings are — see the
// aspect ratio in components/guides/GuideVideoPlayer. Reserving the box with
// `aspect-ratio` rather than letting the video size itself means no layout
// shift when a poster or an iframe arrives.

import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";

import { SHOWCASE, SHOWCASE_COUNT, type ShowcaseEntry } from "@/data/video-showcase";
import { BRAND } from "@/lib/brand";
import { SOCIAL, SOCIAL_LINK_ATTRS } from "@/lib/social";

type SourceKey = "cdn" | "youtube" | "instagram";

const SOURCE_LABEL: Record<SourceKey, string> = {
  cdn: "Here",
  youtube: "YouTube",
  instagram: "Instagram",
};

/* ── Marks ─────────────────────────────────────────────────────────────────
   Inline SVG rather than an icon package: three glyphs, and this page is
   already asking the network for twelve posters. */

function PlayGlyph({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M8 5.5v13l11-6.5-11-6.5Z" fill="currentColor" />
    </svg>
  );
}

function YouTubeGlyph() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8C22 15.2 22 12 22 12s0-3.2-.4-4.8Z"
        fill="currentColor"
      />
      <path d="M10 9.2v5.6l4.8-2.8L10 9.2Z" fill="#fff" />
    </svg>
  );
}

function InstagramGlyph() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

/* ── One card ───────────────────────────────────────────────────────────── */

function ShowcaseCard({ entry, index }: { entry: ShowcaseEntry; index: number }) {
  const [source, setSource] = useState<SourceKey>("cdn");
  /** Whether the YouTube iframe has been created yet. Never un-set — tearing
      it down on a tab change would restart the video the viewer is watching.
      Instagram needs no equivalent: it is a link, not a frame. */
  const [ytLoaded, setYtLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const { guide, media } = entry;
  const accent = guide.accent || BRAND.gold;
  const headingId = `showcase-${entry.slug}`;

  const pick = useCallback((next: SourceKey) => {
    setSource(next);
    // Leaving the CDN tab: stop our own player rather than let it keep
    // playing audio behind an iframe the viewer is now looking at.
    if (next !== "cdn") videoRef.current?.pause();
    if (next === "youtube") setYtLoaded(true);
  }, []);

  return (
    <article className="sc-card" aria-labelledby={headingId}>
      <div className="sc-stage" style={{ ["--sc-accent" as string]: accent }}>
        {/* ── Our own copy ───────────────────────────────────────────────── */}
        <div className="sc-pane" hidden={source !== "cdn"}>
          <video
            ref={videoRef}
            className="sc-video"
            poster={media.poster}
            preload="none"
            controls
            playsInline
            // The recordings are silent screen captures; muted lets a phone
            // start them without the extra tap iOS demands for audio.
            muted
            aria-label={`${guide.templateName} walkthrough`}
          >
            {/* 720p on small screens, the full file above that — the same
                ladder the guide pages use. */}
            <source src={media.mp4720} type="video/mp4" media="(max-width: 820px)" />
            <source src={media.mp4} type="video/mp4" />
          </video>
        </div>

        {/* ── YouTube, once asked for ────────────────────────────────────── */}
        <div className="sc-pane" hidden={source !== "youtube"}>
          {ytLoaded ? (
            <iframe
              className="sc-frame"
              src={entry.youtubeEmbedUrl}
              title={`${guide.templateName} on YouTube`}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          ) : (
            <Facade poster={media.poster} label="Play on YouTube" onPlay={() => pick("youtube")} />
          )}
        </div>

        {/* ── Instagram: a link, because it cannot be a player ────────────
            Instagram serves `X-Frame-Options: DENY` on every embed URL it has
            — /reel/<code>/embed/, /embed/captioned/ and the older /p/<code>/
            forms, with and without browser Sec-Fetch headers. All eight
            combinations were measured; all eight deny. An <iframe> here would
            render a permanently blank box, so this pane does not pretend to be
            a player: it shows the frame and hands the viewer to the app.

            The reel is the same recording as the CDN copy on the first tab, so
            nobody has to leave to watch it — this is for people who want to
            like, comment or follow, which is the only thing Instagram can do
            here that we cannot. */}
        <div className="sc-pane" hidden={source !== "instagram"}>
          <a
            className="sc-facade sc-facade-link"
            href={entry.instagramUrl}
            aria-label={`Open the ${guide.templateName} reel on Instagram`}
            {...SOCIAL_LINK_ATTRS}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={media.poster} alt="" loading="lazy" decoding="async" />
            <span className="sc-facade-play">
              <InstagramGlyph />
            </span>
            <span className="sc-facade-label">Open the reel on Instagram ↗</span>
          </a>
        </div>

        <span className="sc-index" aria-hidden="true">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      {/* ── Source switch ─────────────────────────────────────────────────
          A radiogroup, not tabs: the three panes are the same video, so this
          is a choice of source rather than navigation between contents. */}
      <div className="sc-sources" role="radiogroup" aria-label={`Watch ${guide.templateName} on`}>
        {(["cdn", "youtube", "instagram"] as SourceKey[]).map((key) => (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={source === key}
            className="sc-source"
            data-on={source === key || undefined}
            onClick={() => pick(key)}
            style={{ ["--sc-accent" as string]: accent }}
          >
            {key === "youtube" ? <YouTubeGlyph /> : key === "instagram" ? <InstagramGlyph /> : <PlayGlyph size={14} />}
            <span>{SOURCE_LABEL[key]}</span>
          </button>
        ))}
      </div>

      <div className="sc-body">
        <p className="sc-eyebrow" style={{ color: accent }}>
          <span aria-hidden="true">{guide.emoji}</span> {guide.templateName}
        </p>
        <h2 className="sc-title" id={headingId}>
          {guide.title}
        </h2>
        {/* No description was supplied for these, so the guide's own tagline is
            used — it is the line already written for this exact video, and one
            place to edit beats two that disagree. */}
        <p className="sc-tagline">{guide.tagline}</p>

        <p className="sc-meta">
          <span>{guide.buildTime}</span>
          {guide.video ? <span>{formatDuration(guide.video.seconds)}</span> : null}
        </p>

        {/* ── TWO ACTIONS, NOT FOUR ────────────────────────────────────────
            This row used to repeat YouTube and Instagram as ↗ links, which the
            source switch above already offers — four buttons stacked on two
            lines, on a card whose actual subject is the video. The switch is
            where you choose a source; this is where you go and do something.
            Rendered as one row that wraps, so a narrow phone gets two lines
            rather than a squeeze. */}
        <div className="sc-links">
          <Link className="sc-link" href={entry.templateHref} prefetch={false}>
            Open the template
          </Link>
          <Link className="sc-link sc-link-quiet" href={entry.guideHref} prefetch={false}>
            Read the guide
          </Link>
        </div>
      </div>
    </article>
  );
}

/** The stand-in an embed gets before anybody asks for it. */
function Facade({ poster, label, onPlay }: { poster: string; label: string; onPlay: () => void }) {
  return (
    <button type="button" className="sc-facade" onClick={onPlay} aria-label={label}>
      {/* A plain <img>: this is a fixed-size decorative frame on a CDN that
          next/image would only re-proxy. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={poster} alt="" loading="lazy" decoding="async" />
      <span className="sc-facade-play">
        <PlayGlyph size={26} />
      </span>
      <span className="sc-facade-label">{label}</span>
    </button>
  );
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/* ── The page ───────────────────────────────────────────────────────────── */

export default function ShowcaseClient() {
  const entries = useMemo(() => SHOWCASE, []);

  return (
    <main className="sc-root">
      <style>{SHOWCASE_CSS}</style>

      <header className="sc-head">
        <p className="sc-kicker">Walkthroughs</p>
        <h1 className="sc-h1">
          Every template, built start to finish
        </h1>
        <p className="sc-sub">
          {SHOWCASE_COUNT} recordings. Each one is the whole build — every field filled, then the
          page as the person receiving it sees it. Watch here, or open it on YouTube or Instagram.
        </p>
      </header>

      <div className="sc-grid">
        {entries.map((entry, i) => (
          <ShowcaseCard key={entry.slug} entry={entry} index={i} />
        ))}
      </div>

      <footer className="sc-foot">
        <p>
          More on{" "}
          <a href={SOCIAL.youtube} {...SOCIAL_LINK_ATTRS}>
            YouTube
          </a>{" "}
          and{" "}
          <a href={SOCIAL.instagram} {...SOCIAL_LINK_ATTRS}>
            Instagram
          </a>
          .
        </p>
      </footer>
    </main>
  );
}

const SHOWCASE_CSS = `
.sc-root {
  --sc-ink: ${BRAND.text};
  --sc-muted: ${BRAND.muted};
  --sc-faint: ${BRAND.faint};
  --sc-surface: ${BRAND.surface};
  --sc-border: ${BRAND.border};
  --sc-gold: ${BRAND.gold};
  background: ${BRAND.bg};
  color: var(--sc-ink);
  min-height: 100vh;
  padding: clamp(28px, 6vw, 72px) clamp(16px, 4vw, 48px) 72px;
  font-family: var(--font-inter), system-ui, -apple-system, "Segoe UI", sans-serif;
}

/* ── Header ───────────────────────────────────────────────────────────── */
.sc-head { max-width: 720px; margin: 0 auto clamp(28px, 5vw, 52px); text-align: center; }
.sc-kicker {
  margin: 0 0 10px; font-size: 11px; font-weight: 700; letter-spacing: .16em;
  text-transform: uppercase; color: var(--sc-gold);
}
.sc-h1 {
  margin: 0 0 14px;
  font-family: var(--font-lora), Georgia, serif;
  font-size: clamp(26px, 5.4vw, 44px);
  line-height: 1.15;
  font-weight: 700;
  letter-spacing: -0.01em;
}
.sc-sub { margin: 0; font-size: clamp(14px, 2.2vw, 16px); line-height: 1.65; color: var(--sc-muted); }

/* ── Grid ─────────────────────────────────────────────────────────────────
   auto-fit with a 340px floor, so the column count follows the available
   width instead of a device guess. 1 up on a phone, 2 on a tablet, 3–4 on a
   desktop, with no breakpoint to maintain. */
.sc-grid {
  display: grid;
  /* 'min(340px, 100%)' rather than a bare 340px floor. A bare floor makes the
     track 340px even when the container is narrower, which pushes the card
     past its own grid on a 360px phone — measured, before this was changed.
     Wrapping it in min() lets the track collapse to the container width
     instead, so the layout is correct by construction at any width and there
     is no 'max-width' breakpoint to keep in step with the floor. */
  grid-template-columns: repeat(auto-fit, minmax(min(340px, 100%), 1fr));
  gap: clamp(18px, 2.6vw, 28px);
  max-width: 1500px;
  margin: 0 auto;
}

/* ── Card ─────────────────────────────────────────────────────────────── */
.sc-card {
  display: flex;
  flex-direction: column;
  background: var(--sc-surface);
  border: 1px solid var(--sc-border);
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(61,12,17,.04);
  transition: box-shadow .2s ease, transform .2s ease;
}
@media (hover: hover) {
  .sc-card:hover { box-shadow: 0 18px 40px -22px rgba(61,12,17,.30); transform: translateY(-2px); }
}

.sc-stage { position: relative; background: #1a0508; }
/* The box is reserved before anything arrives, so a poster, a video or an
   iframe all land without shifting the page. */
.sc-pane { position: relative; width: 100%; aspect-ratio: 16 / 9; }
.sc-video, .sc-frame { width: 100%; height: 100%; display: block; border: 0; }
.sc-video { object-fit: contain; background: #1a0508; }
/* Instagram's embed is portrait and taller than the pane; it scrolls inside
   itself rather than stretching the card. */
.sc-pane > .sc-frame[title$="Instagram"] { height: 100%; }

.sc-index {
  position: absolute; top: 10px; left: 12px;
  font-size: 11px; font-weight: 700; letter-spacing: .08em;
  color: rgba(255,255,255,.62);
  text-shadow: 0 1px 3px rgba(0,0,0,.6);
  pointer-events: none;
}

/* ── Embed facade ─────────────────────────────────────────────────────── */
.sc-facade {
  position: absolute; inset: 0; width: 100%; height: 100%;
  padding: 0; border: 0; background: #1a0508; cursor: pointer; display: block;
}
/* The Instagram pane is an <a>, not a <button> — same face, minus the
   underline and inherited link colour. */
.sc-facade-link { text-decoration: none; color: inherit; }
.sc-facade img { width: 100%; height: 100%; object-fit: contain; display: block; opacity: .82; transition: opacity .2s ease; }
.sc-facade:hover img { opacity: 1; }
.sc-facade-play {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  width: 62px; height: 62px; border-radius: 50%;
  display: grid; place-items: center;
  background: rgba(26,5,8,.72); color: #fff;
  backdrop-filter: blur(3px);
  border: 1px solid rgba(255,255,255,.28);
  transition: transform .18s ease, background .18s ease;
}
.sc-facade:hover .sc-facade-play { transform: translate(-50%, -50%) scale(1.06); background: var(--sc-accent, #c9a84c); }
.sc-facade-label {
  position: absolute; bottom: 10px; left: 0; right: 0;
  font-size: 11.5px; font-weight: 600; color: rgba(255,255,255,.9);
  text-shadow: 0 1px 3px rgba(0,0,0,.7);
}

/* ── Source switch ────────────────────────────────────────────────────── */
.sc-sources {
  display: flex; gap: 6px; padding: 10px 12px 0;
}
.sc-source {
  flex: 1;
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  /* 38px keeps every one of the three a real thumb target on a phone. */
  min-height: 38px;
  padding: 0 8px;
  font: inherit; font-size: 12px; font-weight: 600;
  color: var(--sc-muted);
  background: transparent;
  border: 1px solid var(--sc-border);
  border-radius: 10px;
  cursor: pointer;
  transition: color .16s ease, border-color .16s ease, background .16s ease;
}
.sc-source:hover { color: var(--sc-ink); }
.sc-source[data-on] {
  color: #fff;
  background: var(--sc-accent, #c9a84c);
  border-color: var(--sc-accent, #c9a84c);
}
.sc-source:focus-visible { outline: 2px solid var(--sc-accent, #c9a84c); outline-offset: 2px; }

/* ── Body ─────────────────────────────────────────────────────────────── */
.sc-body { padding: 12px 14px 16px; display: flex; flex-direction: column; gap: 6px; }
.sc-eyebrow { margin: 0; font-size: 11.5px; font-weight: 700; letter-spacing: .02em; }
.sc-title {
  margin: 0;
  font-family: var(--font-lora), Georgia, serif;
  font-size: 17px; line-height: 1.32; font-weight: 700;
}
.sc-tagline { margin: 0; font-size: 13px; line-height: 1.55; color: var(--sc-muted); }
.sc-meta {
  margin: 2px 0 0; display: flex; gap: 12px;
  font-size: 11.5px; font-weight: 600; color: var(--sc-faint);
}
.sc-links { margin-top: 8px; display: flex; flex-wrap: wrap; gap: 6px; }
.sc-link {
  display: inline-flex; align-items: center; min-height: 34px; padding: 0 12px;
  font-size: 12px; font-weight: 600; text-decoration: none;
  border-radius: 999px;
  color: #fff; background: ${BRAND.gradient};
  transition: opacity .16s ease;
}
.sc-link:hover { opacity: .88; }
.sc-link-quiet {
  color: var(--sc-ink); background: none; border: 1px solid var(--sc-border);
}
.sc-link-quiet:hover { border-color: var(--sc-gold); color: var(--sc-gold); opacity: 1; }
.sc-link:focus-visible { outline: 2px solid var(--sc-gold); outline-offset: 2px; }

/* ── Foot ─────────────────────────────────────────────────────────────── */
.sc-foot { margin: clamp(36px, 6vw, 64px) auto 0; text-align: center; font-size: 13px; color: var(--sc-muted); }
.sc-foot a { color: var(--sc-gold); font-weight: 600; }

/* A card lifting and a play button scaling are decoration on a page whose
   whole content is video. */
@media (prefers-reduced-motion: reduce) {
  .sc-card, .sc-facade img, .sc-facade-play, .sc-source, .sc-link { transition: none; }
  @media (hover: hover) { .sc-card:hover { transform: none; } }
  .sc-facade:hover .sc-facade-play { transform: translate(-50%, -50%); }
}
`;
