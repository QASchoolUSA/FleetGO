import { buildTheme } from "@sanity/themer";

/** FleetGo storefront palette (from src/app/globals.css) — white / Apollo blue / scarlet */
const navy = "#1342a8";
const navyDeep = "#0e2f7a";
const field = "#1b54d4";
const fieldBright = "#4b7ef0";
const surface = "#ffffff";
const inkMuted = "#5b6675";
const line = "#dde3ea";

/**
 * Studio theme aligned with the ecommerce site:
 * Apollo field blue accents, trunk scarlet signal.
 */
export const fleetGoStudioTheme = buildTheme({
  light: {
    accent: field,
    text: inkMuted,
    background: surface,
    contrast: 90,
  },
  dark: {
    accent: fieldBright,
    text: line,
    background: navyDeep,
    contrast: 90,
  },
});

export const fleetGoBrand = {
  navy,
  navyDeep,
  field,
  fieldBright,
  signal: "#d8212a",
  surface,
} as const;
