import { templateMedia } from "@/lib/templateMedia";

// ─── Ganesh Chaturthi media ──────────────────────────────────────────────────
//
// Served from object storage, not the repo. Three files, 3.1 MB, binary —
// `lib/templateMedia.ts` explains at length why that never enters git. Keys are
// stable and immutable-cached, so re-running the uploader replaces a file in
// place without any URL here changing.
//
//     cd server && npm run upload:template-media -- --only=happy-ganesh-chaturthi
//
// Source of truth: <repo-root>/media-src/templates/happy-ganesh-chaturthi/
//
// ── WHY EVERY ASSET CARRIES ITS TRUE SIZE ───────────────────────────────────
//
// Neither of the two images is square. `bappa` is 936×1000 (0.936) and
// `shubhkamnaye` is 494×434 (1.138), and dropping either into a 1:1 frame with
// `object-fit: cover` crops it — on the idol that means the top of the mukut and
// the base of the murti, which are the two parts that make it read as an idol at
// all. So the real width/height travels with the URL, every frame is sized from
// the asset's own ratio, and the fit is `contain`. Nothing is ever cropped, and
// a replaced asset with different proportions cannot reintroduce the bug: update
// the numbers here and every frame re-sizes itself.
//
// ── THE GIF, WHEN THE HOUSE STYLE AVOIDS GIFs ───────────────────────────────
//
// Elsewhere we build motion in CSS/SVG, because a GIF bands gradients to 256
// colours and fringes its alpha. This one is 21 frames of hand-drawn festival
// artwork with the greeting already lettered into it — the banding is invisible
// on flat art, and nothing we could draw in SVG would carry the same warmth.
//
// The one real constraint it imposes is on export: `html-to-image` snapshots
// whichever frame happens to be painted, so this file must never sit inside a
// node passed to the PNG capture. See the note at the top of `StoryCard.tsx`.
//
// ── THE AUDIO IS NOT AN `Asset` ─────────────────────────────────────────────
//
// `Asset` exists to carry pixel dimensions, and a sound has none. It is a bare
// URL below, consumed by `BackgroundMusic.tsx` through `new Audio()`.
//
// It also must NOT be served as `application/octet-stream`, which is what the
// uploader did for every `.mp3` before this template existed: Safari refuses an
// <audio> source with that content type, fires no error the page can observe,
// and simply plays nothing. `scripts/uploadTemplateMedia.ts` now maps `.mp3` to
// `audio/mpeg` — if the aarti is silent on an iPhone and fine on Chrome, that
// mapping is the first thing to check.

const slug = "happy-ganesh-chaturthi";
const a = (file: string) => templateMedia(slug, file);

export interface Asset {
  src: string;
  width: number;
  height: number;
  /** width / height — frames use this so nothing is ever cropped. */
  ratio: number;
}

const asset = (file: string, width: number, height: number): Asset => ({
  src: a(file),
  width,
  height,
  ratio: width / height,
});

export const GANESH_ASSETS = {
  /**
   * The gallery card, and the og:image. 900×1200 — 3:4, because that is exactly
   * what `components/TemplateCard.tsx` renders (`aspect-[3/4]`, `object-cover`).
   *
   * ── IT IS A SHOT OF THIS PAGE'S OWN HERO ──────────────────────────────────
   *
   * Captured from the live route with the words hidden and the medallion
   * oversized, so the card shows the actual current design rather than a
   * separate illustration that will drift from it. The recipe, for when the
   * design changes and this needs retaking:
   *
   *   viewport 900×1200 on /happy-ganesh-chaturthi
   *   hide  .gc-topbar, .gc-topbar-scrim, .gc-sample, .gc-music, nextjs-portal
   *   hide  .gc-hero-split .gc-words, .gc-verse      (the card prints the words)
   *   hide  the scrollbar, or it lands in the frame as a dark bar down the right
   *   .gc-section--hero { padding-top: 70px; padding-bottom: 0; min-height: 1200px }
   *   .gc-hero-split { display: block }
   *   .gc-medallion { width: 720px; margin: 0 auto }
   *   .gc-wrap { max-width: none; padding-inline: 0 }
   *   clip { x: 0, y: 0, width: 900, height: 1200 }  →  webp q88
   *
   * ── WHY NO TEXT IN THE IMAGE ──────────────────────────────────────────────
   *
   * The card prints the type chip, the title in white Playfair and a two-line
   * description over the bottom, under a black gradient that reaches 0.82. A
   * title baked into the image would sit directly behind that one.
   *
   * ── AND WHY THE MEDALLION IS 720px AND NOT 980px ──────────────────────────
   *
   * 980 was the first try, and it looked better in isolation: the ring bled off
   * both edges, which at card size reads as a composition rather than as a
   * sticker.
   *
   * It failed on the PHONE card. `aspect-[3/4]` holds at every width, but the
   * text block over it is fixed padding plus three lines of type — so the
   * smaller the card, the bigger the share the text takes. At 291×388 on a
   * laptop it covers everything below ~64%; at 175×233 on a phone, below ~51%.
   * At 980 the murti's legs reached 71% and the phone card printed the title
   * across them.
   *
   * At 720 the murti sits at 16%–56% and the whole ring is visible, which clears
   * the text at both sizes. Verified by compositing the real gradient stops and
   * the real text block over the finished file at both sizes — not by looking at
   * the image on its own, which is what made 980 look right.
   *
   * ── AND WHY THE CARD IS NOT THE GIF ────────────────────────────────────────
   *
   * The GIF was the first cover and it is wrong twice. As a gallery card it is a
   * 494×434 animation looping in a grid of fifty still cards. As an og:image it
   * is worse: several scrapers refuse an animated source outright and others
   * take an arbitrary frame, so the WhatsApp preview of every link would be
   * whichever frame the encoder happened to leave first.
   *
   * ── ONE HONEST LIMITATION ─────────────────────────────────────────────────
   *
   * 3:4 is right for the gallery and wrong for a link preview, which wants
   * something nearer 1.91:1. Scrapers centre-crop, and the murti is centred, so
   * it survives — but if link previews ever matter more than the gallery card,
   * that is a second asset and not a change to this one.
   */
  cover: asset("cover.webp", 900, 1200),

  /**
   * The murti. Transparent WebP, so it sits on whichever mandap backdrop the
   * sender picked rather than bringing a background of its own.
   *
   * Shown on the darshan screen and again, smaller, at the aarti — the two
   * screens the whole page is built around, so it is `priority`.
   */
  bappa: asset("bappa.webp", 936, 1000),

  /**
   * The lettered greeting animation, on the cover and nowhere else.
   *
   * It already says "Happy Ganesh Chaturthi" in its own artwork, which is why
   * the cover's own heading is set in Devanagari underneath rather than
   * repeating the same words in Latin directly above it.
   */
  shubhkamnaye: asset("shubhkamnaye.gif", 494, 434),
} as const;

/**
 * Karpur Gauram Karunavtaram — the aarti that closes a Ganesh puja.
 *
 * Faded in on the cover tap, not on mount: a page that starts playing devotional
 * music at whoever opens it, before they have touched anything, is a page people
 * close. See `BackgroundMusic.tsx`, which also means autoplay policy never has
 * to be fought — by the time this plays there has been a real user gesture.
 */
export const AARTI_AUDIO = a("karpur-gauram.mp3");

// ─── Demo media ──────────────────────────────────────────────────────────────
//
// The gallery preview renders `DEMO`, not `SAMPLE`. `SAMPLE` ships every photo
// slot empty on purpose — so nobody can publish a half-finished page carrying
// another family's face — and feeding that same emptiness to the preview meant
// a visitor evaluating the template saw the shell: no devotee photo, no pandal
// grid, no vargani QR. Three of the things this template does were invisible
// until you had already committed to building one.
//
// ── WHY THESE LIVE IN /public AND THE THREE ABOVE DO NOT ────────────────────
//
// The rule that keeps media out of the repo exists because the idol, the GIF and
// the aarti are 3.1 MB of binary that would enter git history, the Docker image
// and every deploy forever. These five total ~140 KB — three orders of magnitude
// below the thing the rule protects against — and unlike the three above they
// are load-bearing for the FIRST render a stranger ever sees. An object-storage
// miss on `bappa.webp` costs one screen on a page somebody already chose to
// open; a miss here means the gallery preview shows an empty frame and a broken
// grid, which is the exact failure this demo content was added to fix.
//
// So they ship with the app and cannot 404 independently of it. They are NOT in
// `media-src/templates/`, because the uploader mirrors everything in that folder
// to object storage and these would land there as five objects nothing reads.
//
// ── THEY ARE DRAWINGS, AND THAT IS THE HONEST CHOICE ────────────────────────
//
// The rakhi demo set is a photograph of two people, cropped four ways, and it
// works because it reads as one family's afternoon — which is what the real
// thing is. There is no equivalent photograph for this template in the repo, and
// the two options were to reuse the rakhi one or to draw something.
//
// Reusing it was not possible: it is unmistakably a rakhi being tied — the
// thread, the thali, the tilak — and it would have advertised the wrong
// festival in the gallery card of this one.
//
// So it is drawn, generated from the same SVG vocabulary as `Ornaments.tsx` —
// the garland, the marigolds, the diya, the modak — which has a second benefit
// worth keeping even once a photograph exists: a drawing cannot be mistaken for
// the sender's own family, so the "somebody else's face one Publish away from
// being sent" hazard that `SAMPLE` exists to avoid does not arise in the preview
// either.
//
// It also carries no Devanagari, like the rest of the template. The first
// version had an Om glyph at the centre of the arch, which was the only script
// left anywhere on the page.
//
// If a real Ganesh Chaturthi photograph is ever shot for this, replace the file
// and change nothing else — the URL and the frame stay as they are.
//
// ── WHY THESE ARE PLAIN URLs AND NOT `Asset`s ───────────────────────────────
//
// They stand in for fields the sender uploads themselves — `photoUrl`,
// `vargani.qrImageUrl` — which are `string` on the wire
// and rendered by the same components that render theirs. Giving them the
// `Asset` treatment would mean a second, demo-only code path through those
// components, and the whole value of the demo is that it exercises the real one.
//
// ── THE QR ──────────────────────────────────────────────────────────────────
//
// PNG, not SVG, and that is not a preference. This URL lands in
// `vargani.qrImageUrl`, which the ashirvad screen renders through `next/image`,
// and `next.config.ts` leaves `dangerouslyAllowSVG` at its default of false —
// the optimiser rejects an SVG source outright. That default is right and must
// not be flipped to suit this file: the same field also holds a QR that a
// stranger uploaded, and allowing SVG there would push arbitrary user-supplied
// markup through /_next/image.
const demo = (file: string) => `/ganesh-demo/${file}`;

export const DEMO_MEDIA = {
  /**
   * 900×900. Stands in for the sender's own photograph, on the page and on the
   * story card.
   *
   * ── IT IS A REAL PHOTOGRAPH NOW, AND THAT MATTERS ─────────────────────────
   *
   * It was a drawing — the mandap, built from the same SVG vocabulary as
   * `Ornaments.tsx` — because there was no Ganesh Chaturthi photograph in the
   * repo and the alternative was the rakhi one, which is unmistakably a rakhi
   * being tied.
   *
   * A drawing in the round portrait frame was wrong for a different reason
   * though: that frame's whole job is to say "put YOUR photograph here", and
   * filling it with an illustration demonstrates the frame without
   * demonstrating the feature. Somebody browsing could not tell whether the
   * template took photos at all.
   *
   * This is cropped from `public/rakhi-sister/demo-hero.webp` — one person, warm
   * indoor festival light, fairy lights, traditional clothes, and no rakhi
   * anywhere in frame, so it reads as any Indian household at any festival.
   * Cropped to drop the second hand at the bottom-right edge.
   *
   * Replace it the moment a real Ganesh Chaturthi photograph exists; nothing
   * else has to change.
   */
  hero: demo("demo-photo.webp"),
  qr: demo("demo-qr.png"),
} as const;

/**
 * Fetched during the cover screen so the darshan never opens on a blank frame.
 *
 * Only the idol. The GIF is already on screen by then (it IS the cover) and the
 * audio is fetched by the <audio> element's own `preload`, which knows how to
 * stream it — putting a 2.3 MB sound in an image preload list would block the
 * two things the next tap actually needs.
 */
export const PRELOAD: string[] = [GANESH_ASSETS.bappa.src];
