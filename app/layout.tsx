import type { Metadata, Viewport } from "next";
import { Dancing_Script, Cinzel, Lora, Fredoka, Inter, Playfair_Display, Outfit, Tinos, Courier_Prime, Tiro_Devanagari_Hindi, Oswald } from "next/font/google";
import Providers from "@/components/Providers";
import { OrganizationJsonLd, WebAppJsonLd } from "@/components/JsonLd";
import { buildMeta, SITE_URL } from "@/lib/seo";
import { ROOT_DOMAIN } from "@/lib/config";
import "./globals.css";

// Secondary / template fonts loaded NON-render-blocking (see <head> below). This
// is the exact set previously pulled in via a CSS `@import` at the top of
// globals.css — which was render-blocking and cost ~1.1s of LCP. Keeping the full
// family list here (loaded async) means every existing `font-family:'Playfair
// Display'` / Cormorant / regional-script reference across the app keeps working
// with zero edits, while first paint no longer waits on it.
// NOTE: Outfit, Playfair Display and Dancing Script are deliberately NOT in this
// URL. They are provided by next/font above (self-hosted, display:"optional") and
// registered under their real family names, so every `font-family:'Playfair
// Display'` / Outfit / Dancing reference resolves to those. Loading them here too
// would add a SECOND @font-face for the same family with display=swap — the
// browser then races between the optional (self-hosted) and swap (external)
// sources for the hero <h1>, re-introducing the intermittent font-swap CLS. This
// URL now carries only the template/regional faces that exist ONLY externally.
const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&family=DM+Sans:wght@300;400;500;600;700&family=Noto+Serif+Devanagari:wght@400;500;600;700&family=Noto+Nastaliq+Urdu:wght@400;500;600;700&family=Amiri:ital,wght@0,400;0,700;1,400;1,700&display=swap";

// display: "optional" on every font that renders on the LANDING (Dancing Script,
// Lora, Inter below, plus Playfair/Outfit) — so none of them can swap after first
// paint and re-wrap text, which was the residual cause of the hero's ~0.12 CLS
// (Lighthouse cause: "Web font"). "optional" uses the metric-matched fallback and
// only upgrades if the font is cached / loads near-instantly, so there is never a
// mid-view swap. Template-only fonts (Cinzel, Fredoka) stay "swap" so invitation
// pages still get their exact display faces.
// ── WHY MOST OF THESE SET preload: false ────────────────────────────────────
//
// next/font preloads every family it declares, and all twelve are declared in
// this one root layout — so every page, including the landing, emitted twelve
// `<link rel="preload" as="font">` tags at the highest priority the browser
// has. On an emulated phone that was ~264 KB of woff2 competing for bandwidth
// with the HTML the hero is painted from, and the landing renders exactly three
// of them: Playfair (the <h1>, which IS the LCP element), Outfit
// (--font-display) and Inter (body text).
//
// The other nine belong to individual templates. They are still self-hosted and
// still load the moment a page actually uses one; they simply no longer jump the
// queue ahead of the content on pages that never mention them.
//
// The three above-the-fold families keep their preload, and keep
// display: "optional" — see the note further down on why that matters for CLS.
const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-script",
  display: "optional",
  // Not on the landing's critical path — see the note above.
  preload: false,
});

// Shaadi-card template fonts (also needed in share viewer page)
const dancingScriptAlt = Dancing_Script({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-dancing",
  display: "optional",
  // Not on the landing's critical path — see the note above.
  preload: false,
});
const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-cinzel",
  display: "swap",
  // Not on the landing's critical path — see the note above.
  preload: false,
});
const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-lora",
  display: "optional",
  // Not on the landing's critical path — see the note above.
  preload: false,
});

// Apology Dashboard template fonts (display + body)
const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-fredoka",
  display: "swap",
  // Not on the landing's critical path — see the note above.
  preload: false,
});
// Inter is the app BODY font (globals.css: body { font-family: 'Inter' }), so it
// renders the hero description and most landing text. "optional" here is what
// stops the hero body text from re-wrapping when Inter swaps in. Inter's metric
// fallback is near-identical (system sans), so there is effectively no visual cost.
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "optional",
  preload: false,
});

// ── Critical above-the-fold fonts — SELF-HOSTED + preloaded via next/font ──────
// Playfair Display renders the hero <h1> (the mobile LCP element); Outfit is the
// body display font (--font-display). next/font self-hosts the woff2, preloads
// it, and injects size-adjusted fallback metrics (zero layout shift on swap), so
// the largest text paints fast without waiting on any external stylesheet.
// display: "optional" (not "swap") is deliberate and important for CLS. These two
// render the hero (the mobile LCP area). With "swap", on a slow connection the
// large Playfair <h1> painted in a fallback, then swapped once the woff2 arrived
// and RE-WRAPPED to a different line count — shifting the whole hero ~84px
// (Lighthouse confirmed cause: "Web font", CLS 0.125). "optional" uses the
// metric-matched fallback and only upgrades to the real font if it loads almost
// instantly or is already cached, so it never swaps mid-view: zero layout shift,
// LCP stays fast. Fast connections and repeat visitors still get Playfair/Outfit.
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "optional",
});
const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-outfit",
  display: "optional",
  preload: false,
});

// ── Document-artifact fonts (court-marriage / train-ticket / legal-notice) ────
// These templates imitate printed paperwork, where realism depends on a
// two-font split: a Times-metric serif for the PRE-PRINTED form text, and a
// typewriter face for the values TYPED into it. One font reads instantly fake.
// display: "swap" (not "optional") is deliberate and load-bearing here: these
// pages export themselves to PNG via html-to-image after `document.fonts.ready`,
// and "optional" can decline to load the face at all — the export would then
// silently fall back and look nothing like the screen. They render inside a
// template route, never the landing hero, so no LCP/CLS cost is incurred.
const tinos = Tinos({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-tinos",
  display: "swap",
  // Not on the landing's critical path — see the note above.
  preload: false,
});
const courierPrime = Courier_Prime({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-courier-prime",
  display: "swap",
  // Not on the landing's critical path — see the note above.
  preload: false,
});
// Devanagari sub-heading on the marriage certificate (विवाह प्रमाण पत्र).
// Self-hosted rather than reusing the async Noto Serif Devanagari in FONTS_HREF,
// because that stylesheet is injected at runtime and is not guaranteed to be
// resolved by the time html-to-image captures.
const tiroDevanagari = Tiro_Devanagari_Hindi({
  subsets: ["devanagari", "latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-tiro-devanagari",
  display: "swap",
  // Not on the landing's critical path — see the note above.
  preload: false,
});
// Condensed caps for machine-stencilled chrome (the vending machine's body
// plates, shelf tags and keypad). A normal-width grotesque letter-spaced down
// reads as a web app; a genuinely condensed face reads as something stamped
// onto sheet metal. Same "swap" reasoning as the faces above — it appears in
// the exported coupon.
const oswald = Oswald({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-oswald",
  display: "swap",
  // Not on the landing's critical path — see the note above.
  preload: false,
});

export const metadata: Metadata = {
  ...buildMeta(),
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SubhSandesh",
    startupImage: "/icons/icon-512.png",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-icon-180.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/icons/icon-192.png",
  },
  alternates: {
    canonical: SITE_URL,
  },
  verification: {
    other: {
      "msvalidate.01": "3C832B30C2443749B7E1B02E805C9438",
    },
  },
  keywords: [
    "gifts",
    "personalized gifts",
    "birthday gift",
    "valentine gift",
    "anniversary gift",
    "online gift maker",
    "shareable gift page",
    "surprise gift link",
  ],
};

export const viewport: Viewport = {
  // Match the manifest theme_color and brand palette (dark maroon) so the browser
  // chrome / PWA title bar is on-brand instead of the old rose (#f43f5e).
  themeColor: "#3d0c11",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${dancingScript.variable} ${dancingScriptAlt.variable} ${cinzel.variable} ${lora.variable} ${fredoka.variable} ${inter.variable} ${playfair.variable} ${outfit.variable} ${tinos.variable} ${courierPrime.variable} ${tiroDevanagari.variable} ${oswald.variable}`}>
      <head suppressHydrationWarning>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Template font stylesheet, loaded WITHOUT blocking render: the link
            is created with media="print" (ignored for screen, so non-blocking)
            and flipped to "all" once it has downloaded. This replaces the old
            render-blocking `@import` in globals.css (~1.1s LCP saving).

            Skipped on the landing page. Nothing on it uses these families, but
            the media flip still re-styles and re-lays out the whole page: a
            283ms layout task on a throttled phone, landing ~2.4s in, squarely
            inside Total Blocking Time. `window.__loadTemplateFonts` stays
            defined so <TemplateFontsLoader/> can load it the moment a visitor
            navigates from the landing to any other page. A user's subdomain
            profile is also served at "/", so only the apex (and www/dev/stag)
            count as the landing. There used to be a <link rel="preload"> here
            too; it was dropped because it downloaded this CSS on the landing
            for nothing — fetchPriority on the created link keeps it prompt on
            every other page. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var done=false;function load(){if(done)return;done=true;var l=document.createElement('link');l.rel='stylesheet';l.href=${JSON.stringify(
              FONTS_HREF
            )};l.media='print';l.fetchPriority='high';l.onload=function(){this.media='all'};document.head.appendChild(l);}
window.__loadTemplateFonts=load;
var root=${JSON.stringify(ROOT_DOMAIN)},h=location.hostname,sub='';
if(root&&h!==root&&h.slice(-root.length-1)==='.'+root)sub=h.slice(0,-root.length-1);
var landing=location.pathname==='/'&&(!sub||sub==='www'||sub==='dev'||sub==='stag');
if(!landing)load();})();`,
          }}
        />
        <noscript>
          <link rel="stylesheet" href={FONTS_HREF} />
        </noscript>
        <OrganizationJsonLd />
        <WebAppJsonLd />
      </head>
      <body className="antialiased transition-colors duration-300" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
