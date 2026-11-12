import { buildTheme } from "@sanity/themer";

/** FleetGo storefront palette (from src/app/globals.css) — Apollo trunks locks */
const navy = "#0b1f3a";
const navyDeep = "#061526";
const field = "#1b54d4";
const fieldBright = "#4b7ef0";
const surface = "#ffffff";
const inkMuted = "#5b6675";
const line = "#dde3ea";

/**
 * Studio theme aligned with the ecommerce site:
 * navy chrome, Apollo field blue accents, trunk scarlet signal.
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
