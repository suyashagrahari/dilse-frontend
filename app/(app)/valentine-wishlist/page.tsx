import type { Metadata } from "next";
import { buildMeta } from "@/lib/seo";
import ValentineWishlistClient from "./ValentineWishlistClient";

export const metadata: Metadata = buildMeta({
  title: "Valentine's Week Wishlist — 30% Off | SubhSandesh",
  description:
    "Join the SubhSandesh Valentine's week wishlist: new templates for Rose Day through Valentine's Day, with 30% off saved to your account.",
});

export default function ValentineWishlistPage() {
  return <ValentineWishlistClient />;
}
