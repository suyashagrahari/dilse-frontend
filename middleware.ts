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

// App pages that should work exactly the same on root domain and subdomains.
const GLOBAL_ROUTE_PREFIXES = [
  "/templates",
  "/profile",
  "/favorites",
  "/manifesto",
  "/raw-home",
  "/u",
  "/anniversary-gf",
  "/anniversary-parents",
  "/birthday-bestfriend",
  "/birthday-friend",
  "/birthday-gf",
  "/birthday-parents",
  "/eid-mubarak",
  "/holi",
  "/love-gf",
  "/missyou-bestfriend",
  "/missyou-gf",
  "/reception",
  "/sorry-friend",
  "/sorry-gf",
  "/valentine-bestfriend",
  "/valentine-gf",
  "/wedding-shaadi",
  "/christian-wedding",
];

function isGlobalRoute(pathname: string): boolean {
  return GLOBAL_ROUTE_PREFIXES.some(
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

  // Keep app pages global; do not treat them like share IDs.
  if (isGlobalRoute(pathname)) {
    return NextResponse.next();
  }

  // Any other path: abc.klyro.digital/abc12345
  //   → internally served as /abc/abc12345
  //   → hits app/[username]/[shareId]/page.tsx
  url.pathname = `/${subdomain}${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Run on user-facing pages, skip internals and API/static assets
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icons|images|robots.txt|sitemap.xml|.*\\..*).*)"],
};
