"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { isAdmin } from "@/lib/roles";
import AdminNav, { ADMIN_NAV_CSS, useAdminTabs } from "./AdminNav";
import SwipeTabs from "@/components/SwipeTabs";
import AdminPageTransition from "./AdminPageTransition";
import { AdminSkeleton } from "@/components/skeleton/Skeletons";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAppSelector((s) => s.auth);
  const [checked, setChecked] = useState(false);
  const tabs = useAdminTabs();

  useEffect(() => {
    if (isLoading) return;

    // ── WAIT BEFORE DECIDING ────────────────────────────────────────────────
    //
    // Opening an /admin URL directly — typing it, a bookmark, a shared link —
    // arrives before `checkAuth` has run. `isLoading` starts false and the store
    // starts empty, so this effect used to fire on the first commit, read "no
    // user" and redirect home. Every admin page was reachable only by clicking
    // through from inside the app, and a hard refresh threw you out.
    //
    // A token in storage means an answer is on its way. Hold the spinner until
    // the user object lands or `checkAuth` rejects and clears it.
    const token =
      typeof window === "undefined" ? null : window.localStorage.getItem("gifts_access_token");
    if (token && !user) return;

    // `isAdmin` is a rank check, not an equality check: a superadmin outranks
    // admin and must still reach every admin page. `role !== "admin"` would
    // redirect them straight back out.
    if (!isAuthenticated || !user || !isAdmin(user.role)) {
      router.replace("/");
      return;
    }
    setChecked(true);
  }, [isAuthenticated, isLoading, user, router]);

  // The admin screen's own shape while the session is confirmed, rather than a
  // spinner on an empty page. No navbar yet, so it draws standalone.
  if (!checked) return <AdminSkeleton standalone />;

  // The navbar lives here, not in each page, so it stays put between sections.
  // `.adm-main` pads content below it and paints the shared background.
  return (
    <>
      <style>{ADMIN_NAV_CSS}</style>
      <AdminNav />
      {/* Sideways swipe/slide only where a finger moves the page; on a desktop
          (clicks) the section fades and rises in instead. */}
      <SwipeTabs tabs={tabs} className="adm-main" media="(max-width: 1023px)">
        <AdminPageTransition>{children}</AdminPageTransition>
      </SwipeTabs>
    </>
  );
}
