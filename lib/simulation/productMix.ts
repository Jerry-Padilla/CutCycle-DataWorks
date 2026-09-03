import type { ProductType } from "@/types/factory";

export interface ProductDefinition {
  id: ProductType;
  label: string;
  shortLabel: string;
  targetShare: number;
  color: string;
  salePrice: number;
  materialCost: number;
  variableCost: number;
  cncCycleSeconds: number;
}

export const PRODUCT_DEFINITIONS: readonly ProductDefinition[] = [
  { id: "MOUNTING_PLATE", label: "Machined mounting plate", shortLabel: "Plate", targetShare: 0.5, color: "#5eb7e8", salePrice: 420, materialCost: 105, variableCost: 75, cncCycleSeconds: 18 },
  { id: "IMPELLER", label: "Six-vane impeller", shortLabel: "Impeller", targetShare: 0.3, color: "#55d995", salePrice: 760, materialCost: 170, variableCost: 145, cncCycleSeconds: 28 },
  { id: "ROCKET_NOZZLE", label: "Rocket engine nozzle", shortLabel: "Nozzle", targetShare: 0.2, color: "#d99a55", salePrice: 1120, materialCost: 260, variableCost: 235, cncCycleSeconds: 36 },
];

export type ProductTargets = Record<ProductType, number>;
export const DEFAULT_PRODUCT_TARGETS: ProductTargets = { MOUNTING_PLATE: 50, IMPELLER: 30, ROCKET_NOZZLE: 20 };

export function emptyProductCounts(): Record<ProductType, number> {
  return { MOUNTING_PLATE: 0, IMPELLER: 0, ROCKET_NOZZLE: 0 };
}

export function productLabel(productType: ProductType): string {
  return PRODUCT_DEFINITIONS.find((product) => product.id === productType)?.label ?? productType;
}

export function productDefinition(productType: ProductType): ProductDefinition {
  return PRODUCT_DEFINITIONS.find((product) => product.id === productType) ?? PRODUCT_DEFINITIONS[0];
}

export function unitProfit(productType: ProductType): number {
  const product = productDefinition(productType);
  return product.salePrice - product.materialCost - product.variableCost;
}

export function profitPerProductionHour(productType: ProductType): number {
  const product = productDefinition(productType);
  const endToEndSeconds = product.cncCycleSeconds + 15;
  return unitProfit(productType) * 3600 / endToEndSeconds;
}

export function plannedProfitPerHour(targets: ProductTargets): number {
  const totals = PRODUCT_DEFINITIONS.reduce((result, product) => {
    const quantity = targets[product.id];
    return {
      profit: result.profit + quantity * unitProfit(product.id),
      seconds: result.seconds + quantity * (product.cncCycleSeconds + 15),
    };
  }, { profit: 0, seconds: 0 });
  return totals.seconds > 0 ? totals.profit * 3600 / totals.seconds : 0;
}

export function rebalanceProductTargets(current: ProductTargets, changed: ProductType, requested: number): ProductTargets {
  const value = Math.max(0, Math.min(100, Math.round(requested)));
  const others = PRODUCT_DEFINITIONS.map((product) => product.id).filter((id) => id !== changed);
  const remaining = 100 - value;
  const previousOtherTotal = others.reduce((sum, id) => sum + current[id], 0);
  const first = previousOtherTotal > 0 ? Math.round(remaining * current[others[0]] / previousOtherTotal) : Math.round(remaining / 2);
  return { ...current, [changed]: value, [others[0]]: first, [others[1]]: remaining - first };
}

/** Chooses the product furthest below its target share after the next completion. */
export function selectNextProductType(counts: Record<ProductType, number>, targets: ProductTargets = DEFAULT_PRODUCT_TARGETS): ProductType {
  const nextTotal = Object.values(counts).reduce((sum, count) => sum + count, 0) + 1;
  return PRODUCT_DEFINITIONS.reduce((best, product) => {
    const deficit = nextTotal * targets[product.id] / 100 - counts[product.id];
    const bestDeficit = nextTotal * targets[best.id] / 100 - counts[best.id];
    return deficit > bestDeficit ? product : best;
  }).id;
}
