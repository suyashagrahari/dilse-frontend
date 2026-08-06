import { TrainFront, TicketCheck, MapPin, Clock, Download } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";

export const config: TemplatePageConfig = {
  slug: "train-ticket",
  type: "love",
  category: "gf",
  title: "Train Ticket",
  description:
    "A long-distance love letter disguised as a train ticket. Check the PNR, watch the waitlist clear, then read the running status of your whole relationship.",
  emoji: "🚆",
  color: "from-slate-500 to-zinc-700",
  previewText: "WL 47 → CNF ✓",
  bodyText:
    "Chart prepared. Seats confirmed. Adjacent. Running late by 4 months — reason: circumstances beyond our control.",
  bgGradient: "from-slate-50 via-stone-50 to-white",
  coverImage: "/templates/train-ticket/cover.jpg",
  tabs: [
    { id: "pnr", icon: TrainFront, label: "PNR" },
    { id: "ticket", icon: TicketCheck, label: "Ticket" },
    { id: "route", icon: MapPin, label: "Route" },
    { id: "countdown", icon: Clock, label: "Countdown" },
    { id: "save", icon: Download, label: "Save" },
  ],
  navActiveColor: "text-slate-700",
  navActiveBg: "bg-slate-700/10",
  floatStyle: "circles",
  pages: {
    cover: {
      subtitle: "Your PNR status is ready to be checked.",
      ctaText: "Get status",
      floatingEmojis: ["🚆","🎫","🛤️","✨","📍"],
    },
    letter: {
      headerEmoji: "🎫",
      title: "Electronic Reservation Slip",
      greeting: "Dear passenger,",
      decorEmojis: ["🚆","🛤️","📍"],
    },
    final: {
      headerEmoji: "🚆",
      title: "CNF",
      subtitle: "Coach S4 · Seats 41, 42 · Adjacent",
      wishes: ["Reach the platform 30 minutes prior to departure 🛤️","I have been on this platform since March 2023 📍","In case of cancellation, no refund shall be admissible. I'm not cancelling 🎫"],
      closingEmoji: "✨",
      closingSubtext: "Indian Hearts Railway",
    },
  },
};
