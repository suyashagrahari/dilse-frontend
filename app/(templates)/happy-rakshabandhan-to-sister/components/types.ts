import { DEMO_MEDIA } from "../assets";

// ─── The data model, and the one thing that makes this template not a recolour ─
//
// The brother template (`happy-rakshabandhan-to-brother`) is built BY a sister.
// She designs the rakhi, and her brother — the reader — performs the puja on his
// phone: tilak, mithai, aarti, the thread, and then he writes his promise back.
//
// This template runs the other way, and the inversion is not cosmetic. On Raksha
// Bandhan the SISTER is the one who ties the thread; the brother's side of the
// ritual is the vow and the shagun. So when a brother builds this page, the
// interactive act it hands his sister is the act that is actually hers:
//
//     he writes the vow  →  she ties the rakhi  →  she opens the lifafa
//
// Everything below follows from that. `vow` and `lifafa` are his, authored in the
// form. `reply` and `rakhiPicked` are hers, written once from the published page
// and never editable from the builder. Confusing the two would either let him
// speak for her or let her overwrite him.

export type RakhiStyle = "phool" | "chandan" | "nazar" | "moti" | "kalava";

/**
 * The five rakhis she can choose from before she ties one.
 *
 * ── WHY SHE PICKS AND HE DOES NOT ────────────────────────────────────────────
 *
 * The brother template has the sister design the rakhi in the form, because there
 * she is the one who will tie it and a rakhi is chosen by whoever brings it. That
 * logic is what makes this the opposite: a brother choosing the rakhi his sister
 * will tie on him has the ritual backwards, and it also spends one of his form
 * fields on the single decision the reader would most enjoy making.
 *
 * So the choice moved to the published page. It is stored back with her reply, so
 * he finds out which one she picked — which is the same thing that happens when
 * she opens her bag on the day.
 */
export const RAKHI_STYLES: readonly {
  id: RakhiStyle;
  name: string;
  hindi: string;
  /** What she is choosing, in her words, not a colour swatch. */
  note: string;
  threadA: string;
  threadB: string;
  bead: string;
  glyph: string;
}[] = [
  {
    id: "phool",
    name: "Phool",
    hindi: "फूल",
    note: "marigold, the one from every photo",
    threadA: "#E8A33A",
    threadB: "#C2410C",
    bead: "#B08D57",
    glyph: "✿",
  },
  {
    id: "chandan",
    name: "Chandan",
    hindi: "चंदन",
    note: "sandalwood, the quiet one",
    threadA: "#C9A227",
    threadB: "#8C6B3F",
    bead: "#D9C194",
    glyph: "☙",
  },
  {
    id: "nazar",
    name: "Nazar",
    hindi: "नज़र",
    note: "evil eye, because you need it",
    threadA: "#1E4F8A",
    threadB: "#17564F",
    bead: "#E8A33A",
    glyph: "🧿",
  },
  {
    id: "moti",
    name: "Moti",
    hindi: "मोती",
    note: "pearls, slightly too fancy for you",
    threadA: "#A62A5C",
    threadB: "#6D1F45",
    bead: "#F2E4CF",
    glyph: "◉",
  },
  {
    id: "kalava",
    name: "Kalava",
    hindi: "कलावा",
    note: "plain red thread, like Dadi ties",
    threadA: "#9B2226",
    threadB: "#E8A33A",
    bead: "#B08D57",
    glyph: "ॐ",
  },
];

export const rakhiStyle = (id: string) =>
  RAKHI_STYLES.find((r) => r.id === id) ?? RAKHI_STYLES[0];

export interface Memory {
  imageUrl: string;
  caption: string;
  year: string;
}

/** One line of the statement. A label and the figure it stands at. */
export interface AccountRow {
  label: string;
  value: string;
}

/**
 * The statement of account — the funniest screen and, by the end of it, the one
 * that does the most work.
 *
 * ── WHY A LEDGER AND NOT A LIST OF COMPLAINTS ────────────────────────────────
 *
 * The first version of this screen was a "complaint register": four grievances he
 * formally drops. It was funny and it went nowhere, because a complaint register
 * is a joke that resolves into nothing and then asks her for her attention again
 * on the next screen.
 *
 * A statement has two sides, and that is the whole device. `sheOwes` is petty and
 * itemised and true — the hoodie, the tattling, the charger. `heOwes` is what she
 * actually did for him, itemised in the same deadpan register, and it does not
 * fit on the same scale. The joke sets up its own reversal: by the third line of
 * the right-hand column nobody is laughing, and the balance is unpayable.
 *
 * It also earns the screen that follows. The shagun stops being "here is some
 * money" and becomes part payment against a debt the page has just spent thirty
 * seconds establishing he can never clear — which is, as it happens, exactly what
 * shagun is.
 *
 * The asymmetry is deliberate and must not be "balanced" in a later edit: two
 * lines on her side, three on his. Equal columns read as a scorecard, and a
 * scorecard is the one reading of this screen that would be unkind.
 */
export interface Account {
  /** Petty, itemised, hers to answer for. Two lines. */
  sheOwes: AccountRow[];
  /** What she actually did. Same deadpan register, no punchlines. Three lines. */
  heOwes: AccountRow[];
}

/**
 * The shagun envelope.
 *
 * `amount` is a string and not a number on purpose: what a brother writes here is
 * "501", "1100", "5001" — the auspicious shagun figures, which all end in 1 — and
 * some write "जितना chahiye". Parsing that to a number would either reject it or
 * silently drop the 1.
 *
 * ── THERE IS NO UPI ID AND NO QR HERE, AND THAT IS THE WHOLE POINT ───────────
 *
 * The brother template has both, correctly: there a SISTER builds the page and
 * asks for shagun, so the payee is the builder, the QR encodes her, and her
 * brother scans it to pay her. The rail points the same way as the money.
 *
 * Invert the template and that stops being true. Here the money flows FROM the
 * builder TO the reader. A UPI QR and a `upi://pay` link both encode a PAYEE and
 * both open the *scanner's* app to *pay*, so putting his handle on her screen
 * builds a rail that runs backwards: it asks the sister to pay her brother on the
 * day he is supposed to be giving her money. The first draft of this template did
 * exactly that, with the form labelled "Your UPI ID — so she can take it in one
 * tap", which is not a thing that handle can do.
 *
 * The obvious repair — he enters HER handle — is worse. It publishes her bank
 * identifier on a page built to be forwarded, and it still hands her nothing to
 * scan, because a payee does not scan anything to be paid.
 *
 * And the shape is dangerous on this specific festival. Raksha Bandhan is peak
 * UPI-scam season, and "a forwarded page showing a QR code and a payment link" is
 * precisely the scam. A careful label does not fix a page that is the same shape
 * as the fraud; the fix is to not have the shape.
 *
 * So the giving direction needs no payment rail at all. The envelope states the
 * figure and his line, and the transfer happens in his own banking app, which is
 * where it was always going to happen. The asymmetry between the two templates is
 * real and correct: the one that ASKS needs a rail, the one that GIVES does not.
 */
export interface Lifafa {
  amount: string;
  note: string;
}

export interface SisterData {
  /** Hers. The page is addressed to this. */
  sisterName: string;
  /** His. Signs the vow. */
  brotherName: string;
  /**
   * Is she the elder one?
   *
   * ── WHY A WHOLE FIELD FOR THIS ───────────────────────────────────────────
   *
   * Because it changes what the template calls her, and there is no neutral
   * option in the languages this page is written in. An elder sister is "Didi" and
   * a younger one is "Behna" — and calling a 34-year-old elder sister "behna", or
   * addressing a younger sister as "didi", is not a small mistranslation. It is
   * the tell that a page was generated rather than written.
   *
   * It is deliberately NOT AI-filled. The model would have to infer birth order
   * from a paragraph that usually does not state it, and a wrong guess here is
   * visible in the largest text on the screen.
   */
  sisterIsElder: boolean;
  /** Square, cropped in the builder. Cover and story card. */
  photoUrl: string;
  /** His opening lines. One at a time on the cover. */
  greeting: string[];
  /**
   * The vow. What "Raksha" in Raksha Bandhan actually refers to, and the reason
   * the certificate screen exists — a brother's side of this festival is a
   * promise, so the promise is the artefact she keeps and can download.
   */
  vow: string[];
  /** "since 1998", "since the day they brought you home". Printed on the seal. */
  vowSince: string;
  lifafa: Lifafa;
  /**
   * The statement of account — the teasing half, and load-bearing.
   *
   * A brother-sister page that is only tender reads as somebody else's. The
   * fighting IS the relationship: the borrowed hoodie that never came back, the
   * tattling, the last charger. See `Account` for why it is a two-sided ledger
   * rather than the list of grievances this started as.
   */
  account: Account;
  memories: Memory[];
  /** His letter. The last thing she reads before she answers. */
  letter: string;

  // ── Hers, written once from the published page ────────────────────────────
  /** Her answer. Write-once via the public share route. */
  reply: string;
  /** Which rakhi she tied. Write-once, alongside the reply. */
  rakhiPicked: string;

  festivalDate: string;
}

export interface Toast {
  id: number;
  type: "success" | "publish" | "error" | "info";
  title: string;
  message?: string;
}

export type EditMode = null | "manual" | "choose" | "preview";

/**
 * Editor state → request body. The server re-validates all of this.
 *
 * ── THE `idb:` STRIP ────────────────────────────────────────────────────────
 *
 * A photo he has picked but not published is held in IndexedDB and carried here
 * as `idb:<id>`. `useSisterEditor` uploads every one of those before it calls
 * this and aborts the publish if any fails, so in the normal path there is
 * nothing to strip.
 *
 * This is the backstop for the abnormal one. A ref that reached the database
 * would be a permanent, unfixable broken image on his sister's page — the id
 * means nothing outside the browser that minted it. Dropping it to an empty
 * string instead renders the illustrated fallback, which is a page missing a
 * photo rather than a page with a hole in it.
 *
 * `reply` and `rakhiPicked` are absent from this body on purpose. They are hers,
 * they arrive through the public share route, and a builder save that carried
 * them would let him overwrite what she wrote — or, more likely, blank it,
 * because his editor never had it in the first place.
 */
const stripLocal = (v: string): string => (v.startsWith("idb:") ? "" : v);

export function sisterDataToBody(d: SisterData, password: string) {
  return {
    sisterName: d.sisterName,
    brotherName: d.brotherName,
    sisterIsElder: d.sisterIsElder,
    photoUrl: stripLocal(d.photoUrl),
    greeting: d.greeting,
    vow: d.vow,
    vowSince: d.vowSince,
    // No media leaf to strip: the lifafa carries no QR — see the `Lifafa` doc.
    lifafa: { ...d.lifafa },
    account: d.account,
    memories: d.memories
      .map((m) => ({ ...m, imageUrl: stripLocal(m.imageUrl) }))
      // A memory IS its photograph; a caption with no image renders an empty frame.
      .filter((m) => m.imageUrl),
    letter: d.letter,
    festivalDate: d.festivalDate,
    password,
  };
}

/**
 * What the builder opens holding — a complete first draft, not an empty form.
 *
 * Every value here is a real, sendable line he can keep, and every one is
 * editable. A form of empty boxes asks someone to be a writer before they have
 * decided whether to bother, and the drop-off is at the first empty box. A draft
 * asks them to correct something instead, which is a much smaller ask.
 *
 * ── WHAT IS NOT PREFILLED, AND WHY ──────────────────────────────────────────
 *
 * `sisterName` is his to state and cannot be guessed. `photoUrl` and `memories`
 * are his own photographs, and a default there would be another family's face
 * (see `DEMO` below, which is exactly that, and must never be merged with this).
 *
 * `lifafa.amount` is EMPTY, and it is the one field here where a plausible default
 * would have been actively wrong. Every other value in this object is a line he
 * can keep or rewrite, and the cost of not noticing one is that his page sounds
 * slightly less like him. An amount is different: it is a factual claim about
 * money, made to his sister, in his name. A default of "501" — which this
 * genuinely shipped for a while, because 501 is the canonical shagun figure and it
 * looked harmless — means a brother who never opened the Lifafa section tells his
 * sister he is giving her ₹501. He may not be. The screen renders the empty case
 * as a sweets-and-blessing beat, so nothing is broken by leaving it blank, and
 * nothing is claimed on his behalf.
 *
 * `brotherName` DOES carry "Bhai" — it signs the vow, and a vow signed "Bhai" is
 * signed. The form marks it as still-untouched so it cannot be published by
 * accident without him seeing it.
 */
export const SAMPLE: SisterData = {
  sisterName: "",
  brotherName: "Bhai",
  // Defaults to elder, because "Didi" is the more common address and the more
  // costly one to get wrong — a younger sister called didi is a joke, an elder
  // sister called behna is a slight.
  sisterIsElder: true,
  photoUrl: "",
  greeting: [
    "You tie it. I complain about the colour.",
    "That is the arrangement.",
    "Thirty years running.",
  ],
  vow: [
    "Nobody gets to make you cry. That job is mine.",
    "Whatever it is, call me first. I will pretend I was awake.",
    "I will scare exactly as many people as required.",
    // ── The line this template exists for ────────────────────────────────────
    //
    // Raksha Bandhan is, underneath the thread, about a married sister's right of
    // return to the house she grew up in — the one thing her brother guarantees
    // her. Nobody says it out loud, in any card, anywhere, and it is the single
    // most powerful sentence available to this page. It stays last, because
    // nothing follows it well.
    "Ghar tera bhi hai. Darwaza band nahi hoga. Kabhi.",
  ],
  vowSince: "since the day they brought you home",
  // `amount` empty on purpose — see the note above. `note` is prefilled because a
  // line is a line; a number is a promise.
  lifafa: { amount: "", note: "Shagun. Do not argue." },
  account: {
    sheOwes: [
      { label: "hoodies never returned", value: "9" },
      { label: "times you told Mummy", value: "too many" },
    ],
    heOwes: [
      { label: "times you covered for me", value: "every single one" },
      { label: "nights you waited up", value: "all of them" },
      { label: "things you never told anyone", value: "everything" },
    ],
  },
  memories: [],
  letter:
    "You were the one who followed me everywhere and I pretended it was annoying. It was not. Tie the thread. I will hold up my wrist like I always do.",
  reply: "",
  rakhiPicked: "",
  festivalDate: "2026-08-28",
};

/**
 * What the GALLERY PREVIEW renders — not what the builder starts from.
 *
 * These two must not be the same object, and the distinction is the whole point
 * of this constant. `SAMPLE` ships every photo slot and the shagun figure empty,
 * so a brother who opens the form and publishes without finishing cannot ship a
 * page carrying another family's face or promising his sister a sum he never chose.
 * But feeding that same emptiness to the preview meant every visitor evaluating
 * the template saw a shell — no photo, no memories, no shagun — and three of the
 * four things this template does were invisible until you had already committed to
 * building one.
 *
 * So: the preview seeds from `DEMO`, the builder seeds from `SAMPLE`, and
 * `useSisterEditor` keeps them apart.
 *
 * `reply` and `rakhiPicked` are filled here and only here. On a real page they
 * appear after she answers; in the preview they are the only way to show a
 * visitor that the page comes back to him at all.
 */
export const DEMO: SisterData = {
  sisterName: "Ananya",
  brotherName: "Kabir",
  sisterIsElder: false,
  photoUrl: DEMO_MEDIA.hero,
  greeting: [
    "You still call me at 1am about nothing.",
    "I still pick up.",
    "Tie the thread, behna.",
  ],
  vow: [
    "Nobody gets to make you cry. That job is mine.",
    "Any hostel, any city, any hour — I am two rings away.",
    "Your fights are my fights. I do not need the details.",
    "Ghar aaunga. Har baar. Even the 11pm flight.",
  ],
  vowSince: "since 2001",
  lifafa: {
    amount: "1101",
    note: "Buy the thing you keep opening and closing in your cart.",
  },
  account: {
    sheOwes: [
      { label: "hoodies never returned", value: "11" },
      { label: "earphones lost, mine", value: "3" },
    ],
    heOwes: [
      { label: "times you took the blame", value: "beyond counting" },
      { label: "exams you sat outside for", value: "four" },
      { label: "the year I did not call", value: "you called anyway" },
    ],
  },
  memories: [
    { imageUrl: DEMO_MEDIA.memories[0], caption: "the year you tied it too tight", year: "2025" },
    { imageUrl: DEMO_MEDIA.memories[1], caption: "negotiating the shagun", year: "2024" },
    { imageUrl: DEMO_MEDIA.memories[2], caption: "she wore my kurta. again.", year: "2023" },
  ],
  letter:
    "You were four and you followed me to the bus stop every single morning. I told everyone it was annoying. It was the best part of the day. Tie the thread. I will hold up my wrist like I always do.",
  reply: "Ok but the hoodie count is 3, not 11. Ghar jaldi aa.",
  rakhiPicked: "nazar",
  festivalDate: "2026-08-28",
};

/** Server document → the shape every screen reads. Tolerates missing fields. */
export function dbToSisterData(raw: unknown): SisterData {
  const d = (raw ?? {}) as Record<string, unknown>;
  const str = (v: unknown, fallback = ""): string => (typeof v === "string" ? v : fallback);
  const list = (v: unknown): string[] =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];

  const lifafa = (d.lifafa ?? {}) as Record<string, unknown>;

  return {
    sisterName: str(d.sisterName),
    brotherName: str(d.brotherName, "Bhai"),
    // `!== false` and not `Boolean(...)`: a document written before this field
    // existed has `undefined` here, and the elder reading is the safe default
    // (see the note on the field). `Boolean(undefined)` would silently demote
    // every legacy page's didi to behna.
    sisterIsElder: d.sisterIsElder !== false,
    photoUrl: str(d.photoUrl),
    greeting: list(d.greeting),
    vow: list(d.vow),
    vowSince: str(d.vowSince),
    lifafa: {
      amount: str(lifafa.amount),
      note: str(lifafa.note),
    },
    account: (() => {
      const a = (d.account ?? {}) as Record<string, unknown>;
      const rows = (v: unknown): AccountRow[] =>
        Array.isArray(v)
          ? (v as Record<string, unknown>[]).map((r) => ({
              label: str(r?.label),
              value: str(r?.value),
            }))
          : [];
      return { sheOwes: rows(a.sheOwes), heOwes: rows(a.heOwes) };
    })(),
    memories: Array.isArray(d.memories)
      ? (d.memories as Record<string, unknown>[]).map((m) => ({
          imageUrl: str(m?.imageUrl),
          caption: str(m?.caption),
          year: str(m?.year),
        }))
      : [],
    letter: str(d.letter),
    reply: str(d.reply),
    rakhiPicked: str(d.rakhiPicked),
    festivalDate: str(d.festivalDate, "2026-08-28"),
  };
}

/** What the template calls her. The one place birth order is resolved. */
export const sisterWord = (d: Pick<SisterData, "sisterIsElder">) =>
  d.sisterIsElder ? "Didi" : "Behna";
