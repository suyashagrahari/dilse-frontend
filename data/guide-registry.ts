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
  { id: "birthday", label: "Birthday", emoji: "🎂" },
  { id: "wedding", label: "Weddings", emoji: "💍" },
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

  // ───────────────────────────────────────────────────────────────────────────
  // Darling
  // ───────────────────────────────────────────────────────────────────────────
  {
    slug: "darling",
    templateHref: "/darling",
    templateName: "My Darling",
    title: "Build the Darling page — six rooms she can wander",
    tagline: "A dashboard, not a card — and a nine-page wizard behind it",
    summary:
      "Darling is not a page she scrolls once. It is a dark little world with its own rail — Home, Wish, Photos, Music, Games, Notes — and she moves around it herself. You fill it through a nine-page wizard: the message, the wish card, her photos, a quiz you write, and truth-or-dare. This guide walks every page and then every room she sees.",
    category: "love",
    emoji: "🌹",
    accent: "#e0457b",
    buildTime: "About 10 minutes",
    updatedAt: "2026-08-26",

    video: {
      seconds: 90,
      recordedAt: "2026-08-26",
      silent: true,
      // Timings read off the recording rather than estimated: the cut stamps a
      // "STEP n OF 13" chip, so sampling one frame per second and reading the
      // chip gives the exact second each step begins. Labels describe what is
      // happening rather than echoing the on-screen heading — the recording's
      // header is fixed, so a couple of its steps inherit the page title
      // "Always Yours & My Love", which would be a useless thing to navigate by.
      chapters: [
        { at: 0,  label: "The page she opens" },
        { at: 4,  label: "Open the builder, and fill it in yourself", sectionId: "open" },
        { at: 11, label: "Their name, your name, your date",          sectionId: "names" },
        { at: 17, label: "The love message",                          sectionId: "message" },
        { at: 20, label: "The wish card",                             sectionId: "wish" },
        { at: 24, label: "Her home photo",                            sectionId: "home-photo" },
        { at: 26, label: "Gallery photos",                            sectionId: "gallery" },
        { at: 29, label: "Quiz questions",                            sectionId: "quiz" },
        { at: 32, label: "Truth & Dare",                              sectionId: "games" },
        { at: 35, label: "The share photo",                           sectionId: "share-photo" },
        { at: 38, label: "Save the page",                             sectionId: "save" },
        { at: 45, label: "What she sees — all six rooms",             sectionId: "recipient" },
        { at: 65, label: "Publish it",                                sectionId: "publish" },
        { at: 72, label: "Link, QR, print",                           sectionId: "share" },
        { at: 87, label: "Done" },
      ],
    },

    sections: [
      {
        id: "open",
        title: "Open the builder — and choose how to fill it",
        intro:
          "Darling opens as a finished sample so you can look round before committing to anything. Edit is at the foot of the left rail.",
        steps: [
          {
            title: "Press Edit, bottom-left",
            body:
              "Not a Create button at the top like most templates — Darling is a dashboard, and its controls live at the foot of the rail you are standing in.",
            shot: "step-01.webp",
            shotAlt: "The Darling dashboard: the left rail, the love letter card and the time-together counter",
          },
          {
            title: "Then pick AI Magic or Write yourself",
            body:
              "AI Magic asks you to describe your relationship in a few words and writes the messages, captions and quiz for you. Write yourself opens the nine-page form.",
            shot: "step-02.webp",
            shotAlt: "The choice between AI Magic and Write yourself",
            note:
              "This guide takes the Write yourself path, and so does the video — because that is the one that shows you every field. If you use AI Magic you land in the same nine pages with the words already filled in, and everything below still applies: you are editing rather than typing from nothing.",
          },
          {
            title: "The strip along the top is a progress bar, not a menu",
            body:
              "Names · Message · Wish · Photos · Gallery · Quiz · Games · Share · Polish shows where you are. You move with Next and Back — clicking the strip does nothing.",
          },
        ],
      },
      {
        id: "names",
        title: "Names, and the date you count from",
        steps: [
          {
            title: "Their name is the only required field",
            body:
              "Everything else on this page can wait. Their name is what the page is addressed to and what the share link previews with.",
            shot: "step-03.webp",
            shotAlt: "The Names page: their name, your name and an optional special date",
          },
          {
            title: "The special date drives the counter",
            body:
              "Optional, and the field that earns its keep: set it and the home page runs a live count — years, months, days, hours, minutes, seconds — from that date. Leave it blank and the counter shows a sample.",
          },
        ],
      },
      {
        id: "message",
        title: "The love message",
        steps: [
          {
            title: "The paragraph on the home page",
            body:
              "This sits under the title and is the first thing she reads. Long enough to say something, short enough that she reads it standing up.",
            shot: "step-04.webp",
            shotAlt: "The Love Message page with its text area",
          },
        ],
      },
      {
        id: "wish",
        title: "The wish card",
        steps: [
          {
            title: "A second, softer note",
            body:
              "This one lives behind the Wish tab rather than on the home page, so it is the one she finds rather than the one she is shown. Worth making it the more private of the two.",
            shot: "step-05.webp",
            shotAlt: "The Wish Card page",
          },
        ],
      },
      {
        id: "home-photo",
        title: "Her home photo",
        steps: [
          {
            title: "One photo, in a circle",
            body:
              "It sits at the top of the home page inside a circular frame, so centre the faces. Sliders set position and zoom — the same control the gallery photos use.",
            shot: "step-06.webp",
            shotAlt: "The Home Photo page with its circular crop area",
          },
        ],
      },
      {
        id: "gallery",
        title: "Gallery photos",
        steps: [
          {
            title: "Up to ten, each with its own love letter",
            body:
              "This is the section people underestimate. Every photo takes its own note, so the gallery reads as a sequence of moments rather than an album.",
            shot: "step-07.webp",
            shotAlt: "The Gallery Photos page, empty, with the add control",
            note:
              "Ten is the ceiling, not the target. Six photos each with a real sentence beats ten with captions like “us ❤️”.",
          },
        ],
      },
      {
        id: "quiz",
        title: "Quiz questions",
        steps: [
          {
            title: "Three are already written for you",
            body:
              "They arrive filled in, so the Games section works even if you skip this page entirely. Replace them with ones only she could answer.",
            shot: "step-08.webp",
            shotAlt: "The Quiz Questions page with three default questions",
          },
          {
            title: "There is a library of thirty",
            body:
              "Browse 30 cute question templates if you are stuck, or write your own — up to ten in total.",
          },
        ],
      },
      {
        id: "games",
        title: "Truth & Dare",
        steps: [
          {
            title: "Two lists, picked from a library",
            body:
              "Truth and Dare are separate tabs. Tap + on anything in the library to add it, or write your own with Custom Truth / Custom Dare.",
            shot: "step-09.webp",
            shotAlt: "The Truth & Dare page with the Truth library open",
            note:
              "Whatever you pick mixes with the built-in defaults rather than replacing them, so adding two of your own does not leave her with a two-question game.",
          },
        ],
      },
      {
        id: "share-photo",
        title: "The share photo",
        steps: [
          {
            title: "The image on the link itself",
            body:
              "This is what appears when the link is pasted into WhatsApp or Instagram — the first thing she sees, before the page even opens.",
            shot: "step-10.webp",
            shotAlt: "The Share Photo page, with its Skip button",
            note:
              "The button on this page says Skip rather than Next, which is the honest label: leave it empty and the link still works, it just previews with the default artwork.",
          },
        ],
      },
      {
        id: "save",
        title: "Save the page",
        steps: [
          {
            title: "Check the summary line first",
            body:
              "The card at the top counts what you actually filled — home photo, gallery photos, quiz questions, truth/dare. It is the fastest way to spot a page you meant to fill and skipped.",
            shot: "step-11.webp",
            shotAlt: "The Save page: the summary of what has been filled, and the optional password",
          },
          {
            title: "Set a password if you want one",
            body:
              "Optional. With it set, only someone with the word can open the page.",
          },
        ],
      },
      {
        id: "recipient",
        title: "What she sees — all six rooms",
        intro:
          "The rail is her navigation, so the tour is the rail. Fastest understood by watching from 00:45.",
        steps: [
          {
            title: "Home, Wish, Photos, Music, Games, Notes",
            body:
              "Home carries the title, your message, the love letter and the counter. Wish holds the wish card. Photos is the gallery, one love letter at a time. Music is the playlist. Games is the quiz and truth-or-dare. Notes is where she writes back.",
          },
          {
            title: "She is not walked through it",
            body:
              "Nothing is gated and there is no order — she wanders. That is the point of the format, and the reason it is worth filling more than one section.",
          },
        ],
      },
      {
        id: "publish",
        title: "Publish",
        steps: [
          {
            title: "Publish appears once you have saved",
            body:
              "Saving puts a Publish button in the rail under Edit. Until then there is nothing to publish.",
            shot: "step-12.webp",
            shotAlt: "The saved dashboard, now with a Publish button in the rail",
          },
          {
            title: "Signed out, you sign in here",
            body:
              "The page publishes immediately afterwards — nothing you filled in is asked for twice.",
            shot: "step-13.webp",
            shotAlt: "Pressing Publish while signed out brings up the sign-in sheet",
            note:
              "On a phone the Google button is a full-page redirect. Let it come back on its own; closing the tab part-way means the publish never completes.",
          },
        ],
      },
      {
        id: "share",
        title: "Link, QR, print",
        steps: [
          {
            title: "Three ways to hand it over",
            body:
              "Copy the link, show the QR if she is with you, or print the card. The QR opens the page — it is not a payment code.",
          },
          {
            title: "You can keep editing afterwards",
            body:
              "Profile → My Creations → the card → Edit. The link does not change, so anything you add later — another gallery photo, a better quiz question — reaches her without sending a new link.",
          },
        ],
      },
    ],

    faqs: [
      {
        q: "Do I have to fill in all nine pages?",
        a: "No. Their name is the only required field in the whole wizard, and the quiz arrives with three questions already written. Every other page can be skipped and the page still works — it just has fewer rooms worth wandering into. The summary on the Save page tells you what you left empty.",
      },
      {
        q: "What does AI Magic actually write?",
        a: "The messages, the photo captions and the quiz questions, from a few words you give it about your relationship. It drops you into the same nine pages with those fields filled, so you are editing rather than starting from a blank form. The video takes the manual path because it shows every field.",
      },
      {
        q: "Can I change the music?",
        a: "The Music room ships with a playlist. It is her side of the page rather than a builder field, so it is not part of the wizard.",
      },
      {
        q: "What is the difference between the love message and the wish card?",
        a: "Placement, and so tone. The love message is on the home page — the first thing she reads. The wish card is behind the Wish tab, so she finds it herself. Most people make the second one more private than the first.",
      },
      {
        q: "How long does the whole thing take?",
        a: "About ten minutes if you have the photos ready. It is longer than the other templates because there is genuinely more in it — the gallery letters and the quiz are where the time goes.",
      },
    ],

    relatedBlogSlugs: [],
    relatedGuideSlugs: ["love-gf"],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // Love GF
  // ───────────────────────────────────────────────────────────────────────────
  {
    slug: "love-gf",
    templateHref: "/love-gf",
    templateName: "Love Page",
    title: "Build the Love Page — a paper board she can pin through",
    tagline: "Polaroids, pressed flowers, and six rooms behind them",
    summary:
      "A crumpled-paper board with your photos pinned to it as polaroids, and six rooms behind the rail — Home, Wish, Photos, Music, Games, Notes. You fill it through a nine-page wizard. Four photos go on the board itself, ten more into the gallery with a love letter on each, and the Games room holds a quiz you write, truth-or-dare, and your story.",
    category: "love",
    emoji: "🤍",
    accent: "#a1785a",
    buildTime: "About 10 minutes",
    updatedAt: "2026-08-26",

    video: {
      seconds: 90,
      recordedAt: "2026-08-26",
      silent: true,
      // Read off the recording, not estimated — the cut stamps a "STEP n OF 14"
      // chip, so one frame per second gives the exact second each step starts.
      // Step 2's on-screen heading is the page's own handwritten "love you!",
      // which is the fixed header leaking through on a page with no new
      // prominent line of its own; the label below says what is actually being
      // filled in instead.
      chapters: [
        { at: 0,  label: "The page she opens" },
        { at: 4,  label: "Open the builder, and fill it in yourself", sectionId: "open" },
        { at: 11, label: "Their name, your name, your date",          sectionId: "names" },
        { at: 16, label: "The love message",                          sectionId: "message" },
        { at: 19, label: "The wish card",                             sectionId: "wish" },
        { at: 22, label: "Four photos for the board",                 sectionId: "home-photos" },
        { at: 25, label: "Gallery photos",                            sectionId: "gallery" },
        { at: 28, label: "A love letter on each one",                 sectionId: "gallery" },
        { at: 32, label: "Quiz questions",                            sectionId: "quiz" },
        { at: 35, label: "Truth & Dare",                              sectionId: "games" },
        { at: 38, label: "The share photo",                           sectionId: "share-photo" },
        { at: 40, label: "Save the page",                             sectionId: "save" },
        { at: 47, label: "What she sees — all six rooms",             sectionId: "recipient" },
        { at: 66, label: "Publish it",                                sectionId: "publish" },
        { at: 73, label: "Link, QR, print",                           sectionId: "share" },
        { at: 87, label: "Done" },
      ],
    },

    sections: [
      {
        id: "open",
        title: "Open the builder — and choose how to fill it",
        intro:
          "The page opens as a finished sample so you can wander it first. Edit sits at the foot of the left rail, not in a top bar.",
        steps: [
          {
            title: "Press Edit, bottom-left",
            body:
              "This is a dashboard rather than a card, so its controls live at the foot of the rail you are standing in.",
            shot: "step-01.webp",
            shotAlt: "The Love Page board: crumpled paper, a pinned polaroid, and the handwritten love-you note",
          },
          {
            title: "Then pick AI Magic or Write yourself",
            body:
              "AI Magic writes the messages, captions and quiz from a few words about your relationship. Write yourself opens the nine-page form.",
            shot: "step-02.webp",
            shotAlt: "The choice between AI Magic and Write yourself",
            note:
              "This guide follows Write yourself, and so does the video, because that is the path that shows every field. AI Magic lands you in the same nine pages with the words filled in — everything below still applies, you are just editing rather than typing from nothing.",
          },
          {
            title: "The strip along the top is a progress bar, not a menu",
            body:
              "Names · Message · Wish · Photos · Gallery · Quiz · Games · Share · Finish shows where you are. You move with Next and Back; clicking the strip does nothing.",
          },
        ],
      },
      {
        id: "names",
        title: "Names, and the date you count from",
        steps: [
          {
            title: "Their name is the only required field",
            body:
              "It is what the page is addressed to and what the share link previews with. Everything else in the wizard can wait.",
            shot: "step-03.webp",
            shotAlt: "The Names page: their name, your name and an optional special date",
          },
        ],
      },
      {
        id: "message",
        title: "The love message",
        steps: [
          {
            title: "The paragraph on the home board",
            body: "The first thing she reads once she is past the photos.",
            shot: "step-04.webp",
            shotAlt: "The Love Message page with its text area",
          },
        ],
      },
      {
        id: "wish",
        title: "The wish card",
        steps: [
          {
            title: "A second, quieter note",
            body:
              "This one lives behind the Wish tab rather than on the board, so it is the one she finds rather than the one she is handed. Worth making it the more private of the two.",
            shot: "step-05.webp",
            shotAlt: "The Wish Card page",
          },
        ],
      },
      {
        id: "home-photos",
        title: "Four photos for the board",
        steps: [
          {
            title: "These become the polaroids",
            body:
              "Up to four, and they are pinned to the paper board as polaroid cards at angles — the first thing she sees. Tap any one to crop and zoom it.",
            shot: "step-06.webp",
            shotAlt: "The Home Photos page: four polaroid slots",
            note:
              "Four, not one. If you have come from the Darling guide, note the difference — Darling puts a single photo in a circle, this one builds a board out of four.",
          },
        ],
      },
      {
        id: "gallery",
        title: "Gallery photos, and a letter on each",
        steps: [
          {
            title: "Up to ten more",
            body:
              "These live behind the Photos tab rather than on the board. Every one takes its own love letter, so the gallery reads as a sequence of moments rather than an album.",
            shot: "step-07.webp",
            shotAlt: "The Gallery Photos page, empty, with the add control",
            note:
              "Ten is the ceiling, not the target. Six photos each with a real sentence beats ten captioned “us ❤️”.",
          },
        ],
      },
      {
        id: "quiz",
        title: "Quiz questions",
        steps: [
          {
            title: "Three arrive already written",
            body:
              "So the Games room works even if you skip this page. Replace them with ones only she could answer.",
            shot: "step-08.webp",
            shotAlt: "The Quiz Questions page with three default questions",
          },
          {
            title: "There is a library of thirty",
            body: "Browse it if you are stuck, or write your own — up to ten in total.",
          },
        ],
      },
      {
        id: "games",
        title: "Truth & Dare",
        steps: [
          {
            title: "Two lists, picked from a library",
            body:
              "Truth and Dare are separate tabs. Tap + on anything in the library, or write your own with Custom Truth / Custom Dare.",
            shot: "step-09.webp",
            shotAlt: "The Truth & Dare page with the Truth library open",
            note:
              "What you pick mixes with the built-in defaults rather than replacing them, so adding two of your own does not leave her with a two-question game.",
          },
        ],
      },
      {
        id: "share-photo",
        title: "The share photo",
        steps: [
          {
            title: "The image on the link itself",
            body:
              "What appears when the link is pasted into WhatsApp or Instagram — seen before the page even opens.",
            shot: "step-10.webp",
            shotAlt: "The Share Photo page, with its Skip button",
            note:
              "The button here says Skip rather than Next, which is the honest label: leave it empty and the link still works, it just previews with the default artwork.",
          },
        ],
      },
      {
        id: "save",
        title: "Save the page",
        steps: [
          {
            title: "Check the summary line first",
            body:
              "The card at the top counts what you actually filled — home photo, gallery photos, quiz questions, truth/dare. The fastest way to catch a page you meant to fill and skipped.",
            shot: "step-11.webp",
            shotAlt: "The Save page: the summary of what has been filled, and the optional password",
          },
          {
            title: "Password is optional",
            body:
              "Set it and only someone with the word can open the page. Saving does not publish — you publish from the main page afterwards.",
          },
        ],
      },
      {
        id: "recipient",
        title: "What she sees — all six rooms",
        intro:
          "The rail is her navigation, so the tour is the rail. Quickest understood by watching from 00:47.",
        steps: [
          {
            title: "The board first",
            body:
              "Home is the paper board: your four polaroids, the pressed flowers, the handwritten note, your message.",
            shot: "step-12.webp",
            shotAlt: "The saved board with four polaroids pinned to it, Publish now in the rail",
          },
          {
            title: "Then Wish, Photos, Music, Games, Notes",
            body:
              "Wish holds the wish card. Photos is the gallery, one love letter at a time. Music is the playlist. Notes is where she writes back.",
          },
          {
            title: "Games holds three, not one",
            body:
              "Love Quiz — the questions you wrote. Truth or Dare. And Our Story, which walks your moments together. The quiz runs ten questions with a score.",
            shot: "step-13.webp",
            shotAlt: "The Games room: Love Quiz, Truth or Dare and Our Story, with a quiz question showing",
          },
        ],
      },
      {
        id: "publish",
        title: "Publish",
        steps: [
          {
            title: "Publish appears once you have saved",
            body:
              "Saving puts a Publish button in the rail under Edit. Until then there is nothing to publish.",
          },
          {
            title: "Signed out, you sign in here",
            body:
              "The page publishes immediately afterwards — nothing you filled in is asked for twice.",
            shot: "step-14.webp",
            shotAlt: "Pressing Publish while signed out brings up the sign-in sheet",
            note:
              "On a phone the Google button is a full-page redirect. Let it come back on its own; closing the tab part-way means the publish never completes.",
          },
        ],
      },
      {
        id: "share",
        title: "Link, QR, print",
        steps: [
          {
            title: "Three ways to hand it over",
            body:
              "Copy the link, show the QR if she is with you, or print the card. The QR opens the page — it is not a payment code.",
          },
          {
            title: "You can keep editing afterwards",
            body:
              "Profile → My Creations → the card → Edit. The link does not change, so anything you add later reaches her without sending a new one.",
          },
        ],
      },
    ],

    faqs: [
      {
        q: "What is the difference between this and the Darling page?",
        a: "Same nine-page wizard, genuinely different result. This one is a crumpled-paper board with four photos pinned to it as polaroids; Darling is a dark velvet page with a single photo in a circle and a live count of your time together. This one's Games room holds three games — Love Quiz, Truth or Dare and Our Story — and its home is the board itself. Pick on which one looks like her.",
      },
      {
        q: "How many photos can I add in total?",
        a: "Fourteen. Four go on the board as polaroids, and up to ten more into the gallery behind the Photos tab, each with its own love letter.",
      },
      {
        q: "Do I have to fill in all nine pages?",
        a: "No. Their name is the only required field, and the quiz arrives with three questions already written. Every other page can be skipped — the summary on the Save page tells you what you left empty.",
      },
      {
        q: "Does saving publish it?",
        a: "No. Save shows you the finished page in preview; a Publish button then appears in the rail. That is deliberate — it gives you a look at the whole thing before anyone else can see it.",
      },
      {
        q: "How long does the whole thing take?",
        a: "About ten minutes with the photos ready. The gallery letters and the quiz are where the time actually goes.",
      },
    ],

    relatedBlogSlugs: [],
    relatedGuideSlugs: ["darling", "bouquet-gf"],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // Birthday GF
  // ───────────────────────────────────────────────────────────────────────────
  {
    slug: "birthday-gf",
    templateHref: "/birthday-gf",
    templateName: "Birthday Page",
    title: "Build the Birthday page — five rooms and a scratch card",
    tagline: "Ten wizard pages, a playlist, and a surprise she scratches open",
    summary:
      "A pressed-flower board with her photos taped to it, and five rooms behind the rail — Home, Gallery, Songs, Games, Surprise. Ten wizard pages fill it: two messages, three placed photos, a gallery, a playlist, a quiz, truth-or-dare, and a scratch-to-reveal surprise card that can carry your voice.",
    category: "birthday",
    emoji: "🎂",
    accent: "#b06a4a",
    buildTime: "About 12 minutes",
    updatedAt: "2026-08-26",

    video: {
      seconds: 90,
      recordedAt: "2026-08-26",
      silent: true,
      // Read off the recording: the cut stamps "STEP n OF 14", so one frame per
      // second gives the exact second each step starts.
      chapters: [
        { at: 0,  label: "The page she opens" },
        { at: 4,  label: "Open the builder, and fill it in yourself", sectionId: "open" },
        { at: 11, label: "Her name, your name, the birthday",         sectionId: "names" },
        { at: 16, label: "The wish and the personal message",         sectionId: "messages" },
        { at: 21, label: "Three photos for the board",                sectionId: "home-photos" },
        { at: 24, label: "Gallery photos",                            sectionId: "gallery" },
        { at: 27, label: "The playlist",                              sectionId: "songs" },
        { at: 29, label: "Quiz questions",                            sectionId: "quiz" },
        { at: 32, label: "Truth & Dare",                              sectionId: "games" },
        { at: 35, label: "The surprise card",                         sectionId: "surprise" },
        { at: 40, label: "The share photo",                           sectionId: "share-photo" },
        { at: 42, label: "Save the page",                             sectionId: "save" },
        { at: 49, label: "What she sees — all five rooms",            sectionId: "recipient" },
        { at: 66, label: "Publish it",                                sectionId: "publish" },
        { at: 72, label: "Link, QR, print",                           sectionId: "share" },
        { at: 87, label: "Done" },
      ],
    },

    sections: [
      {
        id: "open",
        title: "Open the builder",
        intro: "The page opens as a finished sample. Edit sits at the foot of the left rail.",
        steps: [
          {
            title: "Press Edit, bottom-left",
            body:
              "A dashboard rather than a card, so the controls live at the foot of the rail rather than in a top bar.",
            shot: "step-01.webp",
            shotAlt: "The Birthday board: five rooms in the rail, taped photos, pressed flowers",
          },
          {
            title: "Then pick AI Magic or Write Manually",
            body:
              "AI Magic writes the wishes, messages and quiz from a few words about her. Write Manually opens the ten-page form.",
            shot: "step-02.webp",
            shotAlt: "The choice between AI Magic and Write Manually",
            note:
              "This guide and the video both take the manual path, because it is the one that shows every field. AI Magic lands you in the same ten pages with the words filled in.",
          },
        ],
      },
      {
        id: "names",
        title: "Her name, your name, the birthday",
        steps: [
          {
            title: "Only her name is required",
            body:
              "It is what the page is addressed to and what the share link previews with. The birthday date is optional but worth setting — it is what makes the page a birthday page rather than a card.",
            shot: "step-03.webp",
            shotAlt: "Birthday Details: their name, your name and the birthday date",
          },
        ],
      },
      {
        id: "messages",
        title: "The wish and the personal message",
        steps: [
          {
            title: "Two fields, deliberately",
            body:
              "The birthday wish is the public one — the line anyone would be happy to read over her shoulder. The personal message is the one meant only for her. Writing the same thing twice wastes the second.",
            shot: "step-04.webp",
            shotAlt: "Birthday Messages: the birthday wish and the personal message",
          },
        ],
      },
      {
        id: "home-photos",
        title: "Three photos for the board",
        steps: [
          {
            title: "Each has its own place",
            body:
              "Main cover photo, top-right photo, bottom-left photo — named positions rather than a grid, because the board tapes them down at set angles. The cover is the large one.",
            shot: "step-05.webp",
            shotAlt: "Home Photos: three named slots — cover, top-right, bottom-left",
          },
        ],
      },
      {
        id: "gallery",
        title: "Gallery photos",
        steps: [
          {
            title: "Up to eight more",
            body: "Behind the Gallery tab. Tap any one to adjust how it sits in its frame.",
            shot: "step-06.webp",
            shotAlt: "The Gallery Photos page, empty, with the add control",
          },
        ],
      },
      {
        id: "songs",
        title: "The playlist",
        steps: [
          {
            title: "Five birthday tracks, already chosen",
            body:
              "Celebration, Best Day of My Life, Dynamite, Firework, Good Time. They fill the Songs room, so it works without you touching this page.",
            shot: "step-07.webp",
            shotAlt: "The Songs page: the five-track birthday playlist",
          },
        ],
      },
      {
        id: "quiz",
        title: "Quiz questions",
        steps: [
          {
            title: "Three arrive written, up to ten",
            body:
              "About the birthday person — her favourite colour, the dessert she would pick, the superpower she would choose. Each opens to let you set the answers.",
            shot: "step-08.webp",
            shotAlt: "Quiz Questions with three defaults",
          },
        ],
      },
      {
        id: "games",
        title: "Truth & Dare",
        steps: [
          {
            title: "Three of each already picked",
            body:
              "Truth and Dare are separate tabs, each starting with three selected and a library below to add from. You can write your own.",
            shot: "step-09.webp",
            shotAlt: "Truth & Dare: three truths selected, the library below",
          },
        ],
      },
      {
        id: "surprise",
        title: "The surprise card",
        intro: "The one page here that has no equivalent on the other templates.",
        steps: [
          {
            title: "A photo and a voice note she scratches to reveal",
            body:
              "Add either and she gets a scratch-off card. The audio field is the interesting one — record yourself singing Happy Birthday rather than uploading a track.",
            shot: "step-10.webp",
            shotAlt: "The Surprise Card page: an optional photo and an optional voice note",
            note:
              "Leave both empty and the Surprise tab does not appear at all — the page tells you so on this screen. So this is not a section she will find half-finished; it is either there or it is not.",
          },
        ],
      },
      {
        id: "share-photo",
        title: "The share photo",
        steps: [
          {
            title: "The image on the link",
            body:
              "What shows when the link is pasted into WhatsApp or Instagram. The button says Skip, which is honest — leave it and the link still works.",
            shot: "step-11.webp",
            shotAlt: "The Share Photo page, with its Skip button",
          },
        ],
      },
      {
        id: "save",
        title: "Save the page",
        steps: [
          {
            title: "Password optional, then preview",
            body:
              "Saving does not publish. It shows you her version first, and a Publish button then appears in the rail.",
            shot: "step-12.webp",
            shotAlt: "Save Your Page: the optional password field",
          },
        ],
      },
      {
        id: "recipient",
        title: "What she sees — all five rooms",
        intro: "The rail is her navigation. Fastest understood by watching from 00:49.",
        steps: [
          {
            title: "Home, Gallery, Songs, Games, Surprise",
            body:
              "Home is the board with your three photos and the wish. Gallery is the rest. Songs is the playlist. Games holds the quiz and truth-or-dare. Surprise is the scratch card — if you filled it.",
            shot: "step-13.webp",
            shotAlt: "The saved birthday board with her photos in place, Publish now in the rail",
          },
        ],
      },
      {
        id: "publish",
        title: "Publish",
        steps: [
          {
            title: "Signed out, you sign in here",
            body:
              "The page publishes immediately afterwards — nothing you filled in is asked for twice.",
            shot: "step-14.webp",
            shotAlt: "Pressing Publish while signed out brings up the sign-in sheet",
            note:
              "On a phone the Google button is a full-page redirect. Let it come back on its own; closing the tab part-way means the publish never completes.",
          },
        ],
      },
      {
        id: "share",
        title: "Link, QR, print",
        steps: [
          {
            title: "Three ways to hand it over",
            body:
              "Copy the link, show the QR if you are with her, or print the card. The QR opens the page.",
          },
          {
            title: "You can keep editing afterwards",
            body:
              "Profile → My Creations → the card → Edit. The link does not change, so a photo added later still reaches her.",
          },
        ],
      },
    ],

    faqs: [
      {
        q: "Why has the Surprise tab not appeared on my page?",
        a: "Because the surprise card is empty. The tab only shows if you added a photo or a voice note to it — the builder says so on that page. Go back to Edit → Surprise and add either one.",
      },
      {
        q: "Can I record my own voice instead of uploading a song?",
        a: "Yes, and that is what the field is for. Record yourself singing Happy Birthday and it goes behind the scratch card.",
      },
      {
        q: "How many photos in total?",
        a: "Eleven. Three are placed on the board — cover, top-right, bottom-left — and up to eight more go into the gallery.",
      },
      {
        q: "Can I change the playlist?",
        a: "The five birthday tracks are chosen for you and fill the Songs room. They are what makes that room work without any effort from you.",
      },
      {
        q: "How long does the whole thing take?",
        a: "About twelve minutes with the photos ready. It has more pages than the other templates — the quiz answers and the surprise card are where the time goes.",
      },
    ],

    relatedBlogSlugs: [],
    relatedGuideSlugs: ["love-gf", "darling"],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // Bouquet GF
  // ───────────────────────────────────────────────────────────────────────────
  {
    slug: "bouquet-gf",
    templateHref: "/bouquet-gf",
    templateName: "Bouquet",
    title: "Design a bouquet — twelve blooms, each one meaning something",
    tagline: "Four steps, no rooms to fill, about three minutes",
    summary:
      "The shortest build on the site, and the only one that is not a dashboard. You pick six to ten blooms from twelve that each carry a meaning, shuffle the arrangement until it looks right, write the card, and optionally attach a Deed of Devotion — a mock contract of clauses you are signing up to. She taps once to unwrap it.",
    category: "love",
    emoji: "💐",
    accent: "#c2569b",
    buildTime: "About 3 minutes",
    updatedAt: "2026-08-26",

    video: {
      seconds: 90,
      recordedAt: "2026-08-26",
      silent: true,
      // Eight steps, not the fourteen the dashboard templates run to — read off
      // the recording's "STEP n OF 8" chip a frame at a time.
      chapters: [
        { at: 0,  label: "The bouquet she opens" },
        { at: 6,  label: "Open the builder",                sectionId: "open" },
        { at: 15, label: "Pick your blooms",                sectionId: "blooms" },
        { at: 19, label: "Style the arrangement",           sectionId: "style" },
        { at: 23, label: "Write the card",                  sectionId: "card" },
        { at: 32, label: "The Deed of Devotion",            sectionId: "deed" },
        { at: 42, label: "Save it",                         sectionId: "save" },
        { at: 45, label: "What she actually sees",          sectionId: "recipient" },
        { at: 56, label: "Publish it",                      sectionId: "publish" },
        { at: 65, label: "Link, QR, print",                 sectionId: "share" },
        { at: 86, label: "Done" },
      ],
    },

    sections: [
      {
        id: "open",
        title: "Open the builder",
        intro:
          "This one is not a dashboard. There is no rail and there are no rooms — the whole thing is one bouquet, and the builder is four steps.",
        steps: [
          {
            title: "Press Create, top-right",
            body:
              "Note the difference from the other templates: Create sits in the top bar here, not Edit at the foot of a rail, because there is no rail to put it in.",
            shot: "step-01.webp",
            shotAlt: "The finished bouquet with its tap-to-open button",
          },
          {
            title: "There is no AI option, and it does not need one",
            body:
              "The other templates offer to write your messages. This one goes straight to picking flowers — there is only one piece of writing in the whole build, and it is the card.",
          },
        ],
      },
      {
        id: "blooms",
        title: "Pick your blooms",
        steps: [
          {
            title: "Six to ten, from twelve",
            body:
              "Tap to add, tap the minus to remove. The counter at the top holds you between six and ten — fewer looks sparse, more stops reading as a bouquet.",
            shot: "step-02.webp",
            shotAlt: "The Pick your blooms step, with the colour and black-and-white choice",
          },
          {
            title: "Every flower carries a meaning",
            body:
              "Rose is love and passion, tulip is perfect love, peony is romance, sunflower is adoration, lily is purity, daisy is innocence, orchid is beauty, dahlia is elegance, anemone is anticipation, carnation is fascination, zinnia is lasting affection, ranunculus is radiant charm. They are printed under each one, and she sees them too.",
            shot: "step-03.webp",
            shotAlt: "The twelve blooms with their meanings and the counts picked",
            note:
              "This is the whole point of the template, and the easiest thing to skip past. Picking by meaning rather than by colour is what makes the bouquet say something.",
          },
          {
            title: "Colour or black & white",
            body:
              "Black and white renders the same blooms as ink drawings. Worth a look before you settle — it reads as older and quieter.",
          },
        ],
      },
      {
        id: "style",
        title: "Style the arrangement",
        steps: [
          {
            title: "Shuffle until it sits right",
            body:
              "New arrangement re-lays the same flowers; Change greenery swaps the leaves behind them. You are not placing stems by hand — you are re-rolling until one looks good.",
            shot: "step-04.webp",
            shotAlt: "Style your bouquet, with the new-arrangement and change-greenery controls",
          },
        ],
      },
      {
        id: "card",
        title: "Write the card",
        steps: [
          {
            title: "Who it is for, what you want to say, and from",
            body:
              "The only writing in the build. It arrives with a message already in it, which is a fine skeleton but says nothing only you would say.",
            shot: "step-05.webp",
            shotAlt: "The Write the card step: who it is for, the message, and from",
          },
        ],
      },
      {
        id: "deed",
        title: "The Deed of Devotion",
        steps: [
          {
            title: "A mock contract, and it can be switched off",
            body:
              "Numbered clauses in the register of a legal deed — “1× unlimited forehead kisses, on demand”, “first and last text of every single day”, “shared fries, always — no negotiation”. Add your own, or toggle the whole thing off if it is not your tone.",
            shot: "step-06.webp",
            shotAlt: "The Deed of Devotion: the toggle, the numbered clauses, and the optional password",
            note:
              "The clauses work when they are small and specific. A clause that promises to love her forever is not funny and not a promise; one about fries is both.",
          },
          {
            title: "Password, if you want one",
            body: "Optional, on this same page. Set it and only someone with the word can open the bouquet.",
          },
        ],
      },
      {
        id: "save",
        title: "Save it",
        steps: [
          {
            title: "Save & preview",
            body:
              "Shows you the finished bouquet before anything is published, and the top bar changes to Edit and Send it.",
            shot: "step-07.webp",
            shotAlt: "The saved bouquet, with Edit and Send it now in the top bar",
          },
        ],
      },
      {
        id: "recipient",
        title: "What she actually sees",
        steps: [
          {
            title: "One tap, and it unwraps",
            body:
              "She gets the wrapped bouquet with your name on it and a single tap to open. Then the flowers, their meanings, your card, and the deed if you attached one. No rooms, no navigation — it is over in a minute, and that is the point of it.",
          },
        ],
      },
      {
        id: "publish",
        title: "Publish",
        steps: [
          {
            title: "Send it, and sign in if you are signed out",
            body:
              "The bouquet publishes immediately afterwards. Nothing you built is asked for twice.",
            shot: "step-08.webp",
            shotAlt: "Pressing Send it while signed out brings up the sign-in sheet",
          },
        ],
      },
      {
        id: "share",
        title: "Link, QR, print",
        steps: [
          {
            title: "Three ways to hand it over",
            body:
              "Copy the link, show the QR, or print the card. The QR opens the bouquet.",
          },
        ],
      },
    ],

    faqs: [
      {
        q: "Why is this so much shorter than the other guides?",
        a: "Because the template is. Bouquet is four steps and about three minutes; the Darling, Love Page and Birthday templates are nine or ten wizard pages and around ten. If you want something to arrive today rather than something she explores for twenty minutes, this is the one.",
      },
      {
        q: "Do the flower meanings actually show on her page?",
        a: "Yes. They are printed under each bloom in the builder and she sees them too, which is why picking by meaning is worth the extra minute.",
      },
      {
        q: "Can I arrange the flowers myself?",
        a: "Not stem by stem. New arrangement re-lays the ones you picked and Change greenery swaps the foliage — you re-roll until one looks right rather than placing anything by hand.",
      },
      {
        q: "What is the Deed of Devotion, and can I leave it out?",
        a: "A mock contract of small promises, written in legal register for the joke. It is a toggle on the last step — switch it off and the bouquet arrives with just the card.",
      },
      {
        q: "Is there an AI option like the other templates?",
        a: "No, and it would have little to do. The only writing in the whole build is the card, and it already arrives with a draft in it.",
      },
    ],

    relatedBlogSlugs: [],
    relatedGuideSlugs: ["love-gf", "darling"],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // Miss You — long-distance letter
  //
  // The first of two templates that are NOT dashboards. There is no rail and no
  // paged wizard: Create opens one long form, and Save & Preview is at the foot
  // of it. Worth saying plainly in the guide, because someone who has built a
  // Darling or a Birthday page will look for a Next button that is not there.
  // ───────────────────────────────────────────────────────────────────────────
  {
    slug: "missyou-gf",
    templateHref: "/missyou-gf",
    templateName: "Miss You",
    title: "Build a Miss You letter that asks her something back",
    tagline: "One long form, no wizard — and a page that collects her answers",
    summary:
      "A letter for the distance: how long it has been, the two cities and the kilometres between them, a secret behind a scratch card, and a set of Open when… envelopes she keeps for the days that need them. The last section is the one nobody expects — four questions the page asks her, and her answers save back to you.",
    category: "love",
    emoji: "🌙",
    accent: "#b8395f",
    buildTime: "About 7 minutes",
    updatedAt: "2026-08-27",

    video: {
      seconds: 90,
      recordedAt: "2026-08-27",
      silent: true,
      // Timings read off the recording's own "STEP n OF 12" chip and the title
      // it prints over each region, a frame at a time. The chip counts twelve
      // steps; the sections below are the same twelve, which is why the rail
      // and the written guide agree without a lookup table.
      chapters: [
        { at: 0,  label: "The letter she opens" },
        { at: 4,  label: "Open the builder",              sectionId: "open" },
        { at: 7,  label: "Fill it in yourself",           sectionId: "open" },
        { at: 11, label: "Build your letter",             sectionId: "letter" },
        { at: 16, label: "Time apart & distance",         sectionId: "distance" },
        { at: 19, label: "A secret",                      sectionId: "secret" },
        { at: 23, label: "Open when… notes",              sectionId: "open-when" },
        { at: 26, label: "Remember-us quiz",              sectionId: "quiz" },
        { at: 30, label: "Accent tint & password",        sectionId: "tint" },
        { at: 33, label: "Pick the song",                 sectionId: "song" },
        { at: 37, label: "Save it",                       sectionId: "save" },
        { at: 40, label: "What she actually sees",        sectionId: "recipient" },
        { at: 43, label: "For your eyes only",            sectionId: "recipient" },
        { at: 46, label: "The hug button",                sectionId: "recipient" },
        { at: 50, label: "The scratch card",              sectionId: "recipient" },
        { at: 53, label: "One silly question",            sectionId: "recipient" },
        { at: 56, label: "Letters for later",             sectionId: "recipient" },
        { at: 59, label: "Memory lane, as she sees it",   sectionId: "recipient" },
        { at: 63, label: "Our love map",                  sectionId: "recipient" },
        { at: 66, label: "Publish it",                    sectionId: "publish" },
        { at: 73, label: "Link, QR, print",               sectionId: "share" },
        { at: 88, label: "Done" },
      ],
    },

    sections: [
      {
        id: "open",
        title: "Open the builder",
        intro:
          "Create is in the top bar, not Edit at the foot of a rail — this template has no rail. What opens is a single scrolling form, and the button that finishes it is Save & Preview at the very bottom.",
        steps: [
          {
            title: "Press Create, top-right",
            body:
              "The page you are looking at first is the demo, already filled in with someone else's words. Nothing you do to it is saved until you press Save & Preview.",
            shot: "step-01.webp",
            shotAlt: "The finished Miss You letter with Create in the top bar",
          },
          {
            title: "Write it for me, or fill it in yourself",
            body:
              "Two doors. Write it for me takes a couple of sentences about the two of you and drafts every field; I'll fill it in myself goes straight to the form. Either way every word stays editable afterwards.",
            shot: "step-02.webp",
            shotAlt: "The choice between Write it for me and I'll fill it in myself",
            note:
              "The AI draft is a decent skeleton and a poor letter. It cannot know the name of the stall where the chai tasted right. Use it to get past the blank page, then replace the specifics.",
          },
          {
            title: "There are no Next buttons — scroll",
            body:
              "If you have built a Darling or Birthday page you will look for a wizard here and not find one. Everything is on one page, top to bottom, and nothing is lost by scrolling past a section you want to come back to.",
          },
        ],
      },
      {
        id: "letter",
        title: "Build your letter",
        steps: [
          {
            title: "Names, pet-name, cover line",
            body:
              "Your name is the only required field on the whole form. Pet-name is what she is called throughout the page — “my moon” in the demo — and the cover line is the small italic above the headline.",
            shot: "step-03.webp",
            shotAlt: "Your name, their name, pet-name, cover line, the letter body and signature",
          },
          {
            title: "The letter itself",
            body:
              "This is the body of the page and it deserves the most time. Write it in the second person, to her, and keep the small concrete things — a stall, a song, a rooftop. Signature is the line above your name.",
          },
          {
            title: "A voice note, if you want one",
            body:
              "Record voice note captures straight from the browser; Upload audio takes a file. Optional, and easy to miss — it sits directly under the signature.",
            note:
              "Thirty seconds of your actual voice does more here than another paragraph. It is also the one part of the page she cannot re-read in your handwriting later, so it lands differently.",
          },
        ],
      },
      {
        id: "distance",
        title: "Time apart & distance",
        steps: [
          {
            title: "Missing you since",
            body:
              "A date and a time. It drives the live counter on her page — days, hours, minutes, seconds, ticking while she reads.",
            shot: "step-04.webp",
            shotAlt: "Missing you since, your city and their city, reunion date, and the km/mi toggle",
          },
          {
            title: "Two cities, and the kilometres between them",
            body:
              "Your city and their city are dropdowns, and the page works the distance out from them. Set the units with the km / mi pair beside the reunion date.",
            note:
              "The distance is the quietest thing on the page and the one that tends to land. It only works if both cities are actually set — leave one empty and the line simply does not appear.",
          },
          {
            title: "Reunion date, if you have one",
            body:
              "Optional. Set it and the counter gains a second half counting down instead of up. Leave it empty if the date is not real yet — a made-up one reads as a made-up one.",
          },
        ],
      },
      {
        id: "memories",
        title: "Our memory lane",
        intro:
          "No chapter marker for this one — the recording keeps the same title over it as the region above, so there is no honest timestamp to link to. It sits between Time apart & distance and A secret in the form.",
        steps: [
          {
            title: "Six captions, each with a photo slot",
            body:
              "The camera square to the left of each line takes the picture; the line beside it is the caption. They arrive as a numbered zigzag on her page, alternating left and right.",
            shot: "step-05.webp",
            shotAlt: "The memory lane rows, A secret, and the first Open when… note",
          },
          {
            title: "Captions beat titles",
            body:
              "“the rooftop, 2am ✨” tells her which night. “Good times” tells her nothing. Add or remove rows freely — there is no fixed count.",
          },
        ],
      },
      {
        id: "secret",
        title: "A secret",
        steps: [
          {
            title: "One field, and it arrives hidden",
            body:
              "Whatever you write here is covered on her page by a scratch card she has to drag across to uncover. Nothing tells you that in the builder, which is why it is worth knowing before you write it.",
            note:
              "Write something that earns the scratching. A line she has not heard from you before is the right size; a compliment she has heard a hundred times is not.",
          },
        ],
      },
      {
        id: "open-when",
        title: "Open when… notes",
        intro:
          "The part of this template people come back for. Each note is a sealed envelope on her page that she opens on the day it is for.",
        steps: [
          {
            title: "A title and a note, as many as you like",
            body:
              "The title is the occasion — “open when you can't sleep”, “open when we're finally together” — and the body is the letter inside it. Add note adds another.",
          },
          {
            title: "Four is plenty; ten is a chore",
            body:
              "She has to have a reason to open each one. Write for the days you can actually picture her having, and stop there.",
          },
        ],
      },
      {
        id: "quiz",
        title: "Remember-us quiz",
        steps: [
          {
            title: "Three fields per card, not two",
            body:
              "The question, the answer, and then a third line — the thing you tell her once she has answered. That last field is what makes the quiz worth playing; skip it and the card just marks her right.",
            shot: "step-06.webp",
            shotAlt: "A quiz card: the question, the answer, and the line she gets afterwards",
          },
          {
            title: "Ask things only she can answer",
            body:
              "“Where was our first date?” works. “What is my favourite colour?” is a trivia question about you, and she will resent getting it wrong.",
          },
        ],
      },
      {
        id: "song",
        title: "Pick the song",
        steps: [
          {
            title: "A short list, or your own",
            body:
              "Six built-in tracks with a preview each, or Upload a song for a file and Paste a link for something hosted elsewhere. Your own song ✓ appears at the bottom of the list once you have set one.",
            shot: "step-07.webp",
            shotAlt: "The song list, the accent tint pair, the password field and Save & Preview",
          },
          {
            title: "Her browser will not autoplay it",
            body:
              "The page opens muted with a tap-for-sound control in the corner — that is the browser's rule, not a setting you can change. Assume she reads the first screen in silence.",
          },
        ],
      },
      {
        id: "tint",
        title: "Accent tint & password",
        steps: [
          {
            title: "Rose or Blush",
            body:
              "Two tints, and the difference is real rather than decorative: Rose is the deeper, more serious one; Blush is lighter and reads younger.",
          },
          {
            title: "A password, if it is that kind of letter",
            body:
              "Optional, directly under the tint. Set it and the page asks for the word before it shows anything. Leave it empty and the link is the only key.",
          },
        ],
      },
      {
        id: "save",
        title: "Save it",
        steps: [
          {
            title: "Save & Preview, at the foot of the form",
            body:
              "Nothing is published yet. The form closes, the finished letter appears, and the top bar changes to Edit and Publish.",
            shot: "step-08.webp",
            shotAlt: "The saved letter, with Edit and Publish now in the top bar",
          },
        ],
      },
      {
        id: "recipient",
        title: "What she actually sees",
        intro:
          "Seven numbered sections, top to bottom. Walk it once before you send it — a section you left empty simply is not there, and it is easier to notice now than after.",
        steps: [
          {
            title: "02 · A squeeze — and it counts",
            body:
              "A send-a-hug button with a running total underneath. It is not decoration: the count persists, so she can press it at 3am and you can see that she did.",
            shot: "step-09.webp",
            shotAlt: "The hug button with five hugs shared so far",
          },
          {
            title: "03 · A little coupon — the scratch card",
            body:
              "This is where A secret ends up. She drags a finger across the card to uncover it.",
            shot: "step-10.webp",
            shotAlt: "The scratch card covering the secret",
          },
          {
            title: "04 · One silly question, and this-or-that",
            body:
              "A yes/no she answers, and a pair of choices where both of you get a column — your pick and hers, side by side.",
          },
          {
            title: "05 · Open when… — letters for later",
            body:
              "One sealed envelope per note, each with Tap to open under the title. She is not meant to open them all today, and the page does not push her to.",
            shot: "step-11.webp",
            shotAlt: "The Open when… envelopes, one per note",
          },
          {
            title: "07 · Our love map — she answers back",
            body:
              "Four boxes for her: your favourite foods, what's weighing on you lately, dreams to chase together, dates that matter — and a save my answers button under them. This is the only section of any template on the site that collects something from the person receiving it.",
            shot: "step-12.webp",
            shotAlt: "Our love map — four questions for her and the save-my-answers button",
            note:
              "In preview it says “preview mode · it saves for real once you share it”, so testing it yourself will not save anything. It starts collecting once the page is published and sent.",
          },
        ],
      },
      {
        id: "publish",
        title: "Publish",
        steps: [
          {
            title: "Publish, and sign in if you are signed out",
            body:
              "The page goes live straight after you sign in — nothing you built is asked for a second time.",
            shot: "step-13.webp",
            shotAlt: "Pressing Publish while signed out brings up the sign-in sheet",
            note:
              "Sign in before you start if you are on a phone. Continue with Google is a full-page redirect, and it takes the page you were halfway through with it.",
          },
        ],
      },
      {
        id: "share",
        title: "Link, QR, print",
        steps: [
          {
            title: "Three ways to hand it over",
            body:
              "Copy the link for WhatsApp or Instagram, show the QR, or print the card to slip into a real envelope. The QR opens the letter.",
          },
        ],
      },
    ],

    faqs: [
      {
        q: "Where are the Next buttons?",
        a: "There aren't any. Miss You and the Apology Dashboard are the two templates built as one long form rather than a paged wizard — you scroll from your name at the top to Save & Preview at the bottom. If you have built a Darling or Birthday page before, this is the difference you will notice first.",
      },
      {
        q: "Does she really answer back?",
        a: "Yes, and it is the best thing in the template. The last section — our love map — asks her four questions and has a save my answers button. Her answers come back to you. In preview it says it will not save; that only starts once the page is published and shared.",
      },
      {
        q: "What happens to the thing I wrote under A secret?",
        a: "It arrives covered by a scratch card she has to drag across to uncover. The builder does not tell you that, so write something worth the scratching rather than a line she has heard before.",
      },
      {
        q: "How does it know how far apart we are?",
        a: "From the two city dropdowns under Time apart & distance. Set both and the page works out the kilometres itself; set only one and the line quietly does not appear. The km/mi toggle sits beside the reunion date.",
      },
      {
        q: "How many Open when… notes should I write?",
        a: "Four is usually right. Each one has to have a day she can actually picture — can't sleep, need a laugh, finally together. Ten of them turns a gift into a reading list.",
      },
      {
        q: "Can I keep it private?",
        a: "Set a password on the last step of the form, just under the accent tint. She will need the word as well as the link.",
      },
    ],

    relatedBlogSlugs: [],
    relatedGuideSlugs: ["love-gf", "apology-dashboard"],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // Apology Dashboard
  //
  // Two things about this one are unlike everything else on the site and both
  // belong near the top of the guide: the delivery email is REQUIRED and sits
  // near the bottom of a long form (press Publish without it and the form just
  // reopens, with no explanation), and her page is a card carousel driven by
  // arrows rather than a scroll. Everything else follows from those two.
  // ───────────────────────────────────────────────────────────────────────────
  {
    slug: "apology-dashboard",
    templateHref: "/apology-dashboard",
    templateName: "Apology Dashboard",
    title: "Build an apology she has to work her way out of being angry at",
    tagline: "An anger meter that actually goes down — plus the field that blocks publishing",
    summary:
      "Not a letter. A little dashboard of seven cards: an Anger-o-Meter that starts at Fuming, a Whack-a-Boyfriend game where every hit takes ten per cent off it, a desk of bribes worth thirty per cent more, and a forgive button whose No runs away from her finger. Her email address is required, and the guide says why before you find out the hard way.",
    category: "love",
    emoji: "🥺",
    accent: "#ea3b81",
    buildTime: "About 8 minutes",
    updatedAt: "2026-08-27",

    video: {
      seconds: 90,
      recordedAt: "2026-08-27",
      silent: true,
      // Read off the recording's own "STEP n OF 10" chip and the heading it
      // prints over each form region. Two beats in the video cover the same
      // email field (the region, then the driver's dedicated sweep for it);
      // they are one chapter here.
      chapters: [
        { at: 0,  label: "The page she lands on" },
        { at: 4,  label: "Open the builder",              sectionId: "open" },
        { at: 7,  label: "Fill it in yourself",           sectionId: "open" },
        { at: 11, label: "Build your apology",            sectionId: "apology" },
        { at: 16, label: "Whack game faces",              sectionId: "whack" },
        { at: 21, label: "Background music",              sectionId: "bribery" },
        { at: 25, label: "Her email — required",          sectionId: "email" },
        { at: 32, label: "Save it",                       sectionId: "save" },
        { at: 35, label: "What she actually sees",        sectionId: "recipient" },
        { at: 39, label: "She opens it",                  sectionId: "recipient" },
        { at: 42, label: "Anger-o-Meter",                 sectionId: "recipient" },
        { at: 45, label: "A tiny secret",                 sectionId: "recipient" },
        { at: 49, label: "Whack-a-Boyfriend",             sectionId: "recipient" },
        { at: 52, label: "Sweet Bribery Desk",            sectionId: "recipient" },
        { at: 55, label: "The sorry letter",              sectionId: "recipient" },
        { at: 59, label: "Memory Lane",                   sectionId: "recipient" },
        { at: 62, label: "Will you forgive me?",          sectionId: "recipient" },
        { at: 66, label: "Publish it",                    sectionId: "publish" },
        { at: 72, label: "Link, QR, print",               sectionId: "share" },
        { at: 88, label: "Done" },
      ],
    },

    sections: [
      {
        id: "open",
        title: "Open the builder",
        intro:
          "Create is in the top bar and what opens is one long scrolling form — no rail, no wizard pages, no Next. Save & Preview is at the very bottom.",
        steps: [
          {
            title: "What she lands on is a closed door",
            body:
              "The page opens on the headline and a single button — “Take my hand, let's begin”. Nothing below it exists until she presses it. That is deliberate: the whole thing is meant to be entered rather than scrolled.",
            shot: "step-01.webp",
            shotAlt: "The gate: the headline, the sub-message, and Take my hand, let's begin",
          },
          {
            title: "Press Create, then choose a door",
            body:
              "Write it for me drafts the headline, the sub-message and the sorry letter from a couple of sentences. I'll fill it in myself opens the form as it is. Note the Relationship dropdown behind the sheet — it is the first thing the form asks after the names.",
            shot: "step-02.webp",
            shotAlt: "The Write it for me / I'll fill it in myself choice, over the form",
          },
        ],
      },
      {
        id: "apology",
        title: "Build your apology",
        steps: [
          {
            title: "Names, relationship, headline, sub-message",
            body:
              "Your name is the only required text field. Relationship is a dropdown — Girlfriend, Boyfriend and so on — and it sets the pronouns and wording the page uses about her. Headline and sub-message are the two lines on the door.",
            shot: "step-03.webp",
            shotAlt: "Names, the relationship dropdown, headline, sub-message and the sorry letter",
          },
          {
            title: "Your sorry letter",
            body:
              "The one card on her page with no game attached to it, and the one that has to carry the actual apology. Name what you did. A page full of hammers and bribes with a vague letter in the middle reads as an attempt to be charming instead of sorry.",
            note:
              "The demo text is a competent template and says nothing specific. Replace it. It is the difference between a gift and a card bought at a petrol station.",
          },
          {
            title: "Your photo",
            body:
              "A dashed square with a camera glyph, directly under the letter. Optional — but it is the face at the top of the whole dashboard.",
          },
        ],
      },
      {
        id: "whack",
        title: "Whack game faces, and the voice apology",
        steps: [
          {
            title: "Your own face, or emoji",
            body:
              "Whack game faces (optional) is what she hits in the Whack-a-Boyfriend card. The hint under the box is the part worth reading: “No photos → cute emoji faces are used instead.” So the game works either way, and uploading yourself is the joke.",
            shot: "step-04.webp",
            shotAlt: "Whack game faces with its no-photos hint, the voice apology, and A tiny secret",
          },
          {
            title: "A voice apology",
            body:
              "Record voice apology captures from the browser; Upload audio takes a file. Optional, and the one part of the page that cannot be mistaken for something you copied off the internet.",
          },
          {
            title: "A tiny secret — the little note",
            body:
              "The pink panel is labelled “A tiny secret (revealed after scratching)”, and the Little note inside it is what ends up under the scratch card on her page. Photos to reveal, just below, are uncovered the same way.",
          },
        ],
      },
      {
        id: "bribery",
        title: "The Sweet Bribery Desk, and the music",
        steps: [
          {
            title: "Six promises, and you can add more",
            body:
              "Each row is an emoji and a line — “1× premium massage night”, “All the chores for 7 days”, “Morning coffee in bed all week”. Add promise adds another; the bin removes one. They arrive on her page as a tick-list.",
            shot: "step-05.webp",
            shotAlt: "The Sweet Bribery Desk rows and the Memory Lane timeline below them",
          },
          {
            title: "Promise things you will actually do",
            body:
              "She can tick them and lock them in, and the page keeps what she picked. A promise you quietly do not keep is worse than one you never made.",
          },
          {
            title: "Background music",
            body:
              "One built-in option — Gentle lofi. Her browser opens the page muted regardless; there is a control in the corner for her to turn it on.",
          },
        ],
      },
      {
        id: "memory",
        title: "The Memory Lane timeline",
        intro:
          "No chapter marker for this one either — the recording never titles this region separately. In the form it sits directly below the Sweet Bribery Desk.",
        steps: [
          {
            title: "Chapters, each an emoji and a line",
            body:
              "Three to start — The Spark, Inside Jokes, Growing Closer — and Add chapter for more. They render as a numbered vertical timeline with a coloured badge per chapter.",
          },
          {
            title: "Chronology is the point",
            body:
              "The card is an argument that there is something here worth not throwing away. Keep the chapters in order and let them get more specific as they go.",
          },
        ],
      },
      {
        id: "email",
        title: "Her email address — required",
        intro:
          "The one thing on this page that will stop you, and the reason it is worth reading this section before you start filling anything in.",
        steps: [
          {
            title: "YOUR GF / BF'S EMAIL is marked with an asterisk",
            body:
              "It sits near the bottom of the form, below the Memory Lane chapters and above the password. The hint under it says what it is for: the signed “Deed of Forgiveness” PDF is emailed there, and cc'd to you.",
            shot: "step-06.webp",
            shotAlt: "The required gf/bf's email field and the note about the Deed of Forgiveness PDF",
          },
          {
            title: "Save works without it. Publish does not.",
            body:
              "This is the trap, and it is easy to walk into: Save & Preview succeeds with the field empty, the preview looks finished, and the top bar offers you Publish. Press it and the builder simply reopens — no sign-in sheet, no error you are likely to catch, nothing published.",
            note:
              "Verified against the live template on 27 Aug 2026: with the field empty, Publish reopened the form; with it filled, the same click went straight to the sign-in sheet. If Publish seems to do nothing, this field is the first place to look.",
          },
          {
            title: "A password, if you want one",
            body:
              "Optional, directly below the email. Set it and she needs the word as well as the link.",
          },
        ],
      },
      {
        id: "save",
        title: "Save it",
        steps: [
          {
            title: "Save & Preview, at the foot of the form",
            body:
              "The form closes and the door appears with her name on it — “For Aanya 💗”. The top bar becomes Edit and Publish. Still nothing is live.",
            shot: "step-07.webp",
            shotAlt: "The saved page, addressed to her, with Edit and Publish in the top bar",
          },
        ],
      },
      {
        id: "recipient",
        title: "What she actually sees",
        intro:
          "Not a scroll. Seven cards with an arrow on each side — she moves through them one at a time, or swipes on a phone. Walk it yourself before sending: a card you left empty is simply not in the deck.",
        steps: [
          {
            title: "The Anger-o-Meter, and why it starts at Fuming",
            body:
              "A slider from “💚 Perfect love” to “💔 Fuming”, pinned at Fuming when she arrives, with a crying face beside it and the line “Take a deep breath… try sliding me left to calm down.”",
            shot: "step-08.webp",
            shotAlt: "The Anger-o-Meter slider at Fuming, with the crying bear",
            note:
              "Read this card together with the next two. The meter is not decoration — it is a score the rest of the dashboard exists to bring down, which is the whole idea of the template.",
          },
          {
            title: "A tiny secret — the scratch card",
            body:
              "Your Little note, covered. “✦ Scratch to reveal ✦ — use your finger or mouse.”",
          },
          {
            title: "Whack-a-Boyfriend — ten per cent a hit",
            body:
              "A three-by-three grid, a hit counter out of ten, and a Reset. The line under the title is the mechanic: “Every hit takes 10% off the anger meter — with a satisfying dishoom! 💥”",
            shot: "step-09.webp",
            shotAlt: "The Whack-a-Boyfriend grid, hits 0 of 10, with the ten-per-cent line",
          },
          {
            title: "Sweet Bribery Desk — thirty per cent, once",
            body:
              "Your promises as a tick-list, and one button: “Lock it in (-30% anger)”. Ten whacks and the bribes together are exactly enough to take her from Fuming to Perfect love, which is not a coincidence.",
            shot: "step-10.webp",
            shotAlt: "The bribery tick-list and the Lock it in minus-thirty-per-cent button",
          },
          {
            title: "From the bottom of my heart",
            body:
              "The sorry letter, addressed to her by name and signed with yours. The one card with nothing to press.",
          },
          {
            title: "Memory Lane",
            body:
              "Your chapters as a timeline — Chapter I, Chapter II, Chapter III — each with its badge and its line.",
            shot: "step-11.webp",
            shotAlt: "Memory Lane, three numbered chapters with coloured badges",
          },
          {
            title: "So… will you forgive me?",
            body:
              "The last card. “There's a right answer… and a running one 😌” — Yes, I forgive you! sits in the middle, and the No button moves away from her cursor when she goes for it.",
            shot: "step-12.webp",
            shotAlt: "The forgive card, with the No button already displaced to the side",
          },
        ],
      },
      {
        id: "publish",
        title: "Publish",
        steps: [
          {
            title: "Publish, and sign in if you are signed out",
            body:
              "With the delivery email filled in, Publish goes straight to the sign-in sheet and the page is live immediately afterwards.",
            shot: "step-13.webp",
            shotAlt: "Pressing Publish brings up the sign-in sheet",
            note:
              "Sign in before you start if you are on a phone. Continue with Google is a full-page redirect and it takes an unpublished page with it.",
          },
        ],
      },
      {
        id: "share",
        title: "Link, QR, print",
        steps: [
          {
            title: "Three ways to hand it over",
            body:
              "Copy the link, show the QR, or print the card. The QR opens the dashboard.",
          },
          {
            title: "Send the link, not the PDF",
            body:
              "The Deed of Forgiveness email goes out on its own once she signs. The link is what you send.",
          },
        ],
      },
    ],

    faqs: [
      {
        q: "I pressed Publish and nothing happened. Why?",
        a: "Almost certainly the delivery email. YOUR GF / BF'S EMAIL is required and sits near the bottom of the form, and it is the one field Save & Preview does not enforce — so the preview looks finished and Publish silently reopens the builder instead of publishing. Fill it in and press Publish again.",
      },
      {
        q: "What is the Deed of Forgiveness, and who gets it?",
        a: "A signed PDF the page emails to the address in that required field, cc'd to you, once she works her way to the end. It is why the field exists at all.",
      },
      {
        q: "Does the Anger-o-Meter actually do anything?",
        a: "Yes — it is the spine of the whole page. It starts pinned at Fuming, every whack in Whack-a-Boyfriend takes ten per cent off it, and locking in the bribes takes another thirty. Ten hits plus the bribes is exactly enough to reach Perfect love.",
      },
      {
        q: "Do I have to upload a photo of myself to be whacked?",
        a: "No. The hint under the field says it: with no photos it uses cute emoji faces instead. Uploading your own face is the better joke, but the game works either way.",
      },
      {
        q: "Why doesn't her page scroll?",
        a: "Because it is a carousel, not a page. There are arrows on either side of each card and she swipes on a phone. Seven cards, one at a time — which is what keeps the anger meter in front of her rather than three screens up.",
      },
      {
        q: "Is this too silly for a real apology?",
        a: "It depends entirely on the sorry letter. The games are the wrapping; the letter is the apology, and it is the one card with nothing to press. Write the letter properly and the hammer is charming. Leave the demo text in and the whole thing reads as a way of avoiding the conversation.",
      },
      {
        q: "Where are the Next buttons?",
        a: "There aren't any. This and Miss You are the two templates built as one long form rather than a paged wizard — scroll from your name at the top to Save & Preview at the bottom.",
      },
    ],

    relatedBlogSlugs: [],
    relatedGuideSlugs: ["missyou-gf", "love-gf"],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // The four wedding templates
  //
  // All four run the SAME seven-step wizard behind Edit Invitation — Names,
  // Details, Events, Gallery, Descriptions, Share photo, Password — and finish
  // on Set & Preview. Only the defaults, the palette and one or two sections
  // differ. That is documented once, here, in the fullest of the four, and the
  // other three say plainly that they share it rather than repeating it badly.
  // ───────────────────────────────────────────────────────────────────────────
  {
    slug: "christian-wedding",
    templateHref: "/christian-wedding",
    templateName: "Christian Wedding",
    title: "Send a Christian wedding invitation your guests can bless back",
    tagline: "Seven steps, a photo of your paper card as a shortcut, and a guestbook",
    summary:
      "A full wedding site rather than a card: the invitation, your story, every function with its own timings and venue, a gallery, and a Blessings page where guests write to you — by voice if they want. The builder will also read a photograph of your printed invitation and fill itself in from it.",
    category: "wedding",
    emoji: "⛪",
    accent: "#5f7a5f",
    buildTime: "About 10 minutes",
    updatedAt: "2026-08-28",

    video: {
      seconds: 90,
      recordedAt: "2026-08-28",
      silent: true,
      // Read off the recording's own "STEP n OF 11" chip and the heading it
      // prints over each wizard page, a frame at a time.
      chapters: [
        { at: 0,  label: "What the guest opens" },
        { at: 4,  label: "Open the builder",           sectionId: "open" },
        { at: 6,  label: "Fill it in yourself",        sectionId: "open" },
        { at: 10, label: "Names & photos",             sectionId: "names" },
        { at: 20, label: "Date, venue, families",      sectionId: "details" },
        { at: 25, label: "The blessing",               sectionId: "details" },
        { at: 30, label: "The events",                 sectionId: "events" },
        { at: 33, label: "The gallery",                sectionId: "gallery" },
        { at: 37, label: "Descriptions & parents",     sectionId: "descriptions" },
        { at: 47, label: "The share photo",            sectionId: "share-photo" },
        { at: 51, label: "Set & Preview",              sectionId: "save" },
        { at: 53, label: "What the guest sees",        sectionId: "guest" },
        { at: 56, label: "Card",                       sectionId: "guest" },
        { at: 59, label: "Us",                         sectionId: "guest" },
        { at: 61, label: "Events",                     sectionId: "guest" },
        { at: 64, label: "Gallery",                    sectionId: "guest" },
        { at: 66, label: "Blessings",                  sectionId: "guest" },
        { at: 69, label: "Publish it",                 sectionId: "publish" },
        { at: 75, label: "Link, QR, print",            sectionId: "share" },
        { at: 88, label: "Done" },
      ],
    },

    sections: [
      {
        id: "open",
        title: "Open the builder",
        intro:
          "The door is Edit Invitation, at the foot of the guest rail on desktop — not a Create button in a top bar. On a phone it is Create instead.",
        steps: [
          {
            title: "Press Edit Invitation",
            body:
              "What you are looking at before you press it is the demo — Jane & Andrew, already filled in. Nothing is yours until you save.",
            shot: "step-01.webp",
            shotAlt: "The finished invitation with the guest rail and Edit Invitation",
          },
          {
            title: "Generate with AI will read your paper card",
            body:
              "The AI door here is not the usual “describe it and I'll write it”. It says “Upload your invitation image or describe your wedding” — photograph the card the printer gave you and it fills the whole builder from it.",
            shot: "step-02.webp",
            shotAlt: "Customize Your Invitation: Generate with AI, or Fill Manually",
            note:
              "This is the fastest route by a distance if the wedding is already designed on paper, and it is the least obvious thing in the template. Check every field afterwards — a photograph of a card is not a database record.",
          },
          {
            title: "Or Fill Manually, and use Continue",
            body:
              "Seven pages, and the forward button says Continue rather than Next. The progress bar above the heading fills a segment per page.",
          },
        ],
      },
      {
        id: "names",
        title: "Step 1 — names and photos",
        steps: [
          {
            title: "Bride and groom, and a portrait each",
            body:
              "Both names are required; the two photos are not. They become the header of the whole site and the two cards in the Us section.",
            shot: "step-03.webp",
            shotAlt: "Step 1 of 7 — bride name, groom name, and the two photo slots",
          },
        ],
      },
      {
        id: "details",
        title: "Step 2 — date, venue, blessing, families",
        steps: [
          {
            title: "The venue field is doing more than it looks",
            body:
              "Type the address and a live “View … on Google Maps” link appears under it. Guests get that link, so write the address the way you would want it typed into a map, not the way it reads on a card.",
            shot: "step-04.webp",
            shotAlt: "Wedding date and time, the venue with its Maps link, the blessing, and both families",
          },
          {
            title: "The Sanskrit / Hindi blessing",
            body:
              "One line, set above the couple's names. The demo uses “God bless this union”; a Sanskrit or Hindi line sits here just as well and the field is named for both.",
          },
          {
            title: "Both families, by name",
            body:
              "Bride's family and groom's family as they should be read out. These reappear in the Us section.",
          },
        ],
      },
      {
        id: "events",
        title: "Step 3 — the functions",
        steps: [
          {
            title: "Each event gets a date, a time, a venue and a note",
            body:
              "Rehearsal Dinner, Ceremony and Reception to start with. The venue on each event carries its own Maps link, and the note is where the dress code and the “please arrive twenty minutes early” goes.",
            shot: "step-05.webp",
            shotAlt: "The events step — three functions, each with date, time, venue and a note",
            note:
              "The line above the list is worth reading: “Leave fields empty to use defaults.” An event you half-fill will show the demo's wording for the rest, so clear what you do not want rather than leaving it.",
          },
          {
            title: "Deleted events are not gone",
            body:
              "The bin moves an event into a Removed events tray at the bottom of the page, with a + to put it back. Spare slots live there too, which is how you add a Mehendi or a Brunch.",
            shot: "step-06.webp",
            shotAlt: "The Removed events tray, each row with a plus to restore it",
          },
        ],
      },
      {
        id: "gallery",
        title: "Step 4 — the gallery",
        steps: [
          {
            title: "Up to six, and the first one is the big one",
            body:
              "The instruction says it: “Upload up to 6 gallery photos. First photo will be featured large.” Pick the one you want at that size first.",
            shot: "step-07.webp",
            shotAlt: "The gallery step, six slots filled, each with a remove and a crop control",
          },
          {
            title: "It arrives pre-filled, and you can empty it",
            body:
              "Six stock images are already in place. Remove all six and Continue still works — the section simply does not appear for guests. Verified on the live template.",
          },
        ],
      },
      {
        id: "descriptions",
        title: "Step 5 — descriptions and family",
        steps: [
          {
            title: "A line each about the two of you",
            body:
              "Short. These sit under the names on the Us cards, and they are read in passing rather than studied.",
            shot: "step-08.webp",
            shotAlt: "Bride's and groom's descriptions, parents, and the optional grandparents fields",
          },
          {
            title: "Grandparents, if they should be named",
            body:
              "Both grandparent fields are marked Optional and are easy to scroll past. On an Indian or a traditional Christian card they are often the first names on it.",
          },
        ],
      },
      {
        id: "share-photo",
        title: "Step 6 — the share photo",
        steps: [
          {
            title: "This is the WhatsApp preview",
            body:
              "The form says it plainly: “Add a photo your guests will see the moment they open your invitation link.” It is the image that unfurls when the link is pasted into a chat, so it is the first thing most guests ever see. jpg, png or webp, up to 20MB.",
            shot: "step-09.webp",
            shotAlt: "The share photo step and its upload area",
            note:
              "Skip this and the link goes out as a bare grey card. It is the single highest-leverage upload in the whole build and it is on the second-to-last page, where most people are already hurrying.",
          },
        ],
      },
      {
        id: "save",
        title: "Step 7 — password, then Set & Preview",
        steps: [
          {
            title: "A guest password, or Skip",
            body:
              "“Add a password so only invited guests can view it. This is optional.” Skip sits beside Set & Preview, so there is no way to get stuck here.",
            shot: "step-10.webp",
            shotAlt: "The password step, with Skip and Set & Preview",
          },
          {
            title: "Set & Preview finishes the wizard",
            body:
              "The sheet closes onto your finished invitation, and Publish appears in the rail under Edit Invitation.",
            shot: "step-11.webp",
            shotAlt: "The saved invitation, with Publish now under Edit Invitation",
          },
        ],
      },
      {
        id: "guest",
        title: "What the guest sees",
        intro:
          "Five sections down the left: Card, Us, Events, Gallery, Blessings. Walk them before you send — a step you skipped is simply an absent section.",
        steps: [
          {
            title: "Events, one card per function",
            body:
              "“Tap any card for the full story — timings, venue, and notes from the hosts.” The date chip is on the right of each card.",
            shot: "step-12.webp",
            shotAlt: "The guest's Events section, three cards with date chips",
          },
          {
            title: "Blessings is a guestbook, and it takes voice notes",
            body:
              "The banner says what it is for: “After you publish, guests on your shared link can type a blessing or record a voice note here.” The messages you see before publishing are examples.",
            shot: "step-13.webp",
            shotAlt: "Wishes & Blessings, with the banner explaining it opens after publishing",
            note:
              "This is the part of the template worth telling guests about when you send the link. Nobody leaves a blessing on a page they thought was just a card.",
          },
        ],
      },
      {
        id: "publish",
        title: "Publish",
        steps: [
          {
            title: "Publish goes live immediately",
            body:
              "On this template Publish does not ask you to sign in first — the invitation goes live at that click and the rail button becomes Share. Verified on the live site on 28 Aug 2026.",
            note:
              "Because it publishes without an account, the link is the only handle you have on the page afterwards. Copy it somewhere safe before you close the tab.",
          },
        ],
      },
      {
        id: "share",
        title: "Link, QR, print",
        steps: [
          {
            title: "Three ways to hand it over",
            body:
              "WhatsApp, Instagram, Telegram, X and Facebook straight from the sheet, or copy the link. QR prints onto the card itself; Print gives you something to slip into an envelope.",
            shot: "step-14.webp",
            shotAlt: "The share sheet — Link, QR and Print, with the social buttons",
          },
        ],
      },
    ],

    faqs: [
      {
        q: "Can it just read my printed invitation?",
        a: "Yes, and it is the best thing in the builder. Generate with AI accepts a photograph of your card and fills the whole thing in from it. Check the fields afterwards, then carry on from wherever it got to.",
      },
      {
        q: "Where are the Next buttons?",
        a: "The forward button on all four wedding templates says Continue, and the door is Edit Invitation at the foot of the rail rather than Create in a top bar. Seven pages, then Set & Preview.",
      },
      {
        q: "Can guests write back?",
        a: "Yes. The Blessings section is a guestbook that accepts typed messages and recorded voice notes, and it starts collecting once the page is published. The blessings visible before that are examples.",
      },
      {
        q: "I deleted an event by mistake.",
        a: "It is in the Removed events tray at the bottom of the events step, with a plus to put it back. The same tray holds the spare slots you add a Mehendi or a Brunch from.",
      },
      {
        q: "What is the share photo for?",
        a: "It is the preview image guests see when the link is pasted into WhatsApp. Skip it and the link arrives as a blank grey card, which is a poor first impression of a wedding.",
      },
      {
        q: "Do I need an account?",
        a: "Not on this template — Publish puts the invitation live straight away without a sign-in. That also means the link is your only way back to it, so save it as soon as you have it.",
      },
      {
        q: "Can I keep it to invited guests only?",
        a: "Set a password on the last step of the wizard. Guests need the word as well as the link.",
      },
    ],

    relatedBlogSlugs: [],
    relatedGuideSlugs: ["shaadi-card", "wedding-shaadi", "reception"],
  },

  {
    slug: "shaadi-card",
    templateHref: "/shaadi-card",
    templateName: "Animated Shaadi Card",
    title: "Build an animated shaadi card that opens like the real thing",
    tagline: "The same seven steps, in the register of a printed Indian card",
    summary:
      "A vertical animated card — ॐ शुभ विवाह across the top, the two names in script, the mandap below — wrapped in the same five-section guest site as its siblings. The builder is the wedding wizard with Indian defaults already in it, and its AI door will read a photograph of your printed shaadi card.",
    category: "wedding",
    emoji: "🪔",
    accent: "#b03050",
    buildTime: "About 9 minutes",
    updatedAt: "2026-08-28",

    video: {
      seconds: 90,
      recordedAt: "2026-08-28",
      silent: true,
      // From the recording's "STEP n OF 9" chip and the wizard heading over
      // each region.
      chapters: [
        { at: 0,  label: "What the guest opens" },
        { at: 5,  label: "Open the builder",           sectionId: "open" },
        { at: 8,  label: "Fill it in yourself",        sectionId: "open" },
        { at: 14, label: "Names & photos",             sectionId: "names" },
        { at: 24, label: "The events",                 sectionId: "wizard" },
        { at: 28, label: "The gallery",                sectionId: "wizard" },
        { at: 33, label: "The share photo",            sectionId: "wizard" },
        { at: 38, label: "Set & Preview",              sectionId: "save" },
        { at: 41, label: "What the guest sees",        sectionId: "guest" },
        { at: 45, label: "Card",                       sectionId: "guest" },
        { at: 48, label: "Us",                         sectionId: "guest" },
        { at: 52, label: "Events",                     sectionId: "guest" },
        { at: 55, label: "Gallery",                    sectionId: "guest" },
        { at: 58, label: "Blessings",                  sectionId: "guest" },
        { at: 62, label: "Publish it",                 sectionId: "publish" },
        { at: 69, label: "Link, QR, print",            sectionId: "share" },
        { at: 87, label: "Done" },
      ],
    },

    sections: [
      {
        id: "open",
        title: "Open the builder",
        steps: [
          {
            title: "Edit Invitation, at the foot of the rail",
            body:
              "The card animates in when the page loads — give it a few seconds before you reach for anything. Edit Invitation is under the five guest sections.",
            shot: "step-01.webp",
            shotAlt: "The finished animated shaadi card with the guest rail and Edit Invitation",
          },
          {
            title: "Its AI door reads a shaadi card",
            body:
              "“Upload shaadi card or describe your wedding.” Photograph the printed card and the builder fills itself in from it — the same shortcut as the Christian template, worded for this one.",
            shot: "step-02.webp",
            shotAlt: "The fork: Generate with AI, which offers to read your shaadi card, or Fill Manually",
          },
        ],
      },
      {
        id: "names",
        title: "Step 1 — names and photos",
        steps: [
          {
            title: "Both names, and a portrait each",
            body:
              "The names are what the card sets in script, so how you write them here is how they are read. Photos are optional and feed the Us cards.",
            shot: "step-03.webp",
            shotAlt: "Step 1 of 7 — bride name, groom name, and the two photo slots",
          },
        ],
      },
      {
        id: "wizard",
        title: "Steps 2 to 7 — the shared wizard",
        intro:
          "From here it is the same seven-step wizard all four wedding templates run: Details, Events, Gallery, Descriptions, Share photo, Password. The full walkthrough is in the Christian Wedding guide; what follows is what is specific to this one.",
        steps: [
          {
            title: "The defaults are already Indian",
            body:
              "Step 2 arrives with ॐ शुभ विवाह in the blessing field and “Shri Deepak Mehta & Smt. Kavita Mehta” under bride's family. Swap the names and the wording holds up — you are editing a card rather than filling a form.",
            shot: "step-04.webp",
            shotAlt: "Step 2 of 7 — date, Udaipur as the venue, the Hindi blessing, both families",
          },
          {
            title: "The venue types into a live map link",
            body:
              "Whatever you write appears under the field as a Google Maps link, and guests get it. Write it as an address, not as card copy.",
          },
          {
            title: "The share photo is the WhatsApp preview",
            body:
              "Step 6. It is the image that unfurls when someone pastes the link into a chat, and skipping it sends a blank grey card to every guest.",
          },
        ],
      },
      {
        id: "save",
        title: "Set & Preview",
        steps: [
          {
            title: "The last step is the password, and it has a Skip",
            body:
              "Set & Preview closes the wizard onto the finished card, and Publish joins Edit Invitation in the rail.",
          },
        ],
      },
      {
        id: "guest",
        title: "What the guest sees",
        steps: [
          {
            title: "Us — dulhan and dulha, family behind a tap",
            body:
              "Two cards with दुल्हन and दूल्हा chips, the descriptions you wrote, and a Bride's family / Groom's family row with Open on it. “Tap a card — family & story.” The parents you typed in step 2 are behind that.",
            shot: "step-05.webp",
            shotAlt: "The Us section — dulhan and dulha cards, each with a family row to open",
          },
          {
            title: "Then Events, Gallery and Blessings",
            body:
              "Blessings is the guestbook: once published, guests can type a blessing or record a voice note on it.",
          },
        ],
      },
      {
        id: "publish",
        title: "Publish",
        steps: [
          {
            title: "Publish, then Share",
            body:
              "The rail button becomes Share and the sheet gives you the link, a QR and a printable card.",
          },
        ],
      },
      {
        id: "share",
        title: "Link, QR, print",
        steps: [
          {
            title: "Send it on WhatsApp, or print the QR onto the card",
            body:
              "The QR is worth knowing about for a wedding: printed on the paper card, it takes a guest who was handed an envelope to the gallery and the guestbook.",
          },
        ],
      },
    ],

    faqs: [
      {
        q: "How is this different from the Royal Indian Wedding template?",
        a: "Same wizard, different guest experience. This one is a light, animated card in the register of printed stationery. Royal Indian Wedding is dark and gold, opens on a Play & Enter music gate, and carries a countdown to the day.",
      },
      {
        q: "Can it read my printed card?",
        a: "Yes — Generate with AI offers exactly that. Photograph the card and it fills the builder in from the photo.",
      },
      {
        q: "Why does the card take a moment to appear?",
        a: "It animates in deliberately, which is the point of the template. Give it a few seconds before pressing anything.",
      },
      {
        q: "Where do the parents' names show up?",
        a: "In the Us section, behind the Bride's family and Groom's family rows on the two cards. Guests tap to open them.",
      },
    ],

    relatedBlogSlugs: [],
    relatedGuideSlugs: ["christian-wedding", "wedding-shaadi", "reception"],
  },

  {
    slug: "wedding-shaadi",
    templateHref: "/wedding-shaadi",
    templateName: "Royal Indian Wedding",
    title: "A royal wedding invitation that opens with music and counts down",
    tagline: "A Play & Enter gate, a live countdown, and a theme the guest controls",
    summary:
      "The dark, gold version of the wedding site. Guests land on a gate that asks whether to play the music before anything loads, then on a countdown to the day. They can switch the whole invitation between the dark royal look and a light one themselves. Behind Edit Invitation it is the same seven-step wizard as the other three.",
    category: "wedding",
    emoji: "👰",
    accent: "#c9a227",
    buildTime: "About 9 minutes",
    updatedAt: "2026-08-28",

    video: {
      seconds: 90,
      recordedAt: "2026-08-28",
      silent: true,
      // From the recording's "STEP n OF 8" chip. Note the extra beat at 0:04
      // that the two light templates do not have — the music gate.
      chapters: [
        { at: 0,  label: "What the guest opens" },
        { at: 4,  label: "The music gate",             sectionId: "gate" },
        { at: 9,  label: "Open the builder",           sectionId: "open" },
        { at: 12, label: "Fill it in yourself",        sectionId: "open" },
        { at: 17, label: "Names & photos",             sectionId: "wizard" },
        { at: 27, label: "The events",                 sectionId: "wizard" },
        { at: 30, label: "The gallery",                sectionId: "wizard" },
        { at: 36, label: "The share photo",            sectionId: "wizard" },
        { at: 39, label: "Set & Preview",              sectionId: "save" },
        { at: 43, label: "What the guest sees",        sectionId: "guest" },
        { at: 47, label: "Home",                       sectionId: "guest" },
        { at: 50, label: "Us",                         sectionId: "guest" },
        { at: 53, label: "Events",                     sectionId: "guest" },
        { at: 56, label: "Gallery",                    sectionId: "guest" },
        { at: 59, label: "Blessings",                  sectionId: "guest" },
        { at: 63, label: "Publish it",                 sectionId: "publish" },
        { at: 70, label: "Link, QR, print",            sectionId: "share" },
        { at: 87, label: "Done" },
      ],
    },

    sections: [
      {
        id: "gate",
        title: "The music gate",
        intro:
          "The thing to understand before you build anything: this invitation does not open straight onto the page.",
        steps: [
          {
            title: "Play & Enter, or Skip",
            body:
              "Guests get शुभ विवाह, your two names, and a panel — “Wedding Background Music · Enhance your experience with beautiful wedding melodies” — with Play & Enter and Skip. Nothing below loads until one of them is pressed.",
            shot: "step-01.webp",
            shotAlt: "The Play & Enter gate over the darkened hero",
            note:
              "This is why the invitation can have music at all. Browsers refuse to autoplay sound, so the gate turns a blocked autoplay into a choice the guest actually makes — and it is also the reason a guest who taps Skip sees a silent page and has not broken anything.",
          },
        ],
      },
      {
        id: "open",
        title: "Open the builder",
        steps: [
          {
            title: "Edit Invitation, under the rail",
            body:
              "Same door as the other three. The rail here labels itself with emoji — 🏠 Home, 💑 Us, 📅 Events, 📷 Gallery, 🙏 Blessings.",
            shot: "step-04.webp",
            shotAlt: "Customize Your Invitation — Generate with AI, or Fill Manually",
          },
          {
            title: "Two doors: AI, or by hand",
            body:
              "“Upload shaadi card or describe your wedding” reads a photograph of a printed card. Fill Manually opens the seven-step wizard.",
          },
        ],
      },
      {
        id: "wizard",
        title: "The seven-step wizard",
        intro:
          "Identical to the other three wedding templates: Names, Details, Events, Gallery, Descriptions, Share photo, Password, then Set & Preview. The step-by-step is in the Christian Wedding guide.",
        steps: [
          {
            title: "The date drives the countdown",
            body:
              "Step 2's wedding date and time is not decoration here — it feeds the days/hours/minutes/seconds counter on the guest's home screen. A wrong date is visible to everyone, ticking.",
          },
          {
            title: "The venue city shows beside the date",
            body:
              "Home prints “15 MARCH 2026 · JAIPUR” under the names, taken from the venue field, and the field also produces the Google Maps link guests use.",
          },
          {
            title: "The share photo is the WhatsApp preview",
            body:
              "Step 6, and the most-seen image in the whole build — it is what unfurls when the link is pasted into a chat.",
          },
        ],
      },
      {
        id: "save",
        title: "Set & Preview",
        steps: [
          {
            title: "Password or Skip, then Set & Preview",
            body:
              "The wizard closes onto the finished invitation and Publish appears in the rail. The music gate comes back on the way in, so expect to pass it again.",
          },
        ],
      },
      {
        id: "guest",
        title: "What the guest sees",
        steps: [
          {
            title: "Home — the countdown, in the dark",
            body:
              "ॐ शुभ विवाह, the two names across the width, the date and city, and four counters ticking down. This is the template's whole argument.",
            shot: "step-02.webp",
            shotAlt: "The guest's home screen — names, date, city and the live countdown, dark theme",
          },
          {
            title: "And the guest can turn the lights on",
            body:
              "The small sun/moon control at the bottom-left of the rail switches the entire invitation to a light cream-and-gold treatment. It is theirs to press, not yours to set — worth knowing before someone tells you the invitation “looks wrong” on their phone.",
            shot: "step-03.webp",
            shotAlt: "The same page after the guest presses the theme toggle, in light cream and gold",
          },
          {
            title: "Then Us, Events, Gallery and Blessings",
            body:
              "Blessings is the guestbook — once published, guests type a blessing or record a voice note there.",
          },
        ],
      },
      {
        id: "publish",
        title: "Publish",
        steps: [
          {
            title: "Publish, then Share",
            body: "The rail button becomes Share, and the sheet carries the link, the QR and the printable card.",
          },
        ],
      },
      {
        id: "share",
        title: "Link, QR, print",
        steps: [
          {
            title: "WhatsApp, a QR, or a printed card",
            body: "The QR printed onto the paper card is the one worth planning for — it takes a guest from an envelope to the countdown and the guestbook.",
          },
        ],
      },
    ],

    faqs: [
      {
        q: "Why does it ask about music before showing anything?",
        a: "Browsers will not autoplay sound, so instead of failing silently the invitation asks. Play & Enter starts the music; Skip opens the same page without it. Nothing below the gate loads until a guest chooses.",
      },
      {
        q: "A guest says the invitation looks light, not dark. Why?",
        a: "They pressed the theme toggle at the bottom-left of the rail. It switches the whole invitation between the dark royal look and a cream-and-gold one, and it is the guest's choice rather than a setting you control.",
      },
      {
        q: "Where does the countdown come from?",
        a: "The wedding date and time on step 2 of the wizard. It ticks on every guest's screen, so it is the field to check twice.",
      },
      {
        q: "How is this different from the Animated Shaadi Card?",
        a: "Same builder, different evening. This one is dark and gold with a music gate and a countdown; the shaadi card is light and animates like printed stationery.",
      },
    ],

    relatedBlogSlugs: [],
    relatedGuideSlugs: ["reception", "shaadi-card", "christian-wedding"],
  },

  {
    slug: "reception",
    templateHref: "/reception",
    templateName: "Reception",
    title: "A reception invitation with the venue on a real map",
    tagline: "One evening, one place — so it drops Events and adds Location",
    summary:
      "The wedding site narrowed to a single evening. There is no Events section because there is only one event; in its place is Location, a live map with a pin on the venue and directions a guest can follow. It also has the widest front door of the four: upload the card, describe it, or write it yourself.",
    category: "wedding",
    emoji: "🥂",
    accent: "#c08a3e",
    buildTime: "About 8 minutes",
    updatedAt: "2026-08-28",

    video: {
      seconds: 90,
      recordedAt: "2026-08-28",
      silent: true,
      // From the recording's "STEP n OF 8" chip and the wizard heading over
      // each region. Like wedding-shaadi it has a gate beat at 0:04.
      chapters: [
        { at: 0,  label: "What the guest opens" },
        { at: 4,  label: "The music gate",             sectionId: "gate" },
        { at: 8,  label: "Open the builder",           sectionId: "open" },
        { at: 10, label: "Write it yourself",          sectionId: "open" },
        { at: 15, label: "Names & families",           sectionId: "wizard" },
        { at: 26, label: "Tagline, date, venue",       sectionId: "wizard" },
        { at: 37, label: "The photos",                 sectionId: "wizard" },
        { at: 41, label: "The gallery",                sectionId: "wizard" },
        { at: 46, label: "Set & Preview",              sectionId: "save" },
        { at: 49, label: "What the guest sees",        sectionId: "guest" },
        { at: 53, label: "Home",                       sectionId: "guest" },
        { at: 55, label: "Us",                         sectionId: "guest" },
        { at: 58, label: "Gallery",                    sectionId: "guest" },
        { at: 61, label: "Location",                   sectionId: "location" },
        { at: 63, label: "Blessings",                  sectionId: "guest" },
        { at: 66, label: "Publish it",                 sectionId: "publish" },
        { at: 73, label: "Link, QR, print",            sectionId: "share" },
        { at: 88, label: "Done" },
      ],
    },

    sections: [
      {
        id: "gate",
        title: "The music gate",
        steps: [
          {
            title: "Play & Enter, or Skip",
            body:
              "Like the Royal Indian Wedding template, the reception opens on a choice about music before it opens on anything else — “Reception Background Music · Enhance your experience with elegant celebration melodies.” Nothing below loads until a guest presses one.",
            shot: "step-01.webp",
            shotAlt: "The reception's Play & Enter gate",
          },
        ],
      },
      {
        id: "open",
        title: "Open the builder",
        intro:
          "Note the wording throughout: this template says Reception where the other three say Invitation. The rail button is Edit Reception.",
        steps: [
          {
            title: "Three doors, not two",
            body:
              "Upload Reception Card — “AI reads your invitation card & fills everything”. Generate with AI — “Describe your reception & AI creates the content”. Write Manually — “Fill in every detail & upload photos yourself”. The other three fold the first two together; this one names them separately.",
            shot: "step-04.webp",
            shotAlt: "Customize Your Invitation — Upload Reception Card, Generate with AI, Write Manually",
            note:
              "If the reception card is already printed, the first door is the fastest route in the whole wedding set. Photograph it and check the result rather than typing anything.",
          },
        ],
      },
      {
        id: "wizard",
        title: "The seven-step wizard",
        intro:
          "The same seven steps as its siblings, with reception wording — and the sheet opens as a panel down the right rather than in the middle. The full walkthrough is in the Christian Wedding guide.",
        steps: [
          {
            title: "Step 1 is names and families, without photos",
            body:
              "Bride, groom, and both families. The portraits move to the photos step later, which is the one place the four templates order things differently.",
            shot: "step-05.webp",
            shotAlt: "Step 1 of 7 — bride, groom and both families, as a right-hand panel",
          },
          {
            title: "The tagline is the line under the names",
            body:
              "“Request the pleasure of your company” by default. It is the only piece of card language in the build and it is worth writing yourself.",
          },
          {
            title: "Date, timings and venue drive the whole page",
            body:
              "The reception date and time feed the countdown; the venue feeds the details panel, the line under the countdown, and the map in the Location section. One field, three places.",
          },
        ],
      },
      {
        id: "save",
        title: "Set & Preview",
        steps: [
          {
            title: "Password or Skip, then Set & Preview",
            body:
              "The wizard closes onto the finished reception page and Publish appears in the rail. Expect the music gate again on the way back in.",
          },
        ],
      },
      {
        id: "guest",
        title: "What the guest sees",
        intro:
          "Home, Us, Gallery, Location, Blessings. No Events — there is one event, and it is the page.",
        steps: [
          {
            title: "Home, plus a details panel the others do not have",
            body:
              "The countdown and the couple's names, and down the right: date, timings, venue, a gallery count and a blessings count. Before you have filled it in, that panel also carries a tip — “Click Edit Reception to add your couple details, venue, and gallery photos.”",
            shot: "step-02.webp",
            shotAlt: "The reception home screen with the countdown and the right-hand details panel",
          },
          {
            title: "Blessings works as it does everywhere else",
            body:
              "A guestbook that takes typed messages and voice notes, live once the page is published. The panel on Home counts what has arrived.",
          },
        ],
      },
      {
        id: "location",
        title: "Location — the section only this template has",
        steps: [
          {
            title: "A real map, a pin, and directions",
            body:
              "Not a static image: an interactive map centred on the venue, with the venue's own listing card and a directions control. Underneath, a panel repeats the venue, the date and the timings with “Tap for full details & directions”.",
            shot: "step-03.webp",
            shotAlt: "The Location section — an interactive map with the venue pinned",
            note:
              "This is why the venue field deserves care. Write the address as you would type it into a map — the hotel's actual name and city — rather than as it reads on a card, or the pin lands somewhere approximate and a guest drives there.",
          },
        ],
      },
      {
        id: "publish",
        title: "Publish",
        steps: [
          {
            title: "Publish, then Share",
            body: "The rail button becomes Share and the sheet carries the link, the QR and the printable card.",
          },
        ],
      },
      {
        id: "share",
        title: "Link, QR, print",
        steps: [
          {
            title: "WhatsApp, a QR, or a printed card",
            body:
              "For a reception the QR earns its place: printed on the card, it hands a guest the map and the directions rather than an address to retype.",
          },
        ],
      },
    ],

    faqs: [
      {
        q: "Why is there no Events section?",
        a: "Because a reception is one event. The slot in the rail goes to Location instead — a live map with the venue pinned and directions from it.",
      },
      {
        q: "Is the map real?",
        a: "Yes. It is an interactive map centred on whatever you typed into the venue field, with the venue's listing and a directions control. Write the address as you would type it into a map rather than as card copy.",
      },
      {
        q: "Why does this one have three ways to start?",
        a: "It splits what the other templates combine: Upload Reception Card reads a photo of your printed card, Generate with AI writes from a description, and Write Manually opens the wizard. Same seven steps behind all three.",
      },
      {
        q: "What is the panel down the right of the home screen?",
        a: "A summary the other three templates do not have — date, timings, venue, how many gallery photos and how many blessings have arrived. Before you fill it in, it also carries the tip pointing you at Edit Reception.",
      },
      {
        q: "Does it have the music gate too?",
        a: "Yes, the same one as the Royal Indian Wedding template. Guests choose Play & Enter or Skip before anything below loads.",
      },
    ],

    relatedBlogSlugs: [],
    relatedGuideSlugs: ["wedding-shaadi", "christian-wedding", "shaadi-card"],
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
