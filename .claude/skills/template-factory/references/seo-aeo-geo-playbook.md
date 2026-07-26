# SEO / AEO / GEO Playbook (Stage 7)

Make the template discoverable by search engines (SEO), answer engines (AEO), and
generative/AI engines (GEO). Output `06-seo.md`. Target Lighthouse SEO = 100 and
Agentic Browsing passing.

## SEO — technical
- **Per-route `metadata`** in the template's `layout.tsx` (server): unique `title`
  (~50–60 chars, occasion + benefit + brand), `description` (~140–160 chars, with the
  emotional hook + CTA), `alternates.canonical`, `keywords`. Reuse `buildMeta`/`SITE_URL`
  from `@/lib/seo` where present.
- **Open Graph + Twitter:** `openGraph` (title, description, url, type, a 1200×630
  `og-image`) and `twitter` (`summary_large_image`). This is what shows in WhatsApp/
  social when the link is shared — critical for virality.
- **Structured data (JSON-LD):** add the right schema (e.g. `WebPage`/`Event`/
  `CreativeWork`/`Product` as fits) via a JsonLd component like `@/components/JsonLd`.
  Validate it's well-formed.
- **Semantic HTML:** one `<h1>`, logical `<h2>/<h3>`, landmark elements, descriptive
  `alt` text, real links (not click-only divs).
- **Sitemap + robots:** ensure the new route is in the sitemap and crawlable.
- **Perf = ranking:** the Stage 5 work (CWV: LCP, CLS, INP) also feeds SEO.

## AEO — answer-engine optimization
- Phrase key headings as the **questions people ask** ("How do I make a Diwali wish
  page?") and answer them concisely right under the heading (answerable in 1–2
  sentences). Add an FAQ section with `FAQPage` JSON-LD.
- Front-load the direct answer; keep copy scannable (short paragraphs, lists).

## GEO — generative-engine optimization (AI agents / LLMs)
- Ensure the site's **`llms.txt`** describes the template so AI agents can find/use it
  (the landing already passes an `llms.txt` Agentic Browsing check — extend it).
- Keep the **accessibility tree well-formed** (labels, roles, headings) — Agentic
  Browsing scores this. Clean semantics = machine-readable.
- Provide clear, factual, self-contained copy (names, dates, what the page does) so
  models can summarize it correctly; avoid burying meaning in images only.
- Stable, descriptive URLs and metadata; no cloaking.

## Definition of done
`06-seo.md` lists: final title/description, OG image path, the JSON-LD type added,
sitemap entry, FAQ/answer headings, and llms.txt update — plus a Lighthouse SEO=100
and Agentic Browsing 3/3 confirmation.
