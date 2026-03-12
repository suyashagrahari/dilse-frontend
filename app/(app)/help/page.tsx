import type { Metadata } from "next";
import { buildMeta } from "@/lib/seo";
import LuxuryMobileTopBrand from "@/components/LuxuryMobileTopBrand";

export const metadata: Metadata = buildMeta({
  title: "Help | SubhSandesh",
  description:
    "Find quick help for creating, publishing, and sharing your SubhSandesh celebration pages.",
});

const CORNER_FILTER =
  "brightness(0) saturate(100%) invert(8%) sepia(55%) saturate(2800%) hue-rotate(330deg) brightness(90%) contrast(120%)";

const faqs = [
  {
    q: "How do I create my first page?",
    a: "Go to Templates, pick an occasion, add your photos and message, then publish your page.",
  },
  {
    q: "Can I protect my page with password?",
    a: "Yes. While publishing, enable password protection and share only with trusted people.",
  },
  {
    q: "Can I edit after publishing?",
    a: "Yes. Open Profile > My Creations, choose a card, and click Edit This Card.",
  },
];

export default function HelpPage() {
  return (
    <main
      className="min-h-screen overflow-x-hidden"
      style={{ background: "#f5ede6", color: "#2a0a0e", fontFamily: "'Inter', sans-serif" }}
    >
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/indianFestival/alekhancorner2.svg" alt="" aria-hidden="true" style={{ position: "fixed", top: 0, left: 0, width: "clamp(112px, 30vw, 180px)", height: "clamp(112px, 30vw, 180px)", opacity: 0.62, transform: "scaleY(-1)", filter: CORNER_FILTER }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/indianFestival/alekhancorner2.svg" alt="" aria-hidden="true" style={{ position: "fixed", top: 0, right: 0, width: "clamp(112px, 30vw, 180px)", height: "clamp(112px, 30vw, 180px)", opacity: 0.62, transform: "scale(-1,-1)", filter: CORNER_FILTER }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/indianFestival/alekhancorner2.svg" alt="" aria-hidden="true" style={{ position: "fixed", bottom: 0, left: 0, width: "clamp(86px, 24vw, 170px)", height: "clamp(86px, 24vw, 170px)", opacity: 0.54, filter: CORNER_FILTER }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/indianFestival/alekhancorner2.svg" alt="" aria-hidden="true" style={{ position: "fixed", bottom: 0, right: 0, width: "clamp(86px, 24vw, 170px)", height: "clamp(86px, 24vw, 170px)", opacity: 0.54, transform: "scaleX(-1)", filter: CORNER_FILTER }} />
      </div>
      <LuxuryMobileTopBrand />

      <section className="relative z-[1] max-w-5xl mx-auto px-3 md:px-5 pt-10 pb-24 md:pt-32">
        <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.28em] mb-3 text-center" style={{ color: "#c9a84c" }}>
          Help Center
        </p>
        <h1 className="text-[42px] md:text-[72px] leading-[0.94] tracking-[-0.03em] text-center" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
          Quick Answers
          <em style={{ color: "#c9a84c", fontStyle: "italic" }}> for Every Moment.</em>
        </h1>
        <p className="text-center mt-5 text-base md:text-lg max-w-2xl mx-auto" style={{ color: "#7a5555" }}>
          We are here to make your gifting journey simple, warm, and stress-free.
        </p>

        <div className="mt-10 space-y-5 md:space-y-6">
          {faqs.map((item, idx) => (
            <article
              key={item.q}
              className="relative overflow-hidden rounded-3xl border p-6 md:p-7 w-[90%] md:w-full mx-auto"
              style={{ borderColor: "rgba(61,12,17,0.14)", background: "rgba(255,255,255,0.82)" }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 5,
                  background: "linear-gradient(90deg,#3d0c11,#c9a84c,#3d0c11)",
                }}
              />
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] mb-3" style={{ color: "#c9a84c" }}>
                Help {String(idx + 1).padStart(2, "0")}
              </p>
              <h2
                className="text-[32px] md:text-[40px] leading-[1.02] tracking-[-0.02em] mb-3"
                style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: "#2a0a0e" }}
              >
                {item.q}
              </h2>
              <p className="text-[16px] md:text-[18px] leading-[1.7]" style={{ color: "#7a5555" }}>
                {item.a}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
