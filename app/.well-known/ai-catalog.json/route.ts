import { buildAgentCatalog } from "@/lib/agentCatalog";

// Agentic Resource Discovery manifest — see lib/agentCatalog.ts for why this
// exists and the schema rules it must keep to.
export const dynamic = "force-static";

export function GET() {
  return Response.json(buildAgentCatalog(), {
    headers: {
      "cache-control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
      "access-control-allow-origin": "*",
    },
  });
}
