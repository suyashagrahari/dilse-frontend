import { buildAgentSkill } from "@/lib/agentCatalog";

// The agent skill the ARD manifest (/.well-known/ai-catalog.json) points at.
// Generated from TEMPLATE_SEO, like /llms.txt, so the template list never drifts.
export const dynamic = "force-static";

export function GET() {
  return new Response(buildAgentSkill(), {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
      "access-control-allow-origin": "*",
    },
  });
}
