import { ShareSheetHost } from "@/components/share/ShareSheetHost";

/**
 * The share sheet is mounted here, once, for every template.
 *
 * It is opened through `openShareSheet` from `lib/share/shareBus` rather than by
 * props, so a template's editor hook can raise it without its `page.tsx` having
 * to mount or wire anything. See the note at the top of that file for why the
 * alternative — 40 hooks exposing state and 40 pages rendering the component —
 * fails silently the first time one of them is forgotten.
 */
export default function TemplatesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <ShareSheetHost />
    </>
  );
}
