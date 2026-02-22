import type { TemplateListItem } from "@/types/template-config";

import { config as valentineGf } from "@/app/(templates)/valentine-gf/config";
import { config as valentineBestfriend } from "@/app/(templates)/valentine-bestfriend/config";
import { config as birthdayGf } from "@/app/(templates)/birthday-gf/config";
import { config as birthdayFriend } from "@/app/(templates)/birthday-friend/config";
import { config as birthdayParents } from "@/app/(templates)/birthday-parents/config";
import { config as birthdayBestfriend } from "@/app/(templates)/birthday-bestfriend/config";
import { config as sorryGf } from "@/app/(templates)/sorry-gf/config";
import { config as sorryFriend } from "@/app/(templates)/sorry-friend/config";
import { config as missyouGf } from "@/app/(templates)/missyou-gf/config";
import { config as missyouBestfriend } from "@/app/(templates)/missyou-bestfriend/config";
import { config as anniversaryGf } from "@/app/(templates)/anniversary-gf/config";
import { config as anniversaryParents } from "@/app/(templates)/anniversary-parents/config";
import { config as loveGf } from "@/app/(templates)/love-gf/config";
import { config as weddingShaadi } from "@/app/(templates)/wedding-shaadi/config";
import { config as reception } from "@/app/(templates)/reception/config";
import { config as eidMubarak } from "@/app/(templates)/eid-mubarak/config";
import { config as holi } from "@/app/(templates)/holi/config";

const allConfigs = [
  birthdayGf,
  birthdayFriend,
  birthdayParents,
  birthdayBestfriend,
  valentineGf,
  valentineBestfriend,
  sorryGf,
  sorryFriend,
  missyouGf,
  missyouBestfriend,
  anniversaryGf,
  anniversaryParents,
  loveGf,
  weddingShaadi,
  reception,
  eidMubarak,
  holi,
];

function toListItem(c: typeof allConfigs[number]): TemplateListItem {
  return {
    slug: c.slug,
    type: c.type,
    category: c.category,
    title: c.title,
    description: c.description,
    emoji: c.emoji,
    color: c.color,
    bgGradient: c.bgGradient,
    coverImage: c.coverImage,
  };
}

export const templateList: TemplateListItem[] = allConfigs.map(toListItem);

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
