"use client";

import { motion } from "framer-motion";
import type { ContentData } from "./types";

const GRAD    = "linear-gradient(135deg, #ff3d6b 0%, #a855f7 100%)";
const CARD    = "rgba(255,255,255,0.06)";
const CARD_BORDER = "rgba(255,255,255,0.10)";
const TEXT_DIM = "rgba(255,255,255,0.50)";

interface Props {
  data: ContentData;
  isPersonalized: boolean;
  /** Editor mobile: title in top bar */
  titleInTopBar?: boolean;
}

export default function WishSection({ data, isPersonalized, titleInTopBar = false }: Props) {
  return (
    <div style={{
      minHeight: "100svh",
      background: "#0d0b18",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: titleInTopBar
        ? "max(48px, calc(env(safe-area-inset-top, 0px) + 36px)) 18px 100px"
        : "80px 20px 110px",
      position: "relative",
    }}>
      <div style={{
        position: "absolute", top: "12%", left: "50%", transform: "translateX(-50%)",
        width: 280, height: 280, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,61,107,0.12) 0%, transparent 68%)",
        pointerEvents: "none", filter: "blur(28px)",
      }} />
      <div style={{
        position: "absolute", bottom: "10%", left: "50%", transform: "translateX(-50%)",
        width: 220, height: 220, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(168,85,247,0.11) 0%, transparent 68%)",
        pointerEvents: "none", filter: "blur(28px)",
      }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: "100%", maxWidth: 460, position: "relative", zIndex: 1 }}
      >
        {titleInTopBar ? (
          <>
            <div
              className="lg:hidden"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
                marginBottom: 14,
                paddingLeft: 16,
                paddingRight: 16,
                boxSizing: "border-box",
              }}
            >
              <p style={{
                margin: 0,
                fontSize: 12,
                color: TEXT_DIM,
                letterSpacing: "0.04em",
                lineHeight: 1.45,
                textAlign: "center",
                maxWidth: 300,
                width: "100%",
              }}>
                A little note for you
              </p>
              <div
                aria-hidden
                style={{
                  height: 3,
                  width: 72,
                  marginTop: 10,
                  borderRadius: 999,
                  background: GRAD,
                  opacity: 0.65,
                  flexShrink: 0,
                }}
              />
            </div>
            <div className="hidden lg:block" style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: CARD, border: `1px solid ${CARD_BORDER}`,
                borderRadius: 999, padding: "5px 16px", marginBottom: 14,
                boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
              }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", color: TEXT_DIM, textTransform: "uppercase" as const }}>
                  A little note for you
                </span>
              </div>
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: CARD, border: `1px solid ${CARD_BORDER}`,
              borderRadius: 999, padding: "5px 16px", marginBottom: 14,
              boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", color: TEXT_DIM, textTransform: "uppercase" as const }}>
                A little note for you
              </span>
            </div>
          </div>
        )}

        <div style={{
          background: `linear-gradient(165deg, ${CARD} 0%, rgba(255,61,107,0.04) 100%)`,
          border: `1px solid rgba(255,61,107,0.2)`,
          borderRadius: titleInTopBar ? 20 : 24,
          padding: titleInTopBar ? "22px 20px 26px" : "32px 28px 36px",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          boxShadow: "0 16px 48px rgba(0,0,0,0.38), 0 0 0 1px rgba(255,61,107,0.08), inset 0 1px 0 rgba(255,255,255,0.06)",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 3,
            background: GRAD,
          }} />

          <div style={{
            position: "absolute", top: -12, right: 20,
            fontSize: 26, opacity: 0.5, transform: "rotate(14deg)",
          }}>🌹</div>

          {isPersonalized && data.recipientName && (
            <p style={{
              fontSize: "clamp(15px, 4.2vw, 21px)", fontWeight: 700,
              color: "#fff", textAlign: "center", marginBottom: titleInTopBar ? 14 : 18,
            }}>
              dear{" "}
              <span style={{
                background: GRAD,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>
                {data.recipientName}
              </span>
              ,
            </p>
          )}

          <p style={{
            fontSize: "clamp(14px, 3.8vw, 18px)",
            color: "rgba(255,255,255,0.9)",
            lineHeight: 1.78, textAlign: "center",
            whiteSpace: "pre-line", fontStyle: "italic",
          }}>
            &ldquo;{data.wishMessage}&rdquo;
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: titleInTopBar ? "18px 0 14px" : "22px 0 16px" }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
            <motion.span
              animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.8, repeat: Infinity }}
              style={{ fontSize: 15 }}
            >💕</motion.span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
          </div>

          <p style={{
            fontSize: "clamp(13px, 3.5vw, 17px)", fontWeight: 700,
            textAlign: "right",
            background: GRAD,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>
            — {isPersonalized ? data.senderName : "Always Yours"} ♡
          </p>

          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 3,
            background: GRAD,
          }} />
        </div>

        <p style={{
          marginTop: titleInTopBar ? 16 : 22, textAlign: "center",
          fontSize: 12, color: TEXT_DIM, fontStyle: "italic",
          lineHeight: 1.65, letterSpacing: "0.02em",
        }}>
          &ldquo;every love story is beautiful,<br />but ours is my favourite&rdquo;
        </p>
      </motion.div>
    </div>
  );
}
