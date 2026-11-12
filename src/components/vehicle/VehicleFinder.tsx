"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { useGarage } from "@/lib/garage/store";
import {
  listEngines,
  listMakes,
  listModels,
  listYears,
} from "@/lib/vehicles";

export function VehicleFinder({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const setVehicle = useGarage((s) => s.setVehicle);
  const clearVehicle = useGarage((s) => s.clearVehicle);
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [engine, setEngine] = useState("");

  const makes = useMemo(() => listMakes(), []);
  const models = useMemo(() => (make ? listModels(make) : []), [make]);
  const years = useMemo(
    () => (make && model ? listYears(make, model) : []),
    [make, model],
  );
  const engines = useMemo(
    () => (make && model ? listEngines(make, model) : []),
    [make, model],
  );

  function save() {
    if (!make || !model || !year) return;
    setVehicle({
      year: Number(year),
      make,
      model,
      engine: engine || undefined,
    });
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center">
          <motion.button
            type="button"
            aria-label="Close vehicle finder"
            className="absolute inset-0 bg-black/45"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="vehicle-finder-title"
            className="relative z-10 w-full max-w-lg rounded-t-2xl bg-[var(--surface)] p-5 shadow-2xl sm:rounded-2xl sm:p-6"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2
                  id="vehicle-finder-title"
                  className="font-[family-name:var(--font-display)] text-2xl font-bold uppercase tracking-wide text-[var(--navy)]"
                >
                  Find parts that fit
                </h2>
                <p className="mt-1 text-sm text-[var(--ink-muted)]">
                  Select year, make, and model — we&apos;ll badge compatible parts across the catalog.
                </p>
              </div>
              <button type="button" onClick={onClose} aria-label="Close" className="rounded p-1 hover:bg-[var(--surface-muted)]">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1 block font-medium">Make</span>
                <select
                  value={make}
                  onChange={(e) => {
                    setMake(e.target.value);
                    setModel("");
                    setYear("");
                    setEngine("");
                  }}
                  className="h-11 w-full rounded-md border border-[var(--line)] bg-white px-3"
                >
                  <option value="">Select make</option>
                  {makes.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium">Model</span>
                <select
                  value={model}
                  disabled={!make}
                  onChange={(e) => {
                    setModel(e.target.value);
                    setYear("");
                    setEngine("");
                  }}
                  className="h-11 w-full rounded-md border border-[var(--line)] bg-white px-3 disabled:opacity-50"
                >
                  <option value="">Select model</option>
                  {models.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium">Year</span>
                <select
                  value={year}
                  disabled={!model}
                  onChange={(e) => setYear(e.target.value)}
                  className="h-11 w-full rounded-md border border-[var(--line)] bg-white px-3 disabled:opacity-50"
                >
                  <option value="">Select year</option>
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium">Engine (optional)</span>
                <select
                  value={engine}
                  disabled={!model}
                  onChange={(e) => setEngine(e.target.value)}
                  className="h-11 w-full rounded-md border border-[var(--line)] bg-white px-3 disabled:opacity-50"
                >
                  <option value="">Any</option>
                  {engines.map((eng) => (
                    <option key={eng} value={eng}>
                      {eng}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={save}
                disabled={!make || !model || !year}
                className="h-11 flex-1 rounded-md bg-[var(--field)] font-semibold text-white transition hover:bg-[var(--field-bright)] disabled:opacity-40"
              >
                Save vehicle
              </button>
              <button
                type="button"
                onClick={() => {
                  clearVehicle();
                  setMake("");
                  setModel("");
                  setYear("");
                  setEngine("");
                  onClose();
                }}
                className="h-11 rounded-md border border-[var(--line)] px-4 font-medium"
              >
                Clear
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
