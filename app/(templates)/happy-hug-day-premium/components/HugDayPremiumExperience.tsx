"use client";

// happy-hug-day-premium — "Hold Me for 20 Seconds". PLACEHOLDER: the shared PremiumPlaceholder (gate → song →
// voice → letter → film reel → P.S. → reply → poster) so the route works end
// to end. OWNED BY THIS DAY'S BUILDER: replace it with the brief's scenes
// (.template-factory/premium/brief-happy-hug-day-premium.md), built on
// ../../_valentine/kit/premium (see PREMIUM-ENGINE.md).

import { PremiumPlaceholder } from "../../_valentine/kit/premium";
import type { ExperienceProps } from "../../_valentine/types";

export default function HugDayPremiumExperience(props: ExperienceProps) {
  return <PremiumPlaceholder {...props} slug="happy-hug-day-premium" />;
}
