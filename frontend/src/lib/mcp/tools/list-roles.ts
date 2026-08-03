import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { roleMeta } from "@/lib/nexora";

export default defineTool({
  name: "list_roles",
  title: "List roles",
  description:
    "List the access roles available in Nexora (doctor, patient, admin) with their taglines and focus areas.",
  inputSchema: {},
  outputSchema: { roles: z.array(z.object({ id: z.string(), label: z.string(), tagline: z.string(), blurb: z.string(), accent: z.string() })) },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const roles = Object.entries(roleMeta).map(([id, meta]) => ({
      id,
      label: meta.label,
      tagline: meta.tagline,
      blurb: meta.blurb,
      accent: meta.accent,
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(roles, null, 2) }],
      structuredContent: { roles },
    };
  },
});
