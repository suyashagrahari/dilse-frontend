"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

/** Captures ?ref=CODE from the URL and saves it to localStorage (30-day expiry). */
export default function RefCodeCapture() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (!ref) return;
    const code = ref.toUpperCase().trim();
    if (!code) return;
    const expiry = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
    localStorage.setItem("ref_code", code);
    localStorage.setItem("ref_code_expiry", String(expiry));
  }, [searchParams]);

  // Also clear expired codes on mount
  useEffect(() => {
    const expiry = localStorage.getItem("ref_code_expiry");
    if (expiry && Date.now() > Number(expiry)) {
      localStorage.removeItem("ref_code");
      localStorage.removeItem("ref_code_expiry");
    }
  }, []);

  return null;
}
