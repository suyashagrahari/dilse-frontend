import localFont from "next/font/local";

/** The "us." wordmark — our own script mark. Shared by the editor layout and the /[id] viewer. */
export const usScript = localFont({
  src: [
    { path: "../../../../assets/fonts/grand-hotel-400-normal.woff2", weight: "400", style: "normal" },
  ],
  variable: "--font-us-script", display: "swap" });
