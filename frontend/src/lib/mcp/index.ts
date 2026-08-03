import { defineMcp } from "@lovable.dev/mcp-js";
import listRolesTool from "./tools/list-roles";
import getRoleDashboardTool from "./tools/get-role-dashboard";

export default defineMcp({
  name: "nexora-health-suite",
  title: "Nexora Health Suite",
  version: "0.1.0",
  instructions:
    "Tools for Nexora — Your Healthcare Intelligence. Use `list_roles` to see the available access roles (doctor, patient, admin), and `get_role_dashboard` to read the demo dashboard content for one role. All data is the app's built-in demo content; there are no patient records.",
  tools: [listRolesTool, getRoleDashboardTool],
});
