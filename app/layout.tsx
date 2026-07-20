import type { Metadata, Viewport } from "next";
import { Dancing_Script, Cinzel, Lora, Fredoka, Inter } from "next/font/google";
import Providers from "@/components/Providers";
import { OrganizationJsonLd, WebAppJsonLd } from "@/components/JsonLd";
import { buildMeta, SITE_URL } from "@/lib/seo";
import "./globals.css";

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
    <html lang="en" suppressHydrationWarning className={`${dancingScript.variable} ${dancingScriptAlt.variable} ${cinzel.variable} ${lora.variable} ${fredoka.variable} ${inter.variable}`}>
      <head suppressHydrationWarning>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <OrganizationJsonLd />
        <WebAppJsonLd />
      </head>
      <body className="antialiased transition-colors duration-300" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
