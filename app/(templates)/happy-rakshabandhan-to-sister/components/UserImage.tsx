"use client";

import Image from "next/image";

// ─── A photograph the sender supplied ────────────────────────────────────────
//
// Two sources arrive at the same slots and they cannot be rendered the same way:
//
//   https://cdn.subhsandesh.in/…   a published page → next/image, so the
//                                  recipient gets a resized, cached image
//   blob:http://…                  a photo he just picked, still held in
//                                  IndexedDB and not yet uploaded
//
// `next/image` cannot take the second one. Its loader builds a `/_next/image`
// URL with the source as a query parameter, and a `blob:` URL is meaningless to
// the server that would fetch it — the request 400s and the slot renders empty.
// `unoptimized` does not save it either, because the src still goes through
// Next's URL validation.
//
// So local blobs render as a plain `<img>` and everything else keeps the
// optimiser. Branching here, in one component, is what keeps that decision out
// of the four places that show a supplied image — the cover, the polaroid grid,
// the lifafa's QR and the story card.

export default function UserImage({
  src,
  alt,
  sizes,
  priority,
  onError,
  style,
}: {
  src: string;
  alt: string;
  /** next/image only; ignored for local blobs, which are already local. */
  sizes?: string;
  priority?: boolean;
  onError?: () => void;
  style?: React.CSSProperties;
}) {
  const local = src.startsWith("blob:") || src.startsWith("data:");

  // Both branches fill their positioned parent, so callers keep the same
  // `position: relative` + aspect-ratio wrapper either way.
  const fillStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    ...style,
  };

  if (local) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} onError={onError} style={fillStyle} />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      onError={onError}
      style={style}
    />
  );
}
