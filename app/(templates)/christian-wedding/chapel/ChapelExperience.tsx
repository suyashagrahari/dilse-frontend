"use client";

// ─── Christian Wedding — the guest's experience ──────────────────────────────
//
// The chapel doors (tap: a bell, the oak leaves swing inward, light floods out
// of a flower-strewn aisle, doves fly out, the music starts) → the couple
// under a floral drape with the date and a flip countdown → the verse under a
// small rose window → the invitation (and its second language) with both
// families → the bride & the groom → the order of service → our story → every
// function with map, dress code and calendar → the church → film → gallery →
// good to know / who to call / livestream / gift → RSVP per function → the
// blessings wall with voice notes → "What God has joined together", the share
// bar and the invite card.
//
// One long calm scroll after one cinematic moment. Light theme only (ivory,
// dusty rose, sage); every photo and card is a rectangle with all four
// corners equally rounded. ?to=Name greets the guest on the doors and fills
// their RSVP name.

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { RSVPBlock, Reveal, VenueCard, WeddingMasonry, WeddingRoot, cdn, formatEventDate, formatEventTime } from "../../_wedding";
import { DayMusicProvider } from "../../_valentine/music/DayMusic";
import { ART, KIT_TEXTURE, img } from "./assets";
import ChapelDoors from "./ChapelDoors";
import { CW_CSS } from "./css";
import { CW_SONGS, CW_THEMES, CW_TRACK, SLUG, viewOf, type CwData } from "./model";
import { Couple, Film, Finale, Hero, Invitation, Service, Story, Verse, Heading } from "./parts/Blocks";
import Blessings from "./parts/Blessings";
import Events from "./parts/Events";
import GuestInfo from "./parts/GuestInfo";
import ShareBar from "./parts/ShareBar";
import { prefillInput, useGuestName } from "./parts/guest";

const GALLERY_COLUMNS = [
  { min: 0, columns: 2 },
  { min: 600, columns: 3 },
  { min: 1000, columns: 4 },
] as const;

/** The song: the sender's choice, or the hymn an older page always played. */
export function ChapelMusic({ data, autoStart, overSheet = false, children }: { data: CwData; autoStart: boolean; overSheet?: boolean; children: ReactNode }) {
  const mode = data.music.mode === "youtube" && !data.music.youtubeId ? "track" : data.music.mode;
  return (
    <DayMusicProvider
      settings={{ musicMode: mode, musicYoutubeId: data.music.youtubeId, musicStart: data.music.start }}
      melody="lantern"
      autoStart={autoStart}
      audioOnly
      compact
      overSheet={overSheet}
      songs={CW_SONGS}
      track={CW_TRACK}
    >
      {children}
    </DayMusicProvider>
  );
}

export function rootStyle(theme: CwData["theme"]): CSSProperties {
  return {
    ...(CW_THEMES[theme]?.vars ?? CW_THEMES.ivory.vars),
    ["--wk-texture" as string]: `url("${cdn(KIT_TEXTURE.linen)}")`,
    ["--wk-paper" as string]: `url("${cdn(KIT_TEXTURE.silk)}")`,
  } as CSSProperties;
}

interface NavItem {
  id: string;
  label: string;
}

function SectionNav({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [open]);
  const go = (id: string) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  return (
    <div className="cw-nav" ref={ref}>
      <button type="button" className="cw-nav-btn" aria-expanded={open} aria-controls="cw-nav-list" onClick={() => setOpen((o) => !o)} aria-label="Sections">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
          {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h10" />}
        </svg>
        <span>{open ? "Close" : "Sections"}</span>
      </button>
      {open && (
        <ul id="cw-nav-list" className="cw-nav-list">
          {items.map((it) => (
            <li key={it.id}>
              <button type="button" onClick={() => go(it.id)}>
                {it.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export interface ChapelExperienceProps {
  data: CwData;
  mode: "preview" | "live";
  shareId?: string | null;
  /** Bump to replay the doors (the editor's "Replay opening"). */
  replayKey?: number;
  /** Start past the doors (the editor's live preview while typing). */
  skipDoors?: boolean;
  /** Inside the editor's preview pane: no floating section menu. */
  embedded?: boolean;
  onOpened?: () => void;
}

export default function ChapelExperience({ data: m, mode, shareId = null, replayKey = 0, skipDoors = false, embedded = false, onOpened }: ChapelExperienceProps) {
  const v = useMemo(() => viewOf(m), [m]);
  const guest = useGuestName();
  const [open, setOpen] = useState(skipDoors);
  const [seenReplay, setSeenReplay] = useState(replayKey);
  if (seenReplay !== replayKey) {
    setSeenReplay(replayKey);
    setOpen(false);
  }
  const rootRef = useRef<HTMLDivElement>(null);
  const rsvpRef = useRef<HTMLDivElement>(null);
  const [lite] = useState(() => {
    if (typeof navigator === "undefined") return false;
    const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    return (navigator.hardwareConcurrency || 8) <= 4 && mem !== undefined && mem <= 3;
  });

  // ?to=Name → the RSVP's name box, once it is on screen and still empty.
  useEffect(() => {
    const el = rsvpRef.current;
    if (!el || !guest) return;
    const io = new IntersectionObserver(([en]) => {
      if (en.isIntersecting) prefillInput(el.querySelector<HTMLInputElement>('input[autocomplete="name"], input[type="text"]'), guest);
    });
    io.observe(el);
    return () => io.disconnect();
  }, [guest, open]);

  // The kit's RSVP placeholders are written for a Hindu wedding ("…at the
  // sangeet"); give this church wedding its own, without touching the kit.
  useEffect(() => {
    const el = rsvpRef.current;
    if (!el) return;
    el.querySelector<HTMLInputElement>('input[type="text"], input:not([type])')?.setAttribute("placeholder", "e.g. The Thomas family");
    el.querySelector<HTMLTextAreaElement>("textarea")?.setAttribute("placeholder", "Congratulations! We can't wait to celebrate with you…");
  });

  const main = v.main;
  const shareText = `With joy, ${v.couple} invite you to their Holy Matrimony ⛪`;
  const dateShort = main?.date ? formatEventDate(main.date, "en-IN").replace(/^[^,]+,\s*/, "") : "";
  const icons = useMemo(() => Object.fromEntries(m.events.map((e) => [e.id || e.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 30), e.icon])), [m.events]);
  const churchName = m.churchName || main?.venue || "";
  const churchAddr = m.churchName ? m.venue : main?.address || m.venue;
  const hasInfo = m.things.some((t) => t.text.trim()) || !!m.gettingThere.trim() || m.contacts.some((c) => c.name.trim()) || !!m.upiId.trim() || /^https:/.test(m.liveUrl);
  const videoId = (m.videoUrl.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([A-Za-z0-9_-]{11})/) || [])[1] || "";
  const rsvpEvents = v.events.filter((e) => e.id);

  const nav: NavItem[] = [
    { id: "top", label: "The invitation" },
    ...(v.verse || m.blessing.trim() ? [{ id: "verse", label: "Scripture" }] : []),
    { id: "invitation", label: "You are invited" },
    ...(m.orderOfService.length ? [{ id: "service", label: "Order of service" }] : []),
    ...(m.story.length ? [{ id: "story", label: "Our story" }] : []),
    ...(v.events.length ? [{ id: "events", label: "The wedding days" }] : []),
    ...(churchName ? [{ id: "church", label: "The church" }] : []),
    ...(m.gallery.length ? [{ id: "gallery", label: "Gallery" }] : []),
    ...(hasInfo ? [{ id: "good-to-know", label: "Good to know" }] : []),
    ...(m.rsvpOn ? [{ id: "rsvp", label: "RSVP" }] : []),
    { id: "blessings", label: "Blessings" },
  ];

  return (
    <WeddingRoot theme={CW_THEMES[m.theme]?.base ?? "champagne"} className={`cw-root is-${m.theme}${lite ? " is-lite" : ""}${open ? " is-open" : ""}${mode === "live" ? " is-live" : ""}${embedded ? " is-embedded" : ""}`} style={rootStyle(m.theme)}>
      <div ref={rootRef} style={{ display: "contents" }}>
        <style>{CW_CSS}</style>
        {!skipDoors && (
          <ChapelDoors
            first={v.first}
            second={v.second}
            dateLine={dateShort}
            guest={guest}
            replayKey={replayKey}
            onOpened={() => {
              setOpen(true);
              onOpened?.();
            }}
          />
        )}

        {open && !embedded && <SectionNav items={nav} />}

        <main className="cw-page">
          <Hero m={m} v={v} guest={guest} shareText={shareText} />
          <Verse m={m} v={v} />
          <Invitation m={m} v={v} />
          <Couple m={m} v={v} />
          <Service m={m} />
          <Story m={m} />
          <Events events={v.events} couple={v.couple} icons={icons} />

          {churchName && (
            <section className="cw-sec cw-church" id="church" aria-labelledby="cw-church-h">
              <Heading eyebrow="The ceremony" title="The church" id="cw-church-h" />
              <div className="cw-church-wrap">
                {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                <img className="cw-church-col is-l" {...img(ART.column, { lazy: true })} aria-hidden />
                <Reveal effect="zoom" className="cw-church-card">
                  <VenueCard
                    name={churchName}
                    address={churchAddr}
                    mapUrl={main?.mapUrl}
                    eyebrow={main?.date ? `${formatEventDate(main.date, "en-IN")}${main.time ? ` · ${formatEventTime(main.time, "en-IN")}` : ""}` : "Holy Matrimony"}
                    embed
                    ornament={null}
                    labels={{ directions: "Get directions", showMap: "Show the map" }}
                  />
                </Reveal>
                {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                <img className="cw-church-col is-r" {...img(ART.column, { lazy: true })} aria-hidden />
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
              <img className="cw-church-rail" {...img(ART.balustrade, { lazy: true })} aria-hidden />
            </section>
          )}

          {videoId && <Film id={videoId} />}

          {m.gallery.length > 0 && (
            <section className="cw-sec cw-gallery" id="gallery" aria-labelledby="cw-gallery-h">
              <Heading eyebrow="Moments" title="Gallery" id="cw-gallery-h" />
              <div className="cw-gallery-wrap">
                <WeddingMasonry photos={m.gallery} mask="rounded" radius={16} columns={GALLERY_COLUMNS} frame="mat" tileCaptions label="Gallery" />
              </div>
            </section>
          )}

          <GuestInfo m={m} main={main} couple={v.couple} />

          {m.rsvpOn && (
            <section className="cw-sec cw-rsvp" id="rsvp" aria-labelledby="cw-rsvp-h">
              <Heading eyebrow="Kindly reply" title="Will you join us?" id="cw-rsvp-h" />
              <div ref={rsvpRef} className="cw-rsvp-card">
                {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                <img className="cw-rsvp-bq" {...img(ART.roseBouquet, { lazy: true })} aria-hidden />
                <RSVPBlock
                  mode={mode}
                  couple={v.couple}
                  events={rsvpEvents}
                  perEvent={rsvpEvents.length > 1}
                  meal={m.rsvpMeal}
                  maxGuests={m.maxGuests}
                  deadline={m.rsvpBy || undefined}
                  title="RSVP"
                  intro="Three taps — tell us who is coming and to which celebrations."
                  share={mode === "live" && shareId ? { slug: SLUG, shareId } : null}
                  locale="en-IN"
                />
              </div>
            </section>
          )}

          <Blessings wishes={m.wishes} shareId={shareId} mode={mode} couple={v.couple} />

          <Finale m={m} v={v}>
            <ShareBar
              variant="finale"
              shareText={shareText}
              couple={v.couple}
              main={main}
              events={v.events}
              card={{
                first: v.first,
                second: v.second,
                dateLine: main?.date ? formatEventDate(main.date, "en-IN") : "",
                timeLine: main?.time ? formatEventTime(main.time, "en-IN") : "",
                church: churchName,
                address: churchAddr,
                verseRef: v.verse?.ref ?? "",
              }}
            />
          </Finale>
        </main>
      </div>
    </WeddingRoot>
  );
}
