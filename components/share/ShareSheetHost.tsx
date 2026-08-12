"use client";

// ─── ShareSheetHost — the single mount point ─────────────────────────────────
//
// Mounted once per route group — the templates layout, and the app layout that
// covers the profile. It renders nothing at all until something calls
// `openShareSheet`, so it costs one subscription and a null render otherwise.
// The two groups are siblings, so only ever one of them is mounted at a time.
//
// `ShareSheet` itself stays a plain controlled component so the handful of
// templates that already own local share state (the wedding family) can keep
// driving it directly instead of being forced through the bus.
//
// The accent is resolved here rather than at every call site: a template editor
// knows its own colour and passes it, but the profile knows only which template
// a creation came from, and should not have to carry a colour table of its own.

import { shareAccent } from "@/lib/share/accents";
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
      password={payload?.password}
      accent={payload?.accent ?? shareAccent(payload?.slug)}
      slug={payload?.slug}
    />
  );
}

export default ShareSheetHost;
