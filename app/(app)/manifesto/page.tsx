import type { Metadata } from "next";
import Link from "next/link";
import { buildMeta } from "@/lib/seo";
import LuxuryMobileTopBrand from "@/components/LuxuryMobileTopBrand";

export const metadata: Metadata = buildMeta({
  title: "The Manifesto | Gifts",
  description:
    "The Moments OS manifesto: emotion-first design, privacy by default, and cinematic delivery for meaningful digital gifting.",
});

const principles = [
  {
    id: "01",
    title: "Emotion First",
    body: "Every interaction should feel human. We design for butterflies, tears, laughter, and memory - not just clicks.",
  },
  {
    id: "02",
    title: "Privacy by Default",
    body: "Your memories are personal. We keep surprise pages protected and shareable only with the people you choose.",
  },
  {
    id: "03",
    title: "Cinematic by Design",
    body: "Motion, music, and typography should work together like a short film. Every page should feel premium and alive.",
  },
  {
    id: "04",
    title: "Fast Everywhere",
    body: "Moments should open instantly, on any device. We optimize for real-world phones, networks, and edge delivery.",
  },
];

const UI = {
  bg: "#f5ede6",
  bgSoft: "#fbf6f1",
  text: "#2a0a0e",
  textMuted: "#7a5555",
  textFaint: "#9d7b7b",
  accent: "#c9a84c",
  accentFg: "#1a0507",
  border: "rgba(61,12,17,0.16)",
  borderFaint: "rgba(61,12,17,0.1)",
  surface: "rgba(255,255,255,0.76)",
};

const CORNER_FILTER =
  "brightness(0) saturate(100%) invert(8%) sepia(55%) saturate(2800%) hue-rotate(330deg) brightness(90%) contrast(120%)";

export default function ManifestoPage() {
  return (
    <main
      className="min-h-screen overflow-x-hidden"
      style={{
        background: UI.bg,
        color: UI.text,
        fontFamily: "'Inter', sans-serif",
      }}
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

      <div className="mx-auto max-w-6xl px-5 pt-10 pb-16 md:px-10 md:pt-28" style={{ position: "relative", zIndex: 1 }}>
        <section className="relative text-center mb-14 md:mb-20 overflow-hidden rounded-[2rem] border px-5 py-10 md:py-14 md:px-10" style={{ borderColor: UI.border, background: UI.surface }}>
          <div
            aria-hidden
            style={{
              position: "absolute",
              pointerEvents: "none",
              borderRadius: 9999,
              filter: "blur(24px)",
              opacity: 0.25,
              background: "rgba(201,168,76,0.25)",
              width: 180,
              height: 180,
              top: -40,
              left: -30,
            }}
          />
          <div
            aria-hidden
            style={{
              position: "absolute",
              pointerEvents: "none",
              borderRadius: 9999,
              filter: "blur(24px)",
              opacity: 0.2,
              background: "rgba(201,168,76,0.25)",
              width: 140,
              height: 140,
              right: -20,
              bottom: -30,
            }}
          />

          <p
            className="text-[11px] font-bold uppercase tracking-[0.32em] mb-4 animate-slide-up"
            style={{ color: UI.accent }}
          >
            The Manifesto
          </p>
          <h1
            className="leading-[0.92] tracking-[-0.03em] text-[42px] md:text-[74px] animate-slide-up"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, animationDelay: "120ms" }}
          >
            Design The Moment.
            <br />
            <span style={{ color: UI.accent, fontStyle: "italic" }}>Deliver The Feeling.</span>
          </h1>
          <p
            className="mx-auto mt-6 max-w-3xl text-base md:text-lg animate-slide-up"
            style={{ color: UI.textMuted, animationDelay: "220ms" }}
          >
            Gifts exists to turn simple messages into meaningful experiences. Instead of sending plain text, you send a
            crafted moment that feels personal, alive, and unforgettable.
          </p>
        </section>

        <section className="mb-8 md:mb-10">
          <h2
            className="text-[34px] md:text-[56px] leading-[0.95] tracking-[-0.03em] mb-2 animate-slide-up"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
          >
            Our Core Principles
          </h2>
          <p className="text-sm md:text-base animate-slide-up" style={{ color: UI.textMuted, animationDelay: "100ms" }}>
            Every template, animation, and interaction follows these fundamentals.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 mb-14 md:mb-20">
          {principles.map((p, idx) => (
            <article
              key={p.id}
              className="rounded-3xl border p-6 md:p-7 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--app-accent-a35)] animate-slide-up"
              style={{
                borderColor: UI.border,
                background: UI.surface,
                animationDelay: `${idx * 90}ms`,
              }}
            >
              <p
                className="text-xs font-black tracking-[0.25em] mb-3"
                style={{ color: UI.accent, fontFamily: "'Playfair Display', serif" }}
              >
                {p.id}
              </p>
              <h2 className="text-[34px] leading-[1.05] mb-3" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
                {p.title}
              </h2>
              <p className="text-sm md:text-base leading-relaxed" style={{ color: UI.textMuted }}>
                {p.body}
              </p>
            </article>
          ))}
        </section>

        <section
          className="rounded-[2rem] border p-6 md:p-10 mb-10 animate-slide-up"
          style={{ borderColor: UI.border, background: UI.surface, animationDelay: "120ms" }}
        >
          <h3 className="text-[34px] md:text-[56px] leading-[0.95] tracking-[-0.03em] mb-4" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
            Best Way To Create
            <span style={{ color: UI.accent, fontStyle: "italic" }}> The Perfect Surprise</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                step: "1",
                title: "Pick The Right Template",
                text: "Choose by emotion first (love, apology, celebration), then personalize for the person.",
              },
              {
                step: "2",
                title: "Add Real Memories",
                text: "Use your own photos, voice, and music. Personal assets create the strongest emotional impact.",
              },
              {
                step: "3",
                title: "Publish With Intention",
                text: "Preview before sharing, add password when needed, and send it at the perfect moment.",
              },
            ].map((item) => (
              <div key={item.step} className="rounded-2xl border p-4" style={{ borderColor: UI.borderFaint, background: "transparent" }}>
                <p className="text-xs font-black tracking-[0.2em] mb-2" style={{ color: UI.accent }}>
                  STEP {item.step}
                </p>
                <h4 className="text-2xl leading-[1.08] mb-2" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
                  {item.title}
                </h4>
                <p className="text-sm leading-relaxed" style={{ color: UI.textMuted }}>
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section
          className="rounded-[2rem] border p-6 md:p-10 text-center animate-slide-up"
          style={{
            borderColor: UI.border,
            background: "linear-gradient(135deg, rgba(201,168,76,0.1), transparent), rgba(255,255,255,0.76)",
            animationDelay: "200ms",
          }}
        >
          <h3 className="text-[36px] md:text-[60px] leading-[0.95] tracking-[-0.03em] mb-4" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
            Build Something
            <span style={{ color: UI.accent, fontStyle: "italic" }}> Unforgettable.</span>
          </h3>
          <p className="mx-auto max-w-2xl text-sm md:text-base mb-8" style={{ color: UI.textMuted }}>
            Pick a template. Add your story. Publish a private link. One moment can become a forever memory.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/templates"
              className="w-full sm:w-auto rounded-full px-7 py-3.5 text-sm font-black uppercase tracking-[0.16em] transition-all hover:opacity-90"
              style={{ background: UI.accent, color: UI.accentFg }}
            >
              Start Building
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto rounded-full border px-7 py-3.5 text-sm font-black uppercase tracking-[0.16em] transition-colors hover:border-[var(--app-accent-a35)]"
              style={{ borderColor: UI.border, color: UI.text }}
            >
              Back To Home
            </Link>
          </div>
        </section>
      </div>

    </main>
  );
}
