"use client";

// PLACEHOLDER — replaced by the build branch, which adds the top bar,
// EditSheet and `useLoveflixEditor`. For now this just renders the demo.

import { Suspense } from "react";
import LoveflixTemplate from "./components/LoveflixTemplate";
import { DEMO_DATA } from "./components/types";

function LoveflixPageInner() {
  return <LoveflixTemplate data={DEMO_DATA} mode="demo" />;
}

export default function LoveflixPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100dvh" }} />}>
      <LoveflixPageInner />
    </Suspense>
  );
}
