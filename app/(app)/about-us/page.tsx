import type { Metadata } from "next";
import Image from "next/image";
import { Github, Globe, Instagram, Linkedin, Twitter } from "lucide-react";
import { buildMeta, SITE_URL } from "@/lib/seo";
import LuxuryMobileTopBrand from "@/components/LuxuryMobileTopBrand";
import BusinessDetails from "@/components/legal/BusinessDetails";

export const metadata: Metadata = buildMeta({
  title: "About Us | SubhSandesh",
  description:
    "Learn about SubhSandesh and how we craft heartfelt Indian celebration pages with premium design and emotion-first storytelling.",
  alternates: { canonical: `${SITE_URL}/about-us` },
});

const CORNER_FILTER =
  "brightness(0) saturate(100%) invert(8%) sepia(55%) saturate(2800%) hue-rotate(330deg) brightness(90%) contrast(120%)";

const LINKS = {
  linkedin: "https://www.linkedin.com/in/suyash-agrahari-717260228/",
  portfolio: "https://portfolio-website-mu-fawn-27.vercel.app/",
  twitter: "https://x.com/SuyashAgrahari?t=VicKG-jlXCCOPL5IAX4xOQ&s=08",
  github: "https://github.com/suyashagrahari",
  instagram: "https://www.instagram.com/suyash_agrahari_?igsh=MWx2Z2R0aWY0ZWZocw==",
};

export default function AboutUsPage() {
  return (
    <main
      className="min-h-screen overflow-x-hidden"
      style={{ background: "#f5ede6", color: "#2a0a0e", fontFamily: "'Inter', sans-serif" }}
    >
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://cdn.subhsandesh.in/gifts-media/indianFestival/alekhancorner2.svg" alt="" aria-hidden="true" style={{ position: "fixed", top: 0, left: 0, width: "clamp(112px, 30vw, 180px)", height: "clamp(112px, 30vw, 180px)", opacity: 0.62, transform: "scaleY(-1)", filter: CORNER_FILTER }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://cdn.subhsandesh.in/gifts-media/indianFestival/alekhancorner2.svg" alt="" aria-hidden="true" style={{ position: "fixed", top: 0, right: 0, width: "clamp(112px, 30vw, 180px)", height: "clamp(112px, 30vw, 180px)", opacity: 0.62, transform: "scale(-1,-1)", filter: CORNER_FILTER }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://cdn.subhsandesh.in/gifts-media/indianFestival/alekhancorner2.svg" alt="" aria-hidden="true" style={{ position: "fixed", bottom: 0, left: 0, width: "clamp(86px, 24vw, 170px)", height: "clamp(86px, 24vw, 170px)", opacity: 0.54, filter: CORNER_FILTER }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://cdn.subhsandesh.in/gifts-media/indianFestival/alekhancorner2.svg" alt="" aria-hidden="true" style={{ position: "fixed", bottom: 0, right: 0, width: "clamp(86px, 24vw, 170px)", height: "clamp(86px, 24vw, 170px)", opacity: 0.54, transform: "scaleX(-1)", filter: CORNER_FILTER }} />
      </div>
      <LuxuryMobileTopBrand />

      <section className="relative z-[1] max-w-5xl mx-auto px-5 pt-10 pb-24 md:pt-32">
        <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.28em] mb-3 text-center" style={{ color: "#7d5f18" }}>
          Founder Message
        </p>
        <h1 className="text-[40px] md:text-[68px] leading-[0.94] tracking-[-0.03em] text-center" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
          I am Suyash Agrahari,
          <em style={{ color: "#8a6a1c", fontStyle: "italic" }}> Founder of SubhSandesh.</em>
        </h1>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-[320px_1fr] gap-6 md:gap-8 items-start">
          <div className="rounded-3xl border p-3" style={{ borderColor: "rgba(61,12,17,0.14)", background: "rgba(255,255,255,0.74)" }}>
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden">
              <Image
                src="https://cdn.subhsandesh.in/gifts-media/aboutUs/144600880.webp"
                alt="Suyash Agrahari"
                fill
                sizes="(max-width: 768px) 100vw, 320px"
                style={{ objectFit: "cover" }}
                priority
              />
            </div>
            <div className="pt-4 pb-2 px-2 text-center">
              <h2 className="text-2xl" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>Suyash Agrahari</h2>
              <p className="text-sm font-semibold" style={{ color: "#7a5555" }}>Founder, SubhSandesh</p>
            </div>
          </div>

          <div className="rounded-3xl border p-6 md:p-8" style={{ borderColor: "rgba(61,12,17,0.14)", background: "rgba(255,255,255,0.76)" }}>
            <h3 className="text-2xl md:text-4xl mb-4" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
              Why I Created This
            </h3>
            <p className="text-sm md:text-base leading-relaxed mb-4" style={{ color: "#7a5555" }}>
              I created SubhSandesh because in India, celebrations are not just events — they are emotions, blessings, memories, and family stories.
              I wanted to build something that helps people express love in a deeper way, beyond plain chats and simple posts.
            </p>
            <p className="text-sm md:text-base leading-relaxed mb-4" style={{ color: "#7a5555" }}>
              My dream is to connect hearts across all Indian states, languages, and traditions — from every religion, every family, every festival, every special moment.
              Whether someone celebrates a wedding, birthday, Eid, Holi, Diwali, or any personal milestone, SubhSandesh should feel like home.
            </p>
            <p className="text-sm md:text-base leading-relaxed" style={{ color: "#7a5555" }}>
              My motto is simple:
              <span style={{ color: "#2a0a0e", fontWeight: 700 }}> turn feelings into unforgettable digital memories.</span>
              {" "}Not just pages, but moments people can revisit for years with the same smile and emotion.
            </p>
          </div>
        </div>

        <div className="mt-8">
          <BusinessDetails />
        </div>

        <div className="mt-8 rounded-3xl border p-5 md:p-6" style={{ borderColor: "rgba(61,12,17,0.14)", background: "rgba(255,255,255,0.76)" }}>
          <p className="text-[10px] uppercase tracking-[0.24em] font-bold mb-3" style={{ color: "#7d5f18" }}>Connect With Me</p>
          <div className="flex items-center justify-center flex-wrap gap-3">
            <a href={LINKS.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" title="LinkedIn"
              className="inline-flex items-center justify-center w-12 h-12 rounded-full"
              style={{ background: "rgba(61,12,17,0.06)", border: "1px solid rgba(61,12,17,0.14)", color: "#2a0a0e", textDecoration: "none" }}>
              <Linkedin size={20} />
            </a>
            <a href={LINKS.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub" title="GitHub"
              className="inline-flex items-center justify-center w-12 h-12 rounded-full"
              style={{ background: "rgba(61,12,17,0.06)", border: "1px solid rgba(61,12,17,0.14)", color: "#2a0a0e", textDecoration: "none" }}>
              <Github size={20} />
            </a>
            <a href={LINKS.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter" title="Twitter"
              className="inline-flex items-center justify-center w-12 h-12 rounded-full"
              style={{ background: "rgba(61,12,17,0.06)", border: "1px solid rgba(61,12,17,0.14)", color: "#2a0a0e", textDecoration: "none" }}>
              <Twitter size={20} />
            </a>
            <a href={LINKS.portfolio} target="_blank" rel="noopener noreferrer" aria-label="Portfolio" title="Portfolio"
              className="inline-flex items-center justify-center w-12 h-12 rounded-full"
              style={{ background: "rgba(61,12,17,0.06)", border: "1px solid rgba(61,12,17,0.14)", color: "#2a0a0e", textDecoration: "none" }}>
              <Globe size={20} />
            </a>
            <a href={LINKS.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" title="Instagram"
              className="inline-flex items-center justify-center w-12 h-12 rounded-full"
              style={{ background: "rgba(61,12,17,0.06)", border: "1px solid rgba(61,12,17,0.14)", color: "#2a0a0e", textDecoration: "none" }}>
              <Instagram size={20} />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
