import Link from "next/link";
import type { Category } from "@/lib/strapi";

export default function CategoryChips({
  categories,
  active,
}: {
  categories: Category[];
  active?: string;
}) {
  if (!categories.length) return null;

  const chip = (label: string, href: string, isActive: boolean) => (
    <Link
      key={href}
      href={href}
      className="rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-[0.12em] transition-colors"
      style={{
        background: isActive ? "#3d0c11" : "rgba(61,12,17,0.06)",
        color: isActive ? "#f5ede6" : "#2a0a0e",
        border: "1px solid rgba(61,12,17,0.12)",
      }}
    >
      {label}
    </Link>
  );

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {chip("All", "/blog", !active)}
      {categories.map((c) => chip(c.name, `/blog/category/${c.slug}`, active === c.slug))}
    </div>
  );
}
