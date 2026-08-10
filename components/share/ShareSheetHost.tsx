"use client";

// ─── ShareSheetHost — the single mount point ─────────────────────────────────
//
// Mounted once in the templates layout. It renders nothing at all until some
// template's `handleShare` calls `openShareSheet`, so it costs one subscription
// and a null render on every template page.
//
// `ShareSheet` itself stays a plain controlled component so the handful of
// templates that already own local share state (the wedding family) can keep
// driving it directly instead of being forced through the bus.

import { closeShareSheet, useSharePayload } from "@/lib/share/shareBus";
import { ShareSheet } from "./ShareSheet";

export function ShareSheetHost() {
  const payload = useSharePayload();

  return (
    <ShareSheet
      open={payload !== null}
      onClose={closeShareSheet}
      shareUrl={payload?.url ?? null}
      title={payload?.title}
      text={payload?.text}
      cardTitle={payload?.cardTitle}
      cardNote={payload?.cardNote}
      recipientName={payload?.recipientName}
      senderName={payload?.senderName}
      accent={payload?.accent}
      slug={payload?.slug}
    />
  );
}

export default ShareSheetHost;
