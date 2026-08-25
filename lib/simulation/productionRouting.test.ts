import { describe, expect, it } from "vitest";
import { createProductionRoute } from "@/lib/simulation/productionRouting";

describe("full-cell production routing", () => {
  it("alternates saw lines and assigns all twelve CNCs", () => {
    const routes = Array.from({ length: 12 }, (_, index) => createProductionRoute(index + 1));
    expect(routes.map((route) => route.assignedCnc).sort()).toEqual([
      "CNC-01", "CNC-02", "CNC-03", "CNC-04", "CNC-05", "CNC-06",
      "CNC-07", "CNC-08", "CNC-09", "CNC-10", "CNC-11", "CNC-12",
    ]);
    expect(routes.every((route, index) => route.lineId === (index % 2 === 0 ? "south" : "north"))).toBe(true);
    expect(new Set(routes.map((route) => route.assignedCmm))).toEqual(new Set(["CMM-01", "CMM-02", "CMM-03", "CMM-04", "CMM-05", "CMM-06"]));
  });
});
