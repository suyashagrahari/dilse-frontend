"use client";

/**
 * The placeholder a dedicated viewer renders before it has been written.
 *
 * SharePageClient registers all four of this batch's templates up front, in one
 * scaffold pass, so that the four template branches never touch it and never
 * conflict on it. That registration has to compile today, which means the four
 * viewer modules have to exist today — before the templates they render do.
 *
 * Each template branch replaces its own `XxxViewer.tsx` wholesale with the real
 * password gate + template render. If you are seeing this on a published page,
 * that replacement has not happened yet for that slug, and the honest thing to
 * show the recipient is "not ready" rather than a crash or a blank screen.
 */
export default function PendingViewer({ label }: { label: string }) {
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        padding: "24px",
        background: "#FAFAF7",
        color: "#0F1111",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: 320 }}>
        <p style={{ fontSize: 17, fontWeight: 600, margin: "0 0 8px" }}>
          This one isn&rsquo;t ready yet
        </p>
        <p style={{ fontSize: 14, lineHeight: 1.5, color: "#565959", margin: 0 }}>
          The {label} page is still being built. Check back in a little while.
        </p>
      </div>
    </div>
  );
}
