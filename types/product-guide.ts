/**
 * The shape of a product guide.
 *
 * A guide is the answer to "how do I actually use this template?", and it
 * answers it twice over — once as a screen recording for someone who would
 * rather watch, once as a written walkthrough for someone who is mid-build with
 * the form open in another tab and needs to find one specific step.
 *
 * Those two are not alternatives to each other and the page does not make the
 * reader choose. The video carries the *feel* of the flow, which prose cannot;
 * the docs carry the *detail* — exact field names, what a setting does, what
 * happens if you skip it — which a video cannot, because you cannot scan or
 * search a video, and you cannot copy a value out of one. Every guide that has
 * a video also has docs, and the chapters below are what stitches them: each
 * chapter marker is a timestamp AND a link into the written section covering
 * the same ground, so a viewer who pauses at 00:36 wondering what a "lifafa" is
 * can land on the paragraph that says so.
 */

/** A marker in the video's timeline, mirrored by a written section. */
export interface GuideChapter {
  /** Seconds from the start. Drives both the label and the seek. */
  at: number;
  label: string;
  /**
   * `id` of the {@link GuideSection} covering the same ground, when there is
   * one. Optional because intro/outro markers have no written counterpart.
   */
  sectionId?: string;
}

/** One numbered instruction inside a section. */
export interface GuideStep {
  title: string;
  /** One or two sentences. Written to be read standing up, not studied. */
  body: string;
  /**
   * Screenshot filename inside the guide's media folder, e.g. "step-03.webp".
   * Resolved through `guideMedia(slug, file)` at render time so the origin can
   * move without touching this file. Optional — plenty of steps are clearer as
   * a sentence than as another near-identical picture of a form.
   */
  shot?: string;
  /** Alt text for the screenshot. Required whenever `shot` is set. */
  shotAlt?: string;
  /** Optional aside: a gotcha, a shortcut, or the reason behind the step. */
  note?: string;
}

/** A titled group of steps. One section ≈ one chapter of the video. */
export interface GuideSection {
  /** Stable anchor. Appears in the URL as #id and in `GuideChapter.sectionId`. */
  id: string;
  title: string;
  /** Optional one-line framing shown under the section title. */
  intro?: string;
  steps: GuideStep[];
}

/** The video half of a guide. */
export interface GuideVideo {
  /** Total runtime in seconds — feeds the UI label and the VideoObject schema. */
  seconds: number;
  /** ISO date the recording was made. Surfaces as "Recorded <date>". */
  recordedAt: string;
  chapters: GuideChapter[];
  /**
   * True when the recording carries no audio track. The player uses this to
   * hide its mute control and to show a "silent — captions in the docs below"
   * hint, rather than leaving someone hunting for sound that was never there.
   */
  silent?: boolean;
}

export interface GuideFaq {
  q: string;
  a: string;
}

export interface ProductGuide {
  /**
   * Doubles as the URL segment (`/guides/<slug>`) and the S3 media folder.
   * Where a guide documents exactly one template, this equals the template's
   * own slug — so the guide route, the template route and the object keys all
   * agree without a translation table anywhere.
   */
  slug: string;

  /** The template this guide documents, as a site path, e.g. "/holi". */
  templateHref: string;
  /** Human name of that template, for the "Open the template" button. */
  templateName: string;

  title: string;
  /** Short line under the title on the card and the hero. */
  tagline: string;
  /**
   * Two or three sentences. Used as the meta description and the card body, so
   * it has to stand alone away from the page.
   */
  summary: string;

  /** Tab bucket on the hub. Must match an id in `GUIDE_CATEGORIES`. */
  category: string;
  emoji: string;
  /** Accent colour for the card's rule and chips. A hex string. */
  accent: string;

  /** Roughly how long the whole build takes, e.g. "About 5 minutes". */
  buildTime: string;
  /** ISO date this guide's content was last verified against the live flow. */
  updatedAt: string;

  /** Absent for docs-only guides. The hub's Videos tab filters on this. */
  video?: GuideVideo;

  sections: GuideSection[];
  faqs: GuideFaq[];

  /**
   * Blog post slugs to surface at the foot of the guide. Resolved against
   * Strapi at request time and silently dropped if a slug no longer publishes,
   * so an unpublished post degrades to one fewer card rather than a broken
   * link. See `lib/guides.ts`.
   */
  relatedBlogSlugs: string[];

  /** Other guides worth reading next, by slug. */
  relatedGuideSlugs: string[];
}
