import type { ProductGuide } from "@/types/product-guide";

/**
 * Every product guide the site publishes.
 *
 * ── WHY THIS IS A HAND-WRITTEN FILE AND NOT DERIVED FROM THE TEMPLATE CONFIGS ─
 *
 * It would be tempting to generate a guide per template from `template-registry`
 * and be done. That produces fifty pages that all say "fill in the form and
 * press publish", which is worse than having no guides at all: it dilutes the
 * ones that are real, it gives search engines fifty near-duplicate pages to
 * choose between, and it teaches visitors that the Guides tab is filler.
 *
 * A guide earns its entry here by having something specific to say — a flow with
 * a step people get wrong, an asymmetry worth explaining, a screen that is not
 * self-evident. The two below qualify: the Raksha Bandhan pair invert each
 * other, and the single most common support question about them is why only one
 * of the two has a payment field. That is a paragraph no generator writes.
 *
 * ── ADDING ONE ───────────────────────────────────────────────────────────────
 *
 *   1. Stage media in <workspace>/media-src/guides/<slug>/
 *      - a recording? run `./scripts/compress-guide-videos.sh` (add the source
 *        to its SOURCES list first)
 *      - screenshots? run `node scripts/capture-guide-screenshots.mjs <slug>`
 *   2. `cd server && npm run upload:guide-media`
 *   3. Add the entry below.
 *   4. Add `/guides/<slug>` to STANDALONE_INDEXABLE_PAGES in lib/site-routes.ts,
 *      or `npm run seo:check` will fail — which is the point, since a guide
 *      nothing links to is a guide nobody reads.
 */

/** The hub's tab buckets, in tab order. `all` is synthesised by the UI. */
export const GUIDE_CATEGORIES = [
  { id: "festival", label: "Festivals", emoji: "🪔" },
  { id: "love", label: "Love & Romance", emoji: "💕" },
  { id: "basics", label: "Getting Started", emoji: "✨" },
] as const;

const guides: ProductGuide[] = [
  // ───────────────────────────────────────────────────────────────────────────
  // Raksha Bandhan — sister-side
  // ───────────────────────────────────────────────────────────────────────────
  {
    slug: "happy-rakshabandhan-to-sister",
    templateHref: "/happy-rakshabandhan-to-sister",
    templateName: "Happy Raksha Bandhan — for your sister",
    title: "Build a Raksha Bandhan page your sister ties herself",
    tagline: "The full build, start to send, in ninety seconds",
    summary:
      "A brother fills this one in: her name, the vow, the statement of account, and the shagun in the lifafa. She picks the rakhi and ties it herself, on her own phone, with a press and hold. This guide walks every field in the builder and then shows exactly what she sees when the link opens.",
    category: "festival",
    emoji: "🧿",
    accent: "#c2185b",
    buildTime: "About 6 minutes",
    updatedAt: "2026-08-26",

    video: {
      seconds: 90,
      recordedAt: "2026-08-21",
      silent: true,
      // Markers transcribed from the recording itself, not estimated. The
      // sister cut runs 14 steps; the ones without a `sectionId` are the intro
      // and the outro, which have no written counterpart by design.
      chapters: [
        { at: 0,  label: "A rakhi page she ties herself" },
        { at: 1,  label: "Open the builder",                 sectionId: "open" },
        { at: 5,  label: "Her name, your name, Didi or Behna", sectionId: "names" },
        { at: 10, label: "Her photo and the crop",           sectionId: "photo" },
        { at: 18, label: "The three opening lines",          sectionId: "opening" },
        { at: 22, label: "The vow, since-when, the letter",  sectionId: "vow" },
        { at: 29, label: "The statement of account",         sectionId: "ledger" },
        { at: 36, label: "The lifafa and the password",      sectionId: "lifafa" },
        { at: 41, label: "Your three photos",                sectionId: "gallery" },
        { at: 56, label: "Save and preview",                 sectionId: "preview" },
        { at: 57, label: "What she actually sees",           sectionId: "recipient" },
        { at: 80, label: "Send it",                          sectionId: "send" },
        { at: 83, label: "Link, QR, Print",                  sectionId: "share" },
        { at: 88, label: "Done" },
      ],
    },

    sections: [
      {
        id: "open",
        title: "Open the builder",
        intro:
          "Nothing here is saved to your account until you publish, so you can open it and poke around without committing to anything.",
        steps: [
          {
            title: "Find the template and press Create",
            body:
              "From Templates, open Happy Raksha Bandhan — the sister-side card, the one whose preview line reads “Your brother sent you a rakhi to tie”. Press Create to open the form.",
            shot: "step-01.webp",
            shotAlt: "The Raksha Bandhan builder open on the Didi tab, with the names, the Didi/Behna choice and the photo slot",
            note:
              "There are two Raksha Bandhan templates and they are not recolours of each other. This one is filled in by a brother. If you are a sister building for your brother, you want the other one — there is a guide for it too, linked at the foot of this page.",
          },
          {
            title: "You do not need an account yet",
            body:
              "The form works signed out. You are asked to sign in once, at the moment you publish, and everything you have typed carries across the sign-in — nothing is lost.",
          },
        ],
      },
      {
        id: "names",
        title: "Her name, your name, and what you call her",
        steps: [
          {
            title: "Fill the two names",
            body:
              "Her name is what the page greets her by and what the share link previews with. Yours signs the vow at the bottom.",
          },
          {
            title: "Pick Didi or Behna",
            body:
              "This one word is used throughout the finished page — in the greeting, on the certificate, and in the letter. Pick whichever you actually call her; that is the whole point of the field.",
          },
        ],
      },
      {
        id: "photo",
        title: "Her photo, and getting the crop right",
        steps: [
          {
            title: "Add a photo of her",
            body:
              "Press Add photo and choose one. It lands in a round frame at the top of her page, so faces near the centre survive the crop and group shots generally do not.",
          },
          {
            title: "Drag to zoom, drag to reposition",
            body:
              "The crop control is live — what you see in the little circle is exactly what she will see. Adjust it now rather than after publishing.",
          },
        ],
      },
      {
        id: "opening",
        title: "The opening line",
        steps: [
          {
            title: "Choose one of the three, or write your own",
            body:
              "Three opening lines are offered. They set the register for everything under them — one is warm, one is funny, one is plain. Click the one that fits, or type over it.",
            shot: "step-02.webp",
            shotAlt: "The three opening lines, each on its own row",
          },
        ],
      },
      {
        id: "vow",
        title: "The vow, since when, and the letter",
        intro: "This is the part she will read twice. It is worth the extra minute.",
        steps: [
          {
            title: "Write the vow",
            body:
              "A single promise, in your words. It is printed on a certificate she can turn over, and your name is signed under it.",
            shot: "step-03.webp",
            shotAlt: "The since-when field and the letter box",
          },
          {
            title: "Set since when",
            body:
              "The year you want the page to count from — usually her birth year or yours. The finished page renders it as a running count of years.",
          },
          {
            title: "Write the letter",
            body:
              "Longer than the vow and less formal. Specifics beat sentiment here: one real thing she did lands harder than three lines about how much she means to you.",
          },
        ],
      },
      {
        id: "ledger",
        title: "The statement of account",
        steps: [
          {
            title: "Fill both columns",
            body:
              "Two columns, side by side: what she owes you — hoodies never returned, chargers taken hostage — and what you owe her. Itemise both honestly.",
            shot: "step-04.webp",
            shotAlt: "The statement of account, itemised in two columns",
            note:
              "It is not meant to balance, and the page does not try to make it. The joke only works if your column is visibly, unarguably longer.",
          },
        ],
      },
      {
        id: "lifafa",
        title: "The lifafa and the password",
        steps: [
          {
            title: "Put the shagun in the lifafa",
            body:
              "Type the amount you are giving her. It appears inside an envelope she opens on her side.",
            shot: "step-05.webp",
            shotAlt: "The lifafa: the shagun amount, the line that goes with it, and the password field",
            note:
              "There is no payment QR on this template, and that is deliberate rather than missing. A QR encodes a payee — putting one here would ask your sister to pay you. The money is going the other way, so the amount is stated and the transfer happens however you already send her money. The brother-side template does have a UPI field, because there the flow runs the other way round.",
          },
          {
            title: "Set a password if you want one",
            body:
              "Optional. With it set, anyone opening the link is asked for it first — worth it if you are sending through a family group where the link will get forwarded.",
          },
        ],
      },
      {
        id: "gallery",
        title: "Your three photos",
        steps: [
          {
            title: "Add three, with a caption and a year each",
            body:
              "Old ones work better than recent ones. The year is displayed, so a badly guessed year is more noticeable than no year — leave it blank if you are unsure.",
          },
        ],
      },
      {
        id: "preview",
        title: "Save and preview",
        steps: [
          {
            title: "Press Save",
            body:
              "This shows you the finished page as she will get it. Nothing has been published yet and no link exists — you can go back and edit any field.",
            shot: "step-06.webp",
            shotAlt: "The finished page in preview, addressed to Ananya",
          },
        ],
      },
      {
        id: "recipient",
        title: "What she actually sees",
        intro:
          "Worth watching in the video rather than reading — this is the half that is hard to describe and obvious on sight. It runs from 00:57.",
        steps: [
          {
            title: "She picks her own rakhi",
            body:
              "The rakhi is not chosen by you. She is shown the options and picks the one she wants, because she is the one tying it.",
          },
          {
            title: "She presses and holds to tie it",
            body:
              "A press-and-hold, not a tap. The thread draws itself around the wrist while she holds, which is the moment the whole page is built around.",
          },
          {
            title: "Then the certificate, the account, and the lifafa",
            body:
              "She turns the certificate over to read your vow, reads both columns of the statement, and opens the envelope. She can write back once, and her reply comes to you.",
          },
        ],
      },
      {
        id: "send",
        title: "Publish and send",
        steps: [
          {
            title: "Press Send it",
            body:
              "If you are signed out you are asked to sign in here, and the page publishes itself immediately afterwards — you do not have to fill anything in again.",
            shot: "step-07.webp",
            shotAlt: "Pressing Send it while signed out brings up the sign-in sheet; the page publishes straight afterwards",
            note:
              "Sign in with Google on a phone is a full-page redirect rather than a popup. Let it finish and come back on its own; if you close the tab mid-redirect the publish does not complete and you will land back on the form.",
          },
        ],
      },
      {
        id: "share",
        title: "Link, QR, print",
        steps: [
          {
            title: "Three ways out",
            body:
              "Copy the link for WhatsApp, show the QR if she is in the room, or print it if you want something to hand over with the actual rakhi.",
          },
          {
            title: "You can edit it after sending",
            body:
              "Open Profile → My Creations and pick the card. The link stays the same, so anything you fix reaches her even if she has already opened it.",
          },
        ],
      },
    ],

    faqs: [
      {
        q: "Why is there no payment QR on this template?",
        a: "Because a QR code encodes a payee, and on this page the money moves from you to your sister. A QR here would be asking her to pay you. The shagun amount is stated inside the lifafa and you send it however you normally would. The brother-side template does carry a UPI field, because there the shagun travels in the opposite direction.",
      },
      {
        q: "Can she open it on a laptop?",
        a: "Yes, though it is built for a phone. The press-and-hold that ties the rakhi works with a mouse held down, but the page is composed for a portrait screen and that is where it looks right.",
      },
      {
        q: "Can I change something after I have sent the link?",
        a: "Yes. Profile → My Creations → the card → Edit. The link does not change, so she sees the corrected version even if she opened the old one already.",
      },
      {
        q: "Does she need an account to open it?",
        a: "No. She needs the link, and the password if you set one. Nothing else.",
      },
      {
        q: "How long does the whole thing take?",
        a: "About six minutes if you have her photos ready. The letter and the statement of account are where the time actually goes.",
      },
    ],

    relatedBlogSlugs: [],
    relatedGuideSlugs: ["happy-rakshabandhan-to-brother"],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // Raksha Bandhan — brother-side
  // ───────────────────────────────────────────────────────────────────────────
  {
    slug: "happy-rakshabandhan-to-brother",
    templateHref: "/happy-rakshabandhan-to-brother",
    templateName: "Happy Raksha Bandhan — for your brother",
    title: "Build a Raksha Bandhan page your brother performs himself",
    tagline: "Design the rakhi, itemise his debts, watch him do the puja",
    summary:
      "A sister fills this one in. You design the rakhi — two thread colours, a charm, one word engraved on the pendant — and itemise what he owes you. On his side he does the whole puja: tilak, mithai, aarti, then the thread, each as its own act. This guide walks every field and every screen he sees.",
    category: "festival",
    emoji: "🪷",
    accent: "#b8860b",
    buildTime: "About 6 minutes",
    updatedAt: "2026-08-26",

    video: {
      seconds: 90,
      recordedAt: "2026-08-24",
      silent: true,
      chapters: [
        { at: 0,  label: "A rakhi he ties on himself" },
        { at: 2,  label: "Open the builder",                       sectionId: "open" },
        { at: 6,  label: "His name, your name, city, km apart",    sectionId: "names" },
        { at: 13, label: "A photo of you two, and the crop",       sectionId: "photo" },
        { at: 20, label: "What you want to say",                   sectionId: "message" },
        { at: 24, label: "Design the rakhi — thread and charm",    sectionId: "rakhi" },
        { at: 29, label: "The word on the pendant",                sectionId: "pendant" },
        { at: 31, label: "The ledger",                             sectionId: "ledger" },
        { at: 34, label: "Your old photos",                        sectionId: "gallery" },
        { at: 49, label: "The shagun, the QR, the password",       sectionId: "shagun" },
        { at: 57, label: "Save and preview",                       sectionId: "preview" },
        { at: 58, label: "What he sees — the whole puja",          sectionId: "recipient" },
        { at: 78, label: "Send it",                                sectionId: "send" },
        { at: 82, label: "Link, QR, Print",                        sectionId: "share" },
        { at: 88, label: "Done" },
      ],
    },

    sections: [
      {
        id: "open",
        title: "Open the builder",
        steps: [
          {
            title: "Find the template and press Create",
            body:
              "From Templates, open Happy Raksha Bandhan — the brother-side card, the one that promises he performs the ritual. Press Create.",
            shot: "step-01.webp",
            shotAlt: "The brother-side builder open on the Bhai tab — both names, city, kilometres apart, the photo slot and the message lines",
            note:
              "This runs the opposite way to its sister-side pair. Here you design the rakhi and he ties it; there he writes the vow and she picks the rakhi. Neither is a recolour of the other.",
          },
        ],
      },
      {
        id: "names",
        title: "Names, city, and the distance between you",
        steps: [
          {
            title: "Both names",
            body: "His name greets him and previews the link; yours signs the page.",
          },
          {
            title: "City and kilometres apart",
            body:
              "Optional, and the single field that does the most work on this template. If he has moved away, the finished page counts the distance out loud — which is the line that tends to get the reaction.",
          },
        ],
      },
      {
        id: "photo",
        title: "A photo of the two of you",
        steps: [
          {
            title: "Add it and set the crop",
            body:
              "One picture with both of you in it. The frame is round, so centre the two faces and drag to zoom until neither is clipped.",
          },
        ],
      },
      {
        id: "message",
        title: "What you want to say",
        steps: [
          {
            title: "Write the message",
            body:
              "This sits under the photo and is the first thing he reads. Short is fine — the ledger further down does the heavy lifting.",
          },
        ],
      },
      {
        id: "rakhi",
        title: "Design the rakhi",
        intro:
          "The part with no equivalent on the other template. You are making the object he will tie, and he sees exactly what you chose.",
        steps: [
          {
            title: "Pick two thread colours",
            body:
              "The two swatches twist together into the band. High-contrast pairs read better at phone size than two neighbouring shades.",
            shot: "step-02.webp",
            shotAlt: "The five thread swatches, the five charms, the engraved pendant word and the ledger beneath them",
          },
          {
            title: "Choose the charm",
            body: "Om, Swastik, Nazar, Heart or Star sits at the centre of the band.",
          },
        ],
      },
      {
        id: "pendant",
        title: "The word on the pendant",
        steps: [
          {
            title: "Engrave one word",
            body:
              "One word only, engraved on the pendant — whatever you actually call him. It is small on screen, so a short word reads and a long one does not.",
          },
        ],
      },
      {
        id: "ledger",
        title: "The ledger",
        steps: [
          {
            title: "Itemise what he owes you",
            body:
              "Line by line, with amounts. Specific and petty works; round numbers and general grievances do not.",
          },
        ],
      },
      {
        id: "gallery",
        title: "Your old photos",
        steps: [
          {
            title: "Add them with captions and years",
            body:
              "The older and worse-quality, the better this section works. A blurry one from a decade ago beats a good one from last month.",
            shot: "step-03.webp",
            shotAlt: "The old-photos section, with the shagun section beginning below it",
          },
        ],
      },
      {
        id: "shagun",
        title: "The shagun, the QR, and the password",
        steps: [
          {
            title: "Your UPI id",
            body:
              "The shagun travels from him to you on this template, so you are the payee and the UPI field is yours. He taps it and his own UPI app opens with you already filled in.",
            shot: "step-04.webp",
            shotAlt: "The shagun section: your UPI id, the optional QR slot, the line that goes with it, and the password",
            note:
              "This is exactly why the sister-side template has no payment field: there the money moves the other way, and a QR encodes a payee. The asymmetry between the two templates is deliberate.",
          },
          {
            title: "The QR slot is optional",
            body:
              "You can upload your own payment QR image here instead of, or alongside, the UPI id. Leave it empty and the UPI id alone does the job.",
          },
          {
            title: "Password, if you want one",
            body: "Optional. Set it and the link asks for it before anything else loads.",
          },
        ],
      },
      {
        id: "preview",
        title: "Save and preview",
        steps: [
          {
            title: "Press Save",
            body:
              "Shows you his version, end to end, before anything is published. Go back and fix whatever looks wrong.",
            shot: "step-05.webp",
            shotAlt: "The finished brother-side page in preview",
          },
        ],
      },
      {
        id: "recipient",
        title: "What he sees — the whole puja",
        intro:
          "Not a page he scrolls. Four separate acts, each taking two taps. The video runs it from 00:58 and is the fastest way to understand it.",
        steps: [
          {
            title: "Tilak, then mithai, then aarti, then the thread",
            body:
              "Each is its own screen and its own gesture. He cannot skip ahead — the order is the order of the actual ritual, which is the point.",
          },
          {
            title: "Then he asks where his gift is",
            body:
              "You have already answered: your reply is the shagun screen, with your UPI id on it.",
          },
          {
            title: "And he writes his promise back",
            body: "One reply, from him to you. It comes to you.",
          },
        ],
      },
      {
        id: "send",
        title: "Publish and send",
        steps: [
          {
            title: "Press Send it",
            body:
              "Signed out, you sign in here and it publishes straight afterwards without asking you to re-enter anything.",
            note:
              "On a phone the Google sign-in is a full-page redirect. Let it come back on its own — closing the tab part-way means the publish never happens.",
          },
        ],
      },
      {
        id: "share",
        title: "Link, QR, print",
        steps: [
          {
            title: "Copy, scan, or print",
            body:
              "The QR here opens the page — it is not a payment code. Print is worth it if you are handing him a physical rakhi at the same time.",
          },
        ],
      },
    ],

    faqs: [
      {
        q: "Why does this one have a UPI field when the sister template does not?",
        a: "Because the shagun moves in opposite directions on the two templates. Here it goes from your brother to you, so you are the payee and a UPI id points the right way. On the sister-side template the money goes from the brother to the sister, so a payment code there would be asking her to pay him. Same festival, mirrored flow.",
      },
      {
        q: "Do I have to upload a payment QR?",
        a: "No, it is optional and most people leave it empty. The UPI id on its own opens his payment app with you already filled in.",
      },
      {
        q: "Can he do the puja steps more than once?",
        a: "He can reopen the link and go through it again. His reply is sent once.",
      },
      {
        q: "What if he opens it on a laptop?",
        a: "It works, but the puja is built around taps on a portrait screen. Send it somewhere he will open it on his phone.",
      },
      {
        q: "Can I change the rakhi design after publishing?",
        a: "Yes — Profile → My Creations → the card → Edit. The link is unchanged, so the next time he opens it he sees the new one.",
      },
    ],

    relatedBlogSlugs: [],
    relatedGuideSlugs: ["happy-rakshabandhan-to-sister"],
  },
];

export const guideList: ProductGuide[] = guides;

export const getGuide = (slug: string): ProductGuide | undefined =>
  guides.find((g) => g.slug === slug);

/** Guides that carry a recording — what the hub's Videos tab shows. */
export const videoGuides: ProductGuide[] = guides.filter((g) => g.video);

export const guideSlugs: string[] = guides.map((g) => g.slug);

/**
 * Guide keyed by the template path it documents, so a template page can find
 * its own guide without importing the whole list and scanning it.
 */
export const guideByTemplateHref: Record<string, ProductGuide> = Object.fromEntries(
  guides.map((g) => [g.templateHref, g]),
);
