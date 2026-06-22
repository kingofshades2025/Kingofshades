"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getVehicleMakes, getVehicleModels } from "@/app/actions/vehicles";
import type { VehicleMake } from "@/lib/vehicles/nhtsa";
import { buildYearOptions } from "@/lib/vehicles/nhtsa";
import { Field, Input, Select } from "@/components/ui/Field";

const OTHER = "__other__";
const yearOptions = buildYearOptions();

export function VehicleFields({
  year,
  make,
  model,
  onYearChange,
  onMakeChange,
  onModelChange,
}: {
  year: string;
  make: string;
  model: string;
  onYearChange: (value: string) => void;
  onMakeChange: (value: string) => void;
  onModelChange: (value: string) => void;
}) {
  const [makes, setMakes] = useState<VehicleMake[]>([]);
  const [models, setModels] = useState<{ id: number; name: string }[]>([]);
  const [loadingMakes, setLoadingMakes] = useState(true);
  const [loadingModels, setLoadingModels] = useState(false);
  const [makesError, setMakesError] = useState<string | null>(null);

  const selectedMake = useMemo(
    () => makes.find((m) => m.name === make) ?? null,
    [makes, make],
  );

  const makeIsOther = make === OTHER || (make !== "" && !selectedMake && makes.length > 0);
  const modelIsOther =
    model === OTHER || (model !== "" && !models.some((m) => m.name === model) && models.length > 0);

  const prevYear = useRef(year);
  useEffect(() => {
    if (prevYear.current !== year) {
      onModelChange("");
    }
    prevYear.current = year;
  }, [year, onModelChange]);

  useEffect(() => {
    let cancelled = false;
    setLoadingMakes(true);
    getVehicleMakes().then((result) => {
      if (cancelled) return;
      if (result.success) {
        setMakes(result.makes);
        setMakesError(null);
      } else {
        setMakesError(result.error);
      }
      setLoadingMakes(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedMake || makeIsOther) {
      setModels([]);
      return;
    }

    let cancelled = false;
    setLoadingModels(true);
    const yearNum = year ? Number(year) : undefined;

    getVehicleModels(selectedMake.id, yearNum).then((result) => {
      if (cancelled) return;
      if (result.success) {
        setModels(result.models);
      } else {
        setModels([]);
      }
      setLoadingModels(false);
    });

    return () => {
      cancelled = true;
    };
  }, [selectedMake, year, makeIsOther]);

  function handleMakeSelect(value: string) {
    if (value === OTHER) {
      onMakeChange(OTHER);
      onModelChange("");
      return;
    }
    const match = makes.find((m) => String(m.id) === value);
    if (match) {
      onMakeChange(match.name);
      onModelChange("");
    }
  }

  function handleModelSelect(value: string) {
    if (value === OTHER) {
      onModelChange(OTHER);
      return;
    }
    const match = models.find((m) => m.name === value);
    if (match) onModelChange(match.name);
  }

  const makeSelectValue = makeIsOther
    ? OTHER
    : selectedMake
      ? String(selectedMake.id)
      : "";

  const modelSelectValue = modelIsOther ? OTHER : model;

  return (
    <>
      <Field label="Vehicle year">
        <Select value={year} onChange={(e) => onYearChange(e.target.value)}>
          <option value="" disabled>
            Select year…
          </option>
          {yearOptions.map((y) => (
            <option key={y} value={String(y)}>
              {y}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Vehicle make">
        <Select
          value={makeSelectValue}
          onChange={(e) => handleMakeSelect(e.target.value)}
          disabled={loadingMakes}
        >
          <option value="" disabled>
            {loadingMakes ? "Loading makes…" : "Select make…"}
          </option>
          {makes.map((m) => (
            <option key={m.id} value={String(m.id)}>
              {m.name}
            </option>
          ))}
          <option value={OTHER}>Other (not listed)</option>
        </Select>
        {makesError && <p className="mt-1 text-xs text-red-300">{makesError}</p>}
        {makeIsOther && (
          <Input
            className="mt-2"
            placeholder="Enter vehicle make"
            value={make === OTHER ? "" : make}
            onChange={(e) => onMakeChange(e.target.value)}
          />
        )}
      </Field>

      <Field label="Vehicle model">
        <Select
          value={modelSelectValue}
          onChange={(e) => handleModelSelect(e.target.value)}
          disabled={!make || makeIsOther || loadingModels}
        >
          <option value="" disabled>
            {!make || makeIsOther
              ? "Select make first"
              : loadingModels
                ? "Loading models…"
                : "Select model…"}
          </option>
          {models.map((m) => (
            <option key={`${m.id}-${m.name}`} value={m.name}>
              {m.name}
            </option>
          ))}
          <option value={OTHER}>Other (not listed)</option>
        </Select>
        {modelIsOther && (
          <Input
            className="mt-2"
            placeholder="Enter vehicle model"
            value={model === OTHER ? "" : model}
            onChange={(e) => onModelChange(e.target.value)}
          />
        )}
      </Field>
    </>
  );
}
