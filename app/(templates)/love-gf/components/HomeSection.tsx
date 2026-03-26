"use client";

import Image from "next/image";
import { ContentData } from "./types";

// Placeholder shown when user hasn't uploaded a photo
function PhotoPlaceholder({ index }: { index: number }) {
  return (
    <div
      style={{
        position: "absolute", inset: "5% 6% 8% 10%",
        background: "linear-gradient(135deg, #ede8df 0%, #d9d0c3 100%)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 4,
      }}
    >
      <span style={{ fontSize: "clamp(18px, 5vw, 28px)", opacity: 0.45 }}>📷</span>
      <span style={{
        fontFamily: "'Dancing Script', cursive",
        fontSize: "clamp(9px, 2.2vw, 13px)",
        color: "rgb(140,105,70)", opacity: 0.6, textAlign: "center",
      }}>
        photo {index}
      </span>
    </div>
  );
}

interface Props {
  data: ContentData;
  isPersonalized: boolean;
  onEditClick: () => void;
}

/**
 * Scrapbook collage home section — same layout as /love/page.tsx
 * but with user's actual gallery photos in the polaroid frames.
 */
export default function HomeSection({ data, isPersonalized, onEditClick }: Props) {
  const photos = data.galleryPhotos || [];
  const defaultCardPhotos = ["/love/image5.webp", "/love/image14.webp", "/love/imaghe12.webp", "/love/image13.webp"];
  const p = (i: number) => photos[i] || defaultCardPhotos[i] || "";

  return (
    <div
      style={{
        position: "relative",
        height: "100dvh",
        width: "100%",
        background: `
          radial-gradient(ellipse at 50% 50%, transparent 20%, rgba(28,15,6,0.28) 100%),
          url(/love/image18.webp) center / cover no-repeat
        `,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* Phone frame corners (premium rounded border) */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 28,
          pointerEvents: "none",
          border: "1.5px solid rgba(158, 126, 97, 0.22)",
          boxShadow: "0 18px 60px rgba(40,22,8,0.12)",
          zIndex: 1,
        }}
      />
      {/* Scrapbook canvas — 2:3 ratio, fills phone width */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          // Always fill the phone height, then clamp to viewport width.
          // This removes leftover top/bottom gaps and keeps the collage centered.
          width: "min(100vw, calc(100dvh * 2 / 3))",
          height: "100%",
          background: "transparent",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {/* Corner brackets */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 3,
          }}
        >
          {/* top-left */}
          <div
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              width: 44,
              height: 44,
              borderLeft: "3px solid rgba(158, 126, 97, 0.42)",
              borderTop: "3px solid rgba(158, 126, 97, 0.42)",
              borderTopLeftRadius: 16,
              opacity: 0.7,
            }}
          />
          {/* top-right */}
          <div
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              width: 44,
              height: 44,
              borderRight: "3px solid rgba(158, 126, 97, 0.42)",
              borderTop: "3px solid rgba(158, 126, 97, 0.42)",
              borderTopRightRadius: 16,
              opacity: 0.7,
            }}
          />
          {/* bottom-left */}
          <div
            style={{
              position: "absolute",
              bottom: 12,
              left: 12,
              width: 44,
              height: 44,
              borderLeft: "3px solid rgba(158, 126, 97, 0.42)",
              borderBottom: "3px solid rgba(158, 126, 97, 0.42)",
              borderBottomLeftRadius: 16,
              opacity: 0.7,
            }}
          />
          {/* bottom-right */}
          <div
            style={{
              position: "absolute",
              bottom: 12,
              right: 12,
              width: 44,
              height: 44,
              borderRight: "3px solid rgba(158, 126, 97, 0.42)",
              borderBottom: "3px solid rgba(158, 126, 97, 0.42)",
              borderBottomRightRadius: 16,
              opacity: 0.7,
            }}
          />
        </div>

        {/* Canvas paper background (desktop only inside isolated card) */}
        <div
          className="hidden sm:block"
          style={{ position: "absolute", inset: 0 }}
          aria-hidden="true"
        >
          <Image src="/love/image18.webp" alt="" fill priority
            style={{ objectFit: "cover", objectPosition: "center" }} />
        </div>

        {/* ── Torn paper LEFT ── */}
        <div style={{ position: "absolute", left: "-33.8%", top: "0", width: "87.6%", height: "21.0%",
          transform: "rotate(92.09deg)", zIndex: 1, opacity: 0.9, mixBlendMode: "multiply" }}>
          <Image src="/love/image17.webp" alt="" width={1600} height={577}
            style={{ width: "100%", height: "100%", display: "block", objectFit: "fill" }} />
        </div>

        {/* ── Sticky note ── */}
        <div style={{ position: "absolute", left: "42.8%", top: "6.6%", width: "48.6%",
          transform: "rotate(8deg)", zIndex: 2 }}>
          <Image src="/love/image16.webp" alt="note" width={780} height={605}
            style={{ width: "100%", height: "auto", display: "block" }} />
        </div>

        {/* ── Torn paper RIGHT ── */}
        <div style={{ position: "absolute", left: "46.2%", top: "73.8%", width: "87.6%", height: "21.0%",
          transform: "rotate(-83.58deg)", zIndex: 3, opacity: 0.9, mixBlendMode: "multiply" }}>
          <Image src="/love/image15.webp" alt="" width={1600} height={400}
            style={{ width: "100%", height: "100%", display: "block", objectFit: "fill" }} />
        </div>

        {/* ── Photo 2 (top-right polaroid) ── */}
        <div style={{ position: "absolute", left: "48%", top: "18%", width: "45.2%", height: "25.2%",
          transform: "rotate(18deg)", zIndex: 4,
          background: "#faf8f2", boxShadow: "3px 6px 22px rgba(0,0,0,0.30), 0 1px 6px rgba(0,0,0,0.15)" }}>
          {p(1) ? (
            <div style={{ position: "absolute", inset: "5% 6% 8% 10%" }}>
              <Image src={p(1)} fill alt="couple" style={{ objectFit: "cover", objectPosition: "center" }}
                sizes="43vw" />
            </div>
          ) : (
            <PhotoPlaceholder index={2} />
          )}
        </div>

        {/* ── Photo 4 (bottom-right tall polaroid) ── */}
        <div style={{ position: "absolute", left: "47%", top: "46%", width: "49.1%", height: "28.2%",
          transform: "rotate(10deg)", zIndex: 20,
          background: "#faf8f2", boxShadow: "3px 6px 22px rgba(0,0,0,0.30), 0 1px 6px rgba(0,0,0,0.15)" }}>
          {p(3) ? (
            <div style={{ position: "absolute", inset: "5% 6% 8% 10%" }}>
              <Image src={p(3)} fill alt="couple" style={{ objectFit: "cover", objectPosition: "center" }}
                sizes="47vw" />
            </div>
          ) : (
            <PhotoPlaceholder index={4} />
          )}
        </div>

        {/* ── Photo 3 (bottom-left polaroid) ── */}
        <div style={{ position: "absolute", left: "9.2%", top: "50%", width: "45.1%", height: "25.3%",
          transform: "rotate(-9deg)", zIndex: 25,
          background: "#faf8f2", boxShadow: "3px 6px 22px rgba(0,0,0,0.30), 0 1px 6px rgba(0,0,0,0.15)" }}>
          {p(2) ? (
            <div style={{ position: "absolute", inset: "5% 6% 8% 10%" }}>
              <Image src={p(2)} fill alt="couple" style={{ objectFit: "cover", objectPosition: "center" }}
                sizes="43vw" />
            </div>
          ) : (
            <PhotoPlaceholder index={3} />
          )}
        </div>

        {/* ── Right botanical ── */}
        <div style={{ position: "absolute", left: "65.8%", top: "25.4%", width: "41.8%",
          transform: "rotate(8deg)", zIndex: 30, mixBlendMode: "multiply" }}>
          <Image src="/love/image11.webp" alt="" width={312} height={508}
            style={{ width: "100%", height: "32%", display: "block" }} />
        </div>

        {/* ── Pushpin 1 ── */}
        <div style={{ position: "absolute", left: "70.9%", top: "20.2%", width: "7.2%",
          transform: "rotate(15deg)", zIndex: 8, mixBlendMode: "multiply" }}>
          <div
            aria-hidden="true"
            style={{
              width: "100%",
              aspectRatio: "1 / 1",
              borderRadius: "999px",
              background: "radial-gradient(circle at 35% 30%, #f9f9fb 0%, #ececef 55%, #d3d3d8 100%)",
              border: "1.5px solid rgba(135,135,145,0.35)",
              boxShadow: "0 3px 8px rgba(0,0,0,0.28), inset 0 1px 2px rgba(255,255,255,0.7)",
            }}
          />
        </div>

        {/* ── Pushpin 2 ── */}
        <div style={{ position: "absolute", left: "22.8%", top: "51.8%", width: "7.2%",
          transform: "rotate(-9deg)", zIndex: 9, mixBlendMode: "multiply" }}>
          <div
            aria-hidden="true"
            style={{
              width: "100%",
              aspectRatio: "1 / 1",
              borderRadius: "999px",
              background: "radial-gradient(circle at 35% 30%, #f9f9fb 0%, #ececef 55%, #d3d3d8 100%)",
              border: "1.5px solid rgba(135,135,145,0.35)",
              boxShadow: "0 3px 8px rgba(0,0,0,0.28), inset 0 1px 2px rgba(255,255,255,0.7)",
            }}
          />
        </div>

        {/* ── Bottom flower ── */}
        <div style={{ position: "absolute", left: "13%", top: "80.4%", width: "25.4%",
          transform: "rotate(12deg)", zIndex: 35, mixBlendMode: "multiply" }}>
          <Image src="/love/image8.webp" alt="" width={240} height={360}
            style={{ width: "100%", height: "auto", display: "block" }} />
        </div>

        {/* ── Fern ── */}
        <div style={{ position: "absolute", left: "5%", top: "68.7%", width: "23.5%",
          transform: "rotate(-30deg)", zIndex: 34, mixBlendMode: "multiply" }}>
          <Image src="/love/image7.webp" alt="" width={174} height={459}
            style={{ width: "100%", height: "auto", display: "block" }} />
        </div>

        {/* ── Dandelion ── */}
        <div style={{ position: "absolute", left: "77.8%", top: "-2.4%", width: "28.2%",
          transform: "rotate(26.17deg)", zIndex: 12, mixBlendMode: "multiply" }}>
          <Image src="/love/image6.webp" alt="" width={210} height={228}
            style={{ width: "100%", height: "auto", display: "block" }} />
        </div>

        {/* ── "love you!" cursive text ── */}
        <div style={{ position: "absolute", left: "50.3%", top: "9.0%", width: "39.1%",
          transform: "rotate(8deg)", zIndex: 13 }}>
          <span style={{
            display: "block",
            fontFamily: "'Dancing Script', 'Brush Script MT', cursive",
            fontSize: "clamp(24px, 12.5vw, 54px)",
            color: "rgb(158, 126, 97)",
            fontWeight: 700,
            letterSpacing: "0.01em",
            lineHeight: 1.2,
            whiteSpace: "nowrap",
            pointerEvents: "none",
          }}>
            {isPersonalized && data.recipientName ? `for ${data.recipientName}` : "love you!"}
          </span>
        </div>

        {/* ── Photo 1 LARGE (main polaroid) ── */}
        <div style={{ position: "absolute", left: "9%", top: "18.6%", width: "45.6%", height: "30%",
          transform: "rotate(-12deg)", zIndex: 14,
          background: "#faf8f2", boxShadow: "3px 6px 22px rgba(0,0,0,0.30), 0 1px 6px rgba(0,0,0,0.15)" }}>
          {p(0) ? (
            <div style={{ position: "absolute", inset: "5% 6% 8% 10%" }}>
              <Image src={p(0)} fill alt="couple" style={{ objectFit: "cover", objectPosition: "center 10%" }}
                sizes="44vw" />
            </div>
          ) : (
            <PhotoPlaceholder index={1} />
          )}
        </div>

        {/* ── Top-left yarrow botanical ── */}
        <div style={{ position: "absolute", left: "-4.6%", top: "-0.1%", width: "29.2%",
          transform: "rotate(18.83deg)", zIndex: 15, mixBlendMode: "multiply" }}>
          <Image src="/love/image4.webp" alt="" width={215} height={355}
            style={{ width: "100%", height: "auto", display: "block" }} />
        </div>

        {/* ── Center pressed flower ── */}
        <div style={{ position: "absolute", left: "44.2%", top: "42.1%", width: "16.5%", zIndex: 36,
          mixBlendMode: "multiply" }}>
          <Image src="/love/image3.webp" alt="" width={122} height={121}
            style={{ width: "100%", height: "auto", display: "block" }} />
        </div>
      </div>

      {/* Below canvas: sender name */}
      {isPersonalized && data.senderName && (
        <p style={{
          marginTop: 12,
          fontFamily: "'Dancing Script', 'Brush Script MT', cursive",
          fontSize: "clamp(13px, 3.5vw, 18px)",
          color: "rgb(108, 74, 46)",
          opacity: 0.75,
          letterSpacing: "0.08em",
          textAlign: "center",
          padding: "0 16px 8px",
          pointerEvents: "none",
        }}>
          — from {data.senderName} ♡
        </p>
      )}

      {/* No explicit CTA button here: editing is started from the top "Create" button */}
    </div>
  );
}
