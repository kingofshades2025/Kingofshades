/** Top 30 US vehicle makes by sales/popularity (2000–present), alphabetical. */
export const TOP_VEHICLE_MAKES = [
  "Acura",
  "Audi",
  "BMW",
  "Buick",
  "Cadillac",
  "Chevrolet",
  "Dodge",
  "Ford",
  "GMC",
  "Honda",
  "Hyundai",
  "Infiniti",
  "Jaguar",
  "Jeep",
  "Kia",
  "Land Rover",
  "Lexus",
  "Lincoln",
  "Mazda",
  "Mercedes-Benz",
  "Mini",
  "Mitsubishi",
  "Nissan",
  "Porsche",
  "Ram",
  "Subaru",
  "Tesla",
  "Toyota",
  "Volkswagen",
  "Volvo",
] as const;

const TOP_MAKE_SET = new Set(
  TOP_VEHICLE_MAKES.map((name) => name.toLowerCase()),
);

export function isTopVehicleMake(name: string): boolean {
  return TOP_MAKE_SET.has(name.toLowerCase());
}
