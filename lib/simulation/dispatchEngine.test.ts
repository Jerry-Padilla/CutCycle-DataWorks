import { describe, expect, it } from "vitest";
import { selectNextDispatch } from "@/lib/simulation/dispatchEngine";
import { createInitialMachines } from "@/lib/simulation/machineTypes";
import { createPart } from "@/lib/simulation/productionEngine";
import { createProductionRoute } from "@/lib/simulation/productionRouting";

describe("independent line dispatch", () => {
  it("skips a stopped CNC and continues dispatching to available machines", () => {
    const machines = createInitialMachines();
    machines["CNC-01"].status = "IDLE";
    const selection = selectNextDispatch(0, [], machines);
    expect(selection).not.toBeNull();
    expect(selection?.route.assignedCnc).not.toBe("CNC-01");
  });

  it("keeps one saturated line from consuming the other line's WIP capacity", () => {
    const machines = createInitialMachines();
    const southParts = Array.from({ length: 10 }, (_, index) => createPart(index + 1, 0, false, "MOUNTING_PLATE", { ...createProductionRoute(index * 2 + 1), lineId: "south" }));
    const selection = selectNextDispatch(20, southParts, machines);
    expect(selection?.route.lineId).toBe("north");
  });
});
