// The three faith profiles by slug (the studio reads the faith from day.slug).
import { SIKH } from "./sikh";
import { MUSLIM } from "./muslim";
import { CHRISTIAN } from "./christian";
import type { FaithProfile } from "../types";

export const FAITHS: Record<string, FaithProfile> = { [SIKH.slug]: SIKH, [MUSLIM.slug]: MUSLIM, [CHRISTIAN.slug]: CHRISTIAN };

/** The profile for a slug (Holy Matrimony for anything unknown, so the editor never crashes). */
export const faithFor = (slug: string): FaithProfile => FAITHS[slug] ?? CHRISTIAN;
