import { fleetGoBrand } from "./theme";

/** Workspace icon — FleetGo mark (Apollo blue + scarlet) */
export function FleetGoIcon() {
  return (
    <svg viewBox="0 0 32 32" width="1em" height="1em" aria-hidden focusable="false">
      <rect width="32" height="32" rx="6" fill={fleetGoBrand.field} />
      <text
        x="16"
        y="21"
        textAnchor="middle"
        fill={fleetGoBrand.surface}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontSize="13"
        fontWeight="700"
        letterSpacing="0.04em"
      >
        F
        <tspan fill={fleetGoBrand.signal}>G</tspan>
      </text>
    </svg>
  );
}
