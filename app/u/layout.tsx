import NavMount from "@/components/NavMount";
import { TemplateSearchProvider } from "@/components/TemplateSearchProvider";
import GlobalEffects from "@/components/GlobalEffects";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import AppLayoutShell from "@/app/(app)/AppLayoutShell";

/**
 * Layout for /u/[username] — applied when middleware rewrites
 * subdomain root (e.g. suyash.subhsandesh.in/) to /u/suyash.
 * Mirrors (app)/layout so the full nav, shell, referral overlay
 * and ref-code capture all work on subdomain visits too.
 */
export default function ULayout({ children }: { children: React.ReactNode }) {
  return (
    <TemplateSearchProvider>
      <AppLayoutShell>
        <GlobalEffects />
        <NavMount />
        <ErrorBoundary>{children}</ErrorBoundary>
      </AppLayoutShell>
    </TemplateSearchProvider>
  );
}
