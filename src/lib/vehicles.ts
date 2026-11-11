export type GarageVehicle = {
  year: number;
  make: string;
  model: string;
  engine?: string;
};

export const vehicleCatalog: Record<
  string,
  Record<string, { years: [number, number]; engines: string[] }>
> = {
  Ford: {
    "F-150": { years: [2011, 2024], engines: ["2.7L EcoBoost", "3.5L EcoBoost", "5.0L"] },
    "F-250 Super Duty": { years: [2008, 2024], engines: ["6.7L Power Stroke", "7.3L"] },
  },
  Chevrolet: {
    "Silverado 1500": { years: [2007, 2024], engines: ["5.3L", "6.2L"] },
  },
  GMC: {
    "Sierra 1500": { years: [2007, 2024], engines: ["5.3L", "6.2L"] },
  },
  Ram: {
    "1500": { years: [2011, 2024], engines: ["5.7L HEMI", "3.6L"] },
    "2500": { years: [2011, 2024], engines: ["6.7L Cummins"] },
  },
  Toyota: {
    Tacoma: { years: [2016, 2024], engines: ["3.5L"] },
  },
  Freightliner: {
    Cascadia: { years: [2010, 2025], engines: ["DD13", "DD15", "X15"] },
  },
  Kenworth: {
    T680: { years: [2013, 2025], engines: ["X15", "MX-13"] },
    T660: { years: [2008, 2019], engines: ["ISX"] },
  },
  Peterbilt: {
    "579": { years: [2013, 2025], engines: ["X15", "MX-13"] },
  },
  Volvo: {
    VNL: { years: [2010, 2025], engines: ["D13"] },
  },
  International: {
    LT: { years: [2017, 2025], engines: ["A26", "X15"] },
  },
};

export function listMakes(): string[] {
  return Object.keys(vehicleCatalog).sort();
}

export function listModels(make: string): string[] {
  return Object.keys(vehicleCatalog[make] ?? {}).sort();
}

export function listYears(make: string, model: string): number[] {
  const entry = vehicleCatalog[make]?.[model];
  if (!entry) return [];
  const [from, to] = entry.years;
  const years: number[] = [];
  for (let y = to; y >= from; y--) years.push(y);
  return years;
}

export function listEngines(make: string, model: string): string[] {
  return vehicleCatalog[make]?.[model]?.engines ?? [];
}

export function vehicleLabel(v: GarageVehicle): string {
  return `${v.year} ${v.make} ${v.model}${v.engine ? ` · ${v.engine}` : ""}`;
}

export function productFitsVehicle(
  fitment: { yearFrom: number; yearTo: number; make: string; model: string }[],
  vehicle: GarageVehicle | null,
): boolean {
  if (!vehicle || !fitment?.length) return false;
  return fitment.some(
    (f) =>
      f.make.toLowerCase() === vehicle.make.toLowerCase() &&
      f.model.toLowerCase() === vehicle.model.toLowerCase() &&
      vehicle.year >= f.yearFrom &&
      vehicle.year <= f.yearTo,
  );
}
