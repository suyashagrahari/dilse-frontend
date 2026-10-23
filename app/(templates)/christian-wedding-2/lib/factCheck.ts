// ─── After an AI fill: keep only what the sender actually told us ───────────
//
// Tested against the live model (2026-10-23): with a thin description ("Anita
// and Rohan are getting married in Shillong in March") it sometimes still
// invents a cathedral's name, a personality line for the bride, a "how they
// met" chapter made out of the wedding itself, or signs the page "the Anita &
// Rohan families". Guides alone did not make that rare enough, so every fill is
// checked against the text that was sent:
//   - a venue with a name the text never mentions falls back to its city;
//   - a one-line portrait or a story chapter needs a concrete word of the text;
//   - "the X & Y families" needs X and Y in the parents' names;
//   - a midnight start needs the text to say so.
// What is dropped shows up as an empty field in the review screen.
//
// One-shot: it checks the fill that follows `setFillSource` and then forgets
// the text, so the sender's own edits in the review screen (which reach the
// form through the same onFilled) are never second-guessed.

import type { Cw2Data } from "./model";

let source = "";

/** The exact description the next fill is generated from (the guided answers or the sender's own words). */
export function setFillSource(text: string) {
  source = text;
}
/** The pending source, consumed: the next call gets "". */
export function takeFillSource() {
  const s = source;
  source = "";
  return s;
}

// Words that say nothing a sender has to have told us.
const GENERIC = new Set(
  (
    "about after again also always among around beautiful beloved blessed blessing blessings bright brings bride bridal caring cathedral celebrate celebration chapel cherished church " +
    "dedicated deep deeply delightful every everyone faith faithful family families filled forever friend friends from gentle god's grace great groom happy heart hearts holy home hope " +
    "joyful joyous journey kind kindness known laugh laughter life lifetime light love loved loves loving matrimony moment never others passion passionate person place prayer prayers " +
    "really reception sacred service share shared shares smile someone special spirit strong their there these they this together truly union warm warmth wedding where which while whose " +
    "with wonderful world years young"
  ).split(" "),
);

const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "");
const words = (s: string) =>
  norm(s)
    .replace(/'s\b/g, "")
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 4);

/** Does the text contain this word (or a word sharing its first five letters: intern/interns, bake/baking)? */
function told(src: string, w: string) {
  if (src.includes(w)) return true;
  return w.length >= 6 && src.includes(w.slice(0, 5));
}

/** At least one concrete, non-generic word of `line` (names excluded) comes from the text. */
function grounded(line: string, src: string, names: string[]) {
  const skip = new Set(names.map(norm));
  return words(line).some((w) => !GENERIC.has(w) && !skip.has(w) && told(src, w));
}

const MARRYING = /getting married|get married|are marrying|will marry|tying the knot|their wedding|wedding in /i;

export function factCheck(n: Cw2Data, raw: string): Cw2Data {
  if (!raw.trim()) return n;
  const src = norm(raw);
  const names = [n.brideName, n.groomName].map((x) => x.trim()).filter(Boolean);
  // Places are told once and then echoed everywhere: a portrait or a chapter must rest on something else.
  const placeWords = n.events.flatMap((e) => words(`${e.venue} ${e.address}`));
  const next: Cw2Data = { ...n };

  {
    // Venues: every distinctive word must be the sender's; otherwise keep the told city (or nothing).
    next.events = n.events.map((e) => {
      if (!e.venue) return e;
      const bad = words(e.venue).some((w) => !GENERIC.has(w) && !told(src, w));
      if (!bad) return e;
      const city = e.venue
        .split(",")
        .map((p) => p.trim())
        .reverse()
        .find((p) => p && words(p).every((w) => told(src, w)));
      return { ...e, venue: city ?? "" };
    });
    const notThese = [...names, ...placeWords];
    if (n.bride.description && !grounded(n.bride.description, src, notThese)) next.bride = { ...n.bride, description: "" };
    if (n.groom.description && !grounded(n.groom.description, src, notThese)) next.groom = { ...n.groom, description: "" };
    next.story = n.story.filter((c) => {
      const text = `${c.title} ${c.line}`;
      if (!c.title && !c.line) return false;
      if (MARRYING.test(text) && !/\bmet\b|propos|asked|first/i.test(text)) return false;
      return grounded(text, src, notThese);
    });
  }

  // A start time of midnight is the model filling a blank.
  if (!/midnight|12\s*a\.?m|00:00/.test(src)) next.events = next.events.map((e) => (e.time === "00:00" ? { ...e, time: "" } : e));

  // The signature: "the X & Y families" only with surnames from the parents' names.
  const closing = n.closing.trim().replace(/\.$/, "");
  const fam = closing.match(/the\s+(.+?)\s*&\s*(.+?)\s+famil(?:y|ies)/i);
  const parents = norm(`${n.brideFamily.parents} ${n.groomFamily.parents}`);
  const couple = names.length === 2 ? `With love and prayers, ${names[0]} & ${names[1]}` : "";
  if (fam && (!parents.includes(norm(fam[1])) || !parents.includes(norm(fam[2])) || names.some((x) => norm(x) === norm(fam[1]) || norm(x) === norm(fam[2])))) {
    next.closing = couple;
  } else {
    next.closing = closing;
  }
  return next;
}
