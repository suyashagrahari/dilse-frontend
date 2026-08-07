"use client";

import PendingViewer from "./_PendingViewer";

/**
 * REPLACE THIS ENTIRE FILE with the real viewer: password gate + dbTo…Data →
 * <…Template mode="live" />. See reference/shared-viewer.md in the
 * subhsandesh-template skill. Registered in SharePageClient by the scaffold.
 */
export default function WatchViewer(_props: {
  rawData: Record<string, unknown>;
  hasPassword: boolean;
  shareId: string;
}) {
  return <PendingViewer label="watch" />;
}
