"use client";

// ─── /wedding — the hub page itself ──────────────────────────────────────────
//
// Light, phone-first, and built from the owner's wedding art in
// public/wedding-v3 (the couple through every function, marigold garlands,
// gold jhumkas, peony bouquets). Sections, top to bottom:
//
//   hero          — the couple changes outfit through Engagement → Reception
//   featured      — the cinematic openings (palace doors, lotus temple, …)
//   all designs   — filter chips + the gallery's own cards
//   how it works  — pick → AI → WhatsApp → RSVPs
//   functions     — one link for every function
//   features      — RSVP, music, gallery, Hindi, QR, venue
//   FAQ + CTA
//
// The template list follows the gallery's rules exactly: hidden templates
// (per visitor, early-access grants included) never show, ✦ tiers come from the
// super admin's overrides, and the order is the admin's saved order, then the
// most-created ranking — see `useWeddingTemplates`.
//
// Motion is transform/opacity only, images are decoded before the couple
// starts cycling, everything stops off-screen, and prefers-reduced-motion gets
// a still page.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight, CalendarCheck, ChevronLeft, ChevronRight, Images, Languages, LayoutTemplate,
  MapPin, Music2, QrCode, Send, Sparkles, Wand2, ClipboardCheck,
} from "lucide-react";
import TemplateCard, { TEMPLATE_CARD_CSS } from "@/components/TemplateCard";
import PremiumTemplateCard, { PREMIUM_CARD_CSS } from "@/components/PremiumTemplateCard";
import LuxuryMobileTopBrand from "@/components/LuxuryMobileTopBrand";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchFavorites, toggleFavoriteAsync } from "@/store/favoritesSlice";
import { useTemplateAccess } from "@/hooks/useTemplateAccess";
import { isPremiumSlug, useTemplateMeta } from "@/lib/templateMeta";
import { GALLERY_LIST, isComingSoon, isNewLaunch, pinFirst, rankRooms } from "@/lib/galleryRules";
import type { TemplateListItem } from "@/types/template-config";
import {
  FEATURES, FUNCTIONS, OPENINGS, STEPS, WEDDING_FAQS, WEDDING_FILTERS,
  filterOf, isWeddingTemplate, type WeddingFilter,
} from "./content";
import { HUB_CSS } from "./hub.css";

type Item = TemplateListItem & { premium: boolean };

/** "Palace Door Wedding Invitation ✦ — Doors That…" → "Palace Door Wedding Invitation". */
const shortTitle = (t: string) => t.split(/\s+[✦👑—–-]\s|\s+✦|\s+👑/)[0].trim();

// ── data ─────────────────────────────────────────────────────────────────────

/** Every wedding template this visitor may see, in the gallery's order. */
function useWeddingTemplates() {
  const { hidden } = useTemplateAccess();
  const { tiers, ranking, order } = useTemplateMeta();
  const createdBy = useMemo(() => new Map(ranking.map((r) => [r.slug, r.created])), [ranking]);
  const ranked = useMemo(() => {
    const idx = new Map(GALLERY_LIST.map((t, i) => [t.slug, i]));
    return GALLERY_LIST
      .filter((t) => !hidden.has(t.slug))
      .map((t) => ({ ...t, premium: isPremiumSlug(t.slug, tiers) }))
      .sort((a, b) => (createdBy.get(b.slug) ?? 0) - (createdBy.get(a.slug) ?? 0) || idx.get(a.slug)! - idx.get(b.slug)!);
  }, [hidden, tiers, createdBy]);
  // Rank badges mean the same thing here as in the gallery: ranked against the
  // whole room, not just the weddings.
  const rankOf = useMemo(() => rankRooms(ranked, createdBy), [ranked, createdBy]);
  const items: Item[] = useMemo(
    () => pinFirst(ranked, order).filter((t) => isWeddingTemplate(t) && !isComingSoon(t)),
    [ranked, order],
  );
  return { items, rankOf, createdBy };
}

// ── small pieces ─────────────────────────────────────────────────────────────

/** Adds `is-in` to every `.whR` once it scrolls into view (one observer for the page). */
function useReveal(root: React.RefObject<HTMLElement | null>, deps: unknown[]) {
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const targets = Array.from(el.querySelectorAll<HTMLElement>(".whR:not(.is-in)"));
    if (!("IntersectionObserver" in window)) {
      targets.forEach((t) => t.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      }),
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduce(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduce;
}

/** Hanging marigold strands from a toran across the top of the hero. */
function Garlands() {
  // [left %, length on a phone px, length from 960px px, sway delay s] — kept
  // to the edges and short where they would reach the headline.
  const strands: [number, number, number, number][] = [
    [2.5, 150, 170, 0], [11, 100, 64, -1.4], [89, 100, 120, -0.6], [97.5, 150, 176, -2.1],
  ];
  return (
    <div className="whGarlands" aria-hidden>
      <span className="whToran" />
      {strands.map(([left, hm, hd, delay], i) => (
        <span
          key={i}
          className="whStrand"
          style={{ left: `${left}%`, ["--hm" as string]: `${hm}px`, ["--hd" as string]: `${hd}px`, animationDelay: `${delay}s` }}
        />
      ))}
    </div>
  );
}

/** The couple through every function, cross-fading once every image has decoded. */
function CoupleStage() {
  const reduce = usePrefersReducedMotion();
  const [i, setI] = useState(FUNCTIONS.length - 2); // the Pheras first: the most "wedding" outfit
  const [ready, setReady] = useState(false);
  const [onScreen, setOnScreen] = useState(true);
  const stage = useRef<HTMLDivElement>(null);

  // Decode every outfit before cycling, so a swap never shows a half-painted image.
  useEffect(() => {
    let alive = true;
    Promise.all(
      FUNCTIONS.map((f) => {
        const img = new Image();
        img.src = f.img;
        return img.decode().catch(() => undefined);
      }),
    ).then(() => alive && setReady(true));
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    const el = stage.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!ready || reduce || !onScreen) return;
    const t = window.setInterval(() => {
      if (document.visibilityState === "visible") setI((v) => (v + 1) % FUNCTIONS.length);
    }, 2800);
    return () => window.clearInterval(t);
  }, [ready, reduce, onScreen]);

  const f = FUNCTIONS[i];
  return (
    <div
      ref={stage}
      className="whStage"
      style={{ ["--tint" as string]: f.tint }}
    >
      <span className="whStageGlow" aria-hidden />
      <span className="whJhumka l" aria-hidden />
      <span className="whJhumka r" aria-hidden />
      <div className="whCouple">
        {FUNCTIONS.map((x, k) => (
          // eslint-disable-next-line @next/next/no-img-element -- decoded art, cross-faded by class
          <img
            key={x.id}
            src={x.img}
            width={x.w}
            height={x.h}
            alt={k === i ? `Illustrated bride and groom dressed for the ${x.name}` : ""}
            aria-hidden={k === i ? undefined : true}
            className={k === i ? "is-on" : ""}
            loading={k === i ? "eager" : "lazy"}
            fetchPriority={k === i ? "high" : "low"}
            decoding="async"
          />
        ))}
      </div>
      <span className="whPeony l" aria-hidden />
      <span className="whPeony r" aria-hidden />
      <button
        type="button"
        className="whNow"
        onClick={() => setI((v) => (v + 1) % FUNCTIONS.length)}
        aria-label={`Showing the ${f.name} outfit. Show the next function`}
      >
        <span className="whNowDeva" lang="hi">{f.hindi}</span>
        <span className="whNowSep" aria-hidden>·</span>
        <span>{f.name}</span>
        <span className="whDots" aria-hidden>
          {FUNCTIONS.map((x, k) => <i key={x.id} className={k === i ? "is-on" : ""} />)}
        </span>
      </button>
    </div>
  );
}

const FEATURE_ICON: Record<string, React.ReactNode> = {
  rsvp: <CalendarCheck size={20} />,
  music: <Music2 size={20} />,
  gallery: <Images size={20} />,
  lang: <Languages size={20} />,
  qr: <QrCode size={20} />,
  map: <MapPin size={20} />,
};
const STEP_ICON = [<LayoutTemplate key="1" size={20} />, <Wand2 key="2" size={20} />, <Send key="3" size={20} />, <ClipboardCheck key="4" size={20} />];

function Featured({ items }: { items: Item[] }) {
  const row = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });
  const sync = useCallback(() => {
    const el = row.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 });
  }, []);
  useEffect(() => {
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, [sync, items.length]);
  const page = (d: 1 | -1) => {
    const el = row.current;
    if (!el) return;
    el.scrollBy({ left: d * Math.max(el.clientWidth * 0.8, 260), behavior: "smooth" });
  };
  if (!items.length) return null;
  return (
    <section className="whSection" aria-labelledby="wh-featured">
      <div className="whHead whHeadRow">
        <div>
          <p className="whEyebrow">Cinematic openings</p>
          <h2 id="wh-featured" className="whH2">The first tap is <em>the reveal</em></h2>
          <p className="whSub">Every guest opens your invitation to its own little ceremony — doors, gardens, petals, lamps.</p>
        </div>
        <div className="whArrows">
          <button type="button" onClick={() => page(-1)} disabled={edge.start} aria-label="Previous designs"><ChevronLeft size={20} /></button>
          <button type="button" onClick={() => page(1)} disabled={edge.end} aria-label="More designs"><ChevronRight size={20} /></button>
        </div>
      </div>
      <div className="whFeatRow" ref={row} onScroll={sync}>
        {items.map((t, k) => {
          const o = OPENINGS[t.slug];
          return (
            <Link key={t.slug} href={`/${t.slug}`} className="whFeat whR" style={{ transitionDelay: `${Math.min(k, 4) * 70}ms` }}>
              <span className="whFeatImg">
                {/* eslint-disable-next-line @next/next/no-img-element -- finished poster, sized box */}
                <img src={t.coverImage} alt={shortTitle(t.title)} loading="lazy" decoding="async" />
                <span className="whFeatTag"><Sparkles size={12} aria-hidden /> {o.opening}</span>
              </span>
              <span className="whFeatBody">
                <span className="whFeatName">{shortTitle(t.title)}</span>
                <span className="whFeatLine">{o.line}</span>
                <span className="whFeatGo">Open design <ArrowRight size={15} aria-hidden /></span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

// ── page ─────────────────────────────────────────────────────────────────────

export default function WeddingHubClient() {
  const { items, rankOf, createdBy } = useWeddingTemplates();
  const [filter, setFilter] = useState<WeddingFilter>("all");
  const root = useRef<HTMLElement>(null);

  const dispatch = useAppDispatch();
  const favSlugs = useAppSelector((s) => s.favorites.slugs);
  const favFetched = useAppSelector((s) => s.favorites.fetched);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  useEffect(() => {
    if (isAuthenticated && !favFetched) dispatch(fetchFavorites());
  }, [dispatch, isAuthenticated, favFetched]);
  const handleFavorite = useCallback((e: React.MouseEvent, slug: string) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(toggleFavoriteAsync(slug));
  }, [dispatch]);

  const counts = useMemo(() => {
    const m = new Map<WeddingFilter, number>([["all", items.length]]);
    for (const t of items) m.set(filterOf(t.slug), (m.get(filterOf(t.slug)) ?? 0) + 1);
    return m;
  }, [items]);
  const chips = WEDDING_FILTERS.filter((c) => (counts.get(c.id) ?? 0) > 0);
  const shown = filter === "all" ? items : items.filter((t) => filterOf(t.slug) === filter);
  const featured = useMemo(() => items.filter((t) => OPENINGS[t.slug]), [items]);

  useReveal(root, [items.length]);

  return (
    <main ref={root} className="whPage">
      <style>{TEMPLATE_CARD_CSS + PREMIUM_CARD_CSS + HUB_CSS}</style>
      <LuxuryMobileTopBrand />

      <div className="whWrap">
        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="whHero" aria-labelledby="wh-title">
          <Garlands />
          <div className="whHeroText">
            <p className="whKicker">
              <span lang="hi">शुभ विवाह</span>
              <span aria-hidden className="whKickerDot">✦</span>
              Shubh Vivah
            </p>
            <h1 id="wh-title" className="whH1">
              Wedding Invitations
              <span className="whH1Script">that open like a celebration</span>
            </h1>
            <p className="whLead">
              Palace doors, lotus temples, Mughal gardens and church bells — one link for every function,
              with RSVPs, music and photos, ready for WhatsApp in minutes.
            </p>
            <div className="whCtas">
              <a href="#designs" className="whBtn">Explore designs <ArrowRight size={17} aria-hidden /></a>
              <a href="#how" className="whBtn ghost"><Sparkles size={16} aria-hidden /> Fill it with AI</a>
            </div>
            <ul className="whTrust" aria-label="Included in every wedding design">
              <li><CalendarCheck size={14} aria-hidden /> RSVP</li>
              <li><Music2 size={14} aria-hidden /> Music</li>
              <li><Languages size={14} aria-hidden /> Hindi &amp; English</li>
              <li><QrCode size={14} aria-hidden /> QR</li>
            </ul>
          </div>
          <CoupleStage />
        </section>

        {/* ── Featured openings ─────────────────────────────────────────────── */}
        <Featured items={featured} />

        {/* ── All designs ──────────────────────────────────────────────────── */}
        <section className="whSection" id="designs" aria-labelledby="wh-designs">
          <div className="whHead">
            <p className="whEyebrow">The collection</p>
            <h2 id="wh-designs" className="whH2">Every wedding design, <em>one place</em></h2>
            <p className="whSub">Hindu, Christian, reception, court marriage and more — tap a card to see it open.</p>
          </div>
          <div className="whChips" role="group" aria-label="Filter wedding designs">
            {chips.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`whChip${filter === c.id ? " is-on" : ""}`}
                aria-pressed={filter === c.id}
                onClick={() => setFilter(c.id)}
              >
                <span aria-hidden>{c.emoji}</span>
                {c.label}
                <span className="whChipN">{counts.get(c.id)}</span>
              </button>
            ))}
          </div>
          {shown.length > 0 ? (
            <div className="whGrid">
              {shown.map((t, i) => {
                const props = {
                  template: t,
                  rank: rankOf.get(t.slug),
                  created: createdBy.get(t.slug),
                  isNew: isNewLaunch(t.slug),
                  price: true,
                  isFav: favSlugs.includes(t.slug),
                  index: i,
                  onFavorite: handleFavorite,
                };
                return t.ultra ? <PremiumTemplateCard key={t.slug} {...props} /> : <TemplateCard key={t.slug} {...props} />;
              })}
            </div>
          ) : (
            <p className="whEmpty">New wedding designs are on their way. <Link href="/templates">See all templates</Link></p>
          )}
        </section>

        {/* ── How it works ─────────────────────────────────────────────────── */}
        <section className="whSection" id="how" aria-labelledby="wh-how">
          <div className="whHead">
            <p className="whEyebrow">How it works</p>
            <h2 id="wh-how" className="whH2">From <em>“we’re getting married”</em> to RSVPs</h2>
            <p className="whSub">Four steps, about ten minutes. AI asks a few questions and fills the rest — you stay in control of every word.</p>
          </div>
          <ol className="whSteps">
            {STEPS.map((s, k) => (
              <li key={s.n} className="whStep whR" style={{ transitionDelay: `${k * 90}ms` }}>
                <span className="whStepIc" aria-hidden>{STEP_ICON[k]}</span>
                <span className="whStepN" aria-hidden>{s.n}</span>
                <h3 className="whStepT">{s.title}</h3>
                <p className="whStepX">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ── Every function ───────────────────────────────────────────────── */}
        <section className="whSection whFns" aria-labelledby="wh-fns">
          <div className="whHead">
            <p className="whEyebrow">One link, every function</p>
            <h2 id="wh-fns" className="whH2">Sagai to <em>vidaai</em>, all in one invite</h2>
            <p className="whSub">Each function gets its own date, time, venue, dress code and RSVP — guests see only what they need.</p>
          </div>
          <ul className="whFnRow">
            {FUNCTIONS.map((f, k) => (
              <li key={f.id} className="whFn whR" style={{ ["--tint" as string]: f.tint, transitionDelay: `${k * 60}ms` }}>
                <span className="whFnArt">
                  {/* eslint-disable-next-line @next/next/no-img-element -- illustration in a sized box */}
                  <img src={f.img} alt="" width={f.w} height={f.h} loading="lazy" decoding="async" />
                </span>
                <span className="whFnName">{f.name}</span>
                <span className="whFnDeva" lang="hi">{f.hindi}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Features ─────────────────────────────────────────────────────── */}
        <section className="whSection" aria-labelledby="wh-feat">
          <div className="whHead">
            <p className="whEyebrow">Made for Indian weddings</p>
            <h2 id="wh-feat" className="whH2">Everything a <em>shaadi card</em> never could</h2>
          </div>
          <div className="whFeatures">
            {FEATURES.map((f, k) => (
              <article key={f.title} className="whFeature whR" style={{ transitionDelay: `${(k % 3) * 80}ms` }}>
                <span className="whFeatureIc" aria-hidden>{FEATURE_ICON[f.icon]}</span>
                <h3 className="whFeatureT">{f.title}</h3>
                <p className="whFeatureX">{f.text}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────────── */}
        <section className="whSection" aria-labelledby="wh-faq">
          <div className="whHead">
            <p className="whEyebrow">Questions</p>
            <h2 id="wh-faq" className="whH2">Wedding invitation <em>FAQ</em></h2>
          </div>
          <div className="whFaq">
            {WEDDING_FAQS.map((f, k) => (
              <details key={f.q} className="whQ" open={k === 0}>
                <summary>
                  <span>{f.q}</span>
                  <ChevronRight size={18} className="whQIc" aria-hidden />
                </summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────────────────── */}
        <section className="whCta whR" aria-labelledby="wh-cta">
          <span className="whCtaGarland" aria-hidden />
          <p className="whEyebrow light">Your shaadi, your way</p>
          <h2 id="wh-cta" className="whCtaT">Send an invitation your family will forward twice</h2>
          <p className="whCtaX">Pick a design, let AI fill it in, and share one link with everyone you love.</p>
          <div className="whCtas center">
            <a href="#designs" className="whBtn gold">Choose your design <ArrowRight size={17} aria-hidden /></a>
            <Link href="/templates" className="whBtn ghostLight">All templates</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
