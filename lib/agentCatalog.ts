import { SITE_NAME, SITE_URL, SITE_DESCRIPTION, TEMPLATE_SEO } from "@/lib/seo";

// ── Agentic Resource Discovery (ARD) manifest ────────────────────────────────
//
// Served at /.well-known/ai-catalog.json (the path Lighthouse's "Agentic
// Browsing" category fetches) and /.well-known/ard.json (the path ARD v0.91
// moved to). Before this existed, both paths fell through to the [id]/[shareId]
// catch-all and answered 200 with an HTML page, which Lighthouse reported as
// "Malformed JSON in manifest: Unexpected token '<'" — the one failing audit
// that held the category at 3/4.
//
// Lighthouse validates this against ARD's ai-catalog.schema.json, which is
// `additionalProperties: false` at the root, on `host`, and on the trust
// objects. An extra key anywhere in those objects is a hard schema error and
// scores 0, so do not add fields that are not in that schema. Two further
// rules decide between a full pass and 0.9 ("Low" severity warnings):
//   • every entry's `type` must be one of ARD's standard discovery media types;
//   • every entry needs 2–5 `representativeQueries`.
// Schema: https://github.com/ards-project/ard-spec/blob/main/spec/schemas/ai-catalog.schema.json

// hostname, not host: a port (local dev) is not valid in a did:web identifier.
const host = new URL(SITE_URL).hostname;

export const AGENT_SKILL_PATH = "/agent-skills/create-celebration-page.md";

export function buildAgentCatalog() {
  return {
    specVersion: "1.0",
    host: {
      displayName: SITE_NAME,
      identifier: `did:web:${host}`,
      documentationUrl: `${SITE_URL}/llms.txt`,
      logoUrl: `${SITE_URL}/icons/icon-512.png`,
    },
    entries: [
      {
        identifier: `urn:air:${host}:skills:create-celebration-page`,
        displayName: `Create a ${SITE_NAME} celebration page`,
        type: 'text/markdown; profile="urn:air:agent-skills"',
        url: `${SITE_URL}${AGENT_SKILL_PATH}`,
        description:
          `How an agent can help a person pick a ${SITE_NAME} template and create, ` +
          `publish and share a personalised celebration page (birthdays, weddings, ` +
          `anniversaries, Indian festivals).`,
        tags: ["greetings", "celebration", "invitation", "birthday", "wedding", "festival"],
        representativeQueries: [
          "make a birthday wish page with photos and music",
          "create a digital wedding invitation link",
          "send a personalised Diwali or Holi greeting page",
          "build a shareable anniversary surprise page",
        ],
        version: "1.0.0",
      },
    ],
  };
}

/** Markdown agent skill describing the create → publish → share flow. */
export function buildAgentSkill(): string {
  const clean = (s?: string | null) => (s || "").replace(/\s+/g, " ").trim();
  const lines: string[] = [
    "---",
    "name: create-celebration-page",
    `description: Help a person create, publish and share a personalised ${SITE_NAME} celebration page.`,
    "---",
    "",
    `# Create a ${SITE_NAME} celebration page`,
    "",
    `> ${SITE_DESCRIPTION}`,
    "",
    "## When to use",
    "The person wants a shareable greeting, wish or invitation page — for a birthday, " +
      "anniversary, wedding, Valentine's Day, or an Indian festival such as Diwali, Holi or Eid.",
    "",
    "## Steps",
    `1. Open ${SITE_URL}/templates and choose the template that fits the occasion (full list below).`,
    "2. On the template page, preview it, then press **Create** to open the editor.",
    "3. Fill in the form: names, message, photos, music and dates. Drafts are kept in the browser " +
      "tab, so the page can be revisited before publishing.",
    "4. Press **Save** to see the finished preview.",
    "5. Press **Publish**. Publishing requires the person to sign in with Google — hand this step " +
      "to them; never enter credentials on their behalf. Some templates ask for a one-time payment " +
      "at this point; always let the person confirm any payment themselves.",
    "6. After publishing, share the link the site gives (it can be password-protected). " +
      "Recipients open it without an account.",
    "",
    "## Templates",
  ];
  for (const [slug, t] of Object.entries(TEMPLATE_SEO)) {
    lines.push(`- [${clean(t.title)}](${SITE_URL}/${slug}): ${clean(t.description)}`);
  }
  lines.push(
    "",
    "## More",
    `- Site map for LLMs: ${SITE_URL}/llms.txt`,
    `- Step-by-step product guides: ${SITE_URL}/guides`,
    `- Sitemap: ${SITE_URL}/sitemap.xml`,
    "",
  );
  return lines.join("\n");
}
