"use client";

// ─── The listing's sections, top to bottom ───────────────────────────────────
//
// Header → facts strip → What's New → Preview → description → Ratings &
// Reviews → App Privacy → Supports → Information → You Might Also Like. The
// order, the section rhythm (hairline, 22px bold title, pink "See All") and the
// type scale follow the phone storefront's product page.

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { AppData, AppRating, AppReview, AppScreenshot, AppVersion } from "../types";
import {
  ChevronDown,
  ChevronRight,
  CompassIcon,
  CupIcon,
  EyeTrackIcon,
  HandIcon,
  HeartIcon,
  HelpIcon,
  LinkedIcon,
  MusicIcon,
  PencilIcon,
  PeopleIcon,
  PersonSquare,
  PhoneIcon,
  PinIcon,
  ShareIcon,
  ShirtIcon,
  SparkIcon,
  Stars,
  TabletIcon,
} from "../icons";
import { AppIcon, Clamp, Framed, GetButton, Rail, type GetState } from "./parts";

/* ── Derived labels ────────────────────────────────────────────────────────── */

/** "8,472" → "8.5K". Only compacts a plain number; any other label passes through. */
export function compactCount(label: string): string {
  const digits = label.replace(/[,\s]/g, "");
  if (!/^\d+$/.test(digits)) return label;
  const n = Number(digits);
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1).replace(/\.0$/, "")}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10_000 ? 0 : 1).replace(/\.0$/, "")}K`;
  return String(n);
}

/** "Girlfriend · Runs on chai" → "Girlfriend". */
export function relationOf(subtitle: string): string {
  return (subtitle.split("·")[0] ?? "").trim();
}

const OTHER_HALF: Record<string, string> = {
  girlfriend: "Boyfriend",
  boyfriend: "Girlfriend",
  wife: "Husband",
  husband: "Wife",
  "fiancée": "Fiancé",
  fiancee: "Fiancé",
  "fiancé": "Fiancée",
  fiance: "Fiancée",
};

/** "1 human" → ["1", "human"]; "one human" → ["one", "human"]. */
function splitSize(size: string): [string, string] {
  const s = size.trim();
  const m = s.match(/^(\S+)\s+(.+)$/);
  return m ? [m[1], m[2]] : [s || "1", ""];
}

/** "English, Hindi, Sarcasm" → ["EN", "+ 2 More"]. */
function languageBadge(languages: string): [string, string] {
  const list = languages.split(/[,/]| and /).map((l) => l.trim()).filter(Boolean);
  const first = list[0] ?? "EN";
  const code = /^[A-Za-z]/.test(first) ? first.slice(0, 2).toUpperCase() : first.slice(0, 2);
  return [code, list.length > 1 ? `+ ${list.length - 1} More` : first];
}

function yearOf(data: AppData): string {
  const oldest = data.versionHistory[data.versionHistory.length - 1];
  return oldest?.date.match(/\d{4}/)?.[0] ?? "";
}

/* ── Section scaffold ──────────────────────────────────────────────────────── */

export function Section({
  title,
  action,
  onAction,
  children,
  noRule,
  id,
}: {
  title?: string;
  action?: string;
  onAction?: () => void;
  children: ReactNode;
  noRule?: boolean;
  id?: string;
}) {
  return (
    <section className={`al-sec${noRule ? " no-rule" : ""}`} id={id} aria-label={title}>
      {title ? (
        <div className="al-sec-h">
          <h2>{title}</h2>
          {action ? (
            <button type="button" onClick={onAction} className="al-press">
              {action}
            </button>
          ) : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

/* ── Header ────────────────────────────────────────────────────────────────── */

export function Header({
  data,
  rating,
  get,
  onGet,
  onShare,
  onIcon,
  iconBoop,
  getRef,
  onDeveloper,
}: {
  data: AppData;
  rating: AppRating;
  get: GetState;
  onGet: () => void;
  onShare: () => void;
  onIcon: () => void;
  iconBoop: boolean;
  getRef: React.RefObject<HTMLDivElement | null>;
  onDeveloper: () => void;
}) {
  const { app } = data;
  return (
    <header className="al-head">
      <AppIcon
        src={app.iconUrl}
        name={app.name}
        cropX={app.iconCropX}
        cropY={app.iconCropY}
        scale={app.iconScale}
        onClick={onIcon}
        className={iconBoop ? "is-boop" : ""}
        eager
      />
      <div className="al-head-body">
        <h1 className="al-name">
          {app.name}
          <span className="al-age">{app.ageRating}</span>
        </h1>
        <p className="al-sub">{app.subtitle}</p>
        <button type="button" className="al-dev" onClick={onDeveloper}>
          {app.developer}
        </button>
        <div className="al-head-rank">
          <span>No.1 in {app.category}</span>
          {rating.average > 0 ? (
            <>
              <span aria-hidden="true">·</span>
              <Stars value={rating.average} size={12} />
              <span>
                {rating.average.toFixed(1)} · {compactCount(rating.count)} Ratings
              </span>
            </>
          ) : null}
        </div>
        <div className="al-head-actions" ref={getRef}>
          <GetButton state={get} onClick={onGet} />
          {get === "idle" ? (
            <span className="al-iap-note">
              In-App
              <br />
              Purchases
            </span>
          ) : null}
          <button type="button" className="al-share al-press" onClick={onShare} aria-label="Share">
            <ShareIcon size={22} />
          </button>
        </div>
      </div>
    </header>
  );
}

/* ── Facts strip ───────────────────────────────────────────────────────────── */

function Laurel({ side }: { side: "l" | "r" }) {
  return (
    <svg width="14" height="30" viewBox="0 0 14 30" aria-hidden="true" style={side === "r" ? { transform: "scaleX(-1)" } : undefined}>
      <g fill="currentColor">
        <path d="M11 28C5 25 2 19 3 11c.3 7 3 12 8.6 15.6z" />
        <ellipse cx="4.2" cy="8" rx="1.6" ry="3.2" transform="rotate(-18 4.2 8)" />
        <ellipse cx="3.2" cy="14" rx="1.5" ry="3" transform="rotate(-40 3.2 14)" />
        <ellipse cx="4.6" cy="19.6" rx="1.5" ry="3" transform="rotate(-58 4.6 19.6)" />
        <ellipse cx="7.6" cy="24" rx="1.4" ry="2.8" transform="rotate(-72 7.6 24)" />
      </g>
    </svg>
  );
}

export function Facts({ data, rating }: { data: AppData; rating: AppRating }) {
  const { app } = data;
  const [sizeBig, sizeSmall] = splitSize(app.size);
  const [langCode, langMore] = languageBadge(app.languages);
  const seller = app.seller.trim();
  return (
    <div className="al-facts-wrap">
      <div className="al-facts" role="list" aria-label="App facts">
        <div className="al-fact" role="listitem">
          <span className="al-fact-k">{rating.average > 0 ? `${compactCount(rating.count)} Ratings` : "Ratings"}</span>
          <span className="al-fact-v">{rating.average > 0 ? rating.average.toFixed(1) : "—"}</span>
          <span className="al-fact-s">
            {rating.average > 0 ? <Stars value={rating.average} size={11} /> : "No Ratings Yet"}
          </span>
        </div>
        {seller ? (
          <div className="al-fact" role="listitem">
            <span className="al-fact-k">Award</span>
            <span className="al-fact-v" style={{ height: 30 }}>
              <span className="al-laurel">
                <Laurel side="l" />
                <b>{seller}&rsquo;s Choice</b>
                <Laurel side="r" />
              </span>
            </span>
            <span className="al-fact-s">Forever</span>
          </div>
        ) : null}
        <div className="al-fact" role="listitem">
          <span className="al-fact-k">Age</span>
          <span className="al-fact-v">{app.ageRating}</span>
          <span className="al-fact-s">Years Old</span>
        </div>
        <div className="al-fact" role="listitem">
          <span className="al-fact-k">Chart</span>
          <span className="al-fact-v">No.1</span>
          <span className="al-fact-s">{app.category}</span>
        </div>
        <div className="al-fact" role="listitem">
          <span className="al-fact-k">Developer</span>
          <span className="al-fact-v">
            <PersonSquare size={24} />
          </span>
          <span className="al-fact-s">{app.developer}</span>
        </div>
        <div className="al-fact" role="listitem">
          <span className="al-fact-k">Language</span>
          <span className="al-fact-v">{langCode}</span>
          <span className="al-fact-s">{langMore}</span>
        </div>
        <div className="al-fact" role="listitem">
          <span className="al-fact-k">Size</span>
          <span className="al-fact-v">{sizeBig}</span>
          <span className="al-fact-s">{sizeSmall || " "}</span>
        </div>
      </div>
    </div>
  );
}

/* ── What's New ────────────────────────────────────────────────────────────── */

export function WhatsNew({ latest, onHistory }: { latest: AppVersion | null; onHistory: () => void }) {
  if (!latest) return null;
  return (
    <Section title="What’s New" action="Version History" onAction={onHistory}>
      <div className="al-pad">
        <div className="al-ver-row">
          <span>Version {latest.version}</span>
          <span>{latest.date}</span>
        </div>
        <Clamp lines={3}>
          {latest.notes.map((n, i) => (
            <p key={i}>{n}</p>
          ))}
        </Clamp>
      </div>
    </Section>
  );
}

/* ── Preview (marketing screenshots) ──────────────────────────────────────── */

const SHOT_THEMES = [
  { bg: "linear-gradient(165deg, #FFE3EC 0%, #FFB8CC 100%)", ink: "#3B0A1A", sticker: "♥ new" },
  { bg: "linear-gradient(165deg, #FFF1DE 0%, #FFCDB0 100%)", ink: "#3D1A06", sticker: "" },
  { bg: "linear-gradient(165deg, #EFE6FF 0%, #CDB8FF 100%)", ink: "#1F0B4A", sticker: "24/7" },
  { bg: "linear-gradient(165deg, #E0F3FF 0%, #B9DEFF 100%)", ink: "#06243F", sticker: "" },
  { bg: "linear-gradient(165deg, #E4F8EA 0%, #BDEBCB 100%)", ink: "#0B3319", sticker: "♥" },
  { bg: "linear-gradient(165deg, #FFE9F6 0%, #F7C1E4 100%)", ink: "#3D0830", sticker: "" },
];

function Shot({ shot, index, name }: { shot: AppScreenshot; index: number; name: string }) {
  const t = SHOT_THEMES[index % SHOT_THEMES.length];
  return (
    <div className="al-shot" style={{ background: t.bg, color: t.ink }} role="listitem" aria-label={shot.caption || `Screenshot ${index + 1}`}>
      <div className="al-shot-cap">{shot.caption}</div>
      <div className="al-shot-sub">{name} ♡</div>
      {t.sticker ? <span className="al-sticker">{t.sticker}</span> : null}
      <div className="al-shot-phone">
        <div className="al-shot-screen">
          <span className="al-island" aria-hidden="true" />
          <span className="al-status" aria-hidden="true">
            <span>11:11</span>
            <i>
              <svg width="15" height="10" viewBox="0 0 15 10">
                <rect x="0" y="6" width="2.6" height="4" rx=".7" fill="#fff" />
                <rect x="4" y="4" width="2.6" height="6" rx=".7" fill="#fff" />
                <rect x="8" y="2" width="2.6" height="8" rx=".7" fill="#fff" />
                <rect x="12" y="0" width="2.6" height="10" rx=".7" fill="#fff" />
              </svg>
              <svg width="20" height="10" viewBox="0 0 20 10">
                <rect x=".5" y=".5" width="16" height="9" rx="2.4" fill="none" stroke="#fff" opacity=".6" />
                <rect x="2" y="2" width="13" height="6" rx="1.4" fill="#fff" />
                <rect x="17.6" y="3.4" width="1.6" height="3.2" rx=".8" fill="#fff" opacity=".6" />
              </svg>
            </i>
          </span>
          {shot.imageUrl ? (
            <Framed src={shot.imageUrl} cropX={shot.cropX} cropY={shot.cropY} scale={shot.scale} alt={shot.caption} />
          ) : (
            <div className="al-shot-empty">
              <HeartIcon size={28} />
              <span>your photo here</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function Preview({ data }: { data: AppData }) {
  if (data.screenshots.length === 0) return null;
  return (
    <Section title="Preview">
      <Rail label="screenshots">
        {data.screenshots.map((s, i) => (
          <Shot key={i} shot={s} index={i} name={data.app.name} />
        ))}
      </Rail>
      <div className="al-pad">
        <div className="al-devices">
          <PhoneIcon size={16} />
          <TabletIcon size={16} />
          <HeartIcon size={15} />
          <span>Runs on every device you own. Works best in person.</span>
        </div>
      </div>
    </Section>
  );
}

/* ── Description ───────────────────────────────────────────────────────────── */

export function Description({ data, onDeveloper }: { data: AppData; onDeveloper: () => void }) {
  const paras = [...data.description.short, ...data.description.full];
  if (paras.length === 0) return null;
  return (
    <Section>
      <div className="al-pad">
        <Clamp lines={3}>
          {paras.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </Clamp>
        <button type="button" className="al-devrow al-press" onClick={onDeveloper}>
          <span style={{ flex: 1, minWidth: 0 }}>
            <b>{data.app.developer}</b>
            <small>Developer</small>
          </span>
          <ChevronRight size={16} color="#C7C7CC" />
        </button>
      </div>
    </Section>
  );
}

/* ── Ratings & Reviews ─────────────────────────────────────────────────────── */

function Histogram({ rating }: { rating: AppRating }) {
  const total = rating.distribution.reduce((a, b) => a + b, 0);
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      const raf = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(raf);
    }
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setShown(true), { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div className="al-hist" ref={ref}>
      {[5, 4, 3, 2, 1].map((star) => {
        const n = rating.distribution[star - 1] ?? 0;
        const w = total ? n / total : 0;
        return (
          <div className="al-hist-row" key={star}>
            <span className="al-hist-stars" aria-hidden="true">
              <svg width={star * 8} height="7" viewBox={`0 0 ${star * 8} 7`}>
                {Array.from({ length: star }, (_, i) => (
                  <path
                    key={i}
                    transform={`translate(${star * 8 - (i + 1) * 8 + 1} 0) scale(.28)`}
                    d="M12 2.8l2.7 5.8 6.3.7-4.7 4.3 1.3 6.2L12 16.7l-5.6 3.1 1.3-6.2L3 9.3l6.3-.7z"
                    fill="#8A8A8E"
                  />
                ))}
              </svg>
            </span>
            <span className="al-hist-bar">
              <i style={{ ["--w" as string]: shown ? w : 0 }} />
            </span>
          </div>
        );
      })}
      <div className="al-hist-count">{rating.count ? `${rating.count} Ratings` : `${total} Ratings`}</div>
    </div>
  );
}

export function ReviewCard({ review, onOpen }: { review: AppReview; onOpen: () => void }) {
  return (
    <div
      className="al-card al-rev al-press"
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Review: ${review.title || review.author}`}
      style={{ cursor: "pointer" }}
    >
      <div className="al-rev-top">
        <span className="al-rev-t">{review.title || review.body.slice(0, 40)}</span>
        <span className="al-muted" style={{ fontSize: 15, flex: "none" }}>
          {review.ago}
        </span>
      </div>
      <div className="al-rev-meta">
        <Stars value={review.stars} size={13} color="#FF9500" empty="#FF9500" />
        <span>{review.author}</span>
      </div>
      <Clamp lines={review.developerResponse ? 3 : 5} onMore={onOpen}>
        <p>{review.body}</p>
      </Clamp>
      {review.developerResponse ? (
        <span style={{ marginTop: 6, fontSize: 13, color: "var(--al-accent)", fontWeight: 600 }}>
          Developer Response ♥
        </span>
      ) : null}
    </div>
  );
}

export function Ratings({
  rating,
  reviews,
  onOpenReview,
  onSeeAll,
  myStars,
  onRate,
  onWrite,
  onSupport,
}: {
  rating: AppRating;
  reviews: AppReview[];
  onOpenReview: (r: AppReview) => void;
  onSeeAll: () => void;
  myStars: number;
  onRate: (n: number, e: React.MouseEvent) => void;
  onWrite: () => void;
  onSupport: () => void;
}) {
  return (
    <Section title="Ratings & Reviews" action="See All" onAction={onSeeAll}>
      {rating.average > 0 ? (
        <div className="al-rate">
          <div className="al-rate-big">
            <b>{rating.average.toFixed(1)}</b>
            <span>out of 5</span>
          </div>
          <Histogram rating={rating} />
        </div>
      ) : (
        <p className="al-pad al-muted al-body" style={{ margin: 0 }}>
          No Ratings Yet — her friends are still typing.
        </p>
      )}
      {reviews.length > 0 ? (
        <div style={{ marginTop: 16 }}>
          <Rail label="reviews">
            {reviews.map((r) => (
              <ReviewCard key={r.id} review={r} onOpen={() => onOpenReview(r)} />
            ))}
          </Rail>
        </div>
      ) : null}
      <div className="al-tap">
        <span>Tap to Rate:</span>
        <span className="al-tapstars" role="radiogroup" aria-label="Rate her">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={myStars === n}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              className={myStars >= n ? "is-on" : ""}
              onClick={(e) => onRate(n, e)}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M12 2.8l2.7 5.8 6.3.7-4.7 4.3 1.3 6.2L12 16.7l-5.6 3.1 1.3-6.2L3 9.3l6.3-.7z"
                  fill={myStars >= n ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          ))}
        </span>
      </div>
      <div className="al-actions">
        <button type="button" className="al-action al-press" onClick={onWrite}>
          <PencilIcon size={19} /> Write a Review
        </button>
        <button type="button" className="al-action al-press" onClick={onSupport}>
          <HelpIcon size={19} /> App Support
        </button>
      </div>
    </Section>
  );
}

/* ── App Privacy ───────────────────────────────────────────────────────────── */

const PRIV_ICONS = [PinIcon, CupIcon, SparkIcon, ShirtIcon, MusicIcon, HeartIcon];

function PrivList({ items }: { items: string[] }) {
  return (
    <ul className="al-privlist">
      {items.map((it, i) => {
        const Ic = PRIV_ICONS[i % PRIV_ICONS.length];
        return (
          <li key={i}>
            <Ic size={17} />
            <span>{it}</span>
          </li>
        );
      })}
    </ul>
  );
}

export function Privacy({ data, onDetails }: { data: AppData; onDetails: () => void }) {
  const { tracked, linked } = data.privacy;
  if (tracked.length === 0 && linked.length === 0) return null;
  return (
    <Section title="App Privacy" action="See Details" onAction={onDetails}>
      <p className="al-pad al-muted al-body" style={{ margin: 0 }}>
        The developer, <span className="al-link">{data.app.seller.trim() || data.app.developer}</span>, indicated that
        this app’s privacy practices may include handling of data as described below. It is all kept very, very
        safe.
      </p>
      <div className="al-priv">
        {tracked.length > 0 ? (
          <div className="al-card al-privcard">
            <EyeTrackIcon size={30} />
            <h3>Data Used to Track You</h3>
            <p>The following data is tracked closely, constantly, and only out of love:</p>
            <PrivList items={tracked} />
          </div>
        ) : null}
        {linked.length > 0 ? (
          <div className="al-card al-privcard">
            <LinkedIcon size={30} />
            <h3>Data Linked to You</h3>
            <p>The following data is permanently linked to your identity. No opt-out:</p>
            <PrivList items={linked} />
          </div>
        ) : null}
      </div>
    </Section>
  );
}

/* ── Supports ──────────────────────────────────────────────────────────────── */

export function Supports({ data }: { data: AppData }) {
  const seller = data.app.seller.trim() || "one person";
  return (
    <Section title="Supports">
      <div className="al-supp">
        <span className="al-supp-ic">
          <PeopleIcon size={24} color="#fff" />
        </span>
        <div>
          <b>Couple Sharing</b>
          <span>Up to one person can use this app with Couple Sharing enabled. That person is {seller}.</span>
        </div>
      </div>
      <div className="al-supp">
        <span className="al-supp-ic">
          <HeartIcon size={24} color="#fff" />
        </span>
        <div>
          <b>Background Refresh</b>
          <span>Stays open in the background of every single day. Cannot be force-quit.</span>
        </div>
      </div>
    </Section>
  );
}

/* ── Information ───────────────────────────────────────────────────────────── */

function InfoRow({ k, v, more }: { k: string; v: string; more?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const expandable = !!more;
  return (
    <div className={`al-irow${open ? " is-open" : ""}`}>
      {expandable ? (
        <button type="button" className="al-irow-btn" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          <span className="al-irow-k">{k}</span>
          <span className="al-irow-v">
            <span>{v}</span>
            <ChevronDown size={14} />
          </span>
        </button>
      ) : (
        <div className="al-irow-btn">
          <span className="al-irow-k">{k}</span>
          <span className="al-irow-v">
            <span>{v}</span>
          </span>
        </div>
      )}
      {expandable ? (
        <div className="al-irow-more">
          <div>
            <div className="al-inner">{more}</div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** "Forehead kiss · Free" → ["Forehead kiss", "Free"]. */
export function splitIap(line: string): [string, string] {
  const i = line.lastIndexOf("·");
  if (i === -1) {
    const dash = line.lastIndexOf(" — ");
    if (dash === -1) return [line.trim(), "Free"];
    return [line.slice(0, dash).trim(), line.slice(dash + 3).trim() || "Free"];
  }
  return [line.slice(0, i).trim(), line.slice(i + 1).trim() || "Free"];
}

export function Information({ data, onLink }: { data: AppData; onLink: (what: "site" | "policy") => void }) {
  const { app } = data;
  const [, langMore] = languageBadge(app.languages);
  const year = yearOf(data);
  return (
    <Section title="Information">
      <div className="al-info">
        <InfoRow k="Provider" v={app.developer} />
        {app.seller.trim() ? <InfoRow k="Seller" v={app.seller} /> : null}
        <InfoRow k="Size" v={app.size} />
        <InfoRow k="Category" v={app.category} />
        <InfoRow k="Compatibility" v={app.compatibility.length > 18 ? "Works with…" : app.compatibility} more={<span>{app.compatibility}</span>} />
        <InfoRow k="Languages" v={langMore.startsWith("+") ? `${app.languages.split(",")[0]} and more` : app.languages} more={<span>{app.languages}</span>} />
        <InfoRow
          k="Age Rating"
          v={app.ageRating}
          more={
            <span>
              {app.ageRating} · Frequent/Intense Cuddling
              <br />
              Infrequent/Mild Cheesy Pickup Lines
            </span>
          }
        />
        {data.iap.length > 0 ? (
          <InfoRow
            k="In-App Purchases"
            v="Yes"
            more={
              <div>
                {data.iap.map((line, i) => {
                  const [what, price] = splitIap(line);
                  return (
                    <div className="al-iap" key={i}>
                      <span>{what}</span>
                      <span>{price}</span>
                    </div>
                  );
                })}
              </div>
            }
          />
        ) : null}
        <InfoRow k="Price" v={app.price} />
        <InfoRow k="Copyright" v={`© ${year ? `${year} ` : ""}${app.developer}`} />
      </div>
      <div className="al-pad" style={{ marginTop: 6 }}>
        <button type="button" className="al-linkrow al-press" onClick={() => onLink("site")}>
          Developer Website <CompassIcon size={20} />
        </button>
        <button type="button" className="al-linkrow al-press" onClick={() => onLink("policy")}>
          Privacy Policy <HandIcon size={20} />
        </button>
      </div>
    </Section>
  );
}

/* ── You Might Also Like ───────────────────────────────────────────────────── */

interface Suggestion {
  name: string;
  sub: string;
  bg: string;
  glyph: ReactNode;
  toast: string;
}

export function suggestionsFor(data: AppData): Suggestion[] {
  const her = data.app.name.trim() || "her";
  const seller = data.app.seller.trim();
  const rel = relationOf(data.app.subtitle).toLowerCase();
  const other = OTHER_HALF[rel] ?? "Partner";
  return [
    {
      name: seller || "You",
      sub: `${other} · Only works with ${her}`,
      bg: "linear-gradient(135deg, #5AC8FA, #007AFF)",
      glyph: (seller[0] ?? "♥").toUpperCase(),
      toast: `Already installed on ${her}. Obviously.`,
    },
    {
      name: "Chai for Two",
      sub: "Food & Drink · Best at 5 pm",
      bg: "linear-gradient(135deg, #FFCC66, #FF8A00)",
      glyph: <CupIcon size={30} color="#fff" />,
      toast: `Requires ${her} on the other side of the table.`,
    },
    {
      name: "3AM Calls",
      sub: "Social Networking",
      bg: "linear-gradient(135deg, #5E5CE6, #2C1C7A)",
      glyph: <span style={{ fontSize: 28 }}>☾</span>,
      toast: "Only available between midnight and sunrise.",
    },
    {
      name: "Long Drives",
      sub: "Navigation · No destination",
      bg: "linear-gradient(135deg, #34C7A5, #0A8F74)",
      glyph: <PinIcon size={30} color="#fff" />,
      toast: `Navigation disabled. ${her} picks the songs.`,
    },
    {
      name: "Forehead Kisses",
      sub: "Health & Fitness",
      bg: "linear-gradient(135deg, #FF8FAB, #FF2D55)",
      glyph: <HeartIcon size={30} color="#fff" filled />,
      toast: "Unlimited. Always free. No subscription.",
    },
    {
      name: "Our Playlist",
      sub: "Music · 212 songs, 0 skips",
      bg: "linear-gradient(135deg, #BF5AF2, #7D2AE8)",
      glyph: <MusicIcon size={30} color="#fff" />,
      toast: "Already on repeat.",
    },
  ];
}

export function AlsoLike({ data, onPick }: { data: AppData; onPick: (toast: string) => void }) {
  const apps = suggestionsFor(data);
  const cols: Suggestion[][] = [];
  for (let i = 0; i < apps.length; i += 3) cols.push(apps.slice(i, i + 3));
  return (
    <Section title="You Might Also Like" action="See All" onAction={() => onPick("Nothing else compares. That’s the whole list.")}>
      <Rail label="suggested apps">
        {cols.map((col, ci) => (
          <div className="al-ymal-col" key={ci} role="listitem">
            {col.map((a) => (
              <div className="al-lockup" key={a.name}>
                <span className="al-lockup-ic" style={{ background: a.bg }} aria-hidden="true">
                  {a.glyph}
                </span>
                <div className="al-lockup-txt">
                  <div>
                    <b>{a.name}</b>
                    <small>{a.sub}</small>
                  </div>
                  <GetButton state="idle" small soft onClick={() => onPick(a.toast)} />
                </div>
              </div>
            ))}
          </div>
        ))}
      </Rail>
    </Section>
  );
}
