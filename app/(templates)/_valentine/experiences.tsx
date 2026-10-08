"use client";

// slug → the day's Experience, loaded lazily (each day is its own chunk, so the
// editor of one day and every recipient page only download their own day).

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { DaySlug, ExperienceProps } from "./types";

const Loading = () => <div style={{ minHeight: "100dvh" }} aria-busy="true" />;

const EXPERIENCES: Record<DaySlug, ComponentType<ExperienceProps>> = {
  "happy-rose-day": dynamic(() => import("../happy-rose-day/components/RoseDayExperience"), { ssr: false, loading: Loading }),
  "happy-propose-day": dynamic(() => import("../happy-propose-day/components/ProposeDayExperience"), { ssr: false, loading: Loading }),
  "happy-chocolate-day": dynamic(() => import("../happy-chocolate-day/components/ChocolateDayExperience"), { ssr: false, loading: Loading }),
  "happy-teddy-day": dynamic(() => import("../happy-teddy-day/components/TeddyDayExperience"), { ssr: false, loading: Loading }),
  "happy-promise-day": dynamic(() => import("../happy-promise-day/components/PromiseDayExperience"), { ssr: false, loading: Loading }),
  "happy-hug-day": dynamic(() => import("../happy-hug-day/components/HugDayExperience"), { ssr: false, loading: Loading }),
  "happy-kiss-day": dynamic(() => import("../happy-kiss-day/components/KissDayExperience"), { ssr: false, loading: Loading }),
  "happy-valentines-day": dynamic(() => import("../happy-valentines-day/components/ValentinesDayExperience"), { ssr: false, loading: Loading }),
  "happy-halloween": dynamic(() => import("../happy-halloween/components/HalloweenExperience"), { ssr: false, loading: Loading }),
  // ✦ Premium twins
  "happy-rose-day-premium": dynamic(() => import("../happy-rose-day-premium/components/RoseDayPremiumExperience"), { ssr: false, loading: Loading }),
  "happy-propose-day-premium": dynamic(() => import("../happy-propose-day-premium/components/ProposeDayPremiumExperience"), { ssr: false, loading: Loading }),
  "happy-chocolate-day-premium": dynamic(() => import("../happy-chocolate-day-premium/components/ChocolateDayPremiumExperience"), { ssr: false, loading: Loading }),
  "happy-teddy-day-premium": dynamic(() => import("../happy-teddy-day-premium/components/TeddyDayPremiumExperience"), { ssr: false, loading: Loading }),
  "happy-promise-day-premium": dynamic(() => import("../happy-promise-day-premium/components/PromiseDayPremiumExperience"), { ssr: false, loading: Loading }),
  "happy-hug-day-premium": dynamic(() => import("../happy-hug-day-premium/components/HugDayPremiumExperience"), { ssr: false, loading: Loading }),
  "happy-kiss-day-premium": dynamic(() => import("../happy-kiss-day-premium/components/KissDayPremiumExperience"), { ssr: false, loading: Loading }),
  "happy-valentines-day-premium": dynamic(() => import("../happy-valentines-day-premium/components/ValentinesDayPremiumExperience"), { ssr: false, loading: Loading }),
  "happy-halloween-premium": dynamic(() => import("../happy-halloween-premium/components/HalloweenPremiumExperience"), { ssr: false, loading: Loading }),
};

export function getExperience(slug: DaySlug): ComponentType<ExperienceProps> {
  return EXPERIENCES[slug];
}
