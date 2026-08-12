import Link from "next/link";
import { templateList } from "@/data/template-registry";
import { UI } from "./ui";

// ─── The empty state ─────────────────────────────────────────────────────────
//
// When nothing has been shared yet, this page becomes a browsable catalogue
// rather than a grid of nothing — or, worse, a grid of invented people.
//
// This is the state the Wall will actually launch in, so it is built as a real
// page rather than a placeholder: a reader who lands here still sees what the
// site makes and still has somewhere to go. An empty Wall is information — it
// says these pages are not being shared publicly yet — and hiding that behind
// fabricated rows would mean nobody could ever tell whether the feature worked.

/** The first twelve of the gallery order — the strongest templates lead it. */
const LEAD = templateList.filter((t) => t.coverImage).slice(0, 12);

export default function WallEmpty({ slug }: { slug?: string | null }) {
  const filtered = Boolean(slug);

  return (
    <div>
      <div style={{ textAlign: "center", padding: "18px 0 34px" }}>
        <h2
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: 22,
            color: UI.text,
            margin: "0 0 8px",
          }}
        >
          {filtered ? "Nothing here yet" : "The Wall is just getting started"}
        </h2>
        <p style={{ fontSize: 14, color: UI.textMuted, margin: 0, lineHeight: 1.6 }}>
          {filtered
            ? "No one has shared this template publicly yet."
            : "Pages appear here only when the person who made one chooses to share it."}
          <br />
          Make one and you could be first.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gap: 14,
          gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
        }}
      >
        {LEAD.map((t) => (
          <Link
            key={t.slug}
            href={`/${t.slug}`}
            style={{
              textDecoration: "none",
              color: "inherit",
              border: `1px solid ${UI.border}`,
              borderRadius: 12,
              overflow: "hidden",
              background: UI.surface,
              display: "block",
            }}
          >
            <div
              style={{
                aspectRatio: "4 / 5",
                background: t.bgGradient,
                display: "grid",
                placeItems: "center",
                fontSize: 44,
              }}
            >
              <span aria-hidden>{t.emoji}</span>
            </div>
            <div style={{ padding: "11px 12px 13px" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: UI.text, lineHeight: 1.35 }}>
                {t.title}
              </div>
              <div style={{ fontSize: 12, color: UI.textFaint, marginTop: 5 }}>Be the first</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
