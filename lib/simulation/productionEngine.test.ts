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
});

describe("production engine", () => {
  it("advances a raw part through CNC-01 after the nominal cycle", () => {
    const result = advanceProduction({ parts: [createPart(1, 0)], machines: createInitialMachines(), counters: counters(), deltaSeconds: 8, now: 8_000, random: () => 0.5 });
    expect(result.parts[0].currentStation).toBe("CNC-02");
    expect(result.parts[0].status).toBe("MACHINING");
    expect(result.machines["CNC-01"].partsProduced).toBe(323);
    expect(result.events.some((item) => item.message.includes("completed CNC-01"))).toBe(true);
    expect(result.events.some((item) => item.message.includes("operator-loaded into CNC-02 from front"))).toBe(true);
  });

  it("holds finished work when the downstream station is unavailable", () => {
    const machines = createInitialMachines();
    machines["CNC-02"] = { ...machines["CNC-02"], status: "IDLE" };
    const part = { ...createPart(2, 0), currentStation: "CNC-01" as const, status: "MACHINING" as const, stationElapsed: 7.9, progress: 98 };
    const result = advanceProduction({ parts: [part], machines, counters: counters(), deltaSeconds: 1, now: 1_000 });
    expect(result.parts[0].currentStation).toBe("CNC-01");
    expect(result.parts[0].progress).toBe(100);
  });

  it("returns front-unloaded work to the shared conveyor before robot-to-CMM placement", () => {
    const machines = createInitialMachines();
    const cncPart = { ...createPart(5, 0), currentStation: "CNC-02" as const, status: "MACHINING" as const, stationElapsed: 6.9, progress: 98 };
    const conveyorStep = advanceProduction({ parts: [cncPart], machines, counters: counters(), deltaSeconds: 0.2, now: 200 });
    expect(conveyorStep.parts[0].currentStation).toBe("CONVEYOR");
    expect(conveyorStep.events[0].message).toContain("returned part to shared front conveyor");

    const conveyorPart = { ...conveyorStep.parts[0], stationElapsed: 2.9, progress: 98 };
    const robotStep = advanceProduction({ parts: [conveyorPart], machines, counters: counters(), deltaSeconds: 0.2, now: 400 });
    expect(robotStep.parts[0].currentStation).toBe("ROBOT-01");
    expect(robotStep.events[0].message).toContain("shared front conveyor delivered part");

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
  });

  it("guarantees the guided demo part passes inspection", () => {
    const part = { ...createPart(4, 0, true), currentStation: "CMM-01" as const, status: "INSPECTION" as const, stationElapsed: 5 };
    const result = advanceProduction({ parts: [part], machines: createInitialMachines(), counters: counters(), deltaSeconds: 0.1, now: 100 });
    expect(result.parts[0].status).toBe("COMPLETE");
    expect(result.parts[0].qualityScore).toBe(97);
  });
});
