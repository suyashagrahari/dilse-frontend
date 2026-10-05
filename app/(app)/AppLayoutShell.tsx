"use client";

import { usePathname } from "next/navigation";
import ReferralWelcomeOverlay from "@/components/ReferralWelcomeOverlay";

export default function AppLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  // NOTE: the app-open loader now lives in <AppSplash /> (mounted in the server
  // layout so it paints on first paint and flows seamlessly out of the OS/PWA
  // splash). The old client-only counter loader was removed to avoid a second,
  // late-appearing loader.
  return (
    <div className={isHome ? "" : "pb-24 md:pb-0"}>
      <ReferralWelcomeOverlay />
      {children}
    </div>
  );
}
