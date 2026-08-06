"use client";

// STUB — owned by AGENT 5 (completion + share card + sound).
//
// Everything the completion sequence puts in the DOM: the closing line fading
// in beneath the whole photograph, and the save-the-card control. The seam fade
// and the cross-dissolve are canvas work and belong to the engine — this
// component only reacts to the phase it is given.

export interface CompletionOverlayProps {
  /** "sealing" | "dissolving" | "complete" drive the staging. */
  sealed: boolean;
  complete: boolean;
  closingLine: string;
  senderName: string;
  recipientName: string;
  saving: boolean;
  onSave: () => void;
  reducedMotion: boolean;
}

export default function CompletionOverlay(props: CompletionOverlayProps) {
  void props;
  return null;
}
