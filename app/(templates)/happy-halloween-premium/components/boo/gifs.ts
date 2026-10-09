// The GIF stickers (all on our CDN, from .template-factory/premium-v3/gifs.json).
// Six of them are sender-swappable slots (day config `gifSlots`); the rest are
// fixed little reactors that dress each scene.
import { MEDIA_BASE } from "@/lib/templateMedia";

const H = (n: string) => `${MEDIA_BASE}/templates/_premium/gifs/halloween/${n}.webp`;
const C = (n: string) => `${MEDIA_BASE}/templates/_premium/gifs/common/${n}.webp`;
const P = (folder: string, n: string) => `${MEDIA_BASE}/templates/_premium/gifs/${folder}/${n}.webp`;

export const GIF = {
  // halloween
  boo: H("ghost-boo-pumpkins"),
  bucket: H("ghost-pumpkin-bucket"),
  catPumpkin: H("black-cat-pumpkin-peek"),
  pinkPumpkin: H("pink-pumpkin-smile"),
  blush: H("ghost-heart-eyes-blush"),
  spookyLove: H("ghost-spooky-love"),
  couple: H("ghost-couple-hearts"),
  broom: H("witch-bears-broom"),
  cuddle: H("ghosts-cuddling"),
  pandaBat: H("panda-pumpkin-bat"),
  heartEyes: H("ghost-heart-eyes"),
  bride: H("ghost-bride-hearts"),
  // common (animated emoji)
  bat: C("noto-bat"),
  loveLetter: C("noto-love-letter"),
  pleading: C("noto-pleading-face"),
  crying: C("noto-loudly-crying"),
  jack: C("noto-jack-o-lantern"),
  sparkles: C("noto-sparkles"),
  // couple bears from the other days, for the YES
  bearsHug: P("hug-day", "bears-cheek-hug"),
} as const;

/** Slot id → its default (mirrors `file` in the day config's gifSlots). */
export const SLOT_DEFAULT: Record<string, string> = {
  "hb1-hello": GIF.boo,
  "hb2-treats": GIF.bucket,
  "hb3-pumpkin": GIF.pinkPumpkin,
  "hb4-booth": GIF.cuddle,
  "hb5-potion": GIF.broom,
  "hb6-yes": GIF.couple,
};
