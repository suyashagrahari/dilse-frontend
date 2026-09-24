// ARD v0.91 moved the manifest from /.well-known/ai-catalog.json to this path.
// Lighthouse 13.5 still reads the old one; spec-following agents read this one.
// Same document at both — see lib/agentCatalog.ts.
export { GET } from "../ai-catalog.json/route";

export const dynamic = "force-static";
