// Two interlocked wedding rings with a small solitaire — the bottom nav's
// Wedding tab. Drawn on lucide's 24px grid with round caps and joins, so it
// sits beside LayoutTemplate / Home / MessageSquareHeart at the same weight.

export default function WeddingRings({
  size = 24,
  color = "currentColor",
  strokeWidth = 2,
  className,
}: {
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {/* the solitaire */}
      <path d="M6.6 4.6 7.8 3h2.4l1.2 1.6L9 7.4Z" />
      {/* The rings interlock: each one breaks where it passes under the other
          (the right ring at the top crossing, the left ring at the bottom). */}
      <path d="M10.72 19.74A5.8 5.8 0 1 1 13.12 18.29" />
      <path d="M13.3 8.65A5.8 5.8 0 1 1 10.9 10.1" />
    </svg>
  );
}
