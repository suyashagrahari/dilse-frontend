// A bride in a veil and a groom in a suit under a little heart — the bottom
// nav's Wedding tab. Solid silhouettes read better than outlines at 20px, so
// this is filled with the tab colour; the veil is a translucent drape and the
// groom's shirt is a cut-out (evenodd).
// Drawn on lucide's 24px grid so it sits level with Home / LayoutTemplate.

export default function BrideGroom({
  size = 24,
  color = "currentColor",
  className,
}: {
  size?: number;
  color?: string;
  /** Accepted so it drops in for lucide icons; a filled silhouette ignores it. */
  strokeWidth?: number;
  className?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {/* heart between them */}
      <path d="M12 4.5c-1-.8-1.75-1.4-1.75-2.15 0-.6.47-1.05 1.02-1.05.32 0 .56.15.73.4.17-.25.41-.4.73-.4.55 0 1.02.45 1.02 1.05 0 .75-.75 1.35-1.75 2.15z" />
      {/* bride: head, flared gown */}
      <circle cx="8" cy="6.6" r="2.05" />
      <path d="M6.7 9.3c-.9.9-.95 2.6-.3 3.9-1.25 2.7-2.15 5.5-2.55 8.3h8.3c-.4-2.8-1.3-5.6-2.55-8.3.65-1.3.6-3-.3-3.9-.8.35-1.8.35-2.6 0z" />
      {/* veil: a soft drape falling from the crown behind her shoulder */}
      <path opacity=".55" d="M7.2 4.75C4.7 5.9 3.15 9.8 2.45 17.4c1.3-1.25 2.55-3.1 3.65-5.35.15-1.35.05-2.55-.35-3.4.2-1.45.7-2.85 1.45-3.9z" />
      {/* groom: head, suit with a shirt-and-tie cut-out */}
      <circle cx="16.1" cy="6.2" r="2.15" />
      <path
        fillRule="evenodd"
        d="M13.3 9.5c1.75-.75 3.85-.75 5.6 0l.75 6h-1.05v6h-5V15.5h-1.05l.75-6zM16.1 9.6l-.75 1.35.75 2.55.75-2.55-.75-1.35z"
      />
    </svg>
  );
}
