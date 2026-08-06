"use client";

// STUB — owned by AGENT 5 (completion + share card + sound).
//
// The exported 9:16 composition. Fixed pixel size, scaled for display only —
// `exportNodeToPng` un-scales it. No <video>, no cross-origin <img> (the photo
// arrives here already inlined as a data URL, or empty).

import { forwardRef } from "react";

export const SHARE_W = 405;
export const SHARE_H = 720;

export interface ShareCardProps {
  recipientName: string;
  senderName: string;
  /** Already a data URL of the completed photograph, or "". Never a remote URL. */
  imageData: string;
  /** The revealed letter, in letter order. 3–4 are shown. */
  lines: string[];
  closingLine: string;
}

const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(function ShareCard(_props, ref) {
  return <div ref={ref} style={{ width: SHARE_W, height: SHARE_H }} />;
});

export default ShareCard;
