import { TrainFront, TicketCheck, MapPin, Clock, Download } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";

export const config: TemplatePageConfig = {
  slug: "train-ticket",
  type: "love",
  category: "gf",
  title: "Train Ticket",
  description:
    "A love train ticket they unlock with a PNR check: watch the waitlist flip WL → CNF, then open a boarding pass with a live countdown, your window-seat memories (photos with little notes), GIFs, the journey of us and a sealed letter. Pick your vibe — Midnight Express, Chai Break, Monsoon Ride or Pink Sleeper.",
  emoji: "🚆",
  color: "from-slate-500 to-zinc-700",
  previewText: "WL 47 → CNF ✓",
  bodyText:
    "Chart prepared. Seats confirmed. Adjacent. Running late by 4 months — reason: circumstances beyond our control.",
  bgGradient: "from-slate-50 via-stone-50 to-white",
  coverImage: templateMedia("train-ticket", "cover.jpg"),
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
