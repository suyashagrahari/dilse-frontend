// A drawn cartoon avatar — the real app's signature, without its art. One SVG,
// eight presets, a head-and-shoulders crop that reads at 28px in a chat row
// and at 140px on the friendship profile. An uploaded photo (older pages) is
// shown in the same circle instead.

import type { CSSProperties } from "react";
import { avatarOf, type AvatarPreset } from "../skin";

function Hair({ a, layer }: { a: AvatarPreset; layer: "back" | "front" }) {
  const h = a.hair;
  if (layer === "back") {
    switch (a.style) {
      case "long":
        return <path d="M27 44c0-17 10-27 23-27s23 10 23 27v30c0 4-4 6-8 6H35c-4 0-8-2-8-6z" fill={h} />;
      case "bob":
        return <path d="M28 46c0-17 9.5-26 22-26s22 9 22 26v14c0 4-3 6-6 6H34c-3 0-6-2-6-6z" fill={h} />;
      case "wavy":
        return (
          <path
            d="M27 46c0-17 10-27 23-27s23 10 23 27c0 6 3 9 3 14 0 6-5 9-9 9-2 3-6 4-9 3H40c-3 1-7 0-9-3-4 0-9-3-9-9 0-5 5-8 5-14z"
            fill={h}
          />
        );
      case "curly":
        return (
          <g fill={h}>
            {[
              [32, 34, 9], [40, 26, 9], [50, 23, 10], [60, 26, 9], [68, 34, 9], [71, 44, 8], [29, 44, 8],
            ].map(([x, y, r], i) => (
              <circle key={i} cx={x} cy={y} r={r} />
            ))}
          </g>
        );
      default:
        return null;
    }
  }
  switch (a.style) {
    case "short":
      return <path d="M29 44c-1-14 8-24 21-24 12 0 21 8 21 20-4-5-10-7-17-7-6 0-9 3-15 3-3 0-6 2-7 5z" fill={h} />;
    case "bun":
      return (
        <g fill={h}>
          <circle cx="50" cy="15" r="9" />
          <path d="M28 44c0-14 9-23 22-23s22 9 22 23c-5-7-12-11-22-11s-17 4-22 11z" />
        </g>
      );
    case "curly":
      return <path d="M30 40c2-10 10-16 20-16s18 6 20 16c-6-5-11-6-20-6s-14 1-20 6z" fill={h} />;
    default:
      // A soft side-swept fringe for long / bob / wavy.
      return <path d="M28 45c0-15 9-25 22-25 12 0 21 8 22 21-6-3-13-9-17-14-4 7-15 13-27 18z" fill={h} />;
  }
}

export default function Bitmoji({
  preset,
  side = "a",
  photoUrl,
  size = 40,
  ring,
  style,
  mood = "smile",
}: {
  preset: string;
  side?: "a" | "b";
  photoUrl?: string;
  size?: number;
  /** A story ring colour (or gradient) around the avatar. */
  ring?: string;
  style?: CSSProperties;
  mood?: "smile" | "wink" | "love";
}) {
  const a = avatarOf(preset, side);
  const inner = photoUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={photoUrl} alt="" draggable={false} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
  ) : (
    <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden focusable="false" style={{ display: "block", borderRadius: "50%" }}>
      <circle cx="50" cy="50" r="50" fill={a.bg} />
      <Hair a={a} layer="back" />
      {/* shoulders */}
      <path d="M18 100c2-15 14-23 32-23s30 8 32 23z" fill={a.top} />
      <path d="M43 70h14v10c0 3-3 5-7 5s-7-2-7-5z" fill={a.skin} />
      <path d="M43 76c2 2 4.3 3 7 3s5-1 7-3" stroke="rgba(0,0,0,.12)" strokeWidth="2" fill="none" />
      {/* head */}
      <ellipse cx="50" cy="48" rx="20" ry="23" fill={a.skin} />
      <ellipse cx="30.5" cy="50" rx="3.4" ry="4.6" fill={a.skin} />
      <ellipse cx="69.5" cy="50" rx="3.4" ry="4.6" fill={a.skin} />
      <Hair a={a} layer="front" />
      {/* face */}
      {mood === "wink" ? (
        <>
          <ellipse cx="42" cy="51" rx="2.6" ry="3.4" fill="#1B1212" />
          <path d="M55 51.5c1.5-1.8 4.5-1.8 6 0" stroke="#1B1212" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        </>
      ) : mood === "love" ? (
        <>
          <path d="M42 54s-4-2.4-4-5a2 2 0 0 1 4-.6 2 2 0 0 1 4 .6c0 2.6-4 5-4 5z" fill="#FF3B5C" />
          <path d="M58 54s-4-2.4-4-5a2 2 0 0 1 4-.6 2 2 0 0 1 4 .6c0 2.6-4 5-4 5z" fill="#FF3B5C" />
        </>
      ) : (
        <>
          <ellipse cx="42" cy="51" rx="2.6" ry="3.4" fill="#1B1212" />
          <ellipse cx="58" cy="51" rx="2.6" ry="3.4" fill="#1B1212" />
          <circle cx="43" cy="49.8" r=".9" fill="#fff" />
          <circle cx="59" cy="49.8" r=".9" fill="#fff" />
        </>
      )}
      <path d="M38.5 45.5c1.5-1.4 4-1.8 6-1M55.5 44.5c2-.8 4.5-.4 6 1" stroke={a.hair} strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <ellipse cx="37.5" cy="58" rx="3.6" ry="2.2" fill="#FF8FA8" opacity=".55" />
      <ellipse cx="62.5" cy="58" rx="3.6" ry="2.2" fill="#FF8FA8" opacity=".55" />
      <path d="M44.5 60.5c1.6 2.2 3.4 3.2 5.5 3.2s3.9-1 5.5-3.2" stroke="#7A2E2E" strokeWidth="2.1" strokeLinecap="round" fill="none" />
    </svg>
  );

  if (!ring) {
    return (
      <span style={{ display: "inline-block", width: size, height: size, flex: "none", borderRadius: "50%", overflow: "hidden", ...style }}>
        {inner}
      </span>
    );
  }
  const pad = Math.max(2, Math.round(size * 0.06));
  return (
    <span
      style={{
        display: "inline-grid",
        placeItems: "center",
        width: size,
        height: size,
        flex: "none",
        borderRadius: "50%",
        background: ring,
        padding: pad,
        ...style,
      }}
    >
      <span style={{ display: "block", width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", border: `${pad}px solid #fff`, background: "#fff" }}>
        {inner}
      </span>
    </span>
  );
}
