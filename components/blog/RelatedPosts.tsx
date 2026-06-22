import type { Article } from "@/lib/strapi";
import BlogCard from "./BlogCard";

export default function RelatedPosts({ articles }: { articles: Article[] }) {
  if (!articles.length) return null;
  return (
    <section className="mt-16">
      <h2 className="mb-6 text-2xl" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: "#2a0a0e" }}>
        Keep reading
      </h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((a) => (
          <BlogCard key={a.id} article={a} />
        ))}
      </div>
    </section>
  );
}
