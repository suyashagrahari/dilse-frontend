// ─── Building the premium draft from a story-fill patch ──────────────────────
//
// For the birthday upgrade paths the server answers with a PATCH (schema path →
// value, from the same story fill "✨ Write it for me" uses), not a whole draft.
// This lays it over the premium template's demo and carries across what the
// server never sees:
//
//   names        → recipientName / senderName (and petName when they gave one)
//   photos       → theirs, captions and notes kept, capped at the template's
//                  limit; NONE when they added none (the demo's sample photos
//                  must never look like theirs)
//   voice note   → cleared: the demo's recording is not their voice
//
// The result is what the premium editor restores into preview (offer.ts
// handDraftTo), every field still editable.

import { loadStorySchema } from "@/lib/ai-fill/api";
import { applyPatch } from "@/lib/ai-fill/applyPatch";
import { getDay } from "@/app/(templates)/_valentine/days";
import { demoData, type DaySlug, type LovePhoto, type ValentineDayData } from "@/app/(templates)/_valentine/types";

export interface CarriedContent {
  recipientName: string;
  senderName: string;
  petName?: string;
  photos: LovePhoto[];
}

export async function composeValentineDraft(to: DaySlug, patch: Record<string, unknown>, carry: CarriedContent): Promise<ValentineDayData> {
  const day = getDay(to);
  let d = demoData(to);
  const schema = await loadStorySchema(to);
  if (schema) d = applyPatch(d, schema, patch, { overwriteExisting: true }).next;
  else if (typeof patch.letter === "string") d.letter = patch.letter;
  d.letter = d.letter.slice(0, day.letterMax);
  d.recipientName = carry.recipientName.slice(0, 30);
  d.senderName = carry.senderName.slice(0, 30);
  if (carry.petName) d.petName = carry.petName.slice(0, 24);
  d.photos = carry.photos.filter((p) => p && typeof p.url === "string" && p.url).slice(0, day.maxPhotos);
  if (d.premium) d.premium = { ...d.premium, voiceNote: "", voiceNoteSec: 0, voicePeaks: [] };
  return d;
}
