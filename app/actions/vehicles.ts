"use server";

import { unstable_cache } from "next/cache";
import { fetchVehicleMakes, fetchVehicleModels } from "@/lib/vehicles/nhtsa";

const getMakesCached = unstable_cache(fetchVehicleMakes, ["vehicle-makes-top30"], {
  revalidate: 86400,
});

export async function getVehicleMakes() {
  try {
    const makes = await getMakesCached();
    return { success: true as const, makes };
  } catch (err) {
    console.error("[getVehicleMakes]", err);
    return { success: false as const, error: "Could not load vehicle makes." };
  }
}

export async function getVehicleModels(makeId: number, year?: number) {
  if (!makeId) {
    return { success: false as const, error: "Select a make first." };
  }

  const cacheKey = `vehicle-models-${makeId}-${year ?? "all"}`;
  const getCached = unstable_cache(
    () => fetchVehicleModels(makeId, year),
    [cacheKey],
    { revalidate: 86400 },
  );

  try {
    const models = await getCached();
    return { success: true as const, models };
  } catch (err) {
    console.error("[getVehicleModels]", err);
    return { success: false as const, error: "Could not load models for this make." };
  }
}
