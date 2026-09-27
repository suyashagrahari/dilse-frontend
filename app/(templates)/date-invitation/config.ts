import { Mail, CalendarClock, MapPin, Route, Camera } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";

export const config: TemplatePageConfig = {
  slug: "date-invitation",
  type: "love",
  category: "gf",
  title: "The Invitation",
  description:
    "An invitation they have to answer. Say yes and it becomes a countdown — then, on the day, the plan unlocks one stop at a time while you're actually out.",
  coverImage:
    templateMedia("date-invitation", "cover-v2.webp"),
  emoji: "💌",
  color: "from-rose-400 to-amber-500",
  previewText: "you are invited. location: you'll find out 💌",
  bodyText:
    "Time, dress code, how much walking — everything except where. Four stops, revealed one at a time, on the night.",
  bgGradient: "from-amber-50 via-rose-50 to-white",
  tabs: [
    { id: "invitation", icon: Mail, label: "Invitation" },
    { id: "rsvp", icon: CalendarClock, label: "RSVP" },
    { id: "meeting", icon: MapPin, label: "Where" },
    { id: "itinerary", icon: Route, label: "The Night" },
    { id: "after", icon: Camera, label: "After" },
  ],
  navActiveColor: "text-rose-700",
  navActiveBg: "bg-rose-700/10",
  floatStyle: "hearts",
  pages: {
    cover: {
      subtitle: "Someone has planned the whole evening. You only have to answer.",
      ctaText: "Open the invitation",
      floatingEmojis: ["💌", "🕯️", "🌙", "✨", "🍷"],
    },
    letter: {
      headerEmoji: "🗺️",
      title: "The Plan",
      greeting: "Where we're going,",
      decorEmojis: ["📍", "🌙", "☕"],
    },
    final: {
      headerEmoji: "🌙",
      title: "That was the night",
      subtitle: "four stops, one route",
      wishes: [
        "You said yes before you knew where 💌",
        "Every stop was chosen on purpose 📍",
        "Same time again, soon 🌙",
      ],
      closingEmoji: "💌",
      closingSubtext: "SubhSandesh",
    },
  },
};
