"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GarageVehicle } from "@/lib/vehicles";

type GarageState = {
  vehicle: GarageVehicle | null;
  setVehicle: (vehicle: GarageVehicle | null) => void;
  clearVehicle: () => void;
};

export const useGarage = create<GarageState>()(
  persist(
    (set) => ({
      vehicle: null,
      setVehicle: (vehicle) => set({ vehicle }),
      clearVehicle: () => set({ vehicle: null }),
    }),
    { name: "fleetgo-garage" },
  ),
);
