"use client";

// ─── The chapel invitation's sections ───────────────────────────────────────
// Every photo is a rectangle with all four corners equally rounded (the owner
// does not want arch / rounded-top frames). Every motion is a one-shot
// Reveal (transform/opacity) and honours reduced motion.

import { useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { Countdown, Reveal, formatEventDate, formatEventTime, initialOf, cdn } from "../../../_wedding";
import { ART, img } from "../assets";
import { SECOND_LANGS, type CwData, type CwView } from "../model";
import ShareBar, { ICON, Icon } from "./ShareBar";

// ── Pieces ──────────────────────────────────────────────────────────────────

export function Photo({ src, x = 50, y = 50, scale = 100, alt = "", ratio, className = "", lazy = true }: { src: string; x?: number; y?: number; scale?: number; alt?: string; ratio: string; className?: string; lazy?: boolean }) {
  const style: CSSProperties = {
    objectPosition: `${x}% ${y}%`,
    ...(scale > 100 ? { transform: `scale(${scale / 100})`, transformOrigin: `${x}% ${y}%` } : {}),
  };
  return (
    <span className={`cw-photo ${className}`} style={{ aspectRatio: ratio }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={cdn(src)} alt={alt} loading={lazy ? "lazy" : "eager"} decoding="async" style={style} />
    </span>
  );
}

export function Heading({ eyebrow, title, children, id }: { eyebrow?: string; title: string; children?: ReactNode; id?: string }) {
  return (
    <Reveal className="cw-head">
      {eyebrow && <p className="cw-eyebrow">{eyebrow}</p>}
      <h2 className="cw-h2" id={id}>
        {title}
      </h2>
      <span className="cw-rule" aria-hidden>
        <i />
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
          <path d="M12 3v18M8 8h8" />
        </svg>
        <i />
      </span>
      {children}
    </Reveal>
  );
}

const paragraphs = (t: string) =>
  t
    .split(/\n+/) // a blank line or a single break both start a paragraph (the AI writes either)
    .map((p) => p.trim())
    .filter(Boolean);

// ── Hero ────────────────────────────────────────────────────────────────────

export function Hero({ m, v, guest, shareText }: { m: CwData; v: CwView; guest: string; shareText: string }) {
  const main = v.main;
  const dateLine = main?.date ? formatEventDate(main.date, "en-IN") : "";
  const time = main?.time ? formatEventTime(main.time, "en-IN") : "";
  const church = m.churchName || main?.venue || "";
  return (
    <section className="cw-hero" id="top" aria-label="The invitation">
      <span className="cw-hero-lanterns" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...img(ART.lanterns)} />
      </span>
      <div className="cw-hero-grid">
        <Reveal effect="zoom" className="cw-hero-art">
          <span className="cw-hero-frame">
            {v.hero ? (
              <Photo src={v.hero.url} x={v.hero.x} y={v.hero.y} scale={v.hero.scale} alt={`${v.first} and ${v.second}`} ratio="3 / 4" lazy={false} className="cw-hero-photo" />
            ) : (
              <span className="cw-hero-mono" aria-hidden>
                <b>{initialOf(v.first)}</b>
                <i>&amp;</i>
                <b>{initialOf(v.second)}</b>
              </span>
            )}
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img className="cw-hero-drape" {...img(ART.drapeArch)} aria-hidden />
        </Reveal>

        <div className="cw-hero-copy">
          {guest && (
            <Reveal as="p" className="cw-hero-dear">
              Dear <b>{guest}</b>,
            </Reveal>
          )}
          <Reveal as="p" className="cw-eyebrow" delay={60}>
            The Holy Matrimony of
          </Reveal>
          <Reveal as="h1" className="cw-hero-names" delay={120}>
            <span>{v.first}</span>
            <i>&amp;</i>
            <span>{v.second}</span>
          </Reveal>
          <Reveal as="p" className="cw-hero-req" delay={200}>
            request the honour of your presence
          </Reveal>
          {(dateLine || church) && (
            <Reveal className="cw-hero-when" delay={260}>
              {dateLine && <p className="cw-hero-date">{dateLine}</p>}
              <p className="cw-hero-where">{[time, church].filter(Boolean).join(" · ")}</p>
              {m.venue && m.churchName && <p className="cw-hero-addr">{m.venue}</p>}
            </Reveal>
          )}
          {main?.date && (
            <Reveal className="cw-hero-count" delay={320}>
              <Countdown date={main.date} time={main.time || undefined} variant="flip" doneText="Just married" />
            </Reveal>
          )}
          <Reveal delay={380}>
            <ShareBar variant="hero" shareText={shareText} couple={v.couple} main={main} events={v.events} />
          </Reveal>
        </div>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
      <img className="cw-hero-pampas is-l" {...img(ART.pampasCorner)} aria-hidden />
      {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
      <img className="cw-hero-pampas is-r" {...img(ART.pampasCorner)} aria-hidden />
    </section>
  );
}

// ── Scripture ───────────────────────────────────────────────────────────────

export function Verse({ m, v }: { m: CwData; v: CwView }) {
  const alt = SECOND_LANGS.find((l) => l.id === m.secondLang);
  if (!v.verse && !m.blessing.trim()) return null;
  return (
    <section className="cw-sec cw-verse" id="verse" aria-label="Scripture">
      {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
      <img className="cw-verse-swirl is-l" {...img(ART.goldSwirl, { lazy: true })} aria-hidden />
      {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
      <img className="cw-verse-swirl is-r" {...img(ART.goldSwirl, { lazy: true })} aria-hidden />
      <Reveal effect="zoom" className="cw-verse-rose">
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...img(ART.roseWindow, { lazy: true })} aria-hidden />
      </Reveal>
      {v.verse ? (
        <Reveal as="blockquote" className="cw-verse-q" delay={100}>
          <p>“{v.verse.text}”</p>
          {v.verse.ref && <cite>{v.verse.ref}</cite>}
        </Reveal>
      ) : (
        <Reveal as="blockquote" className="cw-verse-q" delay={100}>
          <p>{m.blessing}</p>
        </Reveal>
      )}
      {m.secondLang !== "none" && m.altVerse.trim() && (
        <Reveal as="p" className="cw-verse-alt" delay={160}>
          <span lang={alt?.lang}>{m.altVerse}</span>
        </Reveal>
      )}
    </section>
  );
}

// ── The invitation + families ───────────────────────────────────────────────

export function Invitation({ m, v }: { m: CwData; v: CwView }) {
  const alt = SECOND_LANGS.find((l) => l.id === m.secondLang);
  const showAlt = m.secondLang !== "none" && !!m.altInvitation.trim();
  const fams = [
    { title: "The bride's family", of: v.first, parents: m.brideFamily.parents, grand: m.brideFamily.grandparents },
    { title: "The groom's family", of: v.second, parents: m.groomFamily.parents, grand: m.groomFamily.grandparents },
  ].filter((f) => f.parents.trim() || f.grand.trim());
  return (
    <section className="cw-sec cw-invite" id="invitation" aria-labelledby="cw-invite-h">
      <Heading eyebrow="With joyful hearts" title="You are invited" id="cw-invite-h" />
      <Reveal effect="zoom" className={`cw-invite-card${showAlt ? " has-alt" : ""}`}>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img className="cw-invite-peony is-tl" {...img(ART.peony, { lazy: true })} aria-hidden />
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img className="cw-invite-peony is-br" {...img(ART.peonyBouquet, { lazy: true })} aria-hidden />
        <div className="cw-invite-text">
          {paragraphs(v.invitation).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        {showAlt && (
          <div className="cw-invite-alt" lang={alt?.lang}>
            <p className="cw-invite-alt-k" lang="en">
              {alt?.label}
            </p>
            {paragraphs(m.altInvitation).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        )}
        {m.blessingsOf.trim() && (
          <p className="cw-invite-bless">
            <span>With the blessings of</span> {m.blessingsOf}
          </p>
        )}
      </Reveal>
      {fams.length > 0 && (
        <div className={`cw-fams${fams.length === 1 ? " is-one" : ""}`}>
          {fams.map((f, i) => (
            <Reveal key={f.title} className="cw-fam" delay={i * 90}>
              <p className="cw-eyebrow">{f.title}</p>
              {f.parents && <p className="cw-fam-names">{f.parents}</p>}
              {f.grand && <p className="cw-fam-grand">{f.grand}</p>}
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}

// ── The bride & the groom ───────────────────────────────────────────────────

export function Couple({ m, v }: { m: CwData; v: CwView }) {
  const people = [
    { role: "The bride", name: v.first, p: m.bride },
    { role: "The groom", name: v.second, p: m.groom },
  ];
  if (!people.some((x) => x.p.photo || x.p.description.trim())) return null;
  return (
    <section className="cw-sec cw-couple" id="couple" aria-labelledby="cw-couple-h">
      <Heading eyebrow="Two hearts, one covenant" title="The bride & the groom" id="cw-couple-h" />
      <div className="cw-couple-grid">
        {people.map((x, i) => (
          <Reveal key={x.role} className="cw-person" delay={i * 100}>
            {x.p.photo ? (
              <Photo src={x.p.photo} ratio="4 / 5" alt={x.name} className="cw-person-photo" />
            ) : (
              <span className="cw-person-mono" aria-hidden>
                {initialOf(x.name)}
              </span>
            )}
            <p className="cw-eyebrow">{x.role}</p>
            <h3 className="cw-person-name">{x.name}</h3>
            {x.p.description.trim() && <p className="cw-person-line">{x.p.description}</p>}
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ── Order of service ────────────────────────────────────────────────────────

const SERVICE_ICON: [RegExp, string][] = [
  [/ring/i, "M9 14a5 5 0 1 0 6 0M12 9l-2-3h4zM9 14a5 5 0 1 1 0 .1"],
  [/vow|promise/i, "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"],
  [/hymn|choir|song|music/i, "M9 18V6l11-2v12M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"],
  [/word|reading|scripture|liturgy|homily|sermon/i, "M4 5.5C6 4.5 9 4.5 12 6c3-1.5 6-1.5 8-.5V19c-2-1-5-1-8 .5-3-1.5-6-1.5-8-.5zM12 6v13.5"],
  [/register|sign/i, "M4 20h16M6 16l10-10 2 2-10 10H6z"],
  [/recession|exit|depart/i, "M5 12h14M13 6l6 6-6 6"],
  [/bless|prayer|nuptial/i, "M12 3v18M7 8h10"],
];
const iconFor = (t: string) => SERVICE_ICON.find(([re]) => re.test(t))?.[1] ?? "M12 4l2.2 4.6 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5L4.8 9.3l5-.7z";

export function Service({ m }: { m: CwData }) {
  const rows = m.orderOfService.filter((r) => r.title.trim());
  if (!rows.length) return null;
  return (
    <section className="cw-sec cw-service" id="service" aria-labelledby="cw-service-h">
      {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
      <img className="cw-service-ivy" {...img(ART.ivy, { lazy: true })} aria-hidden />
      <Heading eyebrow="The ceremony" title="Order of service" id="cw-service-h" />
      <ol className="cw-service-list">
        {rows.map((r, i) => (
          <Reveal as="li" key={i} className="cw-service-row" delay={(i % 4) * 70}>
            <span className="cw-service-time">{/^\d{2}:\d{2}$/.test(r.time) ? formatEventTime(r.time, "en-IN") : r.time}</span>
            <span className="cw-service-dot" aria-hidden>
              <Icon d={iconFor(r.title)} size={16} />
            </span>
            <span className="cw-service-what">
              <b>{r.title}</b>
              {r.note && <small>{r.note}</small>}
            </span>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}

// ── Our story ───────────────────────────────────────────────────────────────

export function Story({ m }: { m: CwData }) {
  const rows = m.story.filter((r) => r.title.trim() || r.line.trim());
  if (!rows.length) return null;
  return (
    <section className="cw-sec cw-story" id="story" aria-labelledby="cw-story-h">
      <Heading eyebrow="How it began" title="Our story" id="cw-story-h" />
      <ol className="cw-story-list">
        {rows.map((r, i) => (
          <li key={i} className={`cw-chapter${i % 2 ? " is-alt" : ""}${r.photo ? "" : " no-photo"}`}>
            {r.photo && (
              <Reveal effect="zoom" className="cw-chapter-art">
                <Photo src={r.photo} x={r.cropX} y={r.cropY} scale={r.scale} ratio="4 / 3" alt={r.title} />
              </Reveal>
            )}
            <Reveal className="cw-chapter-copy" delay={90}>
              {r.when && <p className="cw-chapter-when">{r.when}</p>}
              {r.title && <h3 className="cw-chapter-title">{r.title}</h3>}
              {r.line && <p className="cw-chapter-line">{r.line}</p>}
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  );
}

// ── The film ────────────────────────────────────────────────────────────────

export function Film({ id }: { id: string }) {
  const [on, setOn] = useState(false);
  return (
    <section className="cw-sec cw-film-sec" id="film" aria-labelledby="cw-film-h">
      <Heading eyebrow="A little film" title="Our story on screen" id="cw-film-h" />
      <Reveal effect="zoom" className="cw-film">
        {on ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
            title="Our film"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            loading="lazy"
          />
        ) : (
          <button type="button" className="cw-film-poster" onClick={() => setOn(true)} aria-label="Play our film">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" decoding="async" width={480} height={360} />
            <span className="cw-film-play" aria-hidden>
              <Icon d={ICON.play} size={26} />
            </span>
          </button>
        )}
      </Reveal>
    </section>
  );
}

// ── Finale ──────────────────────────────────────────────────────────────────

export function Finale({ m, v, children }: { m: CwData; v: CwView; children: ReactNode }) {
  return (
    <section className="cw-finale" id="finale" aria-label="With love">
      {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
      <img className="cw-finale-arch" {...img(ART.floralArch, { lazy: true })} aria-hidden />
      <Reveal effect="zoom" className="cw-finale-seal">
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...img(ART.roseWindow, { lazy: true })} aria-hidden />
      </Reveal>
      <Reveal as="p" className="cw-finale-quote" delay={80}>
        What God has joined together, let no one separate.
      </Reveal>
      <Reveal as="p" className="cw-finale-names" delay={140}>
        {v.first} <i>&amp;</i> {v.second}
      </Reveal>
      {m.closingLine.trim() && (
        <Reveal as="p" className="cw-finale-close" delay={180}>
          {m.closingLine}
        </Reveal>
      )}
      {m.hashtag.trim() && (
        <Reveal as="p" className="cw-finale-tag" delay={220}>
          {m.hashtag.startsWith("#") ? m.hashtag : `#${m.hashtag}`}
        </Reveal>
      )}
      <Reveal delay={260}>{children}</Reveal>
      <Link className="cw-create" href="/christian-wedding">
        ✦ Create your own invitation
      </Link>
      {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
      <img className="cw-finale-pampas" {...img(ART.pampasBorder, { lazy: true })} aria-hidden />
    </section>
  );
}
