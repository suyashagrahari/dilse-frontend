// The GIF stickers (all on our CDN, from .template-factory/premium-v3/gifs.json). Six of them are sender-swappable
// slots (day config `gifSlots`); the rest are fixed little reactors that dress each room.
import { MEDIA_BASE } from "@/lib/templateMedia";

const P = (path: string) => `${MEDIA_BASE}/templates/_premium/gifs/${path}.webp`;

export const GIF = {
  // teddy day
  hello: P("teddy-day/happy-teddy-day-bear"),
  redHeart: P("teddy-day/teddy-red-heart"),
  cool: P("teddy-day/teddy-cool-heart"),
  pinkCuddle: P("teddy-day/bears-pink-cuddle"),
  yes: P("teddy-day/teddy-yes-heart-eyes"),
  loveYou: P("teddy-day/teddy-i-love-you"),
  whiteLove: P("teddy-day/bear-i-love-you-heart"),
  nuzzle: P("teddy-day/bears-nuzzle"),
  hugsPanda: P("teddy-day/teddy-hugs-panda"),
  tinyPlush: P("teddy-day/bear-tiny-plush"),
  // other days (bears, cookies, cuddles)
  sleepy: P("promise-day/bears-cuddle-promise"),
  cookie: P("chocolate-day/bear-eating-cookie"),
  penguinCookie: P("chocolate-day/penguin-munching-cookie"),
  cheekHug: P("hug-day/bears-cheek-hug"),
  backHug: P("hug-day/bears-back-hug"),
  roseTeddy: P("rose-day/teddy-rose-hearts"),
  mwah: P("kiss-day/mwah-blushing-bear"),
  // common (animated emoji)
  gift: P("common/noto-heart-ribbon"),
  sparkles: P("common/noto-sparkles"),
  pleading: P("common/noto-pleading-face"),
  crying: P("common/noto-loudly-crying"),
  holdingTears: P("common/noto-holding-back-tears"),
  heartEyes: P("common/noto-heart-eyes"),
  smilingHearts: P("common/noto-smiling-hearts"),
  dizzy: P("common/noto-dizzy"),
  glowStar: P("common/noto-glowing-star"),
  growingHeart: P("common/noto-growing-heart"),
  hugging: P("common/noto-hugging-face"),
  party: P("common/noto-party-popper"),
} as const;

/** Slot id → its default (mirrors `file` in the day config's gifSlots). */
export const SLOT_DEFAULT: Record<string, string> = {
  "td1-hello": GIF.hello,
  "td2-heart": GIF.redHeart,
  "td3-dress": GIF.cool,
  "td4-squeeze": GIF.pinkCuddle,
  "td5-sleep": GIF.sleepy,
  "td6-yes": GIF.yes,
};
