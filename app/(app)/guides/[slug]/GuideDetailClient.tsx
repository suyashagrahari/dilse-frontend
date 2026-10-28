"use client";

import type { CSSProperties } from "react";
import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Play, FileText, Clock, ListChecks, ArrowRight, ArrowLeft, Lightbulb,
  CalendarCheck, ChevronRight, BookOpen, Sparkles, Youtube, Instagram, ExternalLink,
} from "lucide-react";
import type { ProductGuide } from "@/types/product-guide";
import type { Article } from "@/lib/strapi";
import { articleCover } from "@/lib/strapi";
import { guideVideoSet, guideMedia } from "@/lib/templateMedia";
import { formatDuration, stepCount } from "@/lib/guides";
import GuideVideoPlayer from "@/components/guides/GuideVideoPlayer";

const GOLD = "#c9a84c";
const INK = "#2a0a0e";
const MAROON = "#3d0c11";
const MUTED = "#7a5555";

/** The two "also on" links. Quieter than the page's own buttons on purpose —
 *  they lead away from the guide, and the guide is the thing being read. */
const SOCIAL_PILL: CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 6,
  padding: "7px 13px", borderRadius: 999, textDecoration: "none",
  background: "rgba(255,255,255,0.72)", color: INK,
  border: "1px solid rgba(61,12,17,0.14)",
  fontSize: 12, fontWeight: 700,
};

interface Props {
  guide: ProductGuide;
  relatedGuides: ProductGuide[];
  relatedArticles: Article[];
  /** The same recording on YouTube, when it was posted there. Resolved on the
   *  server from data/video-showcase.ts — see the note at its `getShowcase`. */
  youtubeUrl?: string;
  /** And the Instagram reel of the same recording. */
  instagramUrl?: string;
}

export default function GuideDetailClient({
  guide,
  relatedGuides,
  relatedArticles,
  youtubeUrl,
  instagramUrl,
}: Props) {
  const media = guideVideoSet(guide.slug);
  const steps = stepCount(guide);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const [flashed, setFlashed] = useState<string | null>(null);

  /**
   * The stitch between the two halves of the page: scroll the written section
   * matching a chapter into view and flash it, so a scroll that lands mid-page
   * does not leave you hunting for what moved.
   *
   * ── WHY THIS IS NOT WIRED TO THE CHAPTER CLICK ITSELF ──────────────────────
   *
   * The obvious wiring — click a chapter, seek the video AND scroll to the prose
   * — is actively hostile, and testing it made that plain. Clicking "The lifafa
   * and the password" started the video at 00:36 and then scrolled the player
   * completely off screen (measured: player top at -1680px), so the thing you
   * just asked to watch was the one thing you could no longer see.
   *
   * So the two are separate intentions with separate controls. Clicking the
   * chapter row seeks and plays, and leaves the page where it is. The small
   * "read" affordance on the row jumps to the prose without touching playback.
   * Nobody has to guess which one they are about to get.
   */
  const jumpToSection = useCallback((sectionId: string) => {
    const el = sectionRefs.current[sectionId];
    if (!el) return;

    // `window.scrollTo` with an explicit offset rather than `scrollIntoView`,
    // because the offset is the whole point: the nav is fixed, so landing the
    // section at viewport top puts its heading underneath the bar. Doing the
    // arithmetic here keeps that number in one place instead of splitting it
    // between this call and a `scroll-margin-top` that has to be kept in sync.
    const OFFSET = 96; // clears the fixed nav; mirrors scrollMarginTop below.
    const top = el.getBoundingClientRect().top + window.scrollY - OFFSET;

    // Honour a reduced-motion preference rather than animating regardless: a
    // 5,000px smooth scroll is exactly the kind of movement that setting exists
    // to stop.
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });

    setFlashed(sectionId);
    window.setTimeout(() => setFlashed((c) => (c === sectionId ? null : c)), 1600);
  }, []);

  return (
    <>
      {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 flex-wrap"
        style={{ fontSize: 11.5, fontWeight: 600, color: MUTED }}
      >
        <Link href="/guides" style={{ color: MUTED, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}>
          <ArrowLeft size={12} /> Guides
        </Link>
        <ChevronRight size={11} style={{ opacity: 0.5 }} />
        <span style={{ color: INK }}>{guide.templateName}</span>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <header className="mt-5">
        <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.26em", textTransform: "uppercase", color: GOLD, margin: 0 }}>
          {guide.emoji} Product guide
        </p>
        <h1
          className="mt-3"
          style={{
            fontFamily: "'Playfair Display', serif", fontWeight: 700,
            fontSize: "clamp(32px, 5vw, 56px)", lineHeight: 1.03,
            letterSpacing: "-0.03em", color: INK, margin: 0,
          }}
        >
          {guide.title}
        </h1>

        {/* ── Video ──────────────────────────────────────────────────────────
         *
         * Directly under the H1, before the summary and buttons. Search Console
         * reported every guide as "Video isn't on a watch page": with the player
         * below the hero it started under the fold, so Google read the page as
         * an article that happens to contain a video. On a watch page the video
         * is the first large thing on screen, and the VideoObject in page.tsx
         * (same name as the H1, contentUrl = this mp4) then has a page that
         * matches it. */}
        {guide.video && (
          <section className="mt-6 md:mt-7" aria-label={`Video: ${guide.title}`}>
            <GuideVideoPlayer
              slug={guide.slug}
              video={guide.video}
              sources={media}
              title={guide.title}
              onReadSection={jumpToSection}
            />
            <p className="mt-3.5" style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.6 }}>
              {guide.video.silent && "This recording has no voiceover — every action is labelled on screen as it happens. "}
              Click a chapter to jump the video there. To read that step instead, use the
              ↓ beside it — the written walkthrough is below.
            </p>

            {/* ── The same recording, elsewhere ──────────────────────────────
             *
             * The player above is our own mp4 and stays the primary — it is the
             * one with the chapter rail wired to the written steps, and it is what
             * the VideoObject's `contentUrl` points at, so it has to be the thing
             * on the page. These are for people who would rather watch where they
             * already are, and for the ones who want to send the video on: a
             * YouTube or Instagram link travels through a chat far better than a
             * link to an article that happens to contain a video.
             *
             * Rendered only when the recording was actually posted to each place,
             * so a guide with no social copies shows nothing rather than a dead
             * row of icons. */}
            {(youtubeUrl || instagramUrl) && (
              <div className="mt-4 flex flex-wrap items-center gap-2.5">
                <span
                  style={{
                    fontSize: 10.5, fontWeight: 800, letterSpacing: "0.16em",
                    textTransform: "uppercase", color: MUTED,
                  }}
                >
                  Also on
                </span>
                {youtubeUrl && (
                  <a
                    href={youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={SOCIAL_PILL}
                  >
                    <Youtube size={14} /> YouTube
                    <ExternalLink size={11} style={{ opacity: 0.55 }} />
                  </a>
                )}
                {instagramUrl && (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={SOCIAL_PILL}
                  >
                    <Instagram size={14} /> Instagram
                    <ExternalLink size={11} style={{ opacity: 0.55 }} />
                  </a>
                )}
              </div>
            )}
          </section>
        )}

        <p className="mt-6 max-w-2xl" style={{ fontSize: "clamp(15px,1.5vw,17px)", lineHeight: 1.65, color: MUTED }}>
          {guide.summary}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2.5">
          {guide.video && <Chip icon={<Play size={12} fill="currentColor" strokeWidth={0} />} label={`${formatDuration(guide.video.seconds)} video`} />}
          <Chip icon={<ListChecks size={12} />} label={`${steps} written steps`} />
          <Chip icon={<Clock size={12} />} label={guide.buildTime} />
          <Chip
            icon={<CalendarCheck size={12} />}
            label={`Checked ${new Date(guide.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`}
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-2.5">
          <Link
            href={guide.templateHref}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "12px 22px", borderRadius: 999, textDecoration: "none",
              background: `linear-gradient(180deg,${MAROON},${INK})`,
              color: "#f5ede6", border: `1px solid ${GOLD}`,
              fontSize: 12.5, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase",
              boxShadow: "0 8px 22px rgba(61,12,17,0.24)",
            }}
          >
            <Sparkles size={14} /> Open the template
          </Link>
          <a
            href="#steps"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "12px 22px", borderRadius: 999, textDecoration: "none",
              background: "rgba(255,255,255,0.8)", color: INK,
              border: "1px solid rgba(61,12,17,0.16)",
              fontSize: 12.5, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase",
            }}
          >
            <FileText size={14} /> Read the steps
          </a>
        </div>
      </header>

      {/* ── Steps ──────────────────────────────────────────────────────────── */}
      <section id="steps" className="mt-12 md:mt-16" aria-labelledby="steps-heading">
        <SectionLabel
          id="steps-heading"
          kicker="Step by step"
          title="The written walkthrough"
          sub="Everything the video covers, in a form you can search, scan and keep open in another tab."
        />

        <div className="mt-7 space-y-9 md:space-y-12">
          {guide.sections.map((section, si) => {
            const isFlashed = flashed === section.id;
            return (
              <section
                key={section.id}
                id={section.id}
                ref={(el) => { sectionRefs.current[section.id] = el; }}
                style={{ scrollMarginTop: 96 }}
              >
                <motion.div
                  animate={isFlashed ? { backgroundColor: "rgba(201,168,76,0.16)" } : { backgroundColor: "rgba(201,168,76,0)" }}
                  transition={{ duration: 0.5 }}
                  style={{ borderRadius: 18, padding: "10px 12px", margin: "-10px -12px" }}
                >
                  <div className="flex items-baseline gap-3">
                    <span
                      style={{
                        fontFamily: "'Playfair Display', serif", fontWeight: 700,
                        fontSize: 15, color: GOLD, fontVariantNumeric: "tabular-nums",
                        flexShrink: 0,
                      }}
                    >
                      {String(si + 1).padStart(2, "0")}
                    </span>
                    <h3
                      style={{
                        fontFamily: "'Playfair Display', serif", fontWeight: 700,
                        fontSize: "clamp(23px,2.6vw,30px)", lineHeight: 1.12,
                        letterSpacing: "-0.02em", color: INK, margin: 0,
                      }}
                    >
                      {section.title}
                    </h3>
                  </div>
                  {section.intro && (
                    <p className="mt-2.5" style={{ fontSize: 14.5, lineHeight: 1.66, color: MUTED, paddingLeft: 30 }}>
                      {section.intro}
                    </p>
                  )}
                </motion.div>

                <div className="mt-5 space-y-5 md:space-y-6" style={{ paddingLeft: 0 }}>
                  {section.steps.map((step, i) => (
                    <article
                      key={step.title}
                      className="overflow-hidden rounded-2xl md:rounded-3xl"
                      style={{
                        border: "1px solid rgba(61,12,17,0.13)",
                        background: "rgba(255,255,255,0.84)",
                      }}
                    >
                      <div className="p-5 md:p-6">
                        <p style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: GOLD, margin: 0 }}>
                          Step {si + 1}.{i + 1}
                        </p>
                        <h4 className="mt-2" style={{ fontSize: "clamp(16px,1.7vw,19px)", fontWeight: 700, color: INK, margin: 0, lineHeight: 1.3 }}>
                          {step.title}
                        </h4>
                        <p className="mt-2.5" style={{ fontSize: 14.5, lineHeight: 1.68, color: MUTED, margin: 0 }}>
                          {step.body}
                        </p>

                        {step.note && (
                          <div
                            className="mt-4 flex gap-2.5 rounded-2xl p-3.5"
                            style={{ background: "rgba(201,168,76,0.12)", border: `1px solid ${GOLD}44` }}
                          >
                            <Lightbulb size={15} style={{ color: GOLD, flexShrink: 0, marginTop: 2 }} />
                            <p style={{ fontSize: 13.2, lineHeight: 1.62, color: "#5c3b3b", margin: 0 }}>
                              {step.note}
                            </p>
                          </div>
                        )}
                      </div>

                      {step.shot && (
                        <figure
                          style={{
                            margin: 0,
                            borderTop: "1px solid rgba(61,12,17,0.10)",
                            background: "#efe7de",
                            // Reserve the space before the image arrives. Every
                            // capture is 1449x840; stating the ratio means the
                            // figure occupies its final height from first paint.
                            aspectRatio: "1449 / 840",
                          }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={guideMedia(guide.slug, step.shot)}
                            alt={step.shotAlt ?? step.title}
                            loading="lazy"
                            width={1449}
                            height={840}
                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                          />
                        </figure>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <section className="mt-12 md:mt-16">
        <div
          className="rounded-3xl p-7 md:p-10 text-center"
          style={{
            background: `linear-gradient(150deg,${MAROON},${INK})`,
            border: `1px solid ${GOLD}66`,
            boxShadow: "0 18px 44px rgba(61,12,17,0.24)",
          }}
        >
          <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.26em", textTransform: "uppercase", color: GOLD, margin: 0 }}>
            Your turn
          </p>
          <h2
            className="mt-3"
            style={{
              fontFamily: "'Playfair Display', serif", fontWeight: 700,
              fontSize: "clamp(26px,3.4vw,38px)", lineHeight: 1.1,
              color: "#f5ede6", margin: 0, letterSpacing: "-0.02em",
            }}
          >
            {guide.buildTime}, and it is done.
          </h2>
          <p className="mt-3 mx-auto" style={{ maxWidth: 480, fontSize: 14.5, lineHeight: 1.66, color: "rgba(245,237,230,0.78)" }}>
            You do not need an account to start — you are asked to sign in once, at the moment you publish.
          </p>
          <Link
            href={guide.templateHref}
            className="mt-6 inline-flex items-center gap-2"
            style={{
              padding: "13px 26px", borderRadius: 999, textDecoration: "none",
              background: GOLD, color: INK, border: "none",
              fontSize: 12.5, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase",
            }}
          >
            Open {guide.templateName.split("—")[0].trim()} <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────────────── */}
      {guide.faqs.length > 0 && (
        <section className="mt-12 md:mt-16" aria-labelledby="faq-heading">
          <SectionLabel id="faq-heading" kicker="Questions" title="What people ask about this one" />
          <div className="mt-6 space-y-3">
            {guide.faqs.map((f) => (
              <details
                key={f.q}
                className="group rounded-2xl overflow-hidden"
                style={{ border: "1px solid rgba(61,12,17,0.13)", background: "rgba(255,255,255,0.82)" }}
              >
                <summary
                  className="cursor-pointer list-none p-5 flex items-start justify-between gap-4"
                  style={{ fontSize: 15.5, fontWeight: 700, color: INK, lineHeight: 1.4 }}
                >
                  {f.q}
                  <ChevronRight
                    size={17}
                    className="transition-transform duration-300 group-open:rotate-90"
                    style={{ color: GOLD, flexShrink: 0, marginTop: 2 }}
                  />
                </summary>
                <p style={{ fontSize: 14.5, lineHeight: 1.68, color: MUTED, margin: 0, padding: "0 20px 20px" }}>
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* ── Related guides ─────────────────────────────────────────────────── */}
      {relatedGuides.length > 0 && (
        <section className="mt-12 md:mt-16" aria-labelledby="more-guides">
          <SectionLabel id="more-guides" kicker="Keep going" title="Other guides" />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedGuides.map((g) => (
              <Link
                key={g.slug}
                href={`/guides/${g.slug}`}
                className="group rounded-2xl p-5 block transition-transform duration-300 hover:-translate-y-1"
                style={{
                  border: "1px solid rgba(61,12,17,0.13)",
                  background: "rgba(255,255,255,0.84)", textDecoration: "none",
                }}
              >
                <p style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: GOLD, margin: 0 }}>
                  {g.emoji} {g.video ? `${formatDuration(g.video.seconds)} video` : "Written guide"}
                </p>
                <h3 className="mt-2" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 19, lineHeight: 1.18, color: INK, margin: 0 }}>
                  {g.title}
                </h3>
                <span className="mt-3 inline-flex items-center gap-1.5" style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: MAROON }}>
                  Open <ArrowRight size={12} className="transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Related reading ────────────────────────────────────────────────── */}
      {relatedArticles.length > 0 && (
        <section className="mt-12 md:mt-16" aria-labelledby="more-reading">
          <SectionLabel
            id="more-reading"
            kicker="From the blog"
            title="Related reading"
            sub="Written around the same occasion, if you want the words before the build."
          />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedArticles.map((a) => {
              const cover = articleCover(a);
              return (
                <Link
                  key={a.slug}
                  href={`/blog/${a.slug}`}
                  className="group rounded-2xl overflow-hidden block transition-transform duration-300 hover:-translate-y-1"
                  style={{
                    border: "1px solid rgba(61,12,17,0.13)",
                    background: "rgba(255,255,255,0.84)", textDecoration: "none",
                  }}
                >
                  {cover && (
                    <div style={{ aspectRatio: "16 / 9", overflow: "hidden", background: "#efe4d8" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={cover}
                        alt=""
                        aria-hidden
                        loading="lazy"
                        className="transition-transform duration-500 group-hover:scale-105"
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <p style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: GOLD, margin: 0, display: "inline-flex", alignItems: "center", gap: 5 }}>
                      <BookOpen size={11} /> {a.category?.name ?? "Blog"}
                    </p>
                    <h3 className="mt-2" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 18, lineHeight: 1.2, color: INK, margin: 0 }}>
                      {a.title}
                    </h3>
                    {a.excerpt && (
                      <p className="mt-2" style={{ fontSize: 13, lineHeight: 1.6, color: MUTED, margin: 0 }}>
                        {a.excerpt.length > 110 ? `${a.excerpt.slice(0, 110).trimEnd()}…` : a.excerpt}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
}

function SectionLabel({ id, kicker, title, sub }: { id?: string; kicker: string; title: string; sub?: string }) {
  return (
    <div>
      <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.26em", textTransform: "uppercase", color: GOLD, margin: 0 }}>
        {kicker}
      </p>
      <h2
        id={id}
        className="mt-2.5"
        style={{
          fontFamily: "'Playfair Display', serif", fontWeight: 700,
          fontSize: "clamp(26px,3.2vw,36px)", lineHeight: 1.08,
          letterSpacing: "-0.025em", color: INK, margin: 0,
        }}
      >
        {title}
      </h2>
      {sub && (
        <p className="mt-2.5 max-w-2xl" style={{ fontSize: 14.5, lineHeight: 1.65, color: MUTED }}>
          {sub}
        </p>
      )}
    </div>
  );
}

function Chip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: MUTED }}>
      <span style={{ color: GOLD, display: "inline-flex" }}>{icon}</span>
      {label}
    </span>
  );
}
