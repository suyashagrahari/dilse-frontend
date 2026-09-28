"use client";

// The theme context lives apart from themes.ts: that file is plain data that
// server code (metadata, the share route) also imports, and createContext
// would drag it into the client-only world.

import { createContext, useContext } from "react";
import { CAPSULE_THEMES, type CapsuleTheme } from "./themes";

export const CapsuleThemeContext = createContext<CapsuleTheme>(CAPSULE_THEMES[0]);
export const useCapsuleTheme = (): CapsuleTheme => useContext(CapsuleThemeContext);
