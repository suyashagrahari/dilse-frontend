// The faith profiles by slug (the studio reads the faith from day.slug).
import { SIKH } from "./sikh";
import { MUSLIM } from "./muslim";
import { CHRISTIAN } from "./christian";
import { TAMIL } from "./tamil";
import { TELUGU } from "./telugu";
import { KANNADA } from "./kannada";
import { MALAYALAM } from "./malayalam";
import { MARATHI } from "./marathi";
import type { FaithProfile } from "../types";

export const FAITHS: Record<string, FaithProfile> = Object.fromEntries([SIKH, MUSLIM, CHRISTIAN, TAMIL, TELUGU, KANNADA, MALAYALAM, MARATHI].map((f) => [f.slug, f]));

/** The profile for a slug (Holy Matrimony for anything unknown, so the editor never crashes). */
export const faithFor = (slug: string): FaithProfile => FAITHS[slug] ?? CHRISTIAN;
