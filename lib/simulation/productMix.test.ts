import { describe, expect, it } from "vitest";
import { emptyProductCounts, plannedProfitPerHour, profitPerProductionHour, rebalanceProductTargets, selectNextProductType, unitProfit } from "@/lib/simulation/productMix";

describe("product mix scheduler", () => {
  it("starts with the highest-volume product", () => {
    expect(selectNextProductType(emptyProductCounts())).toBe("MOUNTING_PLATE");
  });

  it("converges on the 50/30/20 production mix", () => {
    const counts = emptyProductCounts();
    for (let index = 0; index < 100; index += 1) counts[selectNextProductType(counts)] += 1;
    expect(counts).toEqual({ MOUNTING_PLATE: 50, IMPELLER: 30, ROCKET_NOZZLE: 20 });
  });

  it("rebalances the other targets to keep the schedule at 100 percent", () => {
    expect(rebalanceProductTargets({ MOUNTING_PLATE: 50, IMPELLER: 30, ROCKET_NOZZLE: 20 }, "ROCKET_NOZZLE", 50))
      .toEqual({ MOUNTING_PLATE: 31, IMPELLER: 19, ROCKET_NOZZLE: 50 });
  });

  it("uses custom targets when choosing the next order", () => {
    expect(selectNextProductType(emptyProductCounts(), { MOUNTING_PLATE: 0, IMPELLER: 0, ROCKET_NOZZLE: 100 })).toBe("ROCKET_NOZZLE");
  });

  it("calculates positive unit and hourly contribution", () => {
    expect(unitProfit("MOUNTING_PLATE")).toBe(240);
    expect(profitPerProductionHour("MOUNTING_PLATE")).toBeCloseTo(26181.82, 1);
    expect(plannedProfitPerHour({ MOUNTING_PLATE: 100, IMPELLER: 0, ROCKET_NOZZLE: 0 })).toBeCloseTo(profitPerProductionHour("MOUNTING_PLATE"));
  });
});
