import Link from "next/link";
import { Play, FileText, ArrowRight } from "lucide-react";
import type { ProductGuide } from "@/types/product-guide";
import { guideVideoSet } from "@/lib/templateMedia";
import { formatDuration, stepCount } from "@/lib/guides";

/**
 * The link *into* the guides, dropped onto pages that are not guides — a blog
 * post about the occasion, or the template page itself.
 *
 * A server component with no client JS: it is a link and a picture, and every
 * surface it appears on is already heavy enough without another hydration root.
 *
 * `variant` exists because the two hosts have opposite needs. On a blog post
 * the guide is a genuine next step and earns a full card with the poster. On a
 * template page the visitor is one click from building the thing — an eye-catching
 * card there competes with the Create button, which is the last thing it should
 * do. So the template variant is a single quiet line that answers "is there a
 * video?" without arguing for attention.
 */
const GOLD = "#c9a84c";
const INK = "#2a0a0e";
const MAROON = "#3d0c11";
const MUTED = "#7a5555";

export default function GuidePromo({
  guides,
  variant = "card",
  heading = "Watch it being built",
}: {
  guides: ProductGuide[];
  variant?: "card" | "inline";
  heading?: string;
}) {
  if (guides.length === 0) return null;

  if (variant === "inline") {
    const g = guides[0];
    return (
      <Link
        href={`/guides/${g.slug}`}
        className="group inline-flex items-center gap-2.5 rounded-full"
        style={{
          padding: "9px 16px",
          background: "rgba(255,255,255,0.82)",
          border: "1px solid rgba(61,12,17,0.16)",
          textDecoration: "none",
          fontSize: 12.5,
          fontWeight: 600,
          color: INK,
        }}
      >
        <span
          style={{
            width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
            display: "grid", placeItems: "center",
            background: MAROON, color: "#f5ede6", paddingLeft: 2,
          }}
        >
          {g.video ? <Play size={10} fill="#f5ede6" strokeWidth={0} /> : <FileText size={10} />}
        </span>
        {g.video
          ? `Watch the ${formatDuration(g.video.seconds)} guide`
          : "Read the step-by-step guide"}
        <ArrowRight size={13} style={{ color: GOLD }} className="transition-transform duration-300 group-hover:translate-x-0.5" />
      </Link>
    );
  }

  return (
    <section className="mt-12" aria-labelledby="guide-promo-heading">
      <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.26em", textTransform: "uppercase", color: GOLD, margin: 0 }}>
        Product guide
      </p>
      <h2
        id="guide-promo-heading"
        className="mt-2.5"
        style={{
          fontFamily: "'Playfair Display', serif", fontWeight: 700,
          fontSize: "clamp(22px,2.6vw,30px)", lineHeight: 1.1,
          letterSpacing: "-0.02em", color: INK, margin: 0,
        }}
      >
        {heading}
      </h2>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {guides.map((g) => {
          const media = guideVideoSet(g.slug);
          return (
            <Link
              key={g.slug}
              href={`/guides/${g.slug}`}
              className="group block rounded-2xl overflow-hidden transition-transform duration-300 hover:-translate-y-1"
              style={{
                border: "1px solid rgba(61,12,17,0.13)",
                background: "rgba(255,255,255,0.84)",
                textDecoration: "none",
              }}
            >
              {g.video && (
                <div style={{ position: "relative", aspectRatio: "16 / 9", background: "#efe4d8", overflow: "hidden" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={media.poster}
                    alt=""
                    aria-hidden
                    loading="lazy"
                    className="transition-transform duration-500 group-hover:scale-[1.04]"
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                  <span
                    style={{
                      position: "absolute", inset: 0, display: "grid", placeItems: "center",
                      background: "linear-gradient(180deg,rgba(26,5,8,0.05),rgba(26,5,8,0.40))",
                    }}
                  >
                    <span
                      style={{
                        width: 44, height: 44, borderRadius: "50%", display: "grid",
                        placeItems: "center", background: "rgba(245,237,230,0.94)",
                        border: `1px solid ${GOLD}`, color: MAROON, paddingLeft: 3,
                      }}
                    >
                      <Play size={17} fill={MAROON} strokeWidth={0} />
                    </span>
                  </span>
                  <span
                    style={{
                      position: "absolute", right: 9, bottom: 9, fontSize: 10.5, fontWeight: 700,
                      color: "#f5ede6", background: "rgba(26,5,8,0.74)",
                      padding: "2px 7px", borderRadius: 5, fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {formatDuration(g.video.seconds)}
                  </span>
                </div>
              )}
              <div className="p-4">
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 17, lineHeight: 1.2, color: INK, margin: 0 }}>
                  {g.title}
                </h3>
                <p className="mt-1.5" style={{ fontSize: 12, color: MUTED, margin: 0 }}>
                  {g.video ? `${formatDuration(g.video.seconds)} video · ` : ""}
                  {stepCount(g)} written steps
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
