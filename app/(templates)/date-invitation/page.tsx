"use client";

// PLACEHOLDER — replaced by the build branch, which adds the top bar,
// EditSheet and `useDateInvitationEditor`. For now this just renders the demo.

import { Suspense } from "react";
import DateInvitationTemplate from "./components/DateInvitationTemplate";
import { buildDemoData } from "./components/types";

function DateInvitationPageInner() {
  return <DateInvitationTemplate data={buildDemoData()} mode="demo" />;
}

export default function DateInvitationPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100dvh" }} />}>
      <DateInvitationPageInner />
    </Suspense>
  );
}
