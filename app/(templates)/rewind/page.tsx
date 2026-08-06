"use client";

// PLACEHOLDER — replaced by the build branch, which adds the top bar,
// EditSheet and `useRewindEditor`. For now this just renders the demo.

import { Suspense } from "react";
import RewindTemplate from "./components/RewindTemplate";
import { DEMO_DATA } from "./components/types";

function RewindPageInner() {
  return <RewindTemplate data={DEMO_DATA} mode="demo" />;
}

export default function RewindPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100dvh" }} />}>
      <RewindPageInner />
    </Suspense>
  );
}
