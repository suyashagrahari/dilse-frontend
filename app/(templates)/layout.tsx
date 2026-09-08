import { ShareSheetHost } from "@/components/share/ShareSheetHost";
import PaywallHost from "@/components/PaywallHost";
import FeedbackHost from "@/components/FeedbackHost";
import ToastHost from "@/components/toast/ToastHost";
import { TemplateAvailabilityGate } from "@/components/TemplateAvailabilityGate";
import { TemplateVisibilityProvider } from "@/components/TemplateVisibilityProvider";
import { getHiddenTemplatesServer } from "@/lib/templateVisibility.server";

/**
 * The share sheet is mounted here, once, for every template.
 *
 * It is opened through `openShareSheet` from `lib/share/shareBus` rather than by
 * props, so a template's editor hook can raise it without its `page.tsx` having
 * to mount or wire anything. See the note at the top of that file for why the
 * alternative — 40 hooks exposing state and 40 pages rendering the component —
 * fails silently the first time one of them is forgotten.
 */
export default async function TemplatesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Resolved here, before the HTML is written, so the gate below decides on its
  // FIRST render. Fetching it from the client instead is what made a live
  // template open on "Not available yet" and then replace itself a moment later.
  const hidden = await getHiddenTemplatesServer();

  return (
    <TemplateVisibilityProvider hidden={hidden}>
      {/* One gate for every route in this group. It reads the slug off the URL,
          so a template switched off in the admin screen closes its builder here
          without any per-template wiring. Published pages are at /[id], outside
          this group, and are deliberately unaffected — see the component. */}
      <TemplateAvailabilityGate>{children}</TemplateAvailabilityGate>
      <ShareSheetHost />
      {/* The paywall, mounted once for every template, for exactly the reason
          the share sheet is. An editor hook raises it with one call to
          `offerPaywall`; nothing per-template has to mount it. That is also why
          this feature previously existed on two templates out of forty-two —
          the old shape needed a modal in each template's page.tsx. */}
      <PaywallHost />
      {/* "How was making this?", raised the moment a publish succeeds and
          before the share sheet. Mounted here for the same reason the two
          above are — the trigger is a module bus, so exactly one component
          has to be listening. */}
      <FeedbackHost />
      <ToastHost />
    </TemplateVisibilityProvider>
  );
}
