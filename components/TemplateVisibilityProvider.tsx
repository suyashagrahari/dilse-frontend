"use client";

// ─── Handing the server's answer to the components that need it ──────────────
//
// `getHiddenTemplatesServer()` resolves which templates are hidden while the
// HTML is still being written. This carries that list to the gallery, the
// favourites list and the builder gate, so their FIRST render is already right
// and nothing has to appear or disappear once a fetch lands.
//
// ── WHY CONTEXT AND NOT JUST SEEDING THE STORE ──────────────────────────────
//
// Because on the server that store is one shared module for every request in the
// process. Writing the list into it during a render lets one visitor's answer
// end up in another visitor's HTML, and since the client's copy of the module
// starts from its own default, React would then be hydrating markup it cannot
// reproduce. Context is per-render and has neither problem. The store is still
// seeded on the client, but only to save the now-redundant fetch.

import { createContext, useContext } from "react";
import { seedTemplateVisibility } from "@/lib/templateVisibility";

const HiddenContext = createContext<readonly string[] | null>(null);

/** The server's list, or `null` when the server could not resolve one. */
export function useProvidedHiddenTemplates(): readonly string[] | null {
  return useContext(HiddenContext);
}

export function TemplateVisibilityProvider({
  hidden,
  children,
}: {
  hidden: string[] | null;
  children: React.ReactNode;
}) {
  // Not an effect: an effect runs after the first paint, which is precisely the
  // beat being removed here. This line runs before children render, which is
  // when it needs to have happened.
  //
  // Browser only, and not because it would misbehave on the server but because
  // it would be pointless there and untidy: that module is shared by every
  // request in the process, and nothing on the server reads the part of it this
  // writes. The value the server render uses is the `hidden` prop below.
  //
  // `seedTemplateVisibility` is a no-op once the store has fetched for itself,
  // so calling it from a render body is safe under StrictMode's double render
  // and under a re-render with the same list.
  if (typeof window !== "undefined" && hidden) seedTemplateVisibility(hidden);

  return <HiddenContext.Provider value={hidden}>{children}</HiddenContext.Provider>;
}

export default TemplateVisibilityProvider;
