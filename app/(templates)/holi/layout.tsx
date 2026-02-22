import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Happy Holi — Festival of Colors Digital Greeting",
  description:
    "A beautiful Holi digital greeting with colors, greetings, playlist & blessings sharing.",
  keywords: ["happy holi", "holi festival", "festival of colors", "holi card", "holi wishes"],
  openGraph: {
    title: "Happy Holi 🎨",
    description: "Wishing you joy, colors, and countless blessings this Holi",
    type: "website",
  },
};

export default function HoliLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
