import { describe, expect, it } from "vitest";
import { createInitialMachines } from "@/lib/simulation/machineTypes";
import { advanceProduction, createPart } from "@/lib/simulation/productionEngine";
import type { ProductionCounters } from "@/types/factory";

const counters = (): ProductionCounters => ({
  totalStarted: 1,
  totalCompleted: 0,
  totalRejected: 0,
  totalInspected: 0,
  totalCycleTime: 0,
  completionTimes: [],
  productCounts: { MOUNTING_PLATE: 0, IMPELLER: 0, ROCKET_NOZZLE: 0 },
});

describe("production engine", () => {
  it("stops one saw-cut blank at CNC-01 before the operator loads it", () => {
    const almostThere = advanceProduction({ parts: [createPart(1, 0)], machines: createInitialMachines(), counters: counters(), deltaSeconds: 3.9, now: 3_900 });
    expect(almostThere.parts[0].currentStation).toBe("RAW");
    expect(almostThere.parts[0].progress).toBeCloseTo(97.5);

    const arrived = advanceProduction({ parts: almostThere.parts, machines: almostThere.machines, counters: counters(), deltaSeconds: 0.1, now: 4_000 });
    expect(arrived.parts[0].currentStation).toBe("CNC-01");
    expect(arrived.events[0].message).toContain("saw-cut blank stopped at CNC-01 pickup");
  });

  it("returns a completed CNC-01 part to its front conveyor", () => {
    const part = { ...createPart(1, 0), currentStation: "CNC-01" as const, status: "MACHINING" as const };
    const result = advanceProduction({ parts: [part], machines: createInitialMachines(), counters: counters(), deltaSeconds: 18, now: 18_000, random: () => 0.5 });
    expect(result.parts[0].currentStation).toBe("CONVEYOR");
    expect(result.parts[0].status).toBe("MOVING");
    expect(result.machines["CNC-01"].partsProduced).toBe(323);
    expect(result.events.some((item) => item.message.includes("completed CNC-01"))).toBe(true);
    expect(result.events.some((item) => item.message.includes("returned part to its outbound conveyor"))).toBe(true);
  });

  it("holds work when its assigned machine is unavailable", () => {
    const machines = createInitialMachines();
    machines["CNC-01"] = { ...machines["CNC-01"], status: "IDLE" };
    const part = { ...createPart(2, 0), currentStation: "CNC-01" as const, status: "MACHINING" as const, stationElapsed: 7.9, progress: 98 };
    const result = advanceProduction({ parts: [part], machines, counters: counters(), deltaSeconds: 1, now: 1_000 });
    expect(result.parts[0].currentStation).toBe("CNC-01");
    expect(result.parts[0].progress).toBe(98);
  });

  it("returns front-unloaded work to the shared conveyor before robot-to-CMM placement", () => {
    const machines = createInitialMachines();
    const cncPart = { ...createPart(5, 0), currentStation: "CNC-02" as const, status: "MACHINING" as const, stationElapsed: 17.9, progress: 99 };
    const conveyorStep = advanceProduction({ parts: [cncPart], machines, counters: counters(), deltaSeconds: 0.2, now: 200 });
    expect(conveyorStep.parts[0].currentStation).toBe("CONVEYOR");
    expect(conveyorStep.events[0].message).toContain("returned part to its outbound conveyor");

    const conveyorPart = { ...conveyorStep.parts[0], stationElapsed: 2.9, progress: 98 };
    const robotStep = advanceProduction({ parts: [conveyorPart], machines, counters: counters(), deltaSeconds: 0.2, now: 400 });
    expect(robotStep.parts[0].currentStation).toBe("ROBOT-01");
    expect(robotStep.events[0].message).toContain("merged inspection conveyor delivered part");

    const robotPart = { ...robotStep.parts[0], stationElapsed: 2.9, progress: 98 };
    const cmmStep = advanceProduction({ parts: [robotPart], machines, counters: counters(), deltaSeconds: 0.2, now: 600 });
    expect(cmmStep.parts[0].currentStation).toBe("CMM-01");
    expect(cmmStep.events[0].message).toContain("placed part directly on CMM-01");
  });

  it("routes an out-of-tolerance inspection to the reject bin", () => {
    const part = { ...createPart(3, 0), currentStation: "CMM-01" as const, status: "INSPECTION" as const, stationElapsed: 4.9, progress: 98 };
    const values = [0, 0.5];
    const result = advanceProduction({ parts: [part], machines: createInitialMachines(), counters: counters(), deltaSeconds: 1, now: 1_000, random: () => values.shift() ?? 0.5 });
    expect(result.parts[0].status).toBe("REJECTED");
    expect(result.parts[0].currentStation).toBe("REJECT");
    expect(result.counters.totalRejected).toBe(1);
    expect(result.counters.totalCompleted).toBe(0);
    expect(result.counters.productCounts).toEqual({ MOUNTING_PLATE: 0, IMPELLER: 0, ROCKET_NOZZLE: 0 });
  });

  it("guarantees the guided demo part passes inspection", () => {
    const part = { ...createPart(4, 0, true, "ROCKET_NOZZLE"), currentStation: "CMM-01" as const, status: "INSPECTION" as const, stationElapsed: 5 };
    const result = advanceProduction({ parts: [part], machines: createInitialMachines(), counters: counters(), deltaSeconds: 0.1, now: 100 });
    expect(result.parts[0].status).toBe("COMPLETE");
    expect(result.parts[0].qualityScore).toBe(97);
    expect(result.counters.productCounts.ROCKET_NOZZLE).toBe(1);
    expect(result.events[0].message).toContain("Rocket engine nozzle");
  });
});
