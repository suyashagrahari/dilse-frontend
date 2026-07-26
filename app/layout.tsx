import type { Metadata, Viewport } from "next";
import { Dancing_Script, Cinzel, Lora, Fredoka, Inter, Playfair_Display, Outfit } from "next/font/google";
import Providers from "@/components/Providers";
import { OrganizationJsonLd, WebAppJsonLd } from "@/components/JsonLd";
import { buildMeta, SITE_URL } from "@/lib/seo";
import "./globals.css";

// Secondary / template fonts loaded NON-render-blocking (see <head> below). This
// is the exact set previously pulled in via a CSS `@import` at the top of
// globals.css — which was render-blocking and cost ~1.1s of LCP. Keeping the full
// family list here (loaded async) means every existing `font-family:'Playfair
// Display'` / Cormorant / regional-script reference across the app keeps working
// with zero edits, while first paint no longer waits on it.
const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500;1,600;1,700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&family=DM+Sans:wght@300;400;500;600;700&family=Noto+Serif+Devanagari:wght@400;500;600;700&family=Noto+Nastaliq+Urdu:wght@400;500;600;700&family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Dancing+Script:wght@400;500;600;700&display=swap";

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-script",
  display: "swap",
});

// Shaadi-card template fonts (also needed in share viewer page)
const dancingScriptAlt = Dancing_Script({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-dancing",
  display: "swap",
});
const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-cinzel",
  display: "swap",
});
const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-lora",
  display: "swap",
});

// Apology Dashboard template fonts (display + body)
const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-fredoka",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

// ── Critical above-the-fold fonts — SELF-HOSTED + preloaded via next/font ──────
// Playfair Display renders the hero <h1> (the mobile LCP element); Outfit is the
// body display font (--font-display). next/font self-hosts the woff2, preloads
// it, and injects size-adjusted fallback metrics (zero layout shift on swap), so
// the largest text paints fast without waiting on any external stylesheet.
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});
const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-outfit",
  display: "swap",
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
    <html lang="en" suppressHydrationWarning className={`${dancingScript.variable} ${dancingScriptAlt.variable} ${cinzel.variable} ${lora.variable} ${fredoka.variable} ${inter.variable} ${playfair.variable} ${outfit.variable}`}>
      <head suppressHydrationWarning>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Warm the secondary/template font stylesheet at high priority… */}
        <link rel="preload" as="style" href={FONTS_HREF} />
        {/* …but load it WITHOUT blocking render: the link is created with
            media="print" (ignored for screen, so non-blocking) and flipped to
            "all" only once it finishes downloading. This replaces the old
            render-blocking `@import` in globals.css (~1.1s LCP saving). */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var l=document.createElement('link');l.rel='stylesheet';l.href=${JSON.stringify(
              FONTS_HREF
            )};l.media='print';l.onload=function(){this.media='all'};document.head.appendChild(l);})();`,
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
