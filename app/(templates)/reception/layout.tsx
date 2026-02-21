import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Luxury Reception Night | Digital Invitation",
  description:
    "A cinematic, ultra-modern reception invitation — luxury night gala meets modern India. RSVP, gallery, blessings & more.",
  openGraph: {
    title: "You're Invited to Our Reception Night 🥂",
    description:
      "Join us for a night of celebration, love & unforgettable memories.",
    type: "website",
  },
};

export default function ReceptionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
