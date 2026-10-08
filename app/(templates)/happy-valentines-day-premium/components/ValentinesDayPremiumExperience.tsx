"use client";

// happy-valentines-day-premium — "Our Film". PLACEHOLDER: the shared PremiumPlaceholder (gate → song →
// voice → letter → film reel → P.S. → reply → poster) so the route works end
// to end. OWNED BY THIS DAY'S BUILDER: replace it with the brief's scenes
// (.template-factory/premium/brief-happy-valentines-day-premium.md), built on
// ../../_valentine/kit/premium (see PREMIUM-ENGINE.md).

import { PremiumPlaceholder } from "../../_valentine/kit/premium";
import type { ExperienceProps } from "../../_valentine/types";

export default function ValentinesDayPremiumExperience(props: ExperienceProps) {
  return <PremiumPlaceholder {...props} slug="happy-valentines-day-premium" />;
}
