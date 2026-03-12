"use client";

import { useEffect, useState } from "react";

import BottomNav from "@/components/BottomNav";
import DesktopNav from "@/components/DesktopNav";

export default function NavMount() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <DesktopNav />
      <BottomNav />
    </>
  );
}
