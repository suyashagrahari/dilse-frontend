"use client";

// ─── Rewind — kind -> component ──────────────────────────────────────────────
//
// Written by the lead. The deck (buildDeck.ts) decides membership and order; this
// only maps a kind to the component that draws it. Adding a slide means adding a
// kind in slideTypes.ts, an entry in ORDER, and a line here.

import type React from "react";
import type { SlideKind, SlideProps } from "../slideTypes";

import ColdOpenSlide from "./ColdOpenSlide";
import DateSlide from "./DateSlide";
import BigNumberSlide from "./BigNumberSlide";
import BreakdownSlide from "./BreakdownSlide";
import TopFiveSlide from "./TopFiveSlide";
import JokeStatSlide from "./JokeStatSlide";
import PhotoStackSlide from "./PhotoStackSlide";
import SongSlide from "./SongSlide";
import BuildUpSlide from "./BuildUpSlide";
import ArchetypeSlide from "./ArchetypeSlide";
import ClosingSlide from "./ClosingSlide";

export const SLIDE_REGISTRY: Record<SlideKind, React.ComponentType<SlideProps>> = {
  cold: ColdOpenSlide,
  date: DateSlide,
  bigNumber: BigNumberSlide,
  breakdown: BreakdownSlide,
  top5: TopFiveSlide,
  joke: JokeStatSlide,
  photos: PhotoStackSlide,
  song: SongSlide,
  buildup: BuildUpSlide,
  archetype: ArchetypeSlide,
  closing: ClosingSlide,
};
