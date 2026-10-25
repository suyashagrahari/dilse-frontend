"use client";

// ─── /wedding — the hub page itself ──────────────────────────────────────────
//
// A full-bleed, phone-first walk into an Indian wedding, built from the
// owner's art in public/wedding-v3 (cut to page-weight variants in /hub/lux).
// Sections, top to bottom — each a full-width band, none boxed in a card:
//
//   hero          — a peacock terrace at golden hour (HubHero)
//   journey       — Roka → Haldi → Mehndi → Sangeet → Baraat → Pheras → Reception (HubJourney)
//   all designs   — sticky filter chips + the gallery's own cards
//   world         — one link to family in eight cities, live clocks (HubWorld)
//   how it works  — pick → AI → share → RSVPs, with little animations
//   features, FAQ, and a finale of fireworks and diyas
//
// The template list follows the gallery's rules exactly: hidden templates
// (per visitor, early-access grants included) never show, ✦ tiers come from the
// super admin's overrides, and the order is the admin's saved order, then the
// most-created ranking — see `useWeddingTemplates`. Links elsewhere on the
// page only point at a design this visitor can see; otherwise at the grid.
//
// No reviews, names, counts or ratings anywhere: features, described honestly.

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight, CalendarCheck, Check, ChevronRight, Images, Languages,
  MapPin, Music2, QrCode, Send, Sparkles, Wand2,
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
  FEATURES, LUX, STEPS, WEDDING_FAQS, WEDDING_FILTERS,
  cdnCover, weddingItems, type WeddingFilter,
} from "./content";
import { HUB_CSS } from "./hub.css";
import { HERO_CSS } from "./hero.css";
import { SECTIONS_CSS } from "./sections.css";
import HubHeroBase from "./HubHero";
import HubJourneyBase from "./HubJourney";
import HubWorldBase from "./HubWorld";
import SeasonRibbon from "./SeasonRibbon";

// The big decorative bands don't re-render when a filter chip or a favourite changes.
const HubHero = memo(HubHeroBase);
const HubJourney = memo(HubJourneyBase);
const HubWorld = memo(HubWorldBase);

type Item = TemplateListItem & { premium: boolean; group: Exclude<WeddingFilter, "all"> };

// ── data ─────────────────────────────────────────────────────────────────────

/**
 * Every wedding template this visitor may see: the super admin's curated list
 * (/admin/places) when one is saved, else the automatic rule in the gallery's
 * order. See `weddingItems`.
 */
function useWeddingTemplates() {
  const { hidden } = useTemplateAccess();
  const { tiers, ranking, order, collections } = useTemplateMeta();
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
  // Covers that live in public/wedding-v3 are served from their CDN twins here.
  const items: Item[] = useMemo(
    () => weddingItems(pinFirst(ranked, order), collections.wedding, isComingSoon)
      .map((t) => ({ ...t, coverImage: cdnCover(t.coverImage) })),
    [ranked, order, collections.wedding],
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

const FEATURE_ICON: Record<string, React.ReactNode> = {
  rsvp: <CalendarCheck size={20} />,
  music: <Music2 size={20} />,
  gallery: <Images size={20} />,
  lang: <Languages size={20} />,
  qr: <QrCode size={20} />,
  map: <MapPin size={20} />,
};

/** The little moving picture at the top of each "how it works" step. */
function StepArt({ k }: { k: number }) {
  if (k === 0) {
    return (
      <span className="whSA pick" aria-hidden>
        <i /><i /><i />
      </span>
    );
  }
  if (k === 1) {
    return (
      <span className="whSA ai" aria-hidden>
        <Wand2 size={26} className="wand" />
        <b className="s1">✦</b><b className="s2">✦</b><b className="s3">✦</b>
        <span className="lines"><i /><i /><i /></span>
      </span>
    );
  }
  if (k === 2) {
    return (
      <span className="whSA share" aria-hidden>
        <span className="bubble">You&rsquo;re invited 💌</span>
        <Send size={22} className="plane" />
      </span>
    );
  }
  return (
    <span className="whSA rsvp" aria-hidden>
      {["Haldi", "Sangeet", "Pheras"].map((f) => (
        <span key={f} className="row"><span>{f}</span><Check size={14} /></span>
      ))}
    </span>
  );
}

const BURSTS = [
  { x: 14, y: 26, c: "#f6d27a", d: 0 }, { x: 84, y: 20, c: "#ff9fb2", d: 0.9 }, { x: 50, y: 10, c: "#ffe7a8", d: 1.7 },
  { x: 28, y: 52, c: "#ffb36b", d: 2.4 }, { x: 72, y: 46, c: "#f6d27a", d: 3.1 },
];
const SPARKS = Array.from({ length: 14 }, (_, i) => i * (360 / 14));
const DIYAS = [0, 1, 2, 3, 4, 5, 6];

// ── page ─────────────────────────────────────────────────────────────────────

export default function WeddingHubClient() {
  const { items, rankOf, createdBy } = useWeddingTemplates();
  const [filter, setFilter] = useState<WeddingFilter>("all");
  const root = useRef<HTMLElement>(null);
  const finale = useRef<HTMLElement>(null);
  const designs = useRef<HTMLElement>(null);
  const how = useRef<HTMLElement>(null);

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
    for (const t of items) m.set(t.group, (m.get(t.group) ?? 0) + 1);
    return m;
  }, [items]);
  const chips = WEDDING_FILTERS.filter((c) => (counts.get(c.id) ?? 0) > 0);
  const shown = filter === "all" ? items : items.filter((t) => t.group === filter);
  const visible = useMemo(() => new Set(items.map((t) => t.slug)), [items]);

  useReveal(root, [items.length]);

  // The finale, the "how it works" pictures and the cards' sheens only animate
  // while their band is on screen (is-live; see the pause rules in hub.css.ts).
  useEffect(() => {
    const els = [finale.current, designs.current, how.current].filter((e): e is HTMLElement => !!e);
    if (!els.length || !("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-live"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.target.classList.toggle("is-live", e.isIntersecting)),
      { threshold: 0.01 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <main ref={root} className="whPage">
      <style>{TEMPLATE_CARD_CSS + PREMIUM_CARD_CSS + HUB_CSS + HERO_CSS + SECTIONS_CSS}</style>
      <LuxuryMobileTopBrand />

      <HubHero />
      {/* Wedding season only: the sale, the clock and a link to /wedding-offer. */}
      <SeasonRibbon />
      <HubJourney visible={visible} />

      {/* ── All designs ──────────────────────────────────────────────────── */}
      <section ref={designs} className="whBand whDesigns" id="designs" aria-labelledby="wh-designs">
        <div className="whIn">
          <div className="whHead">
            <p className="whEyebrow">The collection</p>
            <h2 id="wh-designs" className="whH2">Every wedding design, <em>one place</em></h2>
            <p className="whSub">Hindu, Christian, reception, court marriage and more. Tap a card to watch it open.</p>
          </div>
          <div className="whChips" role="group" aria-label="Filter wedding designs" data-no-swipe>
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
                  // The grid is three screens down here: offset the index so the
                  // card never marks a cover eager/high and competes with the hero.
                  index: i + 4,
                  onFavorite: handleFavorite,
                };
                return t.ultra ? <PremiumTemplateCard key={t.slug} {...props} /> : <TemplateCard key={t.slug} {...props} />;
              })}
            </div>
          ) : (
            <p className="whEmpty">New wedding designs are on their way. <Link href="/templates">See all templates</Link></p>
          )}
        </div>
      </section>

      <HubWorld />

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section ref={how} className="whBand whHow" id="how" aria-labelledby="wh-how">
        <div className="whIn">
          <div className="whHead">
            <p className="whEyebrow">How it works</p>
            <h2 id="wh-how" className="whH2">From <em>&ldquo;we&rsquo;re getting married&rdquo;</em> to RSVPs</h2>
            <p className="whSub">Four steps, about ten minutes. AI asks a few questions and fills in the rest, and you stay in control of every word.</p>
          </div>
          <ol className="whSteps">
            {STEPS.map((s, k) => (
              <li key={s.n} className="whStep whR" style={{ transitionDelay: `${k * 90}ms` }}>
                <StepArt k={k} />
                <span className="whStepN" aria-hidden>{s.n}</span>
                <h3 className="whStepT">{s.title}</h3>
                <p className="whStepX">{s.text}</p>
              </li>
            ))}
          </ol>
          <div className="whCtas center">
            <a href="#designs" className="whBtn"><Sparkles size={16} aria-hidden /> Pick a design to fill with AI</a>
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
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="whBand whFaqBand" aria-labelledby="wh-faq">
        <div className="whIn">
          <div className="whHead">
            <p className="whEyebrow">Questions</p>
            <h2 id="wh-faq" className="whH2">Indian wedding invitation <em>FAQ</em></h2>
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
        </div>
      </section>

      {/* ── Finale ───────────────────────────────────────────────────────── */}
      <section ref={finale} className="whFinale" aria-labelledby="wh-cta">
        <span className="whFinLights" aria-hidden style={{ backgroundImage: `url(${LUX}/string-lights-900.webp)` }} />
        <span className="whFinLantern l" aria-hidden style={{ backgroundImage: `url(${LUX}/lanterns-360.webp)` }} />
        <span className="whFinLantern r" aria-hidden style={{ backgroundImage: `url(${LUX}/lanterns-360.webp)` }} />
        <div className="whFireworks" aria-hidden>
          {BURSTS.map((b, i) => (
            <span key={i} className="whBurst" style={{ left: `${b.x}%`, top: `${b.y}%`, ["--c" as string]: b.c, ["--bd" as string]: `${b.d}s` }}>
              <b className="flash" />
              {SPARKS.map((r) => <i key={r} style={{ ["--r" as string]: `${r}deg` }} />)}
            </span>
          ))}
          {Array.from({ length: 18 }, (_, i) => (
            <em key={i} className="whTwinkle" style={{ left: `${(i * 53) % 100}%`, top: `${(i * 37) % 70}%`, animationDelay: `${(i % 6) * 0.45}s` }} />
          ))}
        </div>
        <div className="whFinIn">
          <p className="whEyebrow light"><span lang="hi">शुभ विवाह</span> · Your wedding, your way</p>
          <h2 id="wh-cta" className="whFinT">Your wedding deserves an invitation <em>they will never forget</em></h2>
          <p className="whFinX">Pick a design, let AI fill it in, and send one link to everyone you love, wherever in the world they are.</p>
          <div className="whCtas center">
            <a href="#designs" className="whBtn gold">Choose your design <ArrowRight size={17} aria-hidden /></a>
            <Link href="/templates" className="whBtn ghostLight">All templates</Link>
          </div>
        </div>
        <div className="whDiyas" aria-hidden>
          {DIYAS.map((d) => (
            <span key={d} className="whDiya">
              <i className="glow" style={{ animationDelay: `${d * 0.31}s` }} />
              <i className="flame" style={{ animationDelay: `${d * 0.17}s` }} />
              <i className="bowl" />
            </span>
          ))}
        </div>
      </section>
    </main>
  );
}
