import { describe, expect, it } from "vitest";
import { calculateKpis } from "@/lib/simulation/kpiEngine";
import { createInitialMachines } from "@/lib/simulation/machineTypes";
import type { ProductionCounters } from "@/types/factory";

describe("KPI engine", () => {
  it("derives availability, quality, performance, and OEE from counters", () => {
    const machines = createInitialMachines();
    Object.values(machines).forEach((machine) => { machine.scheduledMs = 1000; machine.runningMs = 900; });
    const counters: ProductionCounters = { totalStarted: 102, totalCompleted: 98, totalRejected: 2, totalInspected: 100, totalCycleTime: 98 * 23, completionTimes: [55_000, 59_000] };
    const result = calculateKpis(machines, counters, 60_000);
    expect(result.availability).toBe(90);
    expect(result.performance).toBe(100);
    expect(result.quality).toBe(98);
    expect(result.oee).toBeCloseTo(88.2);
    expect(result.throughput).toBe(120);
    expect(result.scrapRate).toBe(2);
  });

  it("handles empty runtime and production histories safely", () => {
    const machines = createInitialMachines();
    Object.values(machines).forEach((machine) => { machine.scheduledMs = 0; machine.runningMs = 0; });
    const result = calculateKpis(machines, { totalStarted: 0, totalCompleted: 0, totalRejected: 0, totalInspected: 0, totalCycleTime: 0, completionTimes: [] }, 0);
    expect(Number.isFinite(result.oee)).toBe(true);
    expect(result.averageCycleTime).toBe(0);
    expect(result.throughput).toBe(0);
  });
});
