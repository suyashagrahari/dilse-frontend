import SocialIcons from "@/components/SocialIcons";

// "Follow SubhSandesh" on the blog — the brand's real accounts from
// lib/social.ts, each opening in a new tab. `inline` sits under the blog index
// heading; `card` closes an article, where a reader who got to the end is the
// one most likely to want more.

const INK = "#2a0a0e";
const MUTED = "rgba(42,10,14,0.7)";
/** Brand gold darkened to pass 4.5:1 as small text on cream (#c9a84c is 1.97:1). */
const GOLD_TEXT = "#7d5f18";

export default function FollowUs({ variant = "card" }: { variant?: "card" | "inline" }) {
  if (variant === "inline") {
    return (
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <span className="text-[10px] font-bold uppercase tracking-[0.24em] md:text-[11px]" style={{ color: GOLD_TEXT }}>
          Follow us
        </span>
        <div className="flex items-center gap-2">
          <SocialIcons size={38} />
        </div>
      </div>
    );
  }

  return (
    <section
      aria-labelledby="follow-us-title"
      className="mt-12 rounded-3xl border p-6 md:p-8 text-center"
      style={{ borderColor: "rgba(61,12,17,0.14)", background: "rgba(255,255,255,0.78)" }}
    >
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.28em] md:text-[11px]" style={{ color: GOLD_TEXT }}>
        Stay Connected
      </p>
      <h2
        id="follow-us-title"
        className="text-[28px] leading-[1.05] tracking-[-0.02em] md:text-[34px]"
        style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: INK }}
      >
        Follow <em style={{ color: "#8a6a1c", fontStyle: "italic" }}>SubhSandesh</em>
      </h2>
      <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed" style={{ color: MUTED }}>
        New templates, festival ideas and step-by-step walkthrough videos — first on our socials.
      </p>
      <div className="mt-5 flex items-center justify-center gap-3">
        <SocialIcons size={46} />
      </div>
    </section>
  );
}
