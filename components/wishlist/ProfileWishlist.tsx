"use client";

// The profile's view of the Valentine's week wishlist: the pass once joined,
// otherwise a slim invitation to the wishlist page.

import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";
import ValentinePass from "@/components/wishlist/ValentinePass";
import { useWishlist } from "@/hooks/useWishlist";
import { useAppSelector } from "@/store/hooks";
import { VALENTINE_CAMPAIGN, VALENTINE_DISCOUNT, VALENTINE_PATH } from "@/lib/wishlist/valentine";

export default function ProfileWishlist() {
  const wl = useWishlist(VALENTINE_CAMPAIGN);
  const name = useAppSelector((s) => s.auth.user?.name);
  if (wl.status === "joined" && wl.entry) {
    return <div className="pwlWrap"><ValentinePass entry={wl.entry} name={name} compact link /></div>;
  }
  if (wl.status !== "open") return null;
  return (
    <div className="pwlWrap">
      <Link href={VALENTINE_PATH} className="pwlInvite">
        <span className="pwlIc"><Heart size={15} fill="currentColor" aria-hidden /></span>
        <span className="pwlTxt"><b>Valentine&apos;s week is coming</b><span>Join the wishlist — {VALENTINE_DISCOUNT}% off saved to your account</span></span>
        <ArrowRight size={16} aria-hidden />
      </Link>
      <style>{`
        .pwlWrap { margin: 14px 0 4px; }
        .pwlInvite { display: flex; align-items: center; gap: 12px; padding: 12px 16px 12px 12px; border-radius: 16px; text-decoration: none; color: #fff4f1;
          background: linear-gradient(120deg, #b3243f, #6d0f26); box-shadow: 0 14px 30px -20px rgba(122,16,40,.8); }
        .pwlIc { flex-shrink: 0; width: 36px; height: 36px; border-radius: 50%; display: grid; place-items: center; color: #8a1430; background: #ffe4de; }
        .pwlTxt { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
        .pwlTxt b { font: 600 15px/1.2 'Playfair Display', serif; }
        .pwlTxt span { font: 500 12px/1.3 'Inter', system-ui, sans-serif; color: rgba(255,236,232,.8); }
      `}</style>
    </div>
  );
}
