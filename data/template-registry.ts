import type { TemplateListItem } from "@/types/template-config";
import { isTemplatePremium } from "@/config/templatePricing";

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

const allConfigs = [
  birthdayGf,
  birthdayFriend,
  birthdayParents,
  birthdayBestfriend,
  valentineGf,
  valentineBestfriend,
  apologyDashboard,
  sorryGf,
  sorryFriend,
  missyouGf,
  bouquetGf,
  missyouBestfriend,
  anniversaryGf,
  anniversaryParents,
  loveGf,
  darling,
  weddingShaadi,
  reception,
  eidMubarak,
  holi,
  shaadiCard,
  christianWedding,
];

function toListItem(c: typeof allConfigs[number]): TemplateListItem {
  return {
    slug:        c.slug,
    type:        c.type,
    category:    c.category,
    title:       c.title,
    description: c.description,
    emoji:       c.emoji,
    color:       c.color,
    bgGradient:  c.bgGradient,
    coverImage:  c.coverImage,
    isPremium:   isTemplatePremium(c.slug),
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
