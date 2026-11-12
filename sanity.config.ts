import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { FleetGoIcon } from "./sanity/FleetGoIcon";
import { schemaTypes } from "./sanity/schemaTypes";
import { fleetGoStudioTheme } from "./sanity/theme";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "placeholder";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export default defineConfig({
  name: "fleetgo",
  title: "FleetGo",
  icon: FleetGoIcon,
  projectId,
  dataset,
  basePath: "/studio",
  theme: fleetGoStudioTheme,
  plugins: [structureTool(), visionTool()],
  schema: { types: schemaTypes },
});
