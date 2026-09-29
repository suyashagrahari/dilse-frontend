// One place that turns a Title into what a card, a hover preview or the
// details modal prints about it.

import type { Title } from "./context";
import { captionLines, fmtRuntime } from "./theme";
import { progressOf, runtimeOf, stillPool, type Crop, type LoveflixData } from "./types";

export interface Described {
  title: string;
  src: string;
  crop?: Crop;
  synopsis: string;
  /** "47m", "6 Episodes", "Coming Soon". */
  length: string;
  tags: string[];
  /** A red ribbon on the card ("Recently Added"). */
  ribbon?: string;
  match: number;
  progress?: number;
  episodeLabel?: string;
}

/** A photo for a catalogue card: the page's own photos, cycled (plus demo stills in the demo). */
const photoFor = (d: LoveflixData, i: number) => {
  const pool = stillPool(d);
  if (!pool.length) return { src: "", crop: undefined as Crop | undefined };
  return pool[i % pool.length];
};

export function describe(t: Title, d: LoveflixData): Described {
  const names = [d.recipientName, d.senderName].filter(Boolean).join(" & ");
  const tags = d.genres.length ? d.genres : ["Romantic"];
  switch (t.kind) {
    case "show":
      return {
        title: d.showTitle,
        src: d.heroImageUrl || photoFor(d, 0).src,
        crop: d.heroImageUrl ? d.heroCrop : photoFor(d, 0).crop,
        synopsis: d.tagline,
        length: d.seasons || `${d.episodes.length} Episodes`,
        tags,
        match: d.matchPercent,
      };
    case "episode": {
      const e = d.episodes[t.index];
      const rt = runtimeOf(e?.title ?? "", t.index);
      return {
        title: e?.title ?? "",
        src: e?.imageUrl ?? "",
        crop: e?.crop,
        synopsis: e?.synopsis || captionLines(e?.subtitle ?? "")[0] || "",
        length: fmtRuntime(rt),
        tags,
        match: d.matchPercent,
        progress: progressOf(e?.title ?? "", t.index),
        episodeLabel: `E${t.index + 1}`,
      };
    }
    case "reason": {
      const p = photoFor(d, t.index + 1);
      return {
        title: d.reasons[t.index] ?? "",
        src: p.src,
        crop: p.crop,
        synopsis: `#${t.index + 1} in ${d.senderName || "my"}'s heart today. A documentary filmed daily${d.metYear ? ` since ${d.metYear}` : ""}, starring ${d.recipientName || "you"}.`,
        length: "Docuseries",
        tags: ["Heartfelt", "Based on a True Story", tags[0]].filter((v, i, a) => a.indexOf(v) === i),
        match: 100,
      };
    }
    case "joke": {
      const blurbs = [
        "An inside joke so inside that exactly two people on Earth get it.",
        "Based on true events. Both leads still dispute what actually happened.",
        "A slow-burn comedy that gets funnier every single time it's retold.",
        `Critically acclaimed by ${names || "the only two critics that matter"}. Everyone else: confused.`,
        "Contains scenes of uncontrollable laughing in public places.",
        "The director's cut runs forever. Nobody has asked for it to stop.",
        "Rated 100% by the only audience that matters.",
        "Streaming exclusively in two group chats and one very long voice note.",
      ];
      return {
        title: d.insideJokes[t.index] ?? "",
        src: photoFor(d, t.index + 7).src,
        crop: photoFor(d, t.index + 7).crop,
        synopsis: blurbs[t.index % blurbs.length],
        length: fmtRuntime(runtimeOf(d.insideJokes[t.index] ?? "", t.index + 40) + 60),
        tags: ["Comedy", "Cult Classic", "Inside Joke"],
        ribbon: t.index % 3 === 0 ? "Recently Added" : t.index % 3 === 1 ? "New Episodes" : undefined,
        match: 97 + (t.index % 3),
      };
    }
    case "plan": {
      const p = photoFor(d, t.index + 11);
      return {
        title: d.plans[t.index] ?? "",
        src: p.src,
        crop: p.crop,
        synopsis: `Coming soon. Starring ${names || "the two of us"}. Release date: whenever you say yes.`,
        length: "Coming Soon",
        tags: ["Upcoming", "Adventure", tags[0]].filter((v, i, a) => a.indexOf(v) === i),
        ribbon: "Coming Soon",
        match: 98,
      };
    }
  }
}
