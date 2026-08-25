import type { FactoryVector } from "@/lib/factory/layout";

export const RAW_CUT_RELEASE_PROGRESS = 0.28;
export const RAW_STOCK_START: FactoryVector = [-13.15, 1.08, -0.9];
export const CNC_01_PICKUP: FactoryVector = [-9.45, 1.3, -0.9];

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const smoothstep = (value: number) => {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
};
const lerp = (from: number, to: number, progress: number) => from + (to - from) * progress;

export function rawStockPosition(progress: number, pickupX = CNC_01_PICKUP[0], laneZ = CNC_01_PICKUP[2]): FactoryVector {
  const t = clamp01(progress);
  const travel = smoothstep((t - RAW_CUT_RELEASE_PROGRESS) / (1 - RAW_CUT_RELEASE_PROGRESS));
  const rise = smoothstep((t - RAW_CUT_RELEASE_PROGRESS) / 0.16);
  return [
    lerp(RAW_STOCK_START[0], pickupX, travel),
    lerp(RAW_STOCK_START[1], CNC_01_PICKUP[1], rise),
    laneZ,
  ];
}
