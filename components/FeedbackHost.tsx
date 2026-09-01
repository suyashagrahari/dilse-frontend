"use client";

// ─── FeedbackHost — the single mount point ────────────────────────────────────
//
// Mounted once per route group, beside `ShareSheetHost` and `PaywallHost`, for
// the same reason both of those are: the modal is raised from a module bus by
// code that cannot render, so exactly one component has to be listening.
//
// It renders nothing at all until a publish succeeds. See
// `lib/feedback/feedbackBus.ts` for why the trigger sits inside
// `openShareSheet` rather than in forty-three editors.

import { closeFeedback, useFeedbackRequest } from "@/lib/feedback/feedbackBus";
import FeedbackModal from "./FeedbackModal";

export function FeedbackHost() {
  const request = useFeedbackRequest();

  if (!request) return null;

  // Keyed on the page URL so a second publish in the same session mounts a
  // genuinely fresh modal rather than reusing one carrying the previous rating.
  return (
    <FeedbackModal
      key={request.ctx.pageUrl}
      ctx={request.ctx}
      onDone={closeFeedback}
    />
  );
}

export default FeedbackHost;
