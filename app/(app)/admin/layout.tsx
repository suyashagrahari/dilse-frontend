"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAppSelector((s) => s.auth);
  const [checked, setChecked] = useState(false);

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

    if (!isAuthenticated || !user || user.role !== "admin") {
      router.replace("/");
      return;
    }
    setChecked(true);
  }, [isAuthenticated, isLoading, user, router]);

  if (!checked) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5ede6" }}>
        <div style={{ width: 32, height: 32, border: "3px solid rgba(61,12,17,0.12)", borderTopColor: "#c9a84c", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return <>{children}</>;
}
