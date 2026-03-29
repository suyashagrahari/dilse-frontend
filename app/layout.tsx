import type { Metadata, Viewport } from "next";
import { Dancing_Script, Cinzel, Lora } from "next/font/google";
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
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-512.png",
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
  themeColor: "#f43f5e",
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
    <html lang="en" suppressHydrationWarning className={`${dancingScript.variable} ${dancingScriptAlt.variable} ${cinzel.variable} ${lora.variable}`}>
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
