import { beforeEach, describe, expect, it } from "vitest";
import { calculateKpis } from "@/lib/simulation/kpiEngine";
import { createInitialMachines } from "@/lib/simulation/machineTypes";
import { createPart } from "@/lib/simulation/productionEngine";
import { useFactoryStore } from "@/store/useFactoryStore";
import type { ProductionCounters, SimulationSpeed } from "@/types/factory";

const emptyCounters = (): ProductionCounters => ({ totalStarted: 1, totalCompleted: 0, totalRejected: 0, totalInspected: 0, totalCycleTime: 0, completionTimes: [] });

describe("factory store clock and controls", () => {
  beforeEach(() => {
    const machines = createInitialMachines();
    const counters = emptyCounters();
    useFactoryStore.setState({
      machines,
      parts: [createPart(1, 0)],
      counters,
      kpis: calculateKpis(machines, counters, 0),
      events: [],
      activeFaults: {},
      introComplete: true,
      paused: false,
      faultMode: "OFF",
      faultCountdown: Number.POSITIVE_INFINITY,
      simulationNow: 0,
      spawnAccumulator: 0,
      telemetryAccumulator: 0,
      chartAccumulator: 0,
      chartData: [],
      demo: { active: false, step: 0, elapsed: 0, message: "", previousSpeed: null, previousFaultMode: null, partId: null },
    });
  });

  it.each<SimulationSpeed>([0.5, 1, 2, 4])("advances elapsed production time at %sx", (speed) => {
    useFactoryStore.setState({ speed, parts: [createPart(1, 0)], simulationNow: 0 });
    useFactoryStore.getState().tick(1);
    expect(useFactoryStore.getState().parts[0].stationElapsed).toBe(speed * 0.25);
  });

  it("does not advance the clock while paused", () => {
    useFactoryStore.setState({ paused: true });
    useFactoryStore.getState().tick(1);
    expect(useFactoryStore.getState().simulationNow).toBe(0);
  });

  it("replaces the displayed finished part only when the next single blank starts", () => {
    const finished = { ...createPart(1, 0), currentStation: "FINISHED" as const, status: "COMPLETE" as const };
    useFactoryStore.setState({ parts: [finished], serialCounter: 1, spawnAccumulator: 1.9 });
    useFactoryStore.getState().tick(1);
    const parts = useFactoryStore.getState().parts;
    expect(parts).toHaveLength(1);
    expect(parts[0].currentStation).toBe("RAW");
    expect(parts[0].serialNumber).toBe("SN-10002");
  });

  it("restores speed and fault settings when a guided demo is cancelled", () => {
    useFactoryStore.setState({ speed: 2, faultMode: "HIGH" });
    useFactoryStore.getState().startDemo();
    expect(useFactoryStore.getState().faultMode).toBe("OFF");
    useFactoryStore.getState().cancelDemo();
    expect(useFactoryStore.getState().speed).toBe(2);
    expect(useFactoryStore.getState().faultMode).toBe("HIGH");
  });
});
