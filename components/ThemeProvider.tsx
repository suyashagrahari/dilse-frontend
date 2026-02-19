"use client";

import { useEffect, useRef } from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { useAppSelector } from "@/store/hooks";

function ThemeSyncer() {
  const { setTheme } = useTheme();
  const user = useAppSelector((s) => s.auth.user);
  const hasSynced = useRef(false);

  useEffect(() => {
    if (user?.theme && !hasSynced.current) {
      setTheme(user.theme);
      hasSynced.current = true;
    }
    if (!user) {
      hasSynced.current = false;
    }
  }, [user, setTheme]);

  return null;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange={false}
    >
      <ThemeSyncer />
      {children}
    </NextThemesProvider>
  );
}
