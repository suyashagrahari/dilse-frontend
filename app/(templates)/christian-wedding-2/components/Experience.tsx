"use client";

// ─── Christian Wedding — Scroll Edition: the guest's experience ─────────────
//
// Stained-glass casement windows swing open onto a cherry-blossom garden
// (tap: wind chimes, the music starts) → the garden terrace hero (ivy curtain,
// white columns, hanging lanterns, the couple framed under blossom branches,
// the date, save-the-date + WhatsApp) → the verse → the invitation (+ an
// optional second language) → the couple → the families → the countdown over
// the lake → our story → the order of service → every function (map, dress
// code, calendar) → the church → live stream → film → gallery → good to know +
// people to call → RSVP per function → the blessings wall (voice notes) →
// shagun → share → the closing seal.
//
// Light only. All art is the owner's or CC0, from /public/wedding-v3 via its CDN twin.
// Every photo frame and card is a rounded rectangle with four equal corners.

import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { cdn, Countdown, DEFAULT_TZ_OFFSET, downloadWeddingIcs, formatEventDate, formatEventTime, googleCalendarUrl, mapLink, Reveal, RSVPBlock, WeddingMasonry, WeddingRoot, type WeddingEvent } from "../../_wedding";
import { cropImgStyle } from "../../_valentine/editor/PhotoCropper";
import { Btn, CAL, Contacts, Icon, LiveStream, PIN, PLAY, SHIRT, ShareBar, Shagun, WA, openWhatsApp, pageUrl } from "./Actions";
import Opening from "./Opening";
import Wishes, { type Wish } from "./Wishes";
import { C2_CSS } from "./css";
import { img, localArt } from "../lib/art";
import { prefillRsvpName, useGuestName } from "../lib/guest";
import type { InviteCardInput } from "../lib/inviteCard";
import { mainEventOf, namesOf, swatchFor, youtubeIdOf, isHttps, isUpiId, type Cw2Data, type Portrait } from "../lib/model";

export const SLUG = "christian-wedding-2";

/** Kit tokens for each palette (the kit's RSVP, countdown and gallery read them). */
const THEME_TOKENS: Record<Cw2Data["theme"], Record<string, string>> = {
  blossom: {
    "--c2-bg": "#fbf6f2", "--c2-bg2": "#f4ebe6",
    "--wk-bg": "#fbf6f2", "--wk-bg2": "#f4ebe6", "--wk-surface": "rgba(255,253,249,.92)", "--wk-surface-solid": "#fffdf9", "--wk-surface-2": "#f6eeea",
    "--wk-ink": "#2f3a32", "--wk-muted": "#66726a", "--wk-accent": "#4c6852", "--wk-accent-ink": "#ffffff", "--wk-gold": "#c2a165", "--wk-gold-ink": "#86672c",
    "--wk-border": "rgba(127,154,131,.3)", "--wk-glow": "rgba(236,195,202,.55)", "--wk-placeholder": "linear-gradient(135deg,#f7e6e9,#fbf3f1 50%,#eaf0e7)",
    "--wk-foil": "linear-gradient(135deg,#b78f4f 0%,#e8d3a1 45%,#c2a165 60%,#9c7a3c 100%)",
  },
  sage: {
    "--c2-bg": "#f5f7f1", "--c2-bg2": "#e9efe5", "--c2-blush": "#e9cfc8", "--c2-blush-deep": "#9a6a5e", "--c2-blush-soft": "#f6efe9", "--c2-sage-deep": "#3f5c46",
    "--wk-bg": "#f5f7f1", "--wk-bg2": "#e9efe5", "--wk-surface": "rgba(255,255,252,.92)", "--wk-surface-solid": "#fffffc", "--wk-surface-2": "#eef3ea",
    "--wk-ink": "#28362c", "--wk-muted": "#617066", "--wk-accent": "#3f5c46", "--wk-accent-ink": "#ffffff", "--wk-gold": "#b99a5c", "--wk-gold-ink": "#7c6029",
    "--wk-border": "rgba(63,92,70,.24)", "--wk-glow": "rgba(190,214,190,.55)", "--wk-placeholder": "linear-gradient(135deg,#e8efe4,#f7f9f4 50%,#e4ece0)",
    "--wk-foil": "linear-gradient(135deg,#a8894b 0%,#e3cf9e 45%,#b99a5c 60%,#8f7134 100%)",
  },
  ivory: {
    "--c2-bg": "#fbf8f1", "--c2-bg2": "#f3ecdc", "--c2-sage-deep": "#5a6b4c", "--c2-blush-deep": "#a0704a", "--c2-blush-soft": "#f8f1e6", "--c2-gold": "#b8913f",
    "--wk-bg": "#fbf8f1", "--wk-bg2": "#f3ecdc", "--wk-surface": "rgba(255,253,247,.92)", "--wk-surface-solid": "#fffdf7", "--wk-surface-2": "#f6efe1",
    "--wk-ink": "#33302a", "--wk-muted": "#6f685b", "--wk-accent": "#5a6b4c", "--wk-accent-ink": "#ffffff", "--wk-gold": "#b8913f", "--wk-gold-ink": "#7f6223",
    "--wk-border": "rgba(184,145,63,.3)", "--wk-glow": "rgba(240,222,180,.6)", "--wk-placeholder": "linear-gradient(135deg,#f4ecdc,#fcf9f2 50%,#efe6d2)",
    "--wk-foil": "linear-gradient(135deg,#a8823a 0%,#ead6a2 45%,#b8913f 60%,#8a6a2b 100%)",
  },
};

const GALLERY_COLUMNS = [
  { min: 0, columns: 2 },
  { min: 600, columns: 3 },
  { min: 940, columns: 4 },
];

const SPRIG = "M36 20C28 22 18 22 6 18M30 21c-1-4 1-7 4-8-0 4-2 7-4 8zM22 21.5c-1.5-4 0-7.5 3.5-9-.2 4-1.5 7.5-3.5 9zM14 20.5c-2-3.5-1-7 2.5-9 .3 4-.5 7-2.5 9zM28 21c3 3 6 3.5 9 2.5-2.5-2.5-6-3.5-9-2.5zM19 21.5c3 3 6.5 3.5 9.5 2-2.5-2.5-6-3.2-9.5-2zM10 19.5c3 3 6 3.5 9 2.2-2.5-2.4-6-3.3-9-2.2z";

function Head({ eyebrow, title }: { eyebrow: string; title?: ReactNode }) {
  return (
    <Reveal className="c2-head">
      <p className="c2-eyebrow">{eyebrow}</p>
      {title && <h2 className="c2-h2">{title}</h2>}
      <div className="c2-rule" aria-hidden>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3c.9 2.7 2.4 4.2 5 5-2.6.8-4.1 2.3-5 5-.9-2.7-2.4-4.2-5-5 2.6-.8 4.1-2.3 5-5zM12 15c.5 1.4 1.3 2.2 2.7 2.7-1.4.5-2.2 1.3-2.7 2.7-.5-1.4-1.3-2.2-2.7-2.7 1.4-.5 2.2-1.3 2.7-2.7z" />
        </svg>
      </div>
    </Reveal>
  );
}

function Photo({ p, alt, className, style, lazy = true }: { p: Portrait; alt: string; className?: string; style?: CSSProperties; lazy?: boolean }) {
  return (
    <div className={`c2-frame${className ? ` ${className}` : ""}`} style={style}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={cdn(localArt(p.url))} alt={alt} loading={lazy ? "lazy" : "eager"} decoding="async" style={cropImgStyle(p.crop)} />
    </div>
  );
}

function Film({ id }: { id: string }) {
  const [on, setOn] = useState(false);
  return (
    <div className="c2-film">
      {on ? (
        <iframe src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`} title="Our film" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen loading="lazy" />
      ) : (
        <button type="button" className="c2-film-poster" onClick={() => setOn(true)} aria-label="Play our film">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" decoding="async" />
          <span className="c2-film-play" aria-hidden>
            <Icon d={PLAY} fill size={30} />
          </span>
        </button>
      )}
    </div>
  );
}

const noSub = () => () => undefined;

function EventCard({ e, isMain, couple, i }: { e: WeddingEvent; isMain: boolean; couple: string; i: number }) {
  // The page URL only exists in the browser: read it after hydration (no SSR mismatch).
  const url = useSyncExternalStore(noSub, pageUrl, () => "");
  const ics = { couple, url, tz: DEFAULT_TZ_OFFSET };
  let day = "";
  let mon = "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(e.date)) {
    const [y, m, d] = e.date.split("-").map(Number);
    day = String(d);
    mon = new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-IN", { month: "short", timeZone: "UTC" }).toUpperCase();
  }
  const when = [e.date ? formatEventDate(e.date, "en-IN") : "", e.time ? `${formatEventTime(e.time, "en-IN")}${e.endTime ? ` – ${formatEventTime(e.endTime, "en-IN")}` : ""}` : ""].filter(Boolean);
  const sw = swatchFor(e);
  const map = e.venue || e.address || e.mapUrl ? mapLink(e) : "";
  const g = e.date ? googleCalendarUrl(e, ics) : "";
  return (
    <Reveal as="article" className={`c2-card c2-ev${isMain ? " is-main" : ""}`} delay={(i % 3) * 90}>
      <div className="c2-ev-top">
        <div className={`c2-ev-date${day ? "" : " is-tba"}`} aria-hidden>
          {day ? (
            <>
              <b>{day}</b>
              <small>{mon}</small>
            </>
          ) : (
            <b>TBA</b>
          )}
        </div>
        <div style={{ minWidth: 0 }}>
          {isMain && <span className="c2-ev-badge">The ceremony</span>}
          <h3 className="c2-ev-title">{e.title || "Celebration"}</h3>
          <p className="c2-ev-when">{when.length ? when.map((w) => <span key={w}>{w}</span>) : "Date to be announced"}</p>
        </div>
      </div>
      {(e.venue || e.address) && (
        <p className="c2-ev-row">
          <Icon d={PIN} size={18} />
          <span>
            {e.venue && <b>{e.venue}</b>}
            {e.venue && e.address && <br />}
            {e.address}
          </span>
        </p>
      )}
      {e.dressCode && (
        <p className="c2-ev-row">
          {sw ? <span className="c2-swatch" style={{ background: sw }} aria-hidden /> : <Icon d={SHIRT} size={18} />}
          <span>
            <b>Dress code:</b> {e.dressCode}
          </span>
        </p>
      )}
      {e.note && <p className="c2-ev-note">{e.note}</p>}
      <div className="c2-ev-actions">
        {map && (
          <Btn href={map} icon={PIN} small kind="ghost" label={`Directions to ${e.venue || e.title}`}>
            Directions
          </Btn>
        )}
        {e.date && (
          <Btn icon={CAL} small kind="ghost" onClick={() => downloadWeddingIcs([e], ics, `${e.title}-${couple}`)} label={`Add ${e.title} to your calendar`}>
            Calendar
          </Btn>
        )}
        {g && (
          <Btn href={g} small kind="ghost" label={`Add ${e.title} to Google Calendar`}>
            Google
          </Btn>
        )}
      </div>
    </Reveal>
  );
}

export interface ExperienceProps {
  data: Cw2Data;
  mode: "preview" | "live";
  shareId?: string | null;
  wishes?: Wish[];
  /** Live page: the "Create your own" link + brand in the finale. */
  brand?: boolean;
  /** Bump to replay the opening. */
  replayKey?: number;
  /** Skip the opening (the editor's live preview while typing). */
  noOpening?: boolean;
  onOpened?: () => void;
}

export default function Experience({ data: d, mode, shareId, wishes = [], brand = false, replayKey = 0, noOpening = false, onOpened }: ExperienceProps) {
  const guest = useGuestName();
  const [first, second] = namesOf(d);
  const couple = `${first} & ${second}`;
  const main = mainEventOf(d.events);
  const [open, setOpen] = useState(noOpening);
  const [replays, setReplays] = useState(0);
  const [shownKey, setShownKey] = useState(replayKey);
  if (shownKey !== replayKey) {
    setShownKey(replayKey);
    setOpen(false);
  }
  const showOpening = !noOpening && !open;

  // A reload in the same tab skips the gate (the music then starts on the first tap anywhere).
  useEffect(() => {
    if (mode !== "live" || !shareId) return;
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (sessionStorage.getItem(`c2_opened_${shareId}`) === "1") setOpen(true);
    } catch {}
  }, [mode, shareId]);

  const dateLine = main?.date ? formatEventDate(main.date, "en-IN") : "";
  const timeLine = main?.time ? formatEventTime(main.time, "en-IN") : "";
  // The city: the address's second-last part ("Ernakulam, Kochi, Kerala" → Kochi), unless the venue already names it.
  const addrParts = (main?.address ?? "").split(",").map((p) => p.trim()).filter(Boolean);
  const city = addrParts.length >= 3 ? addrParts[addrParts.length - 2] : addrParts[addrParts.length - 1];
  const venueLine = [main?.venue, city && !main?.venue?.toLowerCase().includes(city.toLowerCase()) ? city : ""].filter(Boolean).join(" · ");
  const dated = d.events.filter((e) => e.date);
  const videoId = d.videoUrl ? youtubeIdOf(d.videoUrl) : "";
  // Photos that no longer load (old pages can point at a retired bucket) leave the wall instead of showing an empty tile.
  const [deadPhotos, setDeadPhotos] = useState<ReadonlySet<string>>(() => new Set());
  const gallery = useMemo(() => d.gallery.filter((p) => p.url && !deadPhotos.has(localArt(p.url))).map((p) => ({ ...p, url: localArt(p.url) })), [d.gallery, deadPhotos]);
  useEffect(() => {
    let live = true;
    for (const p of d.gallery) {
      if (!p.url) continue;
      const url = localArt(p.url);
      const probe = new Image();
      probe.onerror = () => live && setDeadPhotos((s) => (s.has(url) ? s : new Set(s).add(url)));
      probe.src = cdn(url);
    }
    return () => {
      live = false;
    };
  }, [d.gallery]);
  const story = d.story.filter((c) => c.title || c.line);
  const order = d.order.filter((o) => o.title);
  const things = d.things.filter((t) => t.text);
  const hasFamilies = !!(d.brideFamily.parents || d.groomFamily.parents || d.brideFamily.grandparents || d.groomFamily.grandparents);
  const famFirst = d.nameOrder === "groom" ? ["groom", "bride"] as const : ["bride", "groom"] as const;
  const verse = d.scripture.text.trim();
  const paragraphs = (d.invitation || "").split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const shareText = `💐 You're invited to the wedding of ${couple}`;
  const card: InviteCardInput = {
    first,
    second,
    dateLine,
    time: timeLine,
    venue: main?.venue ?? "",
    address: main?.address ?? "",
    verse: verse.length <= 180 ? verse : "",
    verseRef: d.scripture.ref,
    guest,
    url: typeof window === "undefined" ? "" : pageUrl(),
  };

  // ?to= also fills the RSVP's name.
  const rsvpRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!guest) return;
    const ts = [300, 1400].map((ms) => window.setTimeout(() => prefillRsvpName(rsvpRef.current, guest), ms));
    return () => ts.forEach((t) => window.clearTimeout(t));
  }, [guest, open]);

  // The kit's RSVP placeholders are North-Indian (a sangeet, the Sharma family); a church wedding gets its own.
  useEffect(() => {
    const root = rsvpRef.current;
    if (!root) return;
    const fix = () =>
      root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("textarea, input").forEach((t) => {
        if (/sangeet/i.test(t.placeholder)) t.placeholder = "Congratulations! We'll be praying for you both…";
        else if (/sharma/i.test(t.placeholder)) t.placeholder = "e.g. The Mathew family";
      });
    fix();
    const mo = new MutationObserver(fix);
    mo.observe(root, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, [d.rsvpOn]);

  const onOpenedInner = () => {
    setOpen(true);
    if (mode === "live" && shareId) {
      try {
        sessionStorage.setItem(`c2_opened_${shareId}`, "1");
      } catch {}
    }
    onOpened?.();
  };

  const people = famFirst.map((side) => ({
    side,
    role: side === "bride" ? "The bride" : "The groom",
    name: side === "bride" ? d.brideName || "Bride" : d.groomName || "Groom",
    desc: side === "bride" ? d.bride.description : d.groom.description,
    photo: side === "bride" ? d.bridePhoto : d.groomPhoto,
    fam: side === "bride" ? d.brideFamily : d.groomFamily,
  }));

  const share = mode === "live" && shareId ? { slug: SLUG, shareId } : null;
  const altLang = d.secondLang === "none" ? undefined : d.secondLang;

  return (
    <WeddingRoot theme="blush" className={`c2-root${open ? " is-open" : ""}`} style={THEME_TOKENS[d.theme] as CSSProperties} background={false}>
      <style>{C2_CSS}</style>
      <div className="c2-backdrop" aria-hidden />
      {showOpening && <Opening key={`${replayKey}-${replays}`} first={first} second={second} dateLine={dateLine} place={main?.venue ?? ""} guest={guest} onOpened={onOpenedInner} />}

      <main className="c2-main">
        {/* ── Hero: the garden terrace ─────────────────────────────────── */}
        <section className="c2-hero" id="c2-home" aria-label={`The wedding of ${couple}`}>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...img("sky")} className="c2-hero-sky" />
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...img("column")} className="c2-col is-l" aria-hidden />
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...img("column")} className="c2-col is-r" aria-hidden />
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...img("ivy")} className="c2-hero-ivy" aria-hidden />
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...img("lanterns")} className="c2-hero-lantern is-l" aria-hidden />
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...img("lanterns")} className="c2-hero-lantern is-r" aria-hidden />

          <div className="c2-hero-body">
            <div className="c2-hero-text">
              <p className="c2-eyebrow c2-in" style={{ ["--i" as string]: 0 }}>
                {guest ? `Dear ${guest}` : "Together with their families"}
              </p>
              <h1 className="c2-hero-names c2-in" style={{ ["--i" as string]: 1 }}>
                <span>{first}</span>
                <i>&amp;</i>
                <span>{second}</span>
              </h1>
              <p className="c2-hero-sub c2-in" style={{ ["--i" as string]: 2 }}>
                request the honour of your presence at their {main && /mass/i.test(main.title) ? "Nuptial Mass" : "Holy Matrimony"}
              </p>
              {(dateLine || timeLine) && (
                <div className="c2-hero-when c2-in" style={{ ["--i" as string]: 3 }}>
                  <p className="c2-hero-date">{dateLine || timeLine}</p>
                  {dateLine && timeLine && <p className="c2-hero-time">{timeLine}</p>}
                  {venueLine && <p className="c2-hero-venue">{venueLine}</p>}
                </div>
              )}
              <div className="c2-hero-actions c2-in" style={{ ["--i" as string]: 4 }}>
                {dated.length > 0 && (
                  <Btn icon={CAL} onClick={() => downloadWeddingIcs(dated, { couple, url: pageUrl(), tz: DEFAULT_TZ_OFFSET }, `wedding-${couple}`)}>
                    Save the date
                  </Btn>
                )}
                {d.rsvpOn && (
                  <Btn href="#c2-rsvp" kind="blush" newTab={false}>
                    RSVP
                  </Btn>
                )}
                <Btn icon={WA} fill kind="ghost" onClick={() => openWhatsApp(shareText)} label="Share on WhatsApp">
                  WhatsApp
                </Btn>
              </div>
            </div>
            <div className="c2-hero-photo-wrap c2-in" style={{ ["--i" as string]: 2 }}>
              {d.couplePhoto.url ? (
                <Photo p={d.couplePhoto} alt={couple} className="c2-hero-photo" lazy={false} />
              ) : (
                <div className="c2-frame c2-hero-photo">
                  <div className="c2-initial">
                    {first.slice(0, 1)}
                    {second.slice(0, 1)}
                  </div>
                </div>
              )}
              {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
              <img {...img("branch")} className="c2-hero-branch is-tl" aria-hidden />
              {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
              <img {...img("branch")} className="c2-hero-branch is-br" aria-hidden />
            </div>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...img("railing")} className="c2-hero-rail" aria-hidden />
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...img("anthurium")} className="c2-hero-plant is-l" aria-hidden />
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...img("palm")} className="c2-hero-plant is-r" aria-hidden />
        </section>

        {/* ── The verse ─────────────────────────────────────────────────── */}
        {verse && (
          <section className="c2-sec" id="c2-verse">
            <Reveal className="c2-card c2-verse c2-narrow" effect="zoom">
              {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
              <img {...img("branch", { lazy: true })} className="c2-verse-branch is-tl" aria-hidden />
              {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
              <img {...img("branch", { lazy: true })} className="c2-verse-branch is-br" aria-hidden />
              <svg className="c2-dove" viewBox="0 0 96 36" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden>
                {/* A slender cross between two olive sprigs. */}
                <path d="M48 4v28M41 12h14" strokeWidth="1.8" />
                <path d={SPRIG} />
                <path d={SPRIG} transform="matrix(-1 0 0 1 96 0)" />
              </svg>
              <blockquote style={{ margin: 0 }}>
                <p className="c2-verse-text">“{verse}”</p>
                {d.scripture.ref && <footer className="c2-verse-ref">{d.scripture.ref}</footer>}
              </blockquote>
              {altLang && d.altVerse && (
                <p className="c2-verse-alt" lang={altLang}>
                  {d.altVerse}
                </p>
              )}
            </Reveal>
          </section>
        )}

        {/* ── The invitation ────────────────────────────────────────────── */}
        {(paragraphs.length > 0 || (altLang && d.altInvitation)) && (
          <section className="c2-sec" id="c2-invitation" style={{ paddingTop: verse ? 0 : undefined }}>
            <Head eyebrow="The invitation" title="With joyful hearts" />
            <Reveal className="c2-card c2-invite c2-narrow">
              {paragraphs.map((p, i) => (
                <p key={i} className="c2-p">
                  {p}
                </p>
              ))}
              {altLang && d.altInvitation && (
                <p className="c2-invite-alt" lang={altLang}>
                  {d.altInvitation}
                </p>
              )}
              <p className="c2-sign">{couple}</p>
            </Reveal>
          </section>
        )}

        {/* ── The couple ────────────────────────────────────────────────── */}
        <section className="c2-sec" id="c2-couple">
          <Head eyebrow="The couple" title="Two hearts, one path" />
          <div className="c2-wrap c2-couple">
            {people.map((p, i) => (
              <ConditionalAmp key={p.side} show={i === 1}>
                <Reveal className="c2-person" delay={i * 120}>
                  {p.photo.url ? (
                    <Photo p={p.photo} alt={p.name} />
                  ) : (
                    <div className="c2-frame">
                      <div className="c2-initial">{p.name.slice(0, 1)}</div>
                    </div>
                  )}
                  <p className="c2-person-role">{p.role}</p>
                  <p className="c2-person-name">{p.name}</p>
                  {p.desc && <p className="c2-p c2-person-desc">{p.desc}</p>}
                </Reveal>
              </ConditionalAmp>
            ))}
          </div>
        </section>

        {/* ── Families ──────────────────────────────────────────────────── */}
        {hasFamilies && (
          <section className="c2-sec" id="c2-families" style={{ paddingTop: 0 }}>
            <Head eyebrow="With the blessings of" title="Our families" />
            <div className="c2-wrap" style={{ maxWidth: 880 }}>
              <div className="c2-fams">
                {people.map((p, i) =>
                  p.fam.parents || p.fam.grandparents ? (
                    <Reveal key={p.side} className="c2-card c2-fam" delay={i * 100}>
                      <p className="c2-fam-side">{p.side === "bride" ? `${p.name}'s family` : `${p.name}'s family`}</p>
                      {p.fam.parents && <p className="c2-fam-names">{p.fam.parents}</p>}
                      {p.fam.grandparents && <p className="c2-fam-gp">{p.fam.grandparents}</p>}
                    </Reveal>
                  ) : null,
                )}
              </div>
              {d.blessingsOf && <p className="c2-fam-of">{d.blessingsOf}</p>}
            </div>
          </section>
        )}

        {/* ── The date + countdown over the lake ────────────────────────── */}
        {main?.date && (
          <section className="c2-sec c2-date-sec" id="c2-countdown">
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img {...img("mountains", { lazy: true })} className="c2-date-art" aria-hidden />
            <Head eyebrow="Counting the days" title="Save the date" />
            <Reveal className="c2-card c2-date-card c2-narrow" effect="zoom">
              <p className="c2-date-big">{dateLine}</p>
              <p className="c2-date-line">{[main.title, timeLine, main.venue].filter(Boolean).join(" · ")}</p>
              <Countdown date={main.date} time={main.time || "10:00"} variant="flip" doneText="Just married" />
              {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
              <img {...img("fountain", { lazy: true })} className="c2-date-fountain" aria-hidden />
            </Reveal>
          </section>
        )}

        {/* ── Our story ─────────────────────────────────────────────────── */}
        {story.length > 0 && (
          <section className="c2-sec" id="c2-story">
            <Head eyebrow="How it began" title="Our story" />
            <div className="c2-wrap c2-story" style={{ maxWidth: 980 }}>
              {story.map((c, i) => (
                <Reveal key={i} className="c2-ch" delay={80}>
                  {c.photo ? <Photo p={{ url: c.photo, crop: c.crop }} alt={c.title} /> : null}
                  <div className="c2-ch-t">
                    {c.when && <p className="c2-ch-when">{c.when}</p>}
                    {c.title && <h3 className="c2-h3">{c.title}</h3>}
                    {c.line && <p className="c2-p">{c.line}</p>}
                  </div>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* ── Order of service ──────────────────────────────────────────── */}
        {order.length > 0 && (
          <section className="c2-sec" id="c2-service" style={{ paddingTop: story.length ? 0 : undefined }}>
            <Head eyebrow={main?.title || "The ceremony"} title="Order of service" />
            <Reveal className="c2-card c2-oos c2-narrow">
              <ol>
                {order.map((o, i) => (
                  <li key={i}>
                    <span className="c2-oos-time">{/^\d{2}:\d{2}$/.test(o.time) ? formatEventTime(o.time, "en-IN") : o.time}</span>
                    <div>
                      <p className="c2-oos-title">{o.title}</p>
                      {o.note && <p className="c2-oos-note">{o.note}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            </Reveal>
          </section>
        )}

        {/* ── Functions ─────────────────────────────────────────────────── */}
        {d.events.length > 0 && (
          <section className="c2-sec" id="c2-events">
            <Head eyebrow="Join us" title="The celebrations" />
            <div className="c2-wrap c2-events">
              {d.events.map((e, i) => (
                <EventCard key={e.id || i} e={e} i={i} isMain={e === main && d.events.length > 1} couple={couple} />
              ))}
            </div>
            {dated.length > 1 && (
              <div className="c2-saveall">
                <Btn icon={CAL} kind="ghost" onClick={() => downloadWeddingIcs(dated, { couple, url: pageUrl(), tz: DEFAULT_TZ_OFFSET }, `wedding-${couple}`)}>
                  Save all dates
                </Btn>
              </div>
            )}
          </section>
        )}

        {/* ── The church ────────────────────────────────────────────────── */}
        {main?.venue && (
          <section className="c2-sec" id="c2-venue" style={{ paddingTop: 0 }}>
            <Head eyebrow="Where" title="The church" />
            <Reveal className="c2-card c2-venue c2-wrap" style={{ maxWidth: 880 }}>
              {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
              <img {...img("gazebo", { lazy: true })} className="c2-venue-art" aria-hidden />
              <div className="c2-venue-t">
                <p className="c2-eyebrow">{main.title}</p>
                <h3 className="c2-venue-name">{main.venue}</h3>
                {main.address && <p className="c2-small" style={{ margin: 0 }}>{main.address}</p>}
                <Btn href={mapLink(main)} icon={PIN}>
                  Get directions
                </Btn>
                {d.gettingThere && <p className="c2-venue-note">{d.gettingThere}</p>}
              </div>
            </Reveal>
          </section>
        )}

        {/* ── Live + film ───────────────────────────────────────────────── */}
        {d.liveUrl && isHttps(d.liveUrl) && (
          <section className="c2-sec" id="c2-live" style={{ paddingTop: 0 }}>
            <Head eyebrow="From wherever you are" title="Watch live" />
            <div className="c2-narrow">
              <LiveStream url={d.liveUrl} main={main} />
            </div>
          </section>
        )}
        {videoId && (
          <section className="c2-sec" id="c2-film" style={{ paddingTop: 0 }}>
            <Head eyebrow="A little film" title="Our film" />
            <Reveal className="c2-wrap" style={{ maxWidth: 880 }} effect="zoom">
              <Film id={videoId} />
            </Reveal>
          </section>
        )}

        {/* ── Gallery ───────────────────────────────────────────────────── */}
        {gallery.length > 0 && (
          <section className="c2-sec" id="c2-gallery">
            <Head eyebrow="Moments" title="Gallery" />
            <div className="c2-gallery">
              <WeddingMasonry photos={gallery} mask="rounded" radius={18} columns={GALLERY_COLUMNS} frame="none" tileCaptions label="Gallery" />
            </div>
          </section>
        )}

        {/* ── Good to know + people to call ─────────────────────────────── */}
        {(things.length > 0 || d.contacts.some((c) => c.name && c.phone) || (!main?.venue && d.gettingThere)) && (
          <section className="c2-sec" id="c2-know">
            <Head eyebrow="For our guests" title="Good to know" />
            {things.length > 0 && (
              <ul className="c2-know">
                {things.map((t, i) => (
                  <Reveal as="li" key={i} className="c2-card" delay={(i % 2) * 80}>
                    {t.head && <p className="c2-know-h">{t.head}</p>}
                    <p className="c2-know-t">{t.text}</p>
                  </Reveal>
                ))}
              </ul>
            )}
            {!main?.venue && d.gettingThere && (
              <p className="c2-venue-note c2-narrow" style={{ textAlign: "center" }}>
                {d.gettingThere}
              </p>
            )}
            <Contacts list={d.contacts} couple={couple} />
          </section>
        )}

        {/* ── RSVP ──────────────────────────────────────────────────────── */}
        {d.rsvpOn && (
          <section className="c2-sec" id="c2-rsvp" style={{ scrollMarginTop: 12 }}>
            <Head eyebrow="Kindly reply" title="Will you join us?" />
            <Reveal className="c2-narrow">
              <p className="c2-rsvp-intro">Let us know which celebrations you can make — it takes three taps.</p>
              <div ref={rsvpRef} className="c2-card c2-rsvp">
                <RSVPBlock mode={mode} share={share} couple={couple} events={d.events} perEvent={d.events.length > 1} meal={d.rsvpMeal} maxGuests={d.maxGuests} deadline={d.rsvpBy || undefined} title="" />
              </div>
            </Reveal>
          </section>
        )}

        {/* ── Blessings wall ────────────────────────────────────────────── */}
        <section className="c2-sec" id="c2-blessings">
          <Head eyebrow="Leave a prayer" title="Blessings" />
          <div className="c2-wrap" style={{ maxWidth: 1040 }}>
            <div className="c2-narrow">
              <Wishes initial={wishes} shareId={mode === "live" ? shareId : null} />
            </div>
          </div>
        </section>

        {/* ── Shagun ────────────────────────────────────────────────────── */}
        {d.upiId && isUpiId(d.upiId) && (
          <section className="c2-sec" id="c2-gift" style={{ paddingTop: 0 }}>
            <Head eyebrow="With gratitude" title="A gift" />
            <div className="c2-narrow">
              <Shagun upiId={d.upiId} upiName={d.upiName} />
            </div>
          </section>
        )}

        {/* ── Share ─────────────────────────────────────────────────────── */}
        <section className="c2-sec" id="c2-share" style={{ paddingTop: 0 }}>
          <Head eyebrow="Pass it on" title="Share the joy" />
          <Reveal className="c2-narrow">
            <ShareBar shareText={shareText} card={card} />
          </Reveal>
        </section>

        {/* ── Finale ────────────────────────────────────────────────────── */}
        <section className="c2-finale" id="c2-finale">
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...img("sky", { lazy: true })} className="c2-finale-sky" aria-hidden />
          <Reveal effect="zoom">
            <div className="c2-seal" aria-hidden>
              <b>
                {first.slice(0, 1)}
                {second.slice(0, 1)}
              </b>
            </div>
          </Reveal>
          <Reveal>
            <p className="c2-finale-line">{d.closing || `With love and prayers, ${couple}`}</p>
            {d.blessing && d.blessing !== "God bless this union" && <p className="c2-small">{d.blessing}</p>}
            {d.hashtag && <p className="c2-finale-tag">{d.hashtag}</p>}
          </Reveal>
          <div className="c2-finale-actions">
            <Btn icon={WA} fill onClick={() => openWhatsApp(shareText)}>
              Share on WhatsApp
            </Btn>
            {!noOpening && (
              <button type="button" className="c2-replay" onClick={() => {
                  window.scrollTo({ top: 0 });
                  setReplays((r) => r + 1);
                  setOpen(false);
                }}>
                Open the windows again
              </button>
            )}
          </div>
          {brand && (
            <Link href={`/${SLUG}`} className="c2-finale-brand">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.webp" alt="" width={26} height={26} />
              Made with SubhSandesh — create your own
            </Link>
          )}
        </section>
      </main>
    </WeddingRoot>
  );
}

function ConditionalAmp({ show, children }: { show: boolean; children: ReactNode }) {
  return (
    <>
      {show && (
        <div className="c2-amp" aria-hidden>
          &amp;
        </div>
      )}
      {children}
    </>
  );
}
