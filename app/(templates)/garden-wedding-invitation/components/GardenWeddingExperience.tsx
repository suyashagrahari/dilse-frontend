"use client";

// ─── Mughal Garden Wedding Invitation 🦚 — the guest's experience ────────────
//
// The garden gate (peony trees, clouds, lanterns, a lotus seal to tap; the tap
// starts the music) → the garden itself, a parallax watercolour scene: clouds
// part over a pink gazebo, the couple appears in it, a peacock struts along
// the hedge, lanterns sway and cherry-blossom petals drift; the names in the
// sky → the invitation in English + Hindi under a gold lattice crown → the two
// families between flowering trees → the date beside a playing fountain, with
// a split-flap countdown → the story along a growing vine → the functions as
// painted garden cards → the lake venue over a balustrade → the film → the
// album (resizable masonry) → garden notes, family contacts, shagun → RSVP
// under a flamingo border → blessings → dusk at the pavilion, sky lanterns,
// the share bar (WhatsApp, card PNG, QR, calendar).
//
// Every motion is transform/opacity, gated on visibility and reduced-motion
// aware; art is same-origin (public/wedding-v3), lazy below the fold, with
// intrinsic sizes. A bilingual toggle (top-left) switches every label to Hindi.
// A personal link (?to=Sharma%20family) greets the guest by name and fills the
// RSVP name.

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  BlessingsWall,
  FamiliesBlock,
  MessageBlock,
  RSVPBlock,
  Reveal,
  Section,
  WeddingMasonry,
  WeddingRoot,
  eventEnd,
  eventStart,
  formatEventDate,
  formatEventTime,
} from "../../_wedding";
import type { ExperienceProps } from "../../_valentine/types";
import { GW, gwImg } from "./assets";
import Fountain from "./gw/Fountain";
import Finale from "./gw/Finale";
import GardenEvents from "./gw/GardenEvents";
import GardenHero from "./gw/GardenHero";
import Gate from "./gw/Gate";
import Notes from "./gw/Notes";
import ShareBar, { ICON, Icon } from "./gw/ShareBar";
import Story from "./gw/Story";
import Venue from "./gw/Venue";
import { GW_CSS } from "./gw/css";
import { prefillInput, useGuestName } from "./gw/guest";
import { T, readGarden, type Lang } from "./gw/model";

/** The kit's paper textures, from this repo's public/wedding-v3/gw-kit (the kit's own defaults point at the CDN). */
const LINEN = 'url("/wedding-v3/gw-kit/linen-overlay.webp")';
const SILK = 'url("/wedding-v3/gw-kit/paper-silk-light.webp")';
const gwTextures = (theme: string): CSSProperties =>
  ({ minHeight: "100dvh", ["--wk-texture" as string]: LINEN, ["--wk-paper" as string]: theme === "champagne" ? SILK : LINEN }) as CSSProperties;

/** A key that changes when a section appears or disappears (the observer re-collects them). */
const hasSections = (m: ReturnType<typeof readGarden>) => [m.blessings, !!m.main?.date, m.things.length > 0, m.contacts.length > 0, !!m.upiId, !!m.videoId].join("");

function Film({ id, label }: { id: string; label: string }) {
  const [on, setOn] = useState(false);
  return (
    <div className="gw-film">
      {on ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
          title={label}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          loading="lazy"
        />
      ) : (
        <button type="button" className="gw-film-poster" onClick={() => setOn(true)} aria-label={label}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" width={480} height={360} loading="lazy" decoding="async" />
          <span className="gw-film-play" aria-hidden>
            <Icon d={ICON.play} size={28} />
          </span>
          <span className="gw-film-label">{label}</span>
        </button>
      )}
    </div>
  );
}

/** "Watch live": open from 30 minutes before the main function until it ends (3 h when it has no end). */
function useLiveOpen(url: string, date?: string, time?: string, endTime?: string): boolean {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!url) return;
    const t = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(t);
  }, [url]);
  if (!url || !date) return false;
  const start = eventStart(date, time || "00:00");
  if (!start) return false;
  const end = (endTime && eventEnd({ date, time: time || "00:00", endTime })) || new Date(start.getTime() + 3 * 3600_000);
  return now >= start.getTime() - 30 * 60_000 && now <= end.getTime();
}

export default function GardenWeddingExperience({ data, mode, react }: ExperienceProps) {
  const m = useMemo(() => readGarden(data.extras as Record<string, unknown>, data.photos, data.recipientName, data.senderName), [data.extras, data.photos, data.recipientName, data.senderName]);
  const [lang, setLang] = useState<Lang>(m.lang);
  const s = T[lang];
  const locale = lang === "hi" ? "hi-IN" : "en-IN";
  const couple = `${m.first} & ${m.second}`;
  const guest = useGuestName();
  const [open, setOpen] = useState(false);
  // On low-end phones drop the ambient petals and the parallax.
  const [lite] = useState(() => {
    if (typeof navigator === "undefined") return false;
    const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    return (navigator.hardwareConcurrency || 8) <= 4 && mem !== undefined && mem <= 3;
  });

  const main = m.main;
  const dateLine = main?.date ? formatEventDate(main.date, locale) : "";
  const shortDate = main?.date ? new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${main.date}T12:00:00Z`)) : "";
  const mainTime = main?.time ? formatEventTime(main.time, locale) : "";
  const liveOpen = useLiveOpen(m.liveUrl, main?.date, main?.time, main?.endTime);

  const completed = useRef(false);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = endRef.current;
    if (!el || !open) return;
    const io = new IntersectionObserver(([en]) => {
      if (en.isIntersecting && !completed.current) {
        completed.current = true;
        react("completed");
      }
    });
    io.observe(el);
    return () => io.disconnect();
  }, [open, react]);

  // The personal link fills the RSVP name (the kit's input is controlled; see prefillInput).
  const rsvpRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!guest) return;
    const t = window.setTimeout(() => prefillInput(rsvpRef.current?.querySelector<HTMLInputElement>('input[autocomplete="name"]') ?? null, guest), 300);
    return () => window.clearTimeout(t);
  }, [guest]);

  // Section decor (trees, leaves, the peacock) enters once its section is on screen.
  const secKey = `${hasSections(m)}${m.events.length}${m.gallery.length}${m.story.length}`;
  useEffect(() => {
    const secs = Array.from(document.querySelectorAll<HTMLElement>(".gw-root .gw-sec"));
    if (typeof IntersectionObserver === "undefined" || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      secs.forEach((el) => el.classList.add("is-seen"));
      return;
    }
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("is-seen");
            io.unobserve(en.target);
          }
        }),
      { rootMargin: "0px 0px -15% 0px" },
    );
    secs.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [secKey]);

  const onOpened = () => {
    setOpen(true);
    react("opened");
  };

  const bride = { ...m.bride_, title: s.brideSide };
  const groom = { ...m.groom_, title: s.groomSide };
  const hasFamilies = bride.names.length > 0 || groom.names.length > 0;
  const shareText = lang === "hi" ? `${couple} के शुभ विवाह का निमंत्रण 🌸` : `You're invited to the wedding of ${couple} 🌸`;
  const venueLine = [main?.venue, main?.address?.split(",").pop()?.trim()].filter(Boolean).join(" · ");
  const card = {
    first: m.first,
    second: m.second,
    dateLine: dateLine,
    timeLine: [mainTime, m.muhurat].filter(Boolean).join(" · "),
    venue: main?.venue ?? "",
    address: main?.address ?? "",
    invocation: m.invocation,
  };
  const live = m.liveUrl ? { url: m.liveUrl, open: liveOpen, label: s.live, soon: s.liveSoon } : undefined;

  return (
    <WeddingRoot theme={m.theme} className={`gw-root is-${mode}${lang === "hi" ? " is-hi" : ""}${lite ? " is-lite" : ""}${open ? " is-open" : ""}`} style={gwTextures(m.theme)}>
      <style>{GW_CSS}</style>
      <Gate first={m.first} second={m.second} dateLine={shortDate} guest={guest} s={s} lang={lang} invocation={m.invocation} onOpened={onOpened} />

      <div className="gw-lang" role="group" aria-label="Language">
        <button type="button" aria-pressed={lang === "en"} onClick={() => setLang("en")}>
          EN
        </button>
        <button type="button" aria-pressed={lang === "hi"} onClick={() => setLang("hi")} lang="hi">
          हिं
        </button>
      </div>

      {/* ── The garden (hero) ───────────────────────────────────────────── */}
      <GardenHero
        open={open}
        lite={lite}
        s={s}
        lang={lang}
        first={m.first}
        second={m.second}
        guest={guest}
        invocation={m.invocation}
        dateLine={dateLine}
        time={mainTime}
        muhurat={m.muhurat}
        venue={venueLine}
        actions={<ShareBar variant="hero" s={s} lang={lang} shareText={shareText} couple={couple} main={main} events={m.events} />}
      />

      {/* ── The invitation ──────────────────────────────────────────────── */}
      <Section id="invitation" eyebrow={<span lang={lang}>{s.invitation}</span>} ornament={null} width="normal" className="gw-sec gw-sec-invite">
        <Reveal effect="rise" className="gw-invite">
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img className="gw-invite-crown" {...gwImg(GW.lattice, { lazy: true })} />
          <span className="gw-invite-rose" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img {...gwImg(GW.rose, { lazy: true })} />
          </span>
          <span className="gw-invite-bunch" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img {...gwImg(GW.anthurium, { lazy: true })} />
          </span>
          <div className="gw-invite-in">
            <MessageBlock text={data.letter} hindi={m.hindiMessage} ornament={null} heading={<span lang={lang}>{s.shubh}</span>} signature={data.endLine ? undefined : couple} />
          </div>
        </Reveal>
      </Section>

      {/* ── Families, between two flowering trees ───────────────────────── */}
      {(hasFamilies || m.blessingsOf) && (
        <Section id="families" eyebrow={<span lang={lang}>{s.blessingsEyebrow}</span>} title={<span lang={lang}>{s.families}</span>} ornament="divider-lotus" width="normal" className="gw-sec gw-sec-fam">
          <span className="gw-fam-tree gw-fam-tree-l" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img {...gwImg(GW.peonyL, { lazy: true })} />
          </span>
          <span className="gw-fam-tree gw-fam-tree-r" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img {...gwImg(GW.peonyR, { lazy: true })} />
          </span>
          {m.blessingsOf && (
            <Reveal className="gw-blessings-of">
              <p className="wk-eyebrow" lang={lang}>
                {s.blessingsOf}
              </p>
              <p className="gw-blessings-names">{m.blessingsOf}</p>
            </Reveal>
          )}
          {hasFamilies && (
            <Reveal delay={120} className="gw-fam">
              <FamiliesBlock bride={bride} groom={groom} first={m.familyFirst} heading="" photos />
            </Reveal>
          )}
        </Section>
      )}

      {/* ── The auspicious day: date, countdown, the fountain ───────────── */}
      {main?.date && (
        <Section id="date" eyebrow={<span lang={lang}>{s.dateEyebrow}</span>} title={<span lang={lang}>{s.shubh}</span>} ornament={null} width="wide" className="gw-sec gw-sec-day">
          <Fountain s={s} lang={lang} locale={locale} date={main.date} time={mainTime} timeRaw={main.time} muhurat={m.muhurat} venue={main.venue} />
        </Section>
      )}

      {/* ── Our story ───────────────────────────────────────────────────── */}
      {m.story.length > 0 && (
        <Section id="story" eyebrow={<span lang={lang}>{s.storyEyebrow}</span>} title={<span lang={lang}>{s.story}</span>} ornament="divider-lotus" width="normal" className="gw-sec gw-sec-story">
          <Story chapters={m.story} />
        </Section>
      )}

      {/* ── Functions ───────────────────────────────────────────────────── */}
      {m.events.length > 0 && (
        <Section id="events" eyebrow={<span lang={lang}>{s.eventsEyebrow}</span>} title={<span lang={lang}>{s.events}</span>} ornament="divider-lotus" width="wide" className="gw-sec gw-sec-events">
          <GardenEvents
            events={m.events}
            couple={couple}
            locale={locale}
            lang={lang}
            mainId={main?.id}
            live={live}
            labels={{ directions: s.directions, calendar: s.calendar, saveAll: s.saveAll, dress: s.dress, tba: s.tba, share: s.share, saved: s.saved }}
          />
        </Section>
      )}

      {/* ── The venue ───────────────────────────────────────────────────── */}
      {main?.venue && (
        <Section id="venue" eyebrow={<span lang={lang}>{s.venueEyebrow}</span>} ornament={null} width="wide" className="gw-sec gw-sec-venue">
          <Venue event={main} lang={lang} gettingThere={m.gettingThere} labels={{ directions: s.directions, map: s.map, gettingThere: s.gettingThere }} />
        </Section>
      )}

      {/* ── Pre-wedding film ────────────────────────────────────────────── */}
      {m.videoId && (
        <Section id="film" eyebrow={<span lang={lang}>{s.filmEyebrow}</span>} title={<span lang={lang}>{s.film}</span>} ornament={null} width="normal" className="gw-sec gw-sec-film">
          <Reveal effect="zoom">
            <Film id={m.videoId} label={s.play} />
          </Reveal>
        </Section>
      )}

      {/* ── Gallery ─────────────────────────────────────────────────────── */}
      {m.gallery.length > 0 && (
        <Section id="gallery" eyebrow={<span lang={lang}>{s.galleryEyebrow}</span>} title={<span lang={lang}>{s.gallery}</span>} ornament="divider-lotus" width="wide" className="gw-sec gw-sec-gallery">
          <span className="gw-gal-leaf gw-gal-leaf-l" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img {...gwImg(GW.bananaB, { lazy: true })} />
          </span>
          <span className="gw-gal-leaf gw-gal-leaf-r" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img {...gwImg(GW.palm, { lazy: true })} />
          </span>
          <WeddingMasonry photos={m.gallery} mask="rounded" radius={16} frame="foil" tileCaptions label={s.gallery} />
        </Section>
      )}

      {/* ── Garden notes: good to know, contacts, shagun ────────────────── */}
      {(m.things.length > 0 || m.contacts.length > 0 || m.upiId) && (
        <Section id="good-to-know" eyebrow={<span lang={lang}>{s.notesEyebrow}</span>} title={<span lang={lang}>{s.goodToKnow}</span>} ornament={null} width="normal" className="gw-sec gw-sec-notes">
          <Notes s={s} lang={lang} things={m.things} contacts={m.contacts} upiId={m.upiId} upiName={m.upiName} couple={couple} />
        </Section>
      )}

      {/* ── RSVP, under the flamingo border ─────────────────────────────── */}
      <Section id="rsvp" eyebrow={<span lang={lang}>RSVP · {s.rsvpEyebrow}</span>} ornament={null} width="narrow" className="gw-sec gw-sec-rsvp">
        <span className="gw-rsvp-peacock" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...gwImg(GW.peacockFlowers, { lazy: true })} />
        </span>
        <Reveal as="p" className="gw-upasthiti">
          <span lang={lang}>{s.upasthiti}</span>
        </Reveal>
        <Reveal className="gw-rsvp">
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img className="gw-rsvp-band" {...gwImg(GW.flamingos, { lazy: true })} />
          <div ref={rsvpRef} className="gw-rsvp-in">
            <RSVPBlock mode={mode} couple={couple} events={m.events} perEvent meal={m.rsvpMeal} maxGuests={m.maxGuests} deadline={m.rsvpBy || undefined} title={s.rsvp} intro={s.rsvpIntro} locale={locale} />
          </div>
        </Reveal>
      </Section>

      {/* ── Blessings ───────────────────────────────────────────────────── */}
      {m.blessings && (
        <Section id="blessings" eyebrow={<span lang={lang}>{s.blessingsEyebrow}</span>} ornament={null} width="normal" className="gw-sec gw-sec-bless">
          <span className="gw-bless-hang" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img {...gwImg(GW.lanterns, { lazy: true })} />
          </span>
          <BlessingsWall mode={mode} title={s.blessings} intro={s.blessingsIntro} />
        </Section>
      )}

      <div ref={endRef} />
      <Finale
        seal={T.en.shubh}
        sealHi={T.hi.shubh}
        closing={s.closing}
        endLine={data.endLine}
        first={m.first}
        second={m.second}
        hashtag={m.hashtag}
        lang={lang}
        share={<ShareBar variant="finale" s={s} lang={lang} shareText={shareText} couple={couple} main={main} events={m.events} card={card} />}
      />
    </WeddingRoot>
  );
}
