import { NextRequest, NextResponse } from "next/server";

// Resolve ROOT_DOMAIN per active environment so subdomain routing works
// in both dev (klyro.digital) and prod (subhsandesh.in) without sharing a
// single env var that would have to be manually swapped.
const APP_ENV = process.env.NEXT_PUBLIC_APP_ENV || "local";
const ROOT_DOMAIN = (() => {
  if (APP_ENV === "ngrok") return process.env.NEXT_PUBLIC_NGROK_ROOT_DOMAIN || "";
  if (APP_ENV === "production") return process.env.NEXT_PUBLIC_PROD_ROOT_DOMAIN || "";
  return ""; // local — no subdomain routing
})();

// Subdomains that are NOT user handles — leave them alone
const RESERVED_SUBDOMAINS = new Set([
  "www", "api", "admin", "mail", "ftp", "support", "static", "cdn", "dev",
  "stag", "stag-api", "strapi", "dev-api",
]);

// Shape of a shareId: the output of randomUUID(), which is how every published
// page gets its id (server/src/models/*Page.ts — 14 of 14 models use it, and the
// server has no other id generator).
//
// This replaces what used to be GLOBAL_ROUTE_PREFIXES: a hand-maintained
// allowlist of app routes that had to be passed through untouched. That approach
// was inverted — it had to enumerate everything that ISN'T a share link — so it
// silently rotted every time a template or page was added. By the time it was
// found it was missing 5 templates (including apology-dashboard, the flagship)
// plus /blog, /help, /about-us, /contact-us, /privacy-policy, /terms-of-service
// and /admin. Each of those was being rewritten to /{username}/{path} and served
// as a share link, so the share lookup failed and the page was unreachable on any
// subdomain — breaking the recipient → "Create" → pick-a-template growth loop.
//
// Detecting the share link POSITIVELY cannot go stale: anything that is not a
// UUID is, by definition, an ordinary app route. New templates and new pages work
// on subdomains from the moment they ship, with no change to this file.
const SHARE_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isShareIdPath(pathname: string): boolean {
  // Only the first segment matters; deeper paths were never valid share URLs.
  return SHARE_ID_RE.test(pathname.split("/")[1] ?? "");
}

/**
 * Routes that have no meaning on a user subdomain and are sent to the root
 * domain instead.
 *
 * `/admin` is guarded by a role check in app/(app)/admin/layout.tsx, but that
 * guard is client-side: the shell mounts and renders for a moment before
 * redirecting. Since passing through became the default, the admin area became
 * reachable at `{anyone}.subhsandesh.in/admin/...`. Redirecting to the canonical
 * host removes the exposure and still takes a real admin where they meant to go.
 */
const ROOT_DOMAIN_ONLY_PREFIXES = ["/admin"];

function isRootDomainOnly(pathname: string): boolean {
  return ROOT_DOMAIN_ONLY_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function middleware(req: NextRequest) {
  // Only activate when ROOT_DOMAIN is configured
  // local: empty → no subdomain routing
  // ngrok: klyro.digital → subdomain dev testing
  // production: subhsandesh.in → live subdomain routing
  if (!ROOT_DOMAIN) return NextResponse.next();

  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
  const hostname = host.split(":")[0].toLowerCase(); // strip port

  // Must end with .{ROOT_DOMAIN} (e.g. .klyro.digital or .subhsandesh.in)
  // Root domain itself (no subdomain) falls through to normal routing
  if (!hostname.endsWith(`.${ROOT_DOMAIN}`)) return NextResponse.next();

  // Extract the subdomain part: "abc" from "abc.klyro.digital"
  const subdomain = hostname.slice(0, -(`.${ROOT_DOMAIN}`.length));

  // Skip reserved subdomains and empty
  if (!subdomain || RESERVED_SUBDOMAINS.has(subdomain)) return NextResponse.next();

  const pathname = req.nextUrl.pathname;
  const url = req.nextUrl.clone();

  // Root of subdomain: abc.klyro.digital/
  //   → internally served as /u/abc
  //   → hits app/u/[username]/page.tsx (no URL change visible to user)
  if (pathname === "/" || pathname === "") {
    url.pathname = `/u/${subdomain}`;
    return NextResponse.rewrite(url);
  }

  // Support both /saves and /favorites consistently on subdomains.
  if (pathname === "/saves" || pathname.startsWith("/saves/")) {
    url.pathname = pathname.replace(/^\/saves/, "/favorites");
    return NextResponse.rewrite(url);
  }

  // Share link: abc.klyro.digital/550e8400-e29b-41d4-a716-446655440000
  //   → internally served as /abc/550e8400-...
  //   → hits app/[id]/[shareId]/page.tsx (no URL change visible to the user)
  if (isShareIdPath(pathname)) {
    url.pathname = `/${subdomain}${pathname}`;
    return NextResponse.rewrite(url);
  }

  // Admin-only areas belong on the root domain. Preserves path, query and
  // protocol; only the host changes.
  if (isRootDomainOnly(pathname)) {
    // hostname + explicit port reset, NOT `url.host = ROOT_DOMAIN`. Assigning to
    // `host` keeps any existing port (WHATWG URL: a host value without a port
    // leaves the current one in place), and behind nginx `nextUrl` carries Next's
    // internal port — which leaked a redirect to `https://subhsandesh.in:3000/...`.
    url.hostname = ROOT_DOMAIN;
    url.port = "";
    return NextResponse.redirect(url);
  }

  // Everything else is an ordinary app page (template editor, gallery, blog,
  // legal pages, …) and must render on a subdomain exactly as it does on the
  // root domain. Passing through is now the default rather than something each
  // route had to opt into by name.
  const res = NextResponse.next();

  // These pages are identical on every user's subdomain, so leaving them
  // indexable would publish the same content at unlimited hostnames and split
  // its ranking. Canonical tags would also solve it, but coverage is uneven
  // (/privacy-policy and /help have none), and a header covers every current and
  // future route without relying on each page remembering to declare one.
  //
  // Deliberately scoped: it is set only on this passthrough branch, so the
  // subdomain's own profile page (`/` → /u/{subdomain}) and share links above
  // stay indexable — those are the pages a subdomain exists to serve.
  // `follow` keeps link equity flowing to the canonical copies.
  res.headers.set("X-Robots-Tag", "noindex, follow");

  return res;
}

export const config = {
  // Run on user-facing pages, skip internals and API/static assets
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icons|images|robots.txt|sitemap.xml|.*\\..*).*)"],
};
