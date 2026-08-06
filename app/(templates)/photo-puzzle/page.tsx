"use client";

// PLACEHOLDER — replaced by the build branch, which adds the top bar,
// EditSheet and `usePhotoPuzzleEditor`. For now this just renders the demo.

import { Suspense } from "react";
import PhotoPuzzleTemplate from "./components/PhotoPuzzleTemplate";
import { DEMO_DATA } from "./components/types";

function PhotoPuzzlePageInner() {
  return <PhotoPuzzleTemplate data={DEMO_DATA} mode="demo" />;
}

export default function PhotoPuzzlePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100dvh" }} />}>
      <PhotoPuzzlePageInner />
    </Suspense>
  );
}
