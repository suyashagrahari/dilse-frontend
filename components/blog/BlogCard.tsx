import Link from "next/link";
import Image from "next/image";
import { Clock } from "lucide-react";
import type { Article } from "@/lib/strapi";
import { strapiMedia } from "@/lib/strapi";
import { formatDate } from "@/lib/blog-utils";

export default function BlogCard({ article, featured = false }: { article: Article; featured?: boolean }) {
  const cover = strapiMedia(article.coverImage?.url);
  const authorAvatar = strapiMedia(article.author?.avatar?.url);

  return (
    <Link
      href={`/blog/${article.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1"
      style={{
        background: "rgba(255,255,255,0.78)",
        border: "1px solid rgba(61,12,17,0.12)",
        boxShadow: "0 4px 18px rgba(61,12,17,0.07)",
        gridColumn: featured ? "1 / -1" : undefined,
      }}
    >
      <div
        className={`relative w-full overflow-hidden ${featured ? "aspect-[16/8]" : "aspect-[16/10]"}`}
        style={{ background: "linear-gradient(135deg,#efe3d8,#e4d2c3)" }}
      >
        {cover ? (
          <Image
            src={cover}
            alt={article.coverImage?.alternativeText || article.title}
            fill
            sizes={featured ? "(max-width:768px) 100vw, 1100px" : "(max-width:768px) 100vw, 380px"}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-5xl">📝</div>
        )}
        {article.category && (
          <span
            className="absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em]"
            style={{ background: "#3d0c11", color: "#f5ede6" }}
          >
            {article.category.name}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3
          className={`${featured ? "text-2xl md:text-3xl" : "text-lg"} leading-snug`}
          style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: "#2a0a0e" }}
        >
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="mt-2 text-sm leading-relaxed" style={{ color: "rgba(42,10,14,0.72)" }}>
            {article.excerpt.length > 150 ? `${article.excerpt.slice(0, 150)}…` : article.excerpt}
          </p>
        )}

        <div className="mt-auto flex items-center gap-3 pt-4 text-xs" style={{ color: "rgba(42,10,14,0.6)" }}>
          {article.author && (
            <span className="flex items-center gap-2">
              {authorAvatar ? (
                <Image src={authorAvatar} alt={article.author.name} width={24} height={24} className="rounded-full object-cover" />
              ) : (
                <span className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold" style={{ background: "#c9a84c", color: "#fff" }}>
                  {article.author.name.charAt(0)}
                </span>
              )}
              <span className="font-semibold">{article.author.name}</span>
            </span>
          )}
          <span>·</span>
          <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
          {article.readingTime ? (
            <span className="ml-auto flex items-center gap-1">
              <Clock size={12} /> {article.readingTime} min
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
