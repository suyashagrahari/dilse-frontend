"use client";

import { useEffect, useRef } from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { useAppSelector } from "@/store/hooks";

function ThemeSyncer() {
  const { setTheme } = useTheme();
  const user = useAppSelector((s) => s.auth.user);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const prevAuthenticated = useRef(false);
  const hasSynced = useRef(false);

  useEffect(() => {
    // User just logged in — apply their saved theme (default to light)
    if (isAuthenticated && user && !hasSynced.current) {
      setTheme(user.theme || "light");
      hasSynced.current = true;
    }

    // User just logged out — reset to light
    if (!isAuthenticated && prevAuthenticated.current) {
      setTheme("light");
      hasSynced.current = false;
    }

    prevAuthenticated.current = isAuthenticated;
  }, [user, isAuthenticated, setTheme]);

  return null;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange={false}
    >
      <ThemeSyncer />
      {children}
    </NextThemesProvider>
  );
}
