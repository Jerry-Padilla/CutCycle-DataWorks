import { beforeEach, describe, expect, it } from "vitest";
import { calculateKpis } from "@/lib/simulation/kpiEngine";
import { createInitialMachines } from "@/lib/simulation/machineTypes";
import { createPart } from "@/lib/simulation/productionEngine";
import { useFactoryStore } from "@/store/useFactoryStore";
import type { ProductionCounters, SimulationSpeed } from "@/types/factory";

const emptyCounters = (): ProductionCounters => ({ totalStarted: 1, totalCompleted: 0, totalRejected: 0, totalInspected: 0, totalCycleTime: 0, completionTimes: [], productCounts: { MOUNTING_PLATE: 0, IMPELLER: 0, ROCKET_NOZZLE: 0 } });

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
      autoTechnicianEnabled: true,
      faultCountdown: Number.POSITIVE_INFINITY,
      simulationNow: 0,
      serialCounter: 1,
      spawnAccumulator: 0,
      telemetryAccumulator: 0,
      chartAccumulator: 0,
      chartData: [],
      demo: { active: false, step: 0, elapsed: 0, message: "", previousSpeed: null, previousFaultMode: null, partId: null },
      productTargets: { MOUNTING_PLATE: 50, IMPELLER: 30, ROCKET_NOZZLE: 20 },
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

  it("reloads the saw while another real part is still machining", () => {
    const finished = { ...createPart(1, 0), currentStation: "FINISHED" as const, status: "COMPLETE" as const };
    const machining = { ...createPart(2, 0), currentStation: "CNC-01" as const, status: "MACHINING" as const };
    useFactoryStore.setState({ parts: [finished, machining], serialCounter: 2, spawnAccumulator: 0.4 });
    useFactoryStore.getState().tick(1);
    const parts = useFactoryStore.getState().parts;
    expect(parts).toHaveLength(3);
    expect(parts.some((part) => part.currentStation === "RAW" && part.serialNumber === "SN-10003")).toBe(true);
    expect(useFactoryStore.getState().counters.totalStarted).toBe(2);
  });

  it("fills both production lines with concurrent CNC work", () => {
    for (let index = 0; index < 53; index += 1) useFactoryStore.getState().tick(0.25);
    const activeStations = useFactoryStore.getState().parts
      .filter((part) => part.status !== "COMPLETE" && part.status !== "REJECTED")
      .map((part) => part.currentStation);
    expect(new Set(activeStations.filter((station) => station.startsWith("CNC-"))).size).toBeGreaterThanOrEqual(2);
    expect(useFactoryStore.getState().parts.some((part) => part.lineId === "south")).toBe(true);
    expect(useFactoryStore.getState().parts.some((part) => part.lineId === "north")).toBe(true);
  });

  it("dispatches traceable work across all twelve CNC destinations", () => {
    for (let index = 0; index < 240; index += 1) useFactoryStore.getState().tick(0.25);
    const destinations = new Set(useFactoryStore.getState().parts.map((part) => part.assignedCnc));
    expect(destinations.size).toBe(12);
  });

  it("restores speed and fault settings when a guided demo is cancelled", () => {
    useFactoryStore.setState({ speed: 2, faultMode: "HIGH" });
    useFactoryStore.getState().startDemo();
    expect(useFactoryStore.getState().faultMode).toBe("OFF");
    useFactoryStore.getState().cancelDemo();
    expect(useFactoryStore.getState().speed).toBe(2);
    expect(useFactoryStore.getState().faultMode).toBe("HIGH");
  });

  it("updates the live product schedule while preserving a 100 percent mix", () => {
    useFactoryStore.getState().setProductTarget("ROCKET_NOZZLE", 60);
    const targets = useFactoryStore.getState().productTargets;
    expect(targets.ROCKET_NOZZLE).toBe(60);
    expect(Object.values(targets).reduce((sum, value) => sum + value, 0)).toBe(100);
  });

  it("auto-repairs and restarts a faulted machine when the technician toggle is enabled", () => {
    useFactoryStore.getState().triggerFault("CNC-01", "MTR-104");
    expect(useFactoryStore.getState().machines["CNC-01"].status).toBe("FAULT");
    for (let index = 0; index < 49; index += 1) useFactoryStore.getState().tick(0.25);
    const state = useFactoryStore.getState();
    expect(state.activeFaults["CNC-01"]).toBeUndefined();
    expect(state.machines["CNC-01"].status).toBe("RUNNING");
    expect(state.events.some((event) => event.message.includes("auto-repaired by technician"))).toBe(true);
  });
});
