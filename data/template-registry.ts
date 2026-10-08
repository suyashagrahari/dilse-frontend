import type { TemplateListItem } from "@/types/template-config";

import { config as valentineGf } from "@/app/(templates)/valentine-gf/config";
import { config as valentineBestfriend } from "@/app/(templates)/valentine-bestfriend/config";
import { config as birthdayGf } from "@/app/(templates)/birthday-gf/config";
import { config as birthdayFriend } from "@/app/(templates)/birthday-friend/config";
import { config as birthdayParents } from "@/app/(templates)/birthday-parents/config";
import { config as birthdayBestfriend } from "@/app/(templates)/birthday-bestfriend/config";
import { config as sorryGf } from "@/app/(templates)/sorry-gf/config";
import { config as sorryFriend } from "@/app/(templates)/sorry-friend/config";
import { config as apologyDashboard } from "@/app/(templates)/apology-dashboard/config";
import { config as missyouGf } from "@/app/(templates)/missyou-gf/config";
import { config as bouquetGf } from "@/app/(templates)/bouquet-gf/config";
import { config as courtOfLove } from "@/app/(templates)/court-of-love/config";
import { config as proposal } from "@/app/(templates)/proposal/config";
import { config as missyouBestfriend } from "@/app/(templates)/missyou-bestfriend/config";
import { config as anniversaryGf } from "@/app/(templates)/anniversary-gf/config";
import { config as anniversaryParents } from "@/app/(templates)/anniversary-parents/config";
import { config as loveGf } from "@/app/(templates)/love-gf/config";
import { config as darling } from "@/app/(templates)/darling/config";
import { config as weddingShaadi } from "@/app/(templates)/wedding-shaadi/config";
import { config as reception } from "@/app/(templates)/reception/config";
import { config as eidMubarak } from "@/app/(templates)/eid-mubarak/config";
import { config as holi } from "@/app/(templates)/holi/config";
import { config as shaadiCard } from "@/app/(templates)/shaadi-card/config";
import { config as christianWedding } from "@/app/(templates)/christian-wedding/config";
import { config as christianWedding2 } from "@/app/(templates)/christian-wedding-2/config";
import { config as courtMarriage } from "@/app/(templates)/court-marriage/config";
import { config as holdMyHand } from "@/app/(templates)/hold-my-hand/config";
import { config as trainTicket } from "@/app/(templates)/train-ticket/config";
import { config as legalNotice } from "@/app/(templates)/legal-notice/config";
import { config as kundliMilan } from "@/app/(templates)/kundli-milan/config";
import { config as vendingMachine } from "@/app/(templates)/vending-machine/config";
import { config as catchGame } from "@/app/(templates)/catch/config";
import { config as flags } from "@/app/(templates)/flags/config";
import { config as dateInvitation } from "@/app/(templates)/date-invitation/config";
import { config as photoPuzzle } from "@/app/(templates)/photo-puzzle/config";
import { config as loveflix } from "@/app/(templates)/loveflix/config";
import { config as rewind } from "@/app/(templates)/rewind/config";
import { config as streak } from "@/app/(templates)/streak/config";
import { config as dedication } from "@/app/(templates)/dedication/config";
import { config as searched } from "@/app/(templates)/searched/config";
import { config as capsule } from "@/app/(templates)/capsule/config";
import { config as us } from "@/app/(templates)/us/config";
import { config as product } from "@/app/(templates)/product/config";
import { config as watch } from "@/app/(templates)/watch/config";
import { config as call } from "@/app/(templates)/call/config";
import { config as recharge } from "@/app/(templates)/recharge/config";
import { config as challan } from "@/app/(templates)/challan/config";
import { config as nutrition } from "@/app/(templates)/nutrition/config";
import { config as appListing } from "@/app/(templates)/app/config";
import { config as profilePro } from "@/app/(templates)/profile-pro/config";
import { config as rakshaBandhan } from "@/app/(templates)/happy-rakshabandhan-to-brother/config";
import { config as rakshaBandhanSister } from "@/app/(templates)/happy-rakshabandhan-to-sister/config";
import { config as ganeshChaturthi } from "@/app/(templates)/happy-ganesh-chaturthi/config";
import { config as roseDayCfg } from "@/app/(templates)/happy-rose-day/config";
import { config as proposeDayCfg } from "@/app/(templates)/happy-propose-day/config";
import { config as chocolateDayCfg } from "@/app/(templates)/happy-chocolate-day/config";
import { config as teddyDayCfg } from "@/app/(templates)/happy-teddy-day/config";
import { config as promiseDayCfg } from "@/app/(templates)/happy-promise-day/config";
import { config as hugDayCfg } from "@/app/(templates)/happy-hug-day/config";
import { config as kissDayCfg } from "@/app/(templates)/happy-kiss-day/config";
import { config as valentinesDayCfg } from "@/app/(templates)/happy-valentines-day/config";
import { config as halloweenCfg } from "@/app/(templates)/happy-halloween/config";
import { config as roseDayPremiumCfg } from "@/app/(templates)/happy-rose-day-premium/config";
import { config as proposeDayPremiumCfg } from "@/app/(templates)/happy-propose-day-premium/config";
import { config as chocolateDayPremiumCfg } from "@/app/(templates)/happy-chocolate-day-premium/config";
import { config as teddyDayPremiumCfg } from "@/app/(templates)/happy-teddy-day-premium/config";
import { config as promiseDayPremiumCfg } from "@/app/(templates)/happy-promise-day-premium/config";
import { config as hugDayPremiumCfg } from "@/app/(templates)/happy-hug-day-premium/config";
import { config as kissDayPremiumCfg } from "@/app/(templates)/happy-kiss-day-premium/config";
import { config as valentinesDayPremiumCfg } from "@/app/(templates)/happy-valentines-day-premium/config";
import { config as halloweenPremiumCfg } from "@/app/(templates)/happy-halloween-premium/config";

// The gallery renders in this order, so the first row is the shop window: it is
// what someone sees before they have decided whether this site is for them.
//
// Newest first. The two couple templates that were just rebuilt (the radio and
// the 60-second hold) lead, then the rest of the August 2026 batch, newest
// first, then the long-running favourites. Dated festival templates sit at the
// very end once their festival has passed — a rakhi card in late September is
// a page nobody is shopping for. Move one back to the top only in the fortnight
// before its date.
const allConfigs = [
  // ── Halloween (31 Oct) — in its fortnight, so it leads the shop window.
  //    Ships hidden on the apex (server DEFAULT_HIDDEN) until the super admin
  //    releases it in /admin/templates. Move it to the dated-festival tail
  //    after 31 October. ────────────────────────────────────────────────────
  halloweenCfg,
  halloweenPremiumCfg,

  // ── Valentine's week (7–14 Feb), in week order. Ship hidden on the apex
  //    (server DEFAULT_HIDDEN); the super admin releases each day. ─────────
  roseDayCfg,
  proposeDayCfg,
  chocolateDayCfg,
  teddyDayCfg,
  promiseDayCfg,
  hugDayCfg,
  kissDayCfg,
  valentinesDayCfg,

  // ── ✦ Premium ($4) twins of the Valentine days. In the MAIN grid (gold
  //    premium frame) AND the Premium tab — see ULTRA_PREMIUM_SLUGS. Hidden on
  //    the apex until released (server DEFAULT_HIDDEN). ─────────────────────
  roseDayPremiumCfg,
  proposeDayPremiumCfg,
  chocolateDayPremiumCfg,
  teddyDayPremiumCfg,
  promiseDayPremiumCfg,
  hugDayPremiumCfg,
  kissDayPremiumCfg,
  valentinesDayPremiumCfg,

  // ── new & just rebuilt ────────────────────────────────────────────────────
  kundliMilan,
  dateInvitation,
  dedication,
  holdMyHand,

  // ── the August 2026 batch, newest first ───────────────────────────────────
  profilePro,
  nutrition,
  challan,
  appListing,
  watch,
  recharge,
  product,
  call,
  us,
  streak,
  searched,
  capsule,
  vendingMachine,
  trainTicket,
  rewind,
  photoPuzzle,
  loveflix,
  legalNotice,
  flags,
  courtMarriage,
  catchGame,
  proposal,
  courtOfLove,

  // ── the long-running favourites ───────────────────────────────────────────
  birthdayGf,
  loveGf,
  darling,
  missyouGf,
  bouquetGf,
  apologyDashboard,
  birthdayFriend,
  birthdayParents,
  birthdayBestfriend,
  valentineGf,
  valentineBestfriend,
  sorryGf,
  sorryFriend,
  missyouBestfriend,
  anniversaryGf,
  anniversaryParents,
  weddingShaadi,
  reception,
  eidMubarak,
  holi,
  shaadiCard,
  christianWedding,

  // ── dated festivals, past their date ──────────────────────────────────────
  ganeshChaturthi,
  rakshaBandhan,
  rakshaBandhanSister,
];

/**
 * The premium collection: the real-app clones. They live in the gallery's
 * Premium tab (everything else is under Freemium) and get a luxury card
 * instead of the standard one.
 */
export const PREMIUM_SLUGS = new Set([
  "loveflix", "us", "app", "watch", "product", "recharge", "call", "catch",
  "profile-pro", "searched", "streak", "rewind",
]);

/**
 * The ✦ Premium ($4) tier: cinematic twins of the engine templates. Unlike
 * PREMIUM_SLUGS they stay in the MAIN (freemium) grid — with the gold premium
 * card — and ALSO show in the Premium tab. Never add them to PREMIUM_SLUGS:
 * that moves a template OUT of the main grid.
 */
export const ULTRA_PREMIUM_SLUGS: ReadonlySet<string> = new Set([
  "happy-rose-day-premium",
  "happy-propose-day-premium",
  "happy-chocolate-day-premium",
  "happy-teddy-day-premium",
  "happy-promise-day-premium",
  "happy-hug-day-premium",
  "happy-kiss-day-premium",
  "happy-valentines-day-premium",
  "happy-halloween-premium",
]);

function toListItem(c: typeof allConfigs[number]): TemplateListItem {
  return {
    premium: PREMIUM_SLUGS.has(c.slug),
    ultra: ULTRA_PREMIUM_SLUGS.has(c.slug),
    slug:        c.slug,
    type:        c.type,
    category:    c.category,
    title:       c.title,
    description: c.description,
    emoji:       c.emoji,
    color:       c.color,
    bgGradient:  c.bgGradient,
    coverImage:  c.coverImage,
  };
}

export const templateList: TemplateListItem[] = allConfigs.map(toListItem);

const webpageConfigs = [christianWedding2];

export const webpageTemplateList: TemplateListItem[] = webpageConfigs.map(toListItem);

export const templateTypes = [
  { id: "birthday", label: "Birthday", emoji: "🎂" },
  { id: "valentine", label: "Valentine", emoji: "💝" },
  { id: "sorry", label: "Sorry", emoji: "🥺" },
  { id: "missyou", label: "Miss You", emoji: "💫" },
  { id: "anniversary", label: "Anniversary", emoji: "💍" },
  { id: "love", label: "Love", emoji: "💕" },
  { id: "wedding", label: "Wedding", emoji: "💍" },
  { id: "festival", label: "Festival", emoji: "🌙" },
];

export const categories = [
  { id: "all", label: "All", emoji: "✨" },
  { id: "gf", label: "Girlfriend", emoji: "💕" },
  { id: "friend", label: "Friend", emoji: "🤝" },
  { id: "parents", label: "Parents", emoji: "👨‍👩‍👧" },
  { id: "bestfriend", label: "Best Friend", emoji: "💛" },
  { id: "wedding", label: "Wedding", emoji: "💍" },
  { id: "festival", label: "Festival", emoji: "🌙" },
];
