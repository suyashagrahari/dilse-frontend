import type { Metadata } from "next";
import Link from "next/link";
import { buildMeta } from "@/lib/seo";

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

export default function ManifestoPage() {
  return (
    <main className="min-h-screen" style={{ background: "var(--app-bg)", color: "var(--app-text)" }}>
      <div
        className="mx-auto max-w-6xl px-5 pt-20 pb-16 md:px-10 md:pt-28"
      >
        <section className="relative text-center mb-14 md:mb-20 overflow-hidden rounded-[2rem] border px-5 py-10 md:py-14 md:px-10" style={{ borderColor: "var(--app-border)", background: "var(--app-surface)" }}>
          <div
            aria-hidden
            style={{
              position: "absolute",
              pointerEvents: "none",
              borderRadius: 9999,
              filter: "blur(24px)",
              opacity: 0.25,
              background: "var(--app-accent-a25)",
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
              background: "var(--app-accent-a25)",
              width: 140,
              height: 140,
              right: -20,
              bottom: -30,
            }}
          />

          <p
            className="text-[11px] font-bold uppercase tracking-[0.32em] mb-4 animate-slide-up"
            style={{ color: "var(--app-accent)" }}
          >
            The Manifesto
          </p>
          <h1
            className="font-black uppercase tracking-tighter leading-[0.9] text-5xl md:text-7xl animate-slide-up"
            style={{ fontFamily: "'Space Grotesk', sans-serif", animationDelay: "120ms" }}
          >
            Design The Moment.
            <br />
            <span style={{ color: "var(--app-accent)" }}>Deliver The Feeling.</span>
          </h1>
          <p
            className="mx-auto mt-6 max-w-3xl text-base md:text-lg animate-slide-up"
            style={{ color: "var(--app-text-muted)", animationDelay: "220ms" }}
          >
            Gifts exists to turn simple messages into meaningful experiences. Instead of sending plain text, you send a
            crafted moment that feels personal, alive, and unforgettable.
          </p>
        </section>

        <section className="mb-8 md:mb-10">
          <h2
            className="text-2xl md:text-4xl font-black tracking-tight mb-2 animate-slide-up"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Our Core Principles
          </h2>
          <p className="text-sm md:text-base animate-slide-up" style={{ color: "var(--app-text-muted)", animationDelay: "100ms" }}>
            Every template, animation, and interaction follows these fundamentals.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 mb-14 md:mb-20">
          {principles.map((p, idx) => (
            <article
              key={p.id}
              className="rounded-3xl border p-6 md:p-7 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--app-accent-a35)] animate-slide-up"
              style={{
                borderColor: "var(--app-border)",
                background: "var(--app-surface)",
                animationDelay: `${idx * 90}ms`,
              }}
            >
              <p
                className="text-xs font-black tracking-[0.25em] mb-3"
                style={{ color: "var(--app-accent)", fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {p.id}
              </p>
              <h2 className="text-2xl font-black tracking-tight mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {p.title}
              </h2>
              <p className="text-sm md:text-base leading-relaxed" style={{ color: "var(--app-text-muted)" }}>
                {p.body}
              </p>
            </article>
          ))}
        </section>

        <section
          className="rounded-[2rem] border p-6 md:p-10 mb-10 animate-slide-up"
          style={{ borderColor: "var(--app-border)", background: "var(--app-surface)", animationDelay: "120ms" }}
        >
          <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tight mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Best Way To Create
            <span style={{ color: "var(--app-accent)" }}> The Perfect Surprise</span>
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
              <div key={item.step} className="rounded-2xl border p-4" style={{ borderColor: "var(--app-border-faint)", background: "transparent" }}>
                <p className="text-xs font-black tracking-[0.2em] mb-2" style={{ color: "var(--app-accent)" }}>
                  STEP {item.step}
                </p>
                <h4 className="text-lg font-black mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {item.title}
                </h4>
                <p className="text-sm leading-relaxed" style={{ color: "var(--app-text-muted)" }}>
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section
          className="rounded-[2rem] border p-6 md:p-10 text-center animate-slide-up"
          style={{
            borderColor: "var(--app-border)",
            background: "linear-gradient(135deg, var(--app-accent-a10), transparent), var(--app-surface)",
            animationDelay: "200ms",
          }}
        >
          <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Build Something
            <span style={{ color: "var(--app-accent)" }}> Unforgettable.</span>
          </h3>
          <p className="mx-auto max-w-2xl text-sm md:text-base mb-8" style={{ color: "var(--app-text-muted)" }}>
            Pick a template. Add your story. Publish a private link. One moment can become a forever memory.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/templates"
              className="w-full sm:w-auto rounded-full px-7 py-3.5 text-sm font-black uppercase tracking-[0.16em] transition-all hover:opacity-90"
              style={{ background: "var(--app-accent)", color: "var(--app-accent-fg)" }}
            >
              Start Building
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto rounded-full border px-7 py-3.5 text-sm font-black uppercase tracking-[0.16em] transition-colors hover:border-[var(--app-accent-a35)]"
              style={{ borderColor: "var(--app-border)", color: "var(--app-text)" }}
            >
              Back To Home
            </Link>
          </div>
        </section>
      </div>

    </main>
  );
}
