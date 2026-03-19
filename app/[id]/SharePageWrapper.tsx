"use client";

import dynamic from "next/dynamic";

// ssr:false must live in a Client Component — not allowed in Server Components.
const SharePageClient = dynamic(() => import("./SharePageClient"), { ssr: false });

export default function SharePageWrapper() {
  return <SharePageClient />;
}
