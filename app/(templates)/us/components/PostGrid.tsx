"use client";

// ─── Us — the grid ───────────────────────────────────────────────────────────
//
// THE ONE NUMBER THAT DECIDES THIS TEMPLATE.
//
// `gap: 1px` on a CSS grid. Not margins, not padding, not a 1px border on the
// cells — a real grid gap of exactly GRID_GAP_PX. At 2px the rhythm breaks and
// it reads as a template; at 0 the photos merge and it reads as a collage. One
// pixel is the entire difference and it is not negotiable.
//
// Cells are perfect squares at every width via `aspect-ratio: 1 / 1` rather
// than a padding-top hack, so the height tracks the fractional column width
// exactly instead of rounding away from it. `object-fit: cover` on the photo
// means a portrait or landscape original is centre-cropped, never distorted.
//
// Fewer than nine posts fills left-to-right and stops. No placeholder cells:
// an empty tail of grey squares is a wireframe, not a profile.

import Photo from "./Photo";
import { PinGlyph, PlayGlyph, StackGlyph } from "./icons";
import { GRID_GAP_PX, PALETTE, type Post } from "./types";

/** Inset of the corner glyphs, in CSS pixels. */
const GLYPH_INSET = 8;

const glyphStyle = {
  position: "absolute" as const,
  filter: `drop-shadow(${PALETTE.glyphShadow})`,
  pointerEvents: "none" as const,
};

export interface PostGridProps {
  /** Already ordered — pinned first. Pass `orderedPosts(data)`. */
  posts: Post[];
  pinnedIds: string[];
  onOpen: (index: number) => void;
  /** Renders the cells without buttons, for the exported card. */
  still?: boolean;
}

export default function PostGrid({ posts, pinnedIds, onOpen, still = false }: PostGridProps) {
  const pinned = new Set(pinnedIds);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: `${GRID_GAP_PX}px`,
        background: PALETTE.bg,
      }}
    >
      {posts.map((post, index) => {
        const inner = (
          <>
            <Photo
              src={post.imageUrl}
              alt={post.caption ? post.caption.slice(0, 80) : `Photo ${index + 1}`}
              sizes="140px"
              glyphSize={22}
              priority={index < 3}
            />
            {pinned.has(post.id) ? (
              <PinGlyph size={15} style={{ ...glyphStyle, top: GLYPH_INSET, left: GLYPH_INSET }} />
            ) : null}
            {/* Video wins over multiple: a clip that also has stills is still a clip. */}
            {post.isVideo ? (
              <PlayGlyph size={16} style={{ ...glyphStyle, top: GLYPH_INSET, right: GLYPH_INSET }} />
            ) : post.isMultiple ? (
              <StackGlyph size={16} style={{ ...glyphStyle, top: GLYPH_INSET, right: GLYPH_INSET }} />
            ) : null}
          </>
        );

        const cell = {
          position: "relative" as const,
          aspectRatio: "1 / 1",
          overflow: "hidden",
          background: PALETTE.button,
          display: "block",
          width: "100%",
        };

        return still ? (
          <div key={post.id} style={cell}>
            {inner}
          </div>
        ) : (
          <button
            key={post.id}
            type="button"
            className="us-tap"
            aria-label={post.caption ? post.caption.slice(0, 60) : `Open photo ${index + 1}`}
            onClick={() => onOpen(index)}
            style={cell}
          >
            {inner}
          </button>
        );
      })}
    </div>
  );
}
