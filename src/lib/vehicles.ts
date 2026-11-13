export type GarageVehicle = {
  year: number;
  make: string;
  model: string;
  engine?: string;
};

export type VehicleCatalogEntry = {
  /** Discrete years that have at least one fitting part */
  years: number[];
  engines: string[];
};

export type VehicleCatalog = Record<string, Record<string, VehicleCatalogEntry>>;

export type FitmentRowLike = {
  yearFrom?: number | null;
  yearTo?: number | null;
  make?: string | null;
  model?: string | null;
  engine?: string | null;
};

/** @deprecated Prefer buildVehicleCatalogFromFitment — kept for tests/legacy imports */
export const vehicleCatalog: VehicleCatalog = {};

export function buildVehicleCatalogFromFitment(
  rows: FitmentRowLike[],
): VehicleCatalog {
  const yearSets = new Map<string, Map<string, Set<number>>>();
  const engineSets = new Map<string, Map<string, Set<string>>>();

  for (const row of rows) {
    const make = row.make?.trim();
    const model = row.model?.trim();
    const yearFrom = row.yearFrom;
    const yearTo = row.yearTo;
    if (!make || !model) continue;
    if (make.toLowerCase() === "universal") continue;
    if (
      typeof yearFrom !== "number" ||
      typeof yearTo !== "number" ||
      !Number.isFinite(yearFrom) ||
      !Number.isFinite(yearTo)
    ) {
      continue;
    }
    const from = Math.min(yearFrom, yearTo);
    const to = Math.max(yearFrom, yearTo);

    if (!yearSets.has(make)) yearSets.set(make, new Map());
    if (!engineSets.has(make)) engineSets.set(make, new Map());
    const models = yearSets.get(make)!;
    const enginesByModel = engineSets.get(make)!;
    if (!models.has(model)) models.set(model, new Set());
    if (!enginesByModel.has(model)) enginesByModel.set(model, new Set());

    const years = models.get(model)!;
    for (let y = from; y <= to; y++) years.add(y);

    const engine = row.engine?.trim();
    if (engine) enginesByModel.get(model)!.add(engine);
  }

  const catalog: VehicleCatalog = {};
  for (const make of [...yearSets.keys()].sort((a, b) =>
    a.localeCompare(b),
  )) {
    catalog[make] = {};
    const models = yearSets.get(make)!;
    for (const model of [...models.keys()].sort((a, b) =>
      a.localeCompare(b),
    )) {
      const years = [...models.get(model)!].sort((a, b) => b - a);
      const engines = [...(engineSets.get(make)?.get(model) ?? [])].sort((a, b) =>
        a.localeCompare(b),
      );
      catalog[make][model] = { years, engines };
    }
  }
  return catalog;
}

export function listMakes(catalog: VehicleCatalog = vehicleCatalog): string[] {
  return Object.keys(catalog).sort((a, b) => a.localeCompare(b));
}

export function listModels(
  make: string,
  catalog: VehicleCatalog = vehicleCatalog,
): string[] {
  return Object.keys(catalog[make] ?? {}).sort((a, b) => a.localeCompare(b));
}

export function listYears(
  make: string,
  model: string,
  catalog: VehicleCatalog = vehicleCatalog,
): number[] {
  return catalog[make]?.[model]?.years ?? [];
}

export function listEngines(
  make: string,
  model: string,
  catalog: VehicleCatalog = vehicleCatalog,
): string[] {
  return catalog[make]?.[model]?.engines ?? [];
}

export function vehicleInCatalog(
  vehicle: GarageVehicle,
  catalog: VehicleCatalog,
): boolean {
  const years = catalog[vehicle.make]?.[vehicle.model]?.years;
  if (!years?.includes(vehicle.year)) return false;
  if (!vehicle.engine) return true;
  const engines = catalog[vehicle.make]?.[vehicle.model]?.engines ?? [];
  return engines.length === 0 || engines.includes(vehicle.engine);
}

export function vehicleLabel(v: GarageVehicle): string {
  return `${v.year} ${v.make} ${v.model}${v.engine ? ` · ${v.engine}` : ""}`;
}

export function productFitsVehicle(
  fitment: {
    yearFrom: number;
    yearTo: number;
    make: string;
    model: string;
    engine?: string;
  }[],
  vehicle: GarageVehicle | null,
): boolean {
  if (!vehicle || !fitment?.length) return false;
  return fitment.some((f) => {
    const make = f.make?.toLowerCase() ?? "";
    if (make === "universal") {
      if (
        typeof f.yearFrom === "number" &&
        typeof f.yearTo === "number" &&
        (vehicle.year < f.yearFrom || vehicle.year > f.yearTo)
      ) {
        return false;
      }
      return true;
    }
    if (make !== vehicle.make.toLowerCase()) return false;
    if ((f.model?.toLowerCase() ?? "") !== vehicle.model.toLowerCase()) {
      return false;
    }
    if (vehicle.year < f.yearFrom || vehicle.year > f.yearTo) return false;
    if (f.engine?.trim() && vehicle.engine?.trim()) {
      return f.engine.trim().toLowerCase() === vehicle.engine.trim().toLowerCase();
    }
    return true;
  });
}
