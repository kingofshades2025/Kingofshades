const VPIC_BASE = "https://vpic.nhtsa.dot.gov/api/vehicles";

export type VehicleMake = {
  id: number;
  name: string;
};

export type VehicleModel = {
  id: number;
  name: string;
};

type NhtsaMakeRow = {
  MakeId: number;
  MakeName: string;
};

type NhtsaModelRow = {
  Model_ID: number;
  Model_Name: string;
};

/** Title-case NHTSA labels (e.g. MERCEDES-BENZ → Mercedes-Benz). */
export function formatVehicleLabel(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/(^|[\s-])(\w)/g, (_, sep, ch) => `${sep}${ch.toUpperCase()}`);
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error(`NHTSA request failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export async function fetchVehicleMakes(): Promise<VehicleMake[]> {
  const types = ["car", "truck"];
  const responses = await Promise.all(
    types.map((type) =>
      fetchJson<{ Results: NhtsaMakeRow[] }>(
        `${VPIC_BASE}/GetMakesForVehicleType/${type}?format=json`,
      ),
    ),
  );

  const byId = new Map<number, VehicleMake>();
  for (const { Results } of responses) {
    for (const row of Results ?? []) {
      byId.set(row.MakeId, {
        id: row.MakeId,
        name: formatVehicleLabel(row.MakeName),
      });
    }
  }

  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export async function fetchVehicleModels(
  makeId: number,
  year?: number,
): Promise<VehicleModel[]> {
  const yearNum = year && year >= 1995 ? year : undefined;
  const url = yearNum
    ? `${VPIC_BASE}/GetModelsForMakeIdYear/makeId/${makeId}/modelyear/${yearNum}?format=json`
    : `${VPIC_BASE}/GetModelsForMakeId/${makeId}?format=json`;

  const data = await fetchJson<{ Results: NhtsaModelRow[] }>(url);
  const seen = new Set<string>();
  const models: VehicleModel[] = [];

  for (const row of data.Results ?? []) {
    const name = formatVehicleLabel(row.Model_Name);
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    models.push({ id: row.Model_ID, name });
  }

  return models.sort((a, b) => a.name.localeCompare(b.name));
}

export function buildYearOptions(start = 1995): number[] {
  const current = new Date().getFullYear() + 1;
  const years: number[] = [];
  for (let y = current; y >= start; y--) years.push(y);
  return years;
}
