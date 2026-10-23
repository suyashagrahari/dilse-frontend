"use client";

// ─── Reception Night 🥂 — the guest's experience ─────────────────────────────
//
// White-and-gold ballroom doors swing open toward the guest (tap: a glass
// chime, the music starts, the chandelier flickers on, champagne sparkles
// rise) → the ballroom hero (string lights, the names, the couple under the
// chandelier) → the invitation in English + Hindi → the bride and the groom →
// the date and a flip countdown → our story → the evening (reception,
// dinner, after-party: time, venue, dress code, map, calendar) → the venue
// with a tap-to-load map → live stream → film → gallery → good to know + who
// to call → RSVP per part of the evening → the blessings wall → shagun →
// share → "See you on the dance floor".
//
// Light themes only (champagne · blush · pearl). All art ships from
// /public/wedding-v3. Motion is transform/opacity, reduced-motion aware.
// ?to=<name> greets the guest by name and fills the RSVP.

import { useEffect, useMemo, useRef, useState } from "react";
import {
  RSVPBlock,
  Reveal,
  Section,
  WeddingMasonry,
  WeddingRoot,
  formatEventDate,
  formatEventTime,
  type WeddingThemeId,
} from "../../_wedding";
import { Contacts, LiveStream, ShareBar, Shagun, pageUrl } from "./Actions";
import { img } from "./art";
import Blessings from "./Blessings";
import { RC_CSS } from "./css";
import { prefillRsvpName, useGuestName } from "./guest";
import Hero from "./Hero";
import type { InviteCardInput } from "./inviteCard";
import {
  galleryToPhotos,
  hasStory,
  invitationText,
  isUpiId,
  mainEventIndex,
  toWeddingEvent,
  youtubeIdOf,
} from "./model";
import Opening from "./Opening";
import SectionNav, { type NavItem } from "./SectionNav";
import {
  Couple,
  DateBlock,
  Evening,
  Film,
  Head,
  Invitation,
  Know,
  Story,
  Venue,
} from "./Sections";
import { T } from "./strings";
import type { Lang, ReceptionData } from "./types";

export interface ReceptionExperienceProps {
  data: ReceptionData;
  mode: "preview" | "live";
  shareId?: string;
  /** The recipient's page: the brand mark and "Create your own". */
  brand?: boolean;
  onCreate?: () => void;
  /** Change it to play the doors again (the editor's "Replay opening"). */
  replay?: number;
  /** Start with the doors already open. */
  noOpening?: boolean;
  /** An editor sheet covers the page: hide the floating chrome. */
  chromeHidden?: boolean;
}

const GALLERY_COLUMNS = [
  { min: 0, columns: 2 },
  { min: 600, columns: 3 },
  { min: 900, columns: 4 },
];

const KIT_THEME: Record<ReceptionData["theme"], WeddingThemeId> = {
  champagne: "champagne",
  blush: "blush",
  pearl: "champagne",
};

export default function ReceptionExperience({
  data,
  mode,
  shareId,
  brand,
  onCreate,
  replay = 0,
  noOpening,
  chromeHidden,
}: ReceptionExperienceProps) {
  const [lang, setLang] = useState<Lang>(data.lang);
  const [langFrom, setLangFrom] = useState<Lang>(data.lang);
  if (langFrom !== data.lang) {
    setLangFrom(data.lang);
    setLang(data.lang);
  }
  const s = T[lang];
  const locale = lang === "hi" ? "hi-IN" : "en-IN";
  const guest = useGuestName();
  const [open, setOpen] = useState(!!noOpening);
  const [doors, setDoors] = useState(!noOpening);
  const [noFrom, setNoFrom] = useState(!!noOpening);
  if (noFrom !== !!noOpening) {
    // The editor opened over the doors: skip straight to the invitation.
    setNoFrom(!!noOpening);
    if (noOpening) {
      setOpen(true);
      setDoors(false);
    }
  }
  const [replayFrom, setReplayFrom] = useState(replay);
  if (replayFrom !== replay) {
    setReplayFrom(replay);
    setOpen(false);
    setDoors(true);
  }

  const events = useMemo(
    () =>
      data.events
        .filter((e) => e.title || e.venue || e.date)
        .map(toWeddingEvent),
    [data.events],
  );
  const main =
    events[
      mainEventIndex(data.events.filter((e) => e.title || e.venue || e.date))
    ];
  const first = data.brideName;
  const second = data.groomName;
  const couple = `${first} & ${second}`;
  const initials = `${first.slice(0, 1)}${second.slice(0, 1)}`.toUpperCase();
  const shortDate = main?.date ? formatEventDate(main.date, "en-IN") : "";
  const photos = useMemo(
    () => galleryToPhotos(data.galleryImages),
    [data.galleryImages],
  );
  const videoId = youtubeIdOf(data.videoUrl);
  const liveUrl = /^https:\/\//i.test(data.liveUrl) ? data.liveUrl : "";
  const upi = isUpiId(data.upiId) ? data.upiId : "";
  const story = hasStory(data.story);
  const hasContacts = data.contacts.some((c) => c.name && c.phone);
  const things = data.things.filter((t) => t.text);
  const shareText =
    lang === "hi"
      ? `🥂 ${couple} के स्वागत समारोह का निमंत्रण`
      : `🥂 You're invited to the wedding reception of ${couple}`;

  // ?to= also fills the RSVP's name (the block may restore a stored reply first).
  const rsvpRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!guest) return;
    const ts = [300, 1400].map((ms) =>
      window.setTimeout(() => prefillRsvpName(rsvpRef.current, guest), ms),
    );
    return () => ts.forEach((t) => window.clearTimeout(t));
  }, [guest]);

  // A reload of a page already opened in this tab skips the doors (live only).
  useEffect(() => {
    if (mode !== "live" || !shareId || noOpening) return;
    try {
      if (sessionStorage.getItem(`rc_opened_${shareId}`) === "1") {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setOpen(true);
        setDoors(false);
      }
    } catch {}
  }, [mode, shareId, noOpening]);

  const onOpened = () => {
    setOpen(true);
    if (mode === "live" && shareId) {
      try {
        sessionStorage.setItem(`rc_opened_${shareId}`, "1");
      } catch {}
    }
  };

  const nav: NavItem[] = [
    { id: "top", label: lang === "hi" ? "स्वागत" : "Welcome" },
    { id: "invitation", label: s.invitation },
    { id: "couple", label: s.couple },
    ...(main?.date ? [{ id: "countdown", label: s.countdown }] : []),
    ...(story ? [{ id: "story", label: s.story }] : []),
    ...(events.length ? [{ id: "evening", label: s.evening }] : []),
    ...(main?.venue ? [{ id: "venue", label: s.venueEyebrow }] : []),
    ...(photos.length ? [{ id: "gallery", label: s.gallery }] : []),
    { id: "rsvp", label: "RSVP" },
    { id: "blessings", label: s.blessingsEyebrow },
  ];

  const card: InviteCardInput = {
    first,
    second,
    dateLine: shortDate,
    time: main?.time ? formatEventTime(main.time, "en-IN") : "",
    venue: main?.venue ?? "",
    address: main?.address ?? "",
    tagline: data.tagline,
    guest,
    url: typeof window === "undefined" ? "" : pageUrl(),
    theme: data.theme,
  };

  return (
    <WeddingRoot
      theme={KIT_THEME[data.theme]}
      className={`rc-root t-${data.theme}${lang === "hi" ? " is-hi" : ""}${open ? " is-open" : ""}${brand ? " has-brand" : ""}`}
      style={{ minHeight: "100dvh" }}
    >
      <style>{RC_CSS}</style>
      <div className="rc-backdrop" aria-hidden />
      {doors && (
        <Opening
          key={replay}
          first={first}
          second={second}
          dateLine={shortDate}
          guest={guest}
          s={s}
          lang={lang}
          onOpened={onOpened}
        />
      )}
      {doors && open && <DoorsGone onGone={() => setDoors(false)} />}

      <div
        className={`rc-lang${chromeHidden ? " is-hidden" : ""}`}
        role="group"
        aria-label="Language"
      >
        <button
          type="button"
          aria-pressed={lang === "en"}
          onClick={() => setLang("en")}
        >
          EN
        </button>
        <button
          type="button"
          aria-pressed={lang === "hi"}
          onClick={() => setLang("hi")}
          lang="hi"
        >
          हिं
        </button>
      </div>

      <div className="rc-flow">
        <Hero
          open={open}
          s={s}
          lang={lang}
          first={first}
          second={second}
          guest={guest}
          tagline={data.tagline}
          main={main}
          events={events}
          couple={couple}
          shareText={shareText}
          photo={data.sharePhoto || ""}
        />

        <main className="rc-main">
          {/* ── The invitation ─────────────────────────────────────────────── */}
          <Section
            id="invitation"
            ornament={null}
            width="normal"
            className="rc-sec rc-sec-invite"
          >
            <Invitation
              text={invitationText(data)}
              hindi={data.hindiMessage}
              lang={lang}
              s={s}
              blessingsOf={data.blessingsOf}
              signature={data.closingLine || couple}
            />
          </Section>

          {/* ── The couple ─────────────────────────────────────────────────── */}
          <Section
            id="couple"
            ornament={null}
            width="wide"
            className="rc-sec rc-sec-couple"
          >
            <Head eyebrow={s.couple} title={s.coupleTitle} lang={lang} />
            <Couple
              bride={data.bride}
              groom={data.groom}
              families={data.families}
              s={s}
              lang={lang}
              initials={initials}
            />
          </Section>

          {/* ── The date + countdown ───────────────────────────────────────── */}
          {main?.date && (
            <Section
              id="countdown"
              ornament={null}
              width="normal"
              className="rc-sec rc-sec-date"
            >
              <Head
                eyebrow={s.countdown}
                title={s.countdownTitle}
                lang={lang}
              />
              <DateBlock main={main} s={s} lang={lang} />
            </Section>
          )}

          {/* ── Our story ──────────────────────────────────────────────────── */}
          {story && (
            <Section id="story" ornament={null} width="wide" className="rc-sec">
              <Head eyebrow={s.storyEyebrow} title={s.story} lang={lang} />
              <Story chapters={data.story} />
            </Section>
          )}

          {/* ── The evening ────────────────────────────────────────────────── */}
          {events.length > 0 && (
            <Section
              id="evening"
              ornament={null}
              width="wide"
              className="rc-sec rc-sec-evening"
            >
              <Head eyebrow={s.eveningEyebrow} title={s.evening} lang={lang} />
              <Evening events={events} couple={couple} s={s} locale={locale} />
            </Section>
          )}

          {/* ── The venue ──────────────────────────────────────────────────── */}
          {main?.venue && (
            <Section id="venue" ornament={null} width="wide" className="rc-sec">
              <Head eyebrow={s.venueEyebrow} title={main.venue} lang={lang} />
              <Venue main={main} s={s} note={data.gettingThere} />
            </Section>
          )}

          {/* ── Live stream ────────────────────────────────────────────────── */}
          {liveUrl && (
            <Section
              id="live"
              ornament={null}
              width="narrow"
              className="rc-sec"
            >
              <Head eyebrow={s.liveEyebrow} title={s.live} lang={lang} />
              <Reveal>
                <LiveStream url={liveUrl} main={main} s={s} />
              </Reveal>
            </Section>
          )}

          {/* ── Film ───────────────────────────────────────────────────────── */}
          {videoId && (
            <Section
              id="film"
              ornament={null}
              width="normal"
              className="rc-sec"
            >
              <Head eyebrow={s.film} lang={lang} />
              <Reveal effect="zoom">
                <Film id={videoId} label={s.play} />
              </Reveal>
            </Section>
          )}

          {/* ── Gallery ────────────────────────────────────────────────────── */}
          {photos.length > 0 && (
            <Section
              id="gallery"
              ornament={null}
              width="wide"
              className="rc-sec rc-sec-gallery"
            >
              <Head eyebrow={s.galleryEyebrow} title={s.gallery} lang={lang} />
              <WeddingMasonry
                photos={photos}
                mask="rounded"
                radius={18}
                columns={GALLERY_COLUMNS}
                frame="foil"
                tileCaptions
                label={s.gallery}
              />
            </Section>
          )}

          {/* ── Good to know + who to call ─────────────────────────────────── */}
          {(things.length > 0 || hasContacts) && (
            <Section
              id="good-to-know"
              ornament={null}
              width="normal"
              className="rc-sec"
            >
              <Head eyebrow={s.goodToKnow} lang={lang} />
              {things.length > 0 && <Know things={things} />}
              {hasContacts && (
                <div className="rc-contacts-wrap">
                  <Reveal as="p" className="rc-eyebrow">
                    <span lang={lang}>{s.contactsEyebrow}</span>
                  </Reveal>
                  <Reveal as="h3" className="rc-h3">
                    <span lang={lang}>{s.contacts}</span>
                  </Reveal>
                  <Contacts list={data.contacts} s={s} couple={couple} />
                </div>
              )}
            </Section>
          )}

          {/* ── RSVP ───────────────────────────────────────────────────────── */}
          <Section
            id="rsvp"
            ornament={null}
            width="narrow"
            className="rc-sec rc-sec-rsvp"
          >
            <Head
              eyebrow={`RSVP · ${s.rsvpEyebrow}`}
              title={s.rsvp}
              lang={lang}
            />
            <Reveal>
              <div ref={rsvpRef} className="rc-rsvp">
                <RSVPBlock
                  mode={mode}
                  couple={couple}
                  events={events}
                  perEvent={events.length > 1}
                  meal={data.rsvpMeal}
                  maxGuests={data.maxGuests}
                  deadline={data.rsvpBy || undefined}
                  title=""
                  intro={s.rsvpIntro}
                  locale={locale}
                  share={
                    mode === "live" && shareId
                      ? { slug: "reception", shareId }
                      : null
                  }
                />
              </div>
            </Reveal>
          </Section>

          {/* ── Blessings ──────────────────────────────────────────────────── */}
          <Section
            id="blessings"
            ornament={null}
            width="wide"
            className="rc-sec"
          >
            <Head
              eyebrow={s.blessingsEyebrow}
              title={s.blessings}
              lang={lang}
            />
            <Blessings
              wishes={data.wishes}
              mode={mode}
              shareId={shareId}
              s={s}
              lang={lang}
            />
          </Section>

          {/* ── Shagun ─────────────────────────────────────────────────────── */}
          {upi && (
            <Section
              id="shagun"
              ornament={null}
              width="narrow"
              className="rc-sec"
            >
              <Head eyebrow={s.shagunEyebrow} title={s.shagun} lang={lang} />
              <Reveal>
                <Shagun upiId={upi} upiName={data.upiName} s={s} />
              </Reveal>
            </Section>
          )}

          {/* ── Share ──────────────────────────────────────────────────────── */}
          <Section
            id="share"
            ornament={null}
            width="normal"
            className="rc-sec rc-sec-share"
          >
            <Head eyebrow={s.shareEyebrow} title={s.share} lang={lang} />
            <Reveal>
              <ShareBar s={s} shareText={shareText} card={card} />
            </Reveal>
          </Section>
        </main>

        {/* ── Finale ──────────────────────────────────────────────────────── */}
        <footer className="rc-finale">
          <div className="rc-finale-lights" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img {...img("lights", { lazy: true })} />
          </div>
          <Reveal effect="zoom" className="rc-finale-couple">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img {...img("couple", { lazy: true })} alt="" />
          </Reveal>
          <Reveal className="rc-finale-t">
            <p className="rc-finale-close" lang={lang}>
              {s.closing}
            </p>
            <p className="rc-finale-names">
              {first} <i>&amp;</i> {second}
            </p>
            {data.closingLine && (
              <p className="rc-finale-line">{data.closingLine}</p>
            )}
            {data.hashtag && <p className="rc-finale-tag">{data.hashtag}</p>}
            <button
              type="button"
              className="rc-link"
              onClick={() => {
                window.scrollTo({ top: 0 });
                setOpen(false);
                setDoors(true);
              }}
            >
              {s.replay}
            </button>
            {brand && onCreate && (
              <button
                type="button"
                className="rc-btn rc-btn-gold rc-create"
                onClick={onCreate}
              >
                <span lang={lang}>✦ {s.createOwn}</span>
              </button>
            )}
          </Reveal>
        </footer>
      </div>

      <SectionNav
        items={nav}
        s={s}
        lang={lang}
        hidden={chromeHidden || !open}
      />
    </WeddingRoot>
  );
}

/** Unmount the doors a moment after the invitation has taken over. */
function DoorsGone({ onGone }: { onGone: () => void }) {
  useEffect(() => {
    const t = window.setTimeout(onGone, 900);
    return () => window.clearTimeout(t);
  }, [onGone]);
  return null;
}
