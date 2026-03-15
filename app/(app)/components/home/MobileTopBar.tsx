"use client";

import LuxuryMobileTopBrand from "@/components/LuxuryMobileTopBrand";

export default function MobileTopBar() {
  const goToHero = () => {
    const hero = document.getElementById("hero");
    if (hero) {
      hero.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return <LuxuryMobileTopBrand onBrandClick={goToHero} />;
}
