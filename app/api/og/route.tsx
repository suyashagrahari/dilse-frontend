import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const TEMPLATE_CONFIG: Record<string, { emoji: string; gradient: string[]; label: string }> = {
  birthday: { emoji: "🎂", gradient: ["#f43f5e", "#ec4899"], label: "Birthday" },
  valentine: { emoji: "💝", gradient: ["#ef4444", "#f43f5e"], label: "Valentine" },
  anniversary: { emoji: "💍", gradient: ["#a855f7", "#ec4899"], label: "Anniversary" },
  missyou: { emoji: "💭", gradient: ["#6366f1", "#8b5cf6"], label: "Miss You" },
  gift: { emoji: "🎁", gradient: ["#f43f5e", "#a855f7"], label: "Gift" },
  // Happy Halloween: night indigo → pumpkin, and the teaser wording rather than
  // "Gift for …" (lib/seo.ts TEASER_PREVIEW uses the same line as the og:title).
  "happy-halloween": { emoji: "🎃", gradient: ["#17122B", "#B84E14"], label: "A little haunted house" },
  "happy-halloween-premium": { emoji: "👻", gradient: ["#3A1E5C", "#FF9A3C"], label: "Boo-tiful Night" },
  // Be My Dandiya Partner: Navratri navy → marigold, the invitation wording.
  "dandiya-partner": { emoji: "🪔", gradient: ["#7A0F12", "#D17A00"], label: "A Dandiya night invitation" },
  sorry: { emoji: "🥺", gradient: ["#FFB3C7", "#FF6F91"], label: "A cute sorry page" },
  // Happy Birthday: strawberry frosting, the surprise wording.
  "happy-birthday": { emoji: "🎂", gradient: ["#FFB3C8", "#EE5583"], label: "A birthday surprise" },
  // Birthday Surprise ✦ Premium: buttercream → strawberry, the storybook wording.
  "birthday-premium": { emoji: "📖", gradient: ["#FFE8C4", "#E5527A"], label: "A birthday storybook" },
  "miss-you": { emoji: "🥹", gradient: ["#3A3480", "#FF7EAE"], label: "Someone misses you" },
  "miss-you-premium": { emoji: "🩵", gradient: ["#7FA8F5", "#EC5F9C"], label: "Someone misses you" },
  "will-you-be-mine": { emoji: "💍", gradient: ["#F3BFC4", "#B8435F"], label: "A proposal page" },
  "sorry-premium": { emoji: "🌈", gradient: ["#DCDDEA", "#F4A7BB"], label: "A sorry page, after the rain" },
  "proposal-premium": { emoji: "💍", gradient: ["#FFD3A6", "#A63D58"], label: "A fairytale proposal" },
  "happy-anniversary": { emoji: "🖼️", gradient: ["#FCE4EA", "#D9577A"], label: "A love museum for your anniversary" },
  "anniversary-premium": { emoji: "💞", gradient: ["#F0E2CC", "#B4813A"], label: "An anniversary storybook" },
  "digital-bouquet": { emoji: "💐", gradient: ["#FFE0E9", "#D94A75"], label: "A bouquet, arranged for you" },
  // Happy Diwali: navy night → diya gold, the teaser wording (lib/seo.ts TEASER_PREVIEW).
  "happy-diwali": { emoji: "🪔", gradient: ["#4A0A0D", "#F6A821"], label: "A diya at your door" },
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "gift";
  const recipient = searchParams.get("recipient") || "You";
  const sender = searchParams.get("sender") || "Someone Special";

  const config = TEMPLATE_CONFIG[type] || TEMPLATE_CONFIG.gift;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200",
          height: "630",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: `linear-gradient(135deg, ${config.gradient[0]}, ${config.gradient[1]})`,
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "radial-gradient(circle at 20% 80%, rgba(255,255,255,0.15), transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1), transparent 40%)",
            display: "flex",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
            zIndex: 1,
          }}
        >
          <div style={{ fontSize: "80px", display: "flex" }}>{config.emoji}</div>

          <div
            style={{
              fontSize: "48px",
              fontWeight: 800,
              color: "white",
              textAlign: "center",
              lineHeight: 1.2,
              maxWidth: "900px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <span>{config.label} for {recipient}</span>
          </div>

          <div
            style={{
              fontSize: "24px",
              color: "rgba(255,255,255,0.85)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>From {sender}</span>
          </div>

          <div
            style={{
              marginTop: "24px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              background: "rgba(255,255,255,0.2)",
              padding: "12px 28px",
              borderRadius: "999px",
            }}
          >
            <span style={{ fontSize: "20px", fontWeight: 700, color: "white" }}>
              🎁 Gifts
            </span>
            <span style={{ fontSize: "16px", color: "rgba(255,255,255,0.8)" }}>
              Make Every Moment Special
            </span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
