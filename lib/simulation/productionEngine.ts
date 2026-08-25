import { MAX_EVENT_HISTORY, STATION_CAPACITY, STATION_DURATIONS } from "@/lib/constants";
import type {
  EventSeverity,
  MachineId,
  MachineRuntime,
  Part,
  PartStatus,
  ProductionCounters,
  ProductionEvent,
  StationId,
} from "@/types/factory";

export interface ProductionStepInput {
  parts: Part[];
  machines: Record<MachineId, MachineRuntime>;
  counters: ProductionCounters;
  deltaSeconds: number;
  now: number;
  random?: () => number;
}

export interface ProductionStepResult {
  parts: Part[];
  machines: Record<MachineId, MachineRuntime>;
  counters: ProductionCounters;
  events: ProductionEvent[];
}

const STATION_MACHINE: Partial<Record<StationId, MachineId>> = {
  "CNC-01": "CNC-01",
  "CNC-02": "CNC-02",
  "ROBOT-01": "ROBOT-01",
  "CMM-01": "CMM-01",
};

const NEXT_STATION: Partial<Record<StationId, StationId>> = {
  RAW: "CNC-01",
  "CNC-01": "CNC-02",
  "CNC-02": "CONVEYOR",
  CONVEYOR: "ROBOT-01",
  "ROBOT-01": "CMM-01",
};

const STATION_STATUS: Partial<Record<StationId, PartStatus>> = {
  "CNC-01": "MACHINING",
  "CNC-02": "MACHINING",
  CONVEYOR: "MOVING",
  "ROBOT-01": "MOVING",
  "CMM-01": "INSPECTION",
};

function event(
  now: number,
  message: string,
  severity: EventSeverity,
  sequence: number,
  machineId?: MachineId,
  partId?: string,
): ProductionEvent {
  return { id: `${now}-${sequence}-${partId ?? machineId ?? "system"}`, timestamp: now, message, severity, machineId, partId };
}

function isMachineAvailable(station: StationId, machines: Record<MachineId, MachineRuntime>): boolean {
  const machineId = STATION_MACHINE[station];
  return !machineId || machines[machineId].status === "RUNNING";
}

function stationHasCapacity(parts: Part[], station: StationId): boolean {
  const capacity = STATION_CAPACITY[station] ?? Number.POSITIVE_INFINITY;
  return parts.filter((part) => part.currentStation === station).length < capacity;
}

function qualityScore(machines: Record<MachineId, MachineRuntime>, random: () => number, demo = false): number {
  if (demo) return 97;
  const temperatures = [machines["CNC-01"], machines["CNC-02"]].map((machine) =>
    machine.telemetry.kind === "CNC" ? machine.telemetry.temperature : 45,
  );
  const heatPenalty = temperatures.reduce((sum, temperature) => sum + Math.max(0, temperature - 56) * 0.35, 0);
  const faultPenalty = [machines["CNC-01"], machines["CNC-02"]].filter((machine) => machine.activeFaultCode).length * 5;
  if (random() < 0.02 + faultPenalty / 100) return Math.max(45, 83 - random() * 18 - heatPenalty);
  return Math.max(70, 90 + random() * 10 - heatPenalty - faultPenalty * 0.35);
}

export function createPart(serial: number, now: number, demo = false): Part {
  return {
    id: `part-${serial}`,
    serialNumber: `SN-${String(10000 + serial).padStart(5, "0")}`,
    currentStation: "RAW",
    status: "WAITING",
    qualityScore: null,
    createdAt: now,
    cycleTime: 0,
    stationElapsed: 0,
    progress: 0,
    demo,
  };
}

export function advanceProduction(input: ProductionStepInput): ProductionStepResult {
  const random = input.random ?? Math.random;
  const parts = input.parts.map((part) => ({ ...part }));
  const machines = Object.fromEntries(
    Object.entries(input.machines).map(([id, machine]) => [id, { ...machine, telemetry: { ...machine.telemetry } }]),
  ) as Record<MachineId, MachineRuntime>;
  const counters: ProductionCounters = {
    ...input.counters,
    completionTimes: input.counters.completionTimes.filter((timestamp) => input.now - timestamp < 60_000),
  };
  const events: ProductionEvent[] = [];

  for (const machine of Object.values(machines)) {
    machine.scheduledMs += input.deltaSeconds * 1000;
    if (machine.status === "RUNNING") machine.runningMs += input.deltaSeconds * 1000;
  }

  for (const part of parts) {
    if (part.status !== "COMPLETE" && part.status !== "REJECTED") part.cycleTime += input.deltaSeconds;
  }

  const activeParts = parts
    .filter((part) => STATION_DURATIONS[part.currentStation])
    .sort((a, b) => b.createdAt - a.createdAt);

  for (const part of activeParts) {
    const station = part.currentStation;
    const duration = STATION_DURATIONS[station];
    if (!duration || !isMachineAvailable(station, machines)) continue;

    part.stationElapsed += input.deltaSeconds;
    part.progress = Math.min(100, (part.stationElapsed / duration) * 100);
    if (part.stationElapsed < duration) continue;

    if (station === "CMM-01") {
      const score = qualityScore(machines, random, part.demo);
      const passed = score >= 85;
      part.qualityScore = Number(score.toFixed(1));
      part.currentStation = passed ? "FINISHED" : "REJECT";
      part.status = passed ? "COMPLETE" : "REJECTED";
      part.progress = 100;
      counters.totalInspected += 1;
      if (passed) {
        counters.totalCompleted += 1;
        counters.totalCycleTime += part.cycleTime;
        counters.completionTimes.push(input.now);
      } else {
        counters.totalRejected += 1;
      }
      machines["CMM-01"].partsProduced += 1;
      if (machines["CMM-01"].telemetry.kind === "CMM") {
        machines["CMM-01"].telemetry.lastResult = passed ? "PASS" : "FAIL";
        machines["CMM-01"].telemetry.totalInspected = counters.totalInspected;
        machines["CMM-01"].telemetry.rejectionCount = counters.totalRejected;
      }
      events.push(
        event(
          input.now,
          `CMM inspection ${passed ? "PASSED" : "FAILED"} · ${part.serialNumber} · Q${part.qualityScore}`,
          passed ? "SUCCESS" : "WARNING",
          events.length,
          "CMM-01",
          part.id,
        ),
      );
      continue;
    }

    const next = NEXT_STATION[station];
    if (!next || !stationHasCapacity(parts, next) || !isMachineAvailable(next, machines)) continue;
    const machineId = STATION_MACHINE[station];
    if (machineId) machines[machineId].partsProduced += 1;
    part.currentStation = next;
    part.status = STATION_STATUS[next] ?? "MOVING";
    part.stationElapsed = 0;
    part.progress = 0;
    const nextMachine = STATION_MACHINE[next];
    const transition = station === "RAW"
      ? " · saw-cut blank stopped at CNC-01 pickup · operator-loaded from front"
      : next.startsWith("CNC")
      ? ` · operator-loaded into ${next} from front`
      : next === "CONVEYOR"
        ? " · operator returned part to shared front conveyor"
        : next === "ROBOT-01"
          ? " · shared front conveyor delivered part to ROBOT-01"
          : next === "CMM-01"
            ? " · ROBOT-01 placed part directly on CMM-01"
            : ` · entered ${next}`;
    events.push(
      event(
        input.now,
        `Part ${part.serialNumber} completed ${station}${transition}`,
        "SUCCESS",
        events.length,
        machineId ?? nextMachine,
        part.id,
      ),
    );
  }

  for (const machine of Object.values(machines)) {
    const active = parts.find((part) => part.currentStation === machine.id);
    machine.currentPartId = active?.serialNumber ?? null;
    machine.progress = active?.progress ?? 0;
  }

  return { parts, machines, counters, events: events.slice(-MAX_EVENT_HISTORY) };
}
