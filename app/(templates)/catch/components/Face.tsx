"use client";

import { cropStyle, clampCrop } from "../../dedication/components/types";
import type { CatchData } from "./types";
import { initialOf } from "./theme";

/** Their face in the game's ring, framed exactly as set in the editor. */
export default function Face({ data, size = 96, className = "" }: { data: CatchData; size?: number; className?: string }) {
  const crop = clampCrop({ x: data.faceCropX, y: data.faceCropY, scale: data.faceScale });
  return (
    <span className={`ct-face ${className}`} style={{ width: size, height: size }}>
      {data.faceUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={data.faceUrl} alt={data.recipientName} draggable={false} style={cropStyle(crop)} />
      ) : (
        <span className="ct-faceKawaii" aria-label={data.recipientName}>
          <i className="ct-eye" />
          <i className="ct-eye" />
          <i className="ct-mouth" />
          <i className="ct-cheek" />
          <i className="ct-cheek" />
          <b>{initialOf(data.recipientName)}</b>
        </span>
      )}
    </span>
  );
}
