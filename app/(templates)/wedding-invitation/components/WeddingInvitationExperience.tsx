"use client";

// ─── Wedding Invitation (Classic) — the guest's page ─────────────────────────
//
// "An elegant paper invitation that arrives sealed." One backdrop plate per
// theme (watercolour wash, velvet, marble, damask: ./art) under everything.
//   the wax-sealed envelope (./Envelope) → tap → seal press, crack, flap, the
//   card slides out → the arch-topped paper card (./ArchCard): gold double
//   border draws itself, the theme's florals bloom at two corners, names in
//   gold script with a light sweep, ≤ 6 petals drift
//   → counting down → the invitation (letter) → the families → the
//   celebrations (≤ 2 functions) → the venue → moments (≤ 6 photos) → RSVP
//   → "With love" + WhatsApp share.
// Every section wears the same stationery: paper cards with a double gold
// hairline, a sprig of the theme's florals, a gold flourish under the title.
// Classic stays one plane: no parallax, no vellum, one floral pose.

import { memo, useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode, type RefObject } from "react";
import {
  Countdown,
  EventsTimeline,
  FamiliesBlock,
  MessageBlock,
  Monogram,
  RSVPBlock,
  Reveal,
  VenueCard,
  WeddingMasonry,
  WeddingRoot,
  WEDDING_THEMES,
  isWeddingThemeId,
  mapLink,
  useWeddingReducedMotion,
} from "../../_wedding";
import { art } from "../../_wedding/art";
import type { ExperienceProps } from "../../_valentine/types";
import Envelope, { ENVELOPE_CSS } from "./Envelope";
import ArchCard, { ARCH_CSS, Petals } from "./ArchCard";
import Floral, { FLORAL_CSS } from "./Floral";
import { CLASSIC_ART, DIVIDER_ART, LAUREL, plateImg } from "./art";
import { coupleNames, dotDate, longDate, mainEvent, prettyTime, readWi, type WiModel } from "./model";

type Stage = "sealed" | "opening" | "open";

const noSub = () => () => {};
/** One query parameter (client only; null on the server and in the first hydration pass). */
function useSearchParam(name: string): string | null {
  return useSyncExternalStore(
    noSub,
    () => new URLSearchParams(window.location.search).get(name),
    () => null,
  );
}

/** "For the Sharma family" from ?to= (plain text, React escapes it). */
function guestLine(to: string | null): string {
  const t = (to || "").replace(/\s+/g, " ").trim().slice(0, 48);
  if (!t) return "";
  return /^for\b/i.test(t) ? t : `For ${t}`;
}

export default function WeddingInvitationExperience({ data, mode, react }: ExperienceProps) {
  const reduced = useWeddingReducedMotion();
  const x0 = useMemo(() => readWi(data.extras), [data.extras]);
  // Dev only: ?wiTheme=noir previews a theme without the editor.
  const wiTheme = useSearchParam("wiTheme");
  const devTheme = process.env.NODE_ENV === "production" ? null : wiTheme;
  const x = useMemo(() => (isWeddingThemeId(devTheme) ? { ...x0, theme: devTheme } : x0), [x0, devTheme]);
  const theme = x.theme;
  const [a, b] = coupleNames(data.recipientName, data.senderName, x.namesOrder);
  const main = mainEvent(x.events);
  const date = x.date || main?.date || "";
  const time = x.time || main?.time || "";
  const photos = useMemo(() => data.photos.filter((p) => p && p.url).slice(0, 6), [data.photos]);
  const tokens = WEDDING_THEMES[theme].tokens;
  const dark = WEDDING_THEMES[theme].dark;
  const ca = CLASSIC_ART[theme];
  const plate = plateImg(theme);

  const [stage, setStage] = useState<Stage>("sealed");
  const [round, setRound] = useState(0);
  const guest = guestLine(useSearchParam("to"));

  const pageRef = useRef<HTMLElement>(null);
  /** Decode the card's first-screen art (florals, divider, laurel) before the scene runs. */
  const ready = useCallback(() => {
    const imgs = Array.from(pageRef.current?.querySelectorAll<HTMLImageElement>(".wi-hero img") ?? []);
    return Promise.all(imgs.map((i) => i.decode().catch(() => undefined)));
  }, []);
  const reveal = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
    setStage("opening");
  }, []);
  const done = useCallback(() => setStage("open"), []);
  const replay = useCallback(() => {
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    window.setTimeout(
      () => {
        setRound((n) => n + 1);
        setStage("sealed");
      },
      reduced ? 0 : 450,
    );
  }, [reduced]);
  const sealed = stage === "sealed";

  // "Seen it all" once the closing comes into view.
  const endRef = useRef<HTMLDivElement>(null);
  const completed = useRef(false);
  useEffect(() => {
    const el = endRef.current;
    if (!el || sealed) return;
    const io = new IntersectionObserver((en) => {
      if (en.some((e) => e.isIntersecting) && !completed.current) {
        completed.current = true;
        react("completed");
      }
    });
    io.observe(el);
    return () => io.disconnect();
  }, [sealed, react]);

  const url = typeof window !== "undefined" ? window.location.href.split("#")[0] : "";
  const toRsvp = () => document.getElementById("wi-rsvp")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  const toVenue = () => document.getElementById("wi-venue")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });

  const hasFamilies = !!(x.brideFamily || x.groomFamily);
  const divider = art(DIVIDER_ART);

  return (
    <WeddingRoot theme={theme} background={false} chrome className="wi-root">
      <style>{WI_CSS + ENVELOPE_CSS + ARCH_CSS + FLORAL_CSS}</style>
      {/* The engine's music icon sits outside this root: paint it in the theme. */}
      <style>{`body .vm-icon-btn { background: radial-gradient(circle at 50% 38%, ${tokens.accent}, ${tokens.ink} 140%); color: ${tokens.accentInk}; box-shadow: 0 6px 16px -6px rgba(0,0,0,.45), 0 0 0 1px ${tokens.gold}; }`}</style>

      {/* The backdrop plate: one fixed layer under the envelope and the page. */}
      <div className="wi-plate" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element -- pack plate on the CDN; the pre-tap LCP */}
        <img key={theme} src={plate.src} srcSet={plate.srcSet} sizes={plate.sizes} width={plate.w} height={plate.h} alt="" fetchPriority="high" decoding="async" />
      </div>

      {stage !== "open" && (
        <Envelope
          key={`${round}-${theme}`}
          theme={theme}
          names={[a, b]}
          date={dotDate(date)}
          guest={guest}
          reduced={reduced}
          ready={ready}
          onReveal={reveal}
          onDone={done}
        />
      )}

      <main ref={pageRef} className="wi-page" data-open={!sealed || undefined} aria-hidden={sealed || undefined} key={round}>
        {/* ── The card ───────────────────────────────────────────────────── */}
        <section className="wi-hero">
          <Petals theme={theme} active={!sealed && !reduced} />
          <ArchCard theme={theme}>
            <div className="wi-mono wi-in" style={{ ["--d" as string]: "700ms" }}>
              {ca.laurel && (
                <span className="wi-laurel" aria-hidden>
                  <Floral spec={LAUREL} priority sizes="150px" />
                </span>
              )}
              <Monogram a={a} b={b} variant="text" size={dark ? 92 : 104} animate={false} />
            </div>
            <p className="wk-eyebrow wi-kicker wi-in" style={{ ["--d" as string]: "900ms" }}>
              {hasFamilies ? "Together with their families" : "Shubh Vivah"}
            </p>
            <h1 className="wi-names wi-in" style={{ ["--d" as string]: "1200ms" }}>
              <span className="wi-nameA wk-script">{a}</span>
              <span className="wi-amp" aria-hidden>
                &amp;
              </span>
              <span className="wk-sr"> and </span>
              <span className="wi-nameB wk-script">{b}</span>
              <span className="wi-sweep" aria-hidden>
                <span />
              </span>
            </h1>
            <p className="wi-request wi-in" style={{ ["--d" as string]: "1800ms" }}>
              request the honour of your presence at their wedding
            </p>
            <span className="wi-rule wi-in" style={{ ["--d" as string]: "1920ms" }} aria-hidden>
              {/* eslint-disable-next-line @next/next/no-img-element -- pack ornament */}
              <img src={divider.src} srcSet={divider.srcSet} width={divider.w} height={divider.h} alt="" decoding="async" />
            </span>
            {date && (
              <p className="wi-when wi-in" style={{ ["--d" as string]: "2040ms" }}>
                <span>{longDate(date)}</span>
                {time && <span className="wi-when-t">{prettyTime(time)}</span>}
              </p>
            )}
            {main?.venue && (
              <p className="wi-where wi-in" style={{ ["--d" as string]: "2160ms" }}>
                {main.venue}
                {main.address ? <span>{main.address.split(",").slice(-2).join(",").trim()}</span> : null}
              </p>
            )}
            <div className="wi-acts wi-in" style={{ ["--d" as string]: "2500ms" }}>
              {x.rsvp && (
                <button type="button" className="wk-btn" onClick={toRsvp}>
                  RSVP
                </button>
              )}
              {main?.venue && (
                <button type="button" className="wk-btn wk-btn-ghost" onClick={toVenue}>
                  View location
                </button>
              )}
            </div>
          </ArchCard>
          {date && (
            <div className="wi-count wi-in" style={{ ["--d" as string]: "2700ms" }}>
              <p className="wk-eyebrow">Counting down to forever</p>
              <Countdown date={date} time={time || undefined} variant="roll" doneText="Just married" />
            </div>
          )}
        </section>

        <Sections data={data} x={x} mode={mode} a={a} b={b} url={url} photos={photos} onReplay={replay} endRef={endRef} />
      </main>
    </WeddingRoot>
  );
}


/**
 * Everything below the card. Memoised: the opening's stage changes re-render
 * the card only, never the sections (they are heavy in React and the main
 * thread is busy enough while the card animates in).
 */
const Sections = memo(function Sections({
  data,
  x,
  mode,
  a,
  b,
  url,
  photos,
  onReplay,
  endRef,
}: {
  data: ExperienceProps["data"];
  x: WiModel;
  mode: ExperienceProps["mode"];
  a: string;
  b: string;
  url: string;
  photos: ExperienceProps["data"]["photos"];
  onReplay: () => void;
  endRef: RefObject<HTMLDivElement | null>;
}) {
  const theme = x.theme;
  const ca = CLASSIC_ART[theme];
  const couple = `${a} & ${b}`;
  const main = mainEvent(x.events);
  const date = x.date || main?.date || "";
  const divider = art(DIVIDER_ART);
  const hasFamilies = !!(x.brideFamily || x.groomFamily);
  // "With love" is the script heading above it: don't say it twice.
  const closing = (data.endLine || "").replace(/^\s*[—-]?\s*with (all our |much )?love,?\s*/i, "").trim() || couple;
  const brideSide = { title: "The bride's family", names: x.brideFamily ? [x.brideFamily] : [] };
  const groomSide = { title: "The groom's family", names: x.groomFamily ? [x.groomFamily] : [] };
  const share = () => {
    const text = `You're invited to the wedding of ${couple} 💌${date ? ` ${longDate(date)}` : ""}. Tap to open the invitation: ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };
  // Sections alternate the sprig's corner.
  let n = 0;
  const side = () => (n++ % 2 ? "l" : "r");

  return (
    <>
        {/* ── The invitation ───────────────────────────────────────────── */}
        {data.letter.trim() && (
          <Sec id="wi-invite" eyebrow="The invitation" theme={theme} side={side()} divider={divider}>
            <div className="wi-sheet">
              <MessageBlock text={data.letter} heading="You're invited" ornament={null} />
            </div>
          </Sec>
        )}

        {/* ── Families ─────────────────────────────────────────────────── */}
        {hasFamilies && (
          <Sec eyebrow="Our families" title="With the blessings of" theme={theme} side={side()} divider={divider}>
            <FamiliesBlock heading="" bride={brideSide} groom={groomSide} first={x.namesOrder === "groom" ? "groom" : "bride"} />
          </Sec>
        )}

        {/* ── Celebrations ─────────────────────────────────────────────── */}
        {x.events.length > 0 && (
          <Sec eyebrow="Save the dates" title="The celebrations" theme={theme} side={side()} divider={divider}>
            <EventsTimeline events={x.events} couple={couple} calendar="main" mainEventId={main?.id} url={url} layout="cards" showSwatch={false} />
          </Sec>
        )}

        {/* ── Venue ───────────────────────────────────────────────────── */}
        {main?.venue && (
          <Sec id="wi-venue" eyebrow="Where" title="The venue" theme={theme} side={side()} divider={divider}>
            <VenueCard name={main.venue} address={main.address} mapUrl={main.mapUrl || mapLink(main)} eyebrow={main.title} note={main.note} embed ornament={null} />
          </Sec>
        )}

        {/* ── Moments ─────────────────────────────────────────────────── */}
        {photos.length > 0 && (
          <Sec eyebrow="Moments" title="Our story in pictures" theme={theme} side={side()} divider={divider} wide>
            <WeddingMasonry photos={photos} mask="arch" frame="foil" tileCaptions label={`Photos of ${couple}`} />
          </Sec>
        )}

        {/* ── RSVP ────────────────────────────────────────────────────── */}
        {x.rsvp && (
          <Sec id="wi-rsvp" eyebrow="RSVP" theme={theme} side={side()} divider={divider}>
            <div className="wi-sheet wi-sheet-rsvp">
              <RSVPBlock mode={mode} couple={couple} maxGuests={x.maxGuests} deadline={x.rsvpBy || undefined} title="Will you join us?" />
            </div>
          </Sec>
        )}

        {/* ── Closing ─────────────────────────────────────────────────── */}
        <section className="wi-close" ref={endRef}>
          <Reveal className="wi-closeIn">
            <Floral spec={ca.floral} className="wi-closeFl" sizes="(min-width: 520px) 260px, 60vw" />
            <p className="wi-withLove wk-script">With love</p>
            <p className="wi-closeLine">{closing}</p>
            <span className="wi-rule" aria-hidden>
              {/* eslint-disable-next-line @next/next/no-img-element -- pack ornament */}
              <img src={divider.src} srcSet={divider.srcSet} width={divider.w} height={divider.h} alt="" loading="lazy" decoding="async" />
            </span>
            <div className="wi-acts">
              <button type="button" className="wk-btn" onClick={share}>
                Share on WhatsApp
              </button>
              <button type="button" className="wk-btn wk-btn-ghost" onClick={onReplay}>
                Open the envelope again
              </button>
            </div>
            {main && (
              <a className="wi-dir" href={main.mapUrl || mapLink(main)} target="_blank" rel="noopener noreferrer">
                Get directions to {main.venue || "the venue"}
              </a>
            )}
          </Reveal>
        </section>
    </>
  );
});

/** One section of the stationery: a sprig of the theme's florals, the head, a gold flourish, the content. */
function Sec({
  id,
  eyebrow,
  title,
  theme,
  side,
  divider,
  wide,
  children,
}: {
  id?: string;
  eyebrow: string;
  title?: string;
  theme: keyof typeof CLASSIC_ART;
  side: "l" | "r";
  divider: ReturnType<typeof art>;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <section id={id} className={`wi-sec${wide ? " is-wide" : ""}`} data-side={side}>
      <Reveal className="wi-secHead">
        <p className="wk-eyebrow">{eyebrow}</p>
        {title && <h2 className="wk-h2 wi-gold">{title}</h2>}
        <span className="wi-rule" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element -- pack ornament */}
          <img src={divider.src} srcSet={divider.srcSet} width={divider.w} height={divider.h} alt="" loading="lazy" decoding="async" />
        </span>
      </Reveal>
      <div className="wi-secBody">
        <Floral spec={CLASSIC_ART[theme].floral} className="wi-sprig" sizes="(min-width: 700px) 190px, 40vw" />
        {children}
      </div>
    </section>
  );
}

const WI_CSS = /* css */ `
.wi-root { --wi-soft: cubic-bezier(.22,.61,.36,1); --wi-silk: cubic-bezier(.65,.05,.36,1); --wi-expo: cubic-bezier(.16,1,.3,1); --wi-press: cubic-bezier(.34,1.56,.64,1);
  --wi-card-shadow: 0 40px 70px -36px rgba(70, 40, 20, .55), 0 12px 24px -14px rgba(70, 40, 20, .3), 0 0 0 1px rgba(150, 110, 50, .14);
  position: relative; isolation: isolate; min-height: 100dvh; overflow-x: clip; color: var(--wk-ink); background: var(--wk-bg); }
.wi-root[data-wk-dark] { --wi-card-shadow: 0 44px 80px -34px rgba(0, 0, 0, .9), 0 14px 28px -14px rgba(0, 0, 0, .6), 0 0 0 1px rgba(230, 190, 110, .16); }
/* The kit's foil sheen animates background-position: Classic keeps its foil static (the sweep below is the shine). */
.wi-root .wk-shimmer { animation: none !important; }

.wi-plate { position: fixed; inset: 0; z-index: -1; overflow: hidden; pointer-events: none; animation: wi-fade .4s var(--wi-soft) both; }
.wi-plate img { width: 100%; height: 100%; object-fit: cover; display: block; }
.wi-plate::after { content: ""; position: absolute; inset: 0; background: radial-gradient(120% 85% at 50% 42%, transparent 52%, rgba(60, 30, 20, .16) 100%); }
[data-wk-dark] .wi-plate::after { background: radial-gradient(110% 80% at 50% 42%, transparent 30%, rgba(0, 0, 0, .55) 100%), linear-gradient(rgba(10, 2, 4, .3), rgba(10, 2, 4, .3)); }
@keyframes wi-fade { from { opacity: 0; } to { opacity: 1; } }

.wi-page { padding-bottom: 72px; }
.wi-page:not([data-open]) { visibility: hidden; }
.wi-hero { position: relative; min-height: 100svh; display: grid; align-content: center; justify-items: center; gap: 30px; padding: max(84px, calc(env(safe-area-inset-top) + 72px)) 0 56px; overflow: hidden; }

/* Entrance, keyed off [data-open] (spec §4.3, t = 0 at the settle beat). */
.wi-page[data-open] .wi-cardWrap { animation: wi-cardIn .9s var(--wi-silk) both; }
@keyframes wi-cardIn { from { opacity: 0; transform: translateY(9vh) scale(.86); } to { opacity: 1; transform: none; } }
.wi-cardLine path { stroke-dashoffset: 1; }
.wi-page[data-open] .wi-cardLine path { animation: wi-draw 1.6s var(--wi-soft) .3s forwards; }
.wi-page[data-open] .wi-cardLine-b { animation-delay: .45s; }
@keyframes wi-draw { to { stroke-dashoffset: 0; } }
.wi-bloomIn { opacity: 0; }
.wi-page[data-open] .wi-bloom-tr .wi-bloomIn { animation: wi-bloom 1.4s var(--wi-soft) .6s both; }
.wi-page[data-open] .wi-bloom-bl .wi-bloomIn { animation: wi-bloom 1.2s var(--wi-soft) .8s both; }
@keyframes wi-bloom { from { opacity: 0; transform: scale(.82) rotate(-6deg); } to { opacity: 1; transform: none; } }
.wi-cardCorner { opacity: 0; }
.wi-page[data-open] .wi-cardCorner { animation: wi-fade .8s var(--wi-soft) 1.4s both; }
.wi-in { opacity: 0; }
.wi-page[data-open] .wi-in { animation: wi-rise .7s var(--wi-soft) var(--d, 0ms) both; }
@keyframes wi-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
.wi-page[data-open] .wi-names.wi-in { animation-duration: .9s; }
.wi-amp { opacity: 0; }
.wi-page[data-open] .wi-amp { animation: wi-fade .6s var(--wi-soft) 1.45s both; }

.wi-mono { position: relative; display: grid; place-items: center; margin-bottom: 4px; }
.wi-laurel { position: absolute; left: 50%; top: 50%; width: 148px; transform: translate(-50%, -46%); pointer-events: none; }
.wi-mono .wk-mono-box { border-color: color-mix(in srgb, var(--wk-gold) 55%, transparent); }
.wi-kicker { margin: 12px 0 2px; }
.wi-names { position: relative; margin: 0; display: grid; justify-items: center; font-weight: 400; line-height: 1.08; overflow: hidden; padding: .06em .2em .14em; }
.wi-names .wk-script { font-size: clamp(50px, 14.5vw, 76px); padding: 0 .1em; color: var(--wk-gold-ink);
  background-image: var(--wk-foil); background-size: 100% 100%; -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 1px 0 rgba(255, 255, 255, .35)); }
[data-wk-dark] .wi-names .wk-script { filter: drop-shadow(0 2px 3px rgba(0, 0, 0, .45)); }
.wi-amp { font: italic 500 clamp(26px, 6vw, 36px)/1 var(--wk-font-display); color: var(--wk-gold-ink); margin: -4px 0; }
.wi-sweep { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
.wi-sweep span { position: absolute; top: -10%; bottom: -10%; left: 0; width: 30%; transform: translateX(-110%) skewX(-18deg); opacity: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 252, 240, .85) 50%, transparent); }
[data-wk-dark] .wi-sweep span { background: linear-gradient(90deg, transparent, rgba(255, 236, 180, .32) 50%, transparent); }
.wi-page[data-open] .wi-sweep span { animation: wi-sweep 8s var(--wi-soft) 1.5s infinite; }
@keyframes wi-sweep { 0% { transform: translateX(-110%) skewX(-18deg); opacity: .45; } 20% { transform: translateX(360%) skewX(-18deg); opacity: .45; } 20.1%, 100% { transform: translateX(360%) skewX(-18deg); opacity: 0; } }
.wi-request { margin: 10px 0 2px; font: italic 500 clamp(17px, 4.4vw, 20px)/1.45 var(--wk-font-display); color: var(--wk-muted); max-width: 26ch; }
.wi-rule { display: block; width: min(200px, 60%); margin: 10px auto 12px; }
.wi-rule img { display: block; width: 100%; height: auto; }
.wi-when { margin: 0; display: grid; gap: 4px; font: 600 clamp(12px, 3.3vw, 14px)/1.5 var(--wk-font-caps); letter-spacing: .2em; text-transform: uppercase; color: var(--wk-ink); }
.wi-when-t { color: var(--wk-gold-ink); letter-spacing: .26em; }
.wi-where { margin: 10px 0 0; display: grid; gap: 2px; font: 500 clamp(18px, 4.6vw, 21px)/1.35 var(--wk-font-display); color: var(--wk-ink); }
.wi-where span { font-size: .8em; font-style: italic; color: var(--wk-muted); }
.wi-acts { margin-top: 22px; display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
.wi-acts .wk-btn { min-height: 46px; }
.wi-count { display: grid; justify-items: center; gap: 10px; padding: 0 16px; }
.wi-count .wk-eyebrow { margin: 0; }

/* ── Sections: the same stationery ── */
.wi-sec { position: relative; width: min(100% - 32px, 640px); margin: 0 auto; padding: clamp(56px, 12vw, 96px) 0 8px; }
.wi-sec.is-wide { width: min(100% - 32px, 980px); }
.wi-secHead { position: relative; z-index: 1; text-align: center; margin: 0 auto clamp(30px, 6vw, 40px); max-width: 74%; }
.wi-secHead .wk-eyebrow { margin: 0 0 4px; }
.wi-secHead .wi-rule { width: min(170px, 46%); margin: 8px auto 0; }
.wi-gold { margin: 0; color: var(--wk-gold-ink); background-image: var(--wk-foil); background-size: 100% 100%; -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
.wi-secBody { position: relative; }
.wi-sprig { position: absolute; z-index: 3; top: 0; width: min(34%, 180px); pointer-events: none; }
.wi-sec[data-side=r] .wi-sprig { right: -6%; transform: translateY(-58%) rotate(26deg); }
.wi-sec[data-side=l] .wi-sprig { left: -6%; transform: translateY(-58%) scaleX(-1) rotate(26deg); }
[data-wk-theme=noir] .wi-sprig { width: min(26%, 130px); }

.wi-root .wk-card, .wi-sheet { position: relative; border: 0; border-radius: 16px; -webkit-backdrop-filter: none; backdrop-filter: none;
  background-color: var(--wk-surface-solid); background-image: radial-gradient(130% 90% at 50% 20%, transparent 55%, rgba(120, 80, 30, .07));
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--wk-gold) 70%, transparent), inset 0 0 0 5px var(--wk-surface-solid), inset 0 0 0 5.6px color-mix(in srgb, var(--wk-gold) 45%, transparent), var(--wi-card-shadow); }
.wi-root[data-wk-dark] .wk-card, .wi-root[data-wk-dark] .wi-sheet { background-image: var(--wk-paper); background-size: 512px 512px; background-blend-mode: soft-light; }
.wi-sheet { padding: clamp(28px, 7vw, 44px) clamp(20px, 6vw, 40px); }
.wi-sheet .wk-msg { margin: 0 auto; }
.wi-sheet-rsvp .wk-card { box-shadow: none; background: none; padding: 0; }
.wi-root .wk-ev-dot { box-shadow: 0 0 0 4px var(--wk-surface-solid); }

.wi-close { padding: 64px 16px 24px; display: grid; place-items: center; text-align: center; }
.wi-closeIn { display: grid; justify-items: center; gap: 6px; max-width: 560px; }
.wi-closeFl { width: min(62vw, 260px); margin-bottom: -6px; }
.wi-withLove { margin: 0; font-size: clamp(48px, 13vw, 72px); line-height: 1.15; padding: 0 .12em; color: var(--wk-gold-ink);
  background-image: var(--wk-foil); background-size: 100% 100%; -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
.wi-closeLine { margin: 0; font: 500 clamp(19px, 5vw, 24px)/1.45 var(--wk-font-display); color: var(--wk-ink); }
.wi-close .wi-rule { width: 160px; margin: 6px auto 0; }
.wi-dir { margin-top: 14px; font: 500 14px var(--wk-font-sans); color: var(--wk-gold-ink); text-underline-offset: 3px; min-height: 44px; display: inline-flex; align-items: center; }

@media (min-width: 900px) and (min-height: 700px) {
  .wi-hero { padding-top: 96px; }
}
@media (max-height: 480px) and (orientation: landscape) { .wi-hero { min-height: auto; padding-top: 72px; } }
@media (prefers-reduced-motion: reduce) {
  .wi-root *, .wi-root *::before, .wi-root *::after { animation: none !important; transition: none !important; }
  .wi-page[data-open] { animation: wi-fade .3s linear both !important; }
  .wi-in, .wi-amp, .wi-bloomIn, .wi-cardCorner { opacity: 1; }
  .wi-cardLine path { stroke-dashoffset: 0; }
  .wi-petals { display: none !important; }
}
`;
