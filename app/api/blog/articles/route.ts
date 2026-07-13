import { NextResponse } from "next/server";
import { getArticles } from "@/lib/strapi";

// Serves additional pages of blog articles to the client-side infinite-scroll
// grid. The actual Strapi fetch inside getArticles is cached + webhook-
// revalidated (tag: "articles"), so repeated requests are cheap and fresh.
export const revalidate = 3600;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
  const pageSize = Math.min(48, Math.max(1, parseInt(searchParams.get("pageSize") || "12", 10) || 12));
  const category = searchParams.get("category") || undefined;
  const featured = searchParams.get("featured") === "true" ? true : undefined;
  const search = (searchParams.get("q") || searchParams.get("search") || "").trim() || undefined;

  const { articles, pageCount, total } = await getArticles({ page, pageSize, category, featured, search });
  return NextResponse.json({ articles, pageCount, total, page });
}
