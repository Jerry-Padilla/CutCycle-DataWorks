import { describe, expect, it } from "vitest";
import { emptyProductCounts, selectNextProductType } from "@/lib/simulation/productMix";

describe("product mix scheduler", () => {
  it("starts with the highest-volume product", () => {
    expect(selectNextProductType(emptyProductCounts())).toBe("MOUNTING_PLATE");
  });

  it("converges on the 50/30/20 production mix", () => {
    const counts = emptyProductCounts();
    for (let index = 0; index < 100; index += 1) counts[selectNextProductType(counts)] += 1;
    expect(counts).toEqual({ MOUNTING_PLATE: 50, IMPELLER: 30, ROCKET_NOZZLE: 20 });
  });
});
