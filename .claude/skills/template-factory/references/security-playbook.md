# Security Playbook (Stage 6)

Review the template's frontend + backend. Output `05-security.md` as a findings table
(severity, file:line, issue, fix) with every High/Critical **fixed**.

## Frontend
- **XSS:** audit every `dangerouslySetInnerHTML`. User-supplied text (names, messages,
  wishes) must never be injected as raw HTML. Render as text, or sanitize. Watch
  markdown/rich-text renderers — configure them to disallow raw HTML/scripts.
- **Links/redirects:** user-provided URLs (social, media) must be validated
  (`https?:` only) and use `rel="noopener noreferrer"` for `target="_blank"`.
- **Media:** only load images from allow-listed hosts (already in `next.config.ts`).
  Don't render arbitrary user URLs as `<img>`/`<video>` without validation.
- **Secrets:** nothing sensitive in client code; only `NEXT_PUBLIC_*` is public.
  Grep the template for keys/tokens.

## Backend (new API routes)
- **AuthZ:** who can create/read/edit a personalized page? Enforce it server-side —
  don't trust the client. A share link should be **unguessable** (random id), not a
  sequential/enumerable id.
- **Input validation:** validate + size-limit every field with zod before use/storage.
- **SSRF:** if the server fetches a user-supplied media URL, restrict scheme/host and
  block internal addresses.
- **Injection:** parameterized queries / safe ORM calls; never build queries from
  raw user input.
- **Rate limiting / abuse:** creation and upload endpoints should be rate-limited.
- **Uploads:** validate content-type + size; store via the existing S3 flow with
  least-privilege; never trust the client-provided filename/type alone.

## Headers / platform
- Confirm the app's security headers (`next.config.ts`: X-Frame-Options, nosniff,
  Referrer-Policy, Permissions-Policy, HSTS) still apply to the new route; add CSP
  considerations if the template loads new third-party origins.

## Dependencies
- If the template adds packages, check them for known advisories and pin versions.

## Definition of done
Findings table with severity + file:line + fix; all High/Critical resolved in code;
explicit confirmations: "no secrets client-side", "user text escaped", "share ids
unguessable", "new endpoints authorized + validated".
