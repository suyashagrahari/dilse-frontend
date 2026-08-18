// ─── Copy the contract does not cover ────────────────────────────────────────
//
// `COPY` in the frozen contract owns every string that carries a JUDGEMENT —
// the status lines, the prompts, the moment. It does not cover the labels on
// the archive, the poem and the letters screens, which did not exist when it
// was written.
//
// Rather than scatter those inline where they cannot be audited, they are
// collected here in one object with the same shape, and the template's
// verification pass runs `assertWarmCopy` over BOTH this and `COPY`. If any of
// these earn their place they should be folded into the contract.
//
// Two of them are load-bearing rather than cosmetic:
//
//   `grid.missed` is "a quiet day", NOT "missed". `CellState` calls that state
//   "missed" internally and that is fine — it is a variable name. The moment it
//   reaches a human it becomes a description of a day rather than an accusation
//   about a person.
//
//   `stats.firstMoreOften` is phrased as a habit ("tends to get here first"),
//   not as a win rate. `deriveStats` hands us a percentage; making it sound
//   like a leaderboard is a choice, and it is the wrong one.

export const ARCHIVE_COPY = {
  archive: {
    title: "everything so far",
    back: "back",
    legend: "both · one of you · covered · a quiet day",
  },
  grid: {
    both: "both of you",
    half: "one of you",
    covered: "covered",
    missed: "a quiet day",
    future: "",
  },
  stats: {
    longest: "longest",
    current: "right now",
    total: "days in all",
    mostUsed: "most said",
    firstMoreOften: (name: string, percent: number) => `${name} tends to get here first · ${percent}%`,
    earliest: (name: string, time: string) => `earliest was ${name}, ${time}`,
    latest: (name: string, time: string) => `latest was ${name}, ${time}`,
  },
  day: {
    noWords: "no words this day",
    noPhoto: "",
    prev: "earlier day",
    next: "later day",
    close: "close",
  },
  poem: {
    title: "the poem",
    subtitle: "read down, or across",
    empty: "the poem starts with the first word either of you writes.",
  },
  letters: {
    title: "letters",
    open: "open it",
    openedOn: (date: string) => `opened ${date}`,
    weekly: (week: number) => `week ${week}`,
    none: "the letters arrive as the days do.",
  },
  share: {
    title: "the card",
    save: "save the card",
    saving: "saving…",
  },
} as const;

/** Every string above, flattened, so `assertWarmCopy` can be run over it. */
export function archiveCopyStrings(): string[] {
  const a = ARCHIVE_COPY;
  return [
    a.archive.title,
    a.archive.back,
    a.archive.legend,
    a.grid.both,
    a.grid.half,
    a.grid.covered,
    a.grid.missed,
    a.stats.longest,
    a.stats.current,
    a.stats.total,
    a.stats.mostUsed,
    a.stats.firstMoreOften("Ananya", 62),
    a.stats.earliest("Ananya", "6:41 am"),
    a.stats.latest("Rohan", "11:52 pm"),
    a.day.noWords,
    a.day.prev,
    a.day.next,
    a.day.close,
    a.poem.title,
    a.poem.subtitle,
    a.poem.empty,
    a.letters.title,
    a.letters.open,
    a.letters.openedOn("7 August"),
    a.letters.weekly(3),
    a.letters.none,
    a.share.title,
    a.share.save,
    a.share.saving,
  ];
}
