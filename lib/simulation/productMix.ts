import type { ProductType } from "@/types/factory";

export interface ProductDefinition {
  id: ProductType;
  label: string;
  shortLabel: string;
  targetShare: number;
  color: string;
}

export const PRODUCT_DEFINITIONS: readonly ProductDefinition[] = [
  { id: "MOUNTING_PLATE", label: "Machined mounting plate", shortLabel: "Plate", targetShare: 0.5, color: "#5eb7e8" },
  { id: "IMPELLER", label: "Six-vane impeller", shortLabel: "Impeller", targetShare: 0.3, color: "#55d995" },
  { id: "ROCKET_NOZZLE", label: "Rocket engine nozzle", shortLabel: "Nozzle", targetShare: 0.2, color: "#d99a55" },
];

export function emptyProductCounts(): Record<ProductType, number> {
  return { MOUNTING_PLATE: 0, IMPELLER: 0, ROCKET_NOZZLE: 0 };
}

export function productLabel(productType: ProductType): string {
  return PRODUCT_DEFINITIONS.find((product) => product.id === productType)?.label ?? productType;
}

/** Chooses the product furthest below its target share after the next completion. */
export function selectNextProductType(counts: Record<ProductType, number>): ProductType {
  const nextTotal = Object.values(counts).reduce((sum, count) => sum + count, 0) + 1;
  return PRODUCT_DEFINITIONS.reduce((best, product) => {
    const deficit = nextTotal * product.targetShare - counts[product.id];
    const bestDeficit = nextTotal * best.targetShare - counts[best.id];
    return deficit > bestDeficit ? product : best;
  }).id;
}
