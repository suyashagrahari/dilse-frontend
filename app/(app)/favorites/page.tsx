// Server shell. Resolves the hidden-template list before the HTML is written, so
// a favourite whose template has since been switched off is absent from the
// first render rather than shown and then withdrawn. See the note in
// `../templates/page.tsx` for why this is per-page and not in the layout.

import { TemplateVisibilityProvider } from "@/components/TemplateVisibilityProvider";
import { getHiddenTemplatesServer } from "@/lib/templateVisibility.server";
import FavoritesPageClient from "./FavoritesPageClient";

export default async function FavoritesPage() {
  const hidden = await getHiddenTemplatesServer();

  return (
    <TemplateVisibilityProvider hidden={hidden}>
      <FavoritesPageClient />
    </TemplateVisibilityProvider>
  );
}
