import { buildTheme } from "@sanity/themer";

/** FleetGo storefront palette (from src/app/globals.css) */
const navy = "#0b1f3a";
const navyDeep = "#061526";
const field = "#002868";
const fieldBright = "#1e4d9c";
const surface = "#ffffff";
const inkMuted = "#5b6675";
const line = "#dde3ea";

/**
 * Studio theme aligned with the ecommerce site:
 * navy / field blue accents, muted industrial neutrals, deep navy dark mode.
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
  signal: "#bf0a30",
  surface,
} as const;
