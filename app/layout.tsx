import type { Metadata } from "next";
import { Dancing_Script } from "next/font/google";
import Providers from "@/components/Providers";
import "./globals.css";

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-script",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gifts - Make Every Moment Special",
  description:
    "Create stunning personalized pages for birthdays, anniversaries, apologies, and more. Share your feelings with a beautiful link.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={dancingScript.variable}>
      <body className="antialiased transition-colors duration-300" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
