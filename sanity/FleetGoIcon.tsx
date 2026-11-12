import { fleetGoBrand } from "./theme";

/** Workspace icon — FleetGo wordmark mark (navy + signal) */
export function FleetGoIcon() {
  return (
    <svg viewBox="0 0 32 32" width="1em" height="1em" aria-hidden focusable="false">
      <rect width="32" height="32" rx="6" fill={fleetGoBrand.navy} />
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
      <rect x="0" y="29" width="11" height="3" fill={fleetGoBrand.signal} />
      <rect x="11" y="29" width="10" height="3" fill={fleetGoBrand.surface} />
      <rect x="21" y="29" width="11" height="3" fill={fleetGoBrand.field} />
    </svg>
  );
}
