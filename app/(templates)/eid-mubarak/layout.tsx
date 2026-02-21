import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Eid Mubarak — Digital Greeting Card",
  description:
    "A beautiful Eid al-Fitr digital greeting with duas, greetings, playlist & blessings sharing.",
  keywords: ["eid mubarak", "eid al-fitr", "islamic greeting", "eid card", "eid wishes"],
  openGraph: {
    title: "Eid Mubarak 🌙",
    description: "Wishing you joy, peace, and countless blessings this Eid",
    type: "website",
  },
};

export default function EidLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
