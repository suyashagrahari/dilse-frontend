"use client";

// ─── Animated Shaadi Card 🪔 — the guest's experience ───────────────────────
//
// The painted khidki under a marigold toran (tap: the shutters fold open,
// garlands swing in, haldi light and petals pour out; the tap starts the
// music) → the haldi mandap with the couple → the invitation in English +
// Hindi under two brass lamps → both families between banana leaves → the
// couple → the date with a split-flap countdown beside the marigold jhoola →
// the story → the functions, each with its own illustrated couple, timings,
// map, dress code and calendar buttons → the venue → the film → the album →
// good to know, who to call, shagun → RSVP per function → blessings (with
// voice notes) → the Shubh Vivah seal, the share bar and "Replay opening".
//
// One component for the editor preview (mode "preview": RSVPs and blessings
// work locally) and the published page (mode "live"). Light only; every
// motion is transform/opacity; reduced motion is honoured throughout.

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { RSVPBlock, Reveal, WeddingMasonry, WeddingRoot, cdn, formatEventDate, formatEventTime } from "../../_wedding";
import { ART, img } from "./assets";
import { T, defaultInvitation, readView, type Lang, type ShaadiCardData, type ShaadiTheme, type Wish } from "./model";
import Blessings from "./sc/Blessings";
import Hero from "./sc/Hero";
import Khidki from "./sc/Khidki";
import { Couple, Families, Film, Finale, Functions, Invitation, LiveButton, Notes, SaveTheDate, SectionHead, Story, Venue } from "./sc/Sections";
import ShareBar from "./sc/ShareBar";
import { SC_CSS } from "./sc/css";
import { prefillInput, useGuestName } from "./sc/guest";

export interface ShaadiExperienceProps {
  data: ShaadiCardData;
  mode: "preview" | "live";
  shareId?: string;
  /** Change it to show the opening again (the editor's "Replay opening"). */
  replay?: number;
  /** Called once the khidki has been opened (analytics, the editor dock). */
  onOpened?: () => void;
  /** Link for "Make your own invitation" (live page). */
  createHref?: string;
}

/** The four light palettes. Each overrides the wedding kit's --wk-* tokens. */
const THEMES: Record<ShaadiTheme, Record<string, string>> = {
  marigold: {
    "--wk-bg": "#fff9ee",
    "--wk-bg2": "#ffe9b8",
    "--wk-surface": "rgba(255, 253, 246, 0.9)",
    "--wk-surface-solid": "#fffdf6",
    "--wk-surface-2": "#fff1d2",
    "--wk-ink": "#3d1a0f",
    "--wk-muted": "#7a5a43",
    "--wk-accent": "#b3155a",
    "--wk-accent-ink": "#fffaf3",
    "--wk-gold": "#e29a1b",
    "--wk-gold-ink": "#8c5300",
    "--wk-border": "rgba(179, 21, 90, 0.18)",
    "--wk-glow": "rgba(255, 214, 102, 0.6)",
    "--sc-marigold": "#f29d12",
    "--sc-haldi": "#ffd23f",
    "--sc-rani": "#c2185b",
    "--sc-leaf": "#3f7d2c",
    "--sc-sky1": "#fffaf0",
    "--sc-sky2": "#ffe6a6",
  },
  haldi: {
    "--wk-bg": "#fffbe6",
    "--wk-bg2": "#ffe27a",
    "--wk-surface": "rgba(255, 253, 240, 0.9)",
    "--wk-surface-solid": "#fffdf0",
    "--wk-surface-2": "#fff3bf",
    "--wk-ink": "#3a2408",
    "--wk-muted": "#76603a",
    "--wk-accent": "#c2410c",
    "--wk-accent-ink": "#fffbeb",
    "--wk-gold": "#d99a0b",
    "--wk-gold-ink": "#7c4d00",
    "--wk-border": "rgba(194, 65, 12, 0.2)",
    "--wk-glow": "rgba(255, 221, 87, 0.7)",
    "--sc-marigold": "#f08a00",
    "--sc-haldi": "#ffd000",
    "--sc-rani": "#c2185b",
    "--sc-leaf": "#4d7c0f",
    "--sc-sky1": "#fffbe0",
    "--sc-sky2": "#ffdf61",
  },
  rani: {
    "--wk-bg": "#fff6f8",
    "--wk-bg2": "#ffd6e4",
    "--wk-surface": "rgba(255, 251, 252, 0.9)",
    "--wk-surface-solid": "#fffbfc",
    "--wk-surface-2": "#ffe6ee",
    "--wk-ink": "#3f0f22",
    "--wk-muted": "#86566a",
    "--wk-accent": "#be185d",
    "--wk-accent-ink": "#fff7fa",
    "--wk-gold": "#e5a11a",
    "--wk-gold-ink": "#8a5300",
    "--wk-border": "rgba(190, 24, 93, 0.2)",
    "--wk-glow": "rgba(255, 182, 210, 0.6)",
    "--sc-marigold": "#f29d12",
    "--sc-haldi": "#ffd23f",
    "--sc-rani": "#be185d",
    "--sc-leaf": "#3f7d2c",
    "--sc-sky1": "#fff7f0",
    "--sc-sky2": "#ffd9b0",
  },
  mehendi: {
    "--wk-bg": "#f8faee",
    "--wk-bg2": "#e5efc5",
    "--wk-surface": "rgba(253, 255, 247, 0.9)",
    "--wk-surface-solid": "#fdfff7",
    "--wk-surface-2": "#eef4d8",
    "--wk-ink": "#22300f",
    "--wk-muted": "#5d6b45",
    "--wk-accent": "#3f7d2c",
    "--wk-accent-ink": "#fbfff3",
    "--wk-gold": "#e29a1b",
    "--wk-gold-ink": "#7a5000",
    "--wk-border": "rgba(63, 125, 44, 0.22)",
    "--wk-glow": "rgba(255, 214, 102, 0.55)",
    "--sc-marigold": "#f29d12",
    "--sc-haldi": "#ffd23f",
    "--sc-rani": "#c2185b",
    "--sc-leaf": "#3f7d2c",
    "--sc-sky1": "#fbfdf0",
    "--sc-sky2": "#fbe7a8",
  },
};

const LINEN = `url("${cdn("/wedding-v3/gw-kit/linen-overlay.webp")}")`;
const GALLERY_COLUMNS = [
  { min: 0, columns: 2 },
  { min: 560, columns: 3 },
  { min: 900, columns: 4 },
] as const;

function openedKey(shareId?: string) {
  return `sc_opened_${shareId || "preview"}`;
}

export default function ShaadiExperience({ data, mode, shareId, replay = 0, onOpened, createHref }: ShaadiExperienceProps) {
  const m = useMemo(() => readView(data), [data]);
  const [lang, setLang] = useState<Lang>(data.lang);
  // The editor's language follows the form (adjusted while rendering).
  const [formLang, setFormLang] = useState<Lang>(data.lang);
  if (formLang !== data.lang) {
    setFormLang(data.lang);
    setLang(data.lang);
  }
  const s = T[lang];
  const locale = lang === "hi" ? "hi-IN" : "en-IN";
  const guest = useGuestName();

  // The khidki shows once per session (a reload skips it; "Replay opening" brings it back).
  const [gate, setGate] = useState<"show" | "hidden">(() => {
    if (typeof window === "undefined") return "show";
    try {
      return sessionStorage.getItem(openedKey(shareId)) ? "hidden" : "show";
    } catch {
      return "show";
    }
  });
  const [open, setOpen] = useState(gate === "hidden");
  // "Replay opening" from the editor: close and show the khidki again (state adjusted while rendering; the scroll is the effect).
  const [seenReplay, setSeenReplay] = useState(replay);
  if (replay !== seenReplay) {
    setSeenReplay(replay);
    setOpen(false);
    setGate("show");
  }
  const lastReplay = useRef(replay);
  useEffect(() => {
    if (replay === lastReplay.current) return;
    lastReplay.current = replay;
    window.scrollTo?.({ top: 0 });
  }, [replay]);
  const replayNow = useCallback(() => {
    setOpen(false);
    setGate("show");
    const sc = document.querySelector<HTMLElement>("[data-sc-scroller]");
    if (sc) sc.scrollTo({ top: 0 });
    else window.scrollTo({ top: 0 });
  }, []);
  const onGateOpened = () => {
    setOpen(true);
    try {
      sessionStorage.setItem(openedKey(shareId), "1");
    } catch {
      /* private mode */
    }
    onOpened?.();
  };

  // The personal link fills the RSVP name (the kit's input is controlled; see prefillInput).
  const rsvpRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!guest) return;
    const t = window.setTimeout(() => prefillInput(rsvpRef.current?.querySelector<HTMLInputElement>('input[autocomplete="name"]') ?? null, guest), 400);
    return () => window.clearTimeout(t);
  }, [guest, open]);

  const main = m.main;
  const dateLine = m.day ? formatEventDate(m.day, locale) : "";
  const shortDate = m.day ? new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${m.day}T12:00:00Z`)) : "";
  const time = m.time ? formatEventTime(m.time, locale) : "";
  const venueLine = [main?.venue, data.venue].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(", ");
  const invitation = data.invitation.trim() || defaultInvitation(m.first, m.second, data.venue);
  const shareText = lang === "hi" ? `${m.couple} के शुभ विवाह का निमंत्रण 🪔` : `You're invited to the wedding of ${m.couple} 🪔`;
  const wishes: Wish[] = useMemo(() => [...data.wishes].reverse(), [data.wishes]);
  const first = data.nameOrder === "groom" ? "groom" : "bride";
  const hasFamilies = !!(data.brideFamily.parents || data.brideFamily.grandparents || data.groomFamily.parents || data.groomFamily.grandparents);
  const hasCouple = !!(data.bride.photo || data.groom.photo || data.bride.description || data.groom.description);
  const card = {
    first: m.first,
    second: m.second,
    dateLine,
    timeLine: [time, data.muhurat].filter(Boolean).join(" · "),
    venue: main?.venue || data.venue,
    address: main?.address || "",
    invocation: data.invocation,
  };
  const style = { ...THEMES[data.theme] ?? THEMES.marigold, "--wk-texture": LINEN, "--wk-paper": LINEN, minHeight: "100dvh" } as CSSProperties;

  return (
    <WeddingRoot theme="champagne" className={`sc-root is-${mode}${open ? " is-open" : ""}${lang === "hi" ? " is-hi" : ""}`} style={style}>
      <style>{SC_CSS}</style>
      {gate === "show" && (
        <Khidki
          key={replay}
          first={m.first}
          second={m.second}
          dateLine={shortDate}
          guest={guest}
          s={s}
          lang={lang}
          invocation={data.invocation}
          onOpened={onGateOpened}
          onGone={() => setGate("hidden")}
        />
      )}

      <div className="sc-lang" role="group" aria-label="Language">
        <button type="button" aria-pressed={lang === "en"} onClick={() => setLang("en")}>
          EN
        </button>
        <button type="button" aria-pressed={lang === "hi"} onClick={() => setLang("hi")} lang="hi">
          हिं
        </button>
      </div>

      <Hero
        open={open}
        s={s}
        lang={lang}
        first={m.first}
        second={m.second}
        guest={guest}
        invocation={data.invocation}
        dateLine={dateLine}
        time={time}
        muhurat={data.muhurat}
        venue={venueLine}
        couplePhoto={data.couplePhoto}
        coupleCrop={data.coupleCrop}
        live={data.liveUrl ? <LiveButton url={data.liveUrl} main={main} s={s} lang={lang} /> : undefined}
        actions={<ShareBar variant="hero" s={s} lang={lang} shareText={shareText} couple={m.couple} main={main} events={m.events} />}
      />

      <Invitation text={invitation} hindi={data.hindiMessage} lang={lang} s={s} blessing={data.blessing} signature={data.closingLine ? "" : m.couple} />

      {(hasFamilies || data.blessingsOf) && (
        <Families
          s={s}
          lang={lang}
          first={first}
          blessingsOf={data.blessingsOf}
          bride={{ parents: data.brideFamily.parents, grandparents: data.brideFamily.grandparents, name: m.bride }}
          groom={{ parents: data.groomFamily.parents, grandparents: data.groomFamily.grandparents, name: m.groom }}
        />
      )}

      {hasCouple && <Couple s={s} lang={lang} first={first} bride={{ ...data.bride, name: m.bride }} groom={{ ...data.groom, name: m.groom }} brideCrop={data.brideCrop} groomCrop={data.groomCrop} />}

      {m.day && <SaveTheDate s={s} lang={lang} locale={locale} day={m.day} clock={m.time} time={time} muhurat={data.muhurat} venue={venueLine} />}

      {m.story.length > 0 && <Story s={s} lang={lang} chapters={m.story} />}

      {m.events.length > 0 && <Functions s={s} lang={lang} locale={locale} events={m.events} couple={m.couple} mainId={main?.id} />}

      {main?.venue && <Venue s={s} lang={lang} event={main} gettingThere={data.gettingThere} />}

      {m.videoId && <Film id={m.videoId} s={s} lang={lang} />}

      {m.gallery.length > 0 && (
        <section id="gallery" className="sc-sec sc-sec-gallery">
          <span className="sc-gal-feather" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img {...img(ART.goldLeaf, { lazy: true })} />
          </span>
          <SectionHead eyebrow={s.galleryEyebrow} title={s.gallery} lang={lang} />
          <WeddingMasonry photos={m.gallery} mask="rounded" radius={16} columns={GALLERY_COLUMNS} frame="none" tileCaptions label={s.gallery} className="sc-gallery" />
        </section>
      )}

      {(m.things.length > 0 || m.contacts.length > 0 || data.upiId) && (
        <Notes s={s} lang={lang} things={m.things} contacts={m.contacts} upiId={data.upiId} upiName={data.upiName} couple={m.couple} />
      )}

      {data.rsvpOn && (
        <section id="rsvp" className="sc-sec sc-sec-rsvp">
          <span className="sc-rsvp-pot sc-rsvp-pot-l" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img {...img(ART.pots, { lazy: true })} />
          </span>
          <span className="sc-rsvp-pot sc-rsvp-pot-r" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img {...img(ART.pots, { lazy: true })} />
          </span>
          <SectionHead eyebrow="RSVP" title={s.rsvpEyebrow} lang={lang} />
          <Reveal className="sc-card sc-rsvp">
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img className="sc-rsvp-border" {...img(ART.garlandBorder, { lazy: true })} aria-hidden />
            <div ref={rsvpRef} className="sc-rsvp-in">
              <RSVPBlock
                mode={mode}
                couple={m.couple}
                events={m.events}
                perEvent={m.events.length > 1}
                meal={data.rsvpMeal}
                maxGuests={Math.min(10, Math.max(1, data.maxGuests || 6))}
                deadline={data.rsvpBy || undefined}
                title={s.rsvp}
                intro={s.rsvpIntro}
                locale={locale}
                share={mode === "live" && shareId ? { slug: "shaadi-card", shareId } : null}
              />
            </div>
          </Reveal>
        </section>
      )}

      <section id="blessings" className="sc-sec sc-sec-bless">
        <SectionHead eyebrow={s.blessingsEyebrow} title={s.blessings} lang={lang} />
        <p className="sc-sub" lang={lang}>
          {s.blessingsIntro}
        </p>
        <Blessings mode={mode} shareId={shareId} wishes={wishes} s={s} lang={lang} guest={guest} />
      </section>

      <Finale
        s={s}
        lang={lang}
        first={m.first}
        second={m.second}
        closing={data.closingLine}
        hashtag={data.hashtag}
        onReplay={replayNow}
        createHref={createHref}
        share={<ShareBar variant="finale" s={s} lang={lang} shareText={shareText} couple={m.couple} main={main} events={m.events} card={card} />}
      />
    </WeddingRoot>
  );
}
