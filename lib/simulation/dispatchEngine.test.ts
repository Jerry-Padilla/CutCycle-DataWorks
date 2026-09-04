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

  it("allows one billet to wait at a busy CNC conveyor pickup", () => {
    const machines = createInitialMachines();
    const machining = { ...createPart(1, 0, false, "MOUNTING_PLATE", createProductionRoute(1)), currentStation: "CNC-01" as const, status: "MACHINING" as const };
    const selection = selectNextDispatch(12, [machining], machines);
    expect(selection?.route.assignedCnc).toBe("CNC-01");
  });

  it("does not stack more than one waiting billet at a CNC pickup", () => {
    const machines = createInitialMachines();
    const route = createProductionRoute(1);
    const machining = { ...createPart(1, 0, false, "MOUNTING_PLATE", route), currentStation: "CNC-01" as const, status: "MACHINING" as const };
    const waiting = { ...createPart(13, 1, false, "IMPELLER", route), progress: 100 };
    expect(selectNextDispatch(24, [machining, waiting], machines)?.route.assignedCnc).not.toBe("CNC-01");
  });
});
