import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { roleDashboards, roleMeta, type Role } from "@/lib/nexora";

export default defineTool({
  name: "get_role_dashboard",
  title: "Get role dashboard",
  description:
    "Get the Nexora demo dashboard for one role: greeting, headline stats, panels and quick actions.",
  inputSchema: {
    role: z
      .enum(["doctor", "patient", "admin"])
      .describe("Which Nexora role dashboard to read."),
  },
  outputSchema: {
    role: z.string(),
    meta: z.record(z.string(), z.unknown()),
    dashboard: z.record(z.string(), z.unknown()),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ role }) => {
    const key = role as Role;
    const dashboard = roleDashboards[key];
    if (!dashboard) throw new ToolError(`Unknown role: ${role}`);

    const payload = { role: key, meta: roleMeta[key], dashboard };
    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  },
});
