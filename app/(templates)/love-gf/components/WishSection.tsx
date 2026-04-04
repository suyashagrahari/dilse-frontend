"use client";

import ScrapbookBg from "./ScrapbookBg";
import { ContentData } from "./types";

const WARM = "rgb(108, 74, 46)";
const CURSIVE = "'Dancing Script', 'Brush Script MT', cursive";

interface Props {
  data: ContentData;
  isPersonalized: boolean;
}

export default function WishSection({ data, isPersonalized }: Props) {
  return (
    <ScrapbookBg>
      <div
        style={{
          minHeight: "100svh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 24px 100px",
        }}
      >
        {/* Wish card */}
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: 480,
            background: "rgba(250, 248, 242, 0.88)",
            borderRadius: 8,
            padding: "40px 32px 48px",
            boxShadow: "0 20px 60px rgba(80,50,20,0.18), 0 4px 16px rgba(80,50,20,0.10), 0 0 0 1px rgba(158,126,97,0.15)",
            backdropFilter: "blur(2px)",
          }}
        >
          {/* Decorative top border */}
          <div style={{
            position: "absolute", top: 0, left: "10%", right: "10%", height: 3,
            background: "linear-gradient(90deg, transparent, rgba(158,126,97,0.5), transparent)",
            borderRadius: 2,
          }} />

          {/* Small pressed flower decoration */}
          <div style={{
            position: "absolute", top: -18, right: 28,
            fontSize: 28, opacity: 0.55, transform: "rotate(15deg)",
            pointerEvents: "none",
          }}>
            🌸
          </div>

          {/* Header */}
          <p style={{
            fontFamily: CURSIVE,
            fontSize: "clamp(13px, 3.5vw, 16px)",
            color: WARM,
            opacity: 0.65,
            letterSpacing: "0.15em",
            textAlign: "center",
            marginBottom: 24,
            textTransform: "uppercase",
          }}>
            a little note for you
          </p>

          {/* To label */}
          {isPersonalized && data.recipientName && (
            <p style={{
              fontFamily: CURSIVE,
              fontSize: "clamp(18px, 5vw, 26px)",
              fontWeight: 600,
              color: WARM,
              textAlign: "center",
              marginBottom: 20,
              letterSpacing: "0.02em",
            }}>
              dear {data.recipientName},
            </p>
          )}

          {/* Wish message */}
          <p style={{
            fontFamily: CURSIVE,
            fontSize: "clamp(16px, 4.2vw, 22px)",
            fontWeight: 400,
            color: "rgb(90, 60, 35)",
            lineHeight: 1.75,
            textAlign: "center",
            whiteSpace: "pre-line",
          }}>
            {data.wishMessage}
          </p>

          {/* Signature */}
          {(isPersonalized ? data.senderName : "Always Yours") && (
            <p style={{
              fontFamily: CURSIVE,
              fontSize: "clamp(15px, 3.8vw, 20px)",
              fontWeight: 600,
              color: WARM,
              opacity: 0.80,
              textAlign: "right",
              marginTop: 28,
              letterSpacing: "0.02em",
            }}>
              — {isPersonalized ? data.senderName : "Always Yours"} ♡
            </p>
          )}

          {/* Decorative bottom border */}
          <div style={{
            position: "absolute", bottom: 0, left: "10%", right: "10%", height: 3,
            background: "linear-gradient(90deg, transparent, rgba(158,126,97,0.5), transparent)",
            borderRadius: 2,
          }} />
        </div>

        {/* Decorative quote below */}
        <p style={{
          marginTop: 28,
          fontFamily: CURSIVE,
          fontSize: "clamp(13px, 3.5vw, 17px)",
          color: WARM,
          opacity: 0.60,
          textAlign: "center",
          letterSpacing: "0.06em",
          maxWidth: 320,
          lineHeight: 1.6,
        }}>
          "every love story is beautiful,<br />but ours is my favourite"
        </p>
      </div>
    </ScrapbookBg>
  );
}
