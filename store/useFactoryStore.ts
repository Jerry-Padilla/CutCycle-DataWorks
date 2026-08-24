"use client";

import { create } from "zustand";
import { MAX_CHART_HISTORY, MAX_EVENT_HISTORY, MACHINE_IDS } from "@/lib/constants";
import { FAULT_DEFINITIONS, faultsForKind, getNextFaultDelay } from "@/lib/simulation/faultEngine";
import { calculateKpis } from "@/lib/simulation/kpiEngine";
import { createInitialMachines } from "@/lib/simulation/machineTypes";
import { advanceProduction, createPart } from "@/lib/simulation/productionEngine";
import { updateTelemetry } from "@/lib/simulation/telemetryEngine";
import type {
  ActiveFault,
  AppView,
  ChartSample,
  DemoState,
  FaultMode,
  KpiSnapshot,
  MachineId,
  MachineRuntime,
  Part,
  ProductionCounters,
  ProductionEvent,
  SimulationSpeed,
} from "@/types/factory";

const initialNow = Date.now();
const initialMachines = createInitialMachines();
const initialCounters: ProductionCounters = {
  totalStarted: 326,
  totalCompleted: 312,
  totalRejected: 6,
  totalInspected: 318,
  totalCycleTime: 312 * 24.7,
  completionTimes: [initialNow - 5_000, initialNow - 20_000, initialNow - 35_000, initialNow - 50_000],
};

interface FactoryState {
  view: AppView;
  machines: Record<MachineId, MachineRuntime>;
  parts: Part[];
  events: ProductionEvent[];
  counters: ProductionCounters;
  kpis: KpiSnapshot;
  chartData: ChartSample[];
  selectedMachineId: MachineId | null;
  activeFaults: Partial<Record<MachineId, ActiveFault>>;
  diagnosingMachineId: MachineId | null;
  speed: SimulationSpeed;
  faultMode: FaultMode;
  paused: boolean;
  soundEnabled: boolean;
  exploreMode: boolean;
  introComplete: boolean;
  simulationNow: number;
  serialCounter: number;
  spawnAccumulator: number;
  telemetryAccumulator: number;
  chartAccumulator: number;
  faultCountdown: number;
  demo: DemoState;
  tick: (realDeltaSeconds: number) => void;
  setView: (view: AppView) => void;
  selectMachine: (machineId: MachineId | null) => void;
  startMachine: (machineId: MachineId) => void;
  stopMachine: (machineId: MachineId) => void;
  triggerFault: (machineId?: MachineId, code?: string) => void;
  openDiagnosis: (machineId: MachineId) => void;
  closeDiagnosis: () => void;
  submitDiagnosis: (machineId: MachineId, choiceId: string) => void;
  repairMachine: (machineId: MachineId) => void;
  setSpeed: (speed: SimulationSpeed) => void;
  setFaultMode: (mode: FaultMode) => void;
  togglePause: () => void;
  toggleSound: () => void;
  setExploreMode: (enabled: boolean) => void;
  completeIntro: () => void;
  startDemo: () => void;
  cancelDemo: () => void;
}

function createEvent(message: string, severity: ProductionEvent["severity"], now: number, machineId?: MachineId): ProductionEvent {
  return { id: `${now}-${machineId ?? "system"}-${message}`, timestamp: now, message, severity, machineId };
}

function applyFault(
  machines: Record<MachineId, MachineRuntime>,
  faults: Partial<Record<MachineId, ActiveFault>>,
  machineId: MachineId,
  code: string | undefined,
  now: number,
): { machines: Record<MachineId, MachineRuntime>; faults: Partial<Record<MachineId, ActiveFault>>; event?: ProductionEvent } {
  const machine = machines[machineId];
  if (!machine || machine.status === "FAULT" || machine.status === "MAINTENANCE") return { machines, faults };
  const options = faultsForKind(machine.kind);
  const definition = (code ? FAULT_DEFINITIONS.find((item) => item.code === code) : undefined) ?? options[Math.floor(Math.random() * options.length)];
  if (!definition || !definition.machineKinds.includes(machine.kind)) return { machines, faults };

  const updatedMachine = {
    ...machine,
    status: "FAULT" as const,
    activeFaultCode: definition.code,
    faultsToday: machine.faultsToday + 1,
  };
  return {
    machines: { ...machines, [machineId]: updatedMachine },
    faults: {
      ...faults,
      [machineId]: {
        machineId,
        code: definition.code,
        occurredAt: now,
        diagnosed: false,
        selectedChoiceId: null,
        answerCorrect: null,
      },
    },
    event: createEvent(`${machineId} fault detected · ${definition.code} ${definition.title}`, "FAULT", now, machineId),
  };
}

const initialParts = [createPart(1301, initialNow - 4_000), createPart(1302, initialNow - 3_000), createPart(1303, initialNow - 2_000)];

export const useFactoryStore = create<FactoryState>((set) => ({
  view: "FACTORY",
  machines: initialMachines,
  parts: initialParts,
  events: [createEvent("Factory simulation ready · production schedule loaded", "SUCCESS", initialNow)],
  counters: initialCounters,
  kpis: calculateKpis(initialMachines, initialCounters, initialNow),
  chartData: [],
  selectedMachineId: null,
  activeFaults: {},
  diagnosingMachineId: null,
  speed: 1,
  faultMode: "NORMAL",
  paused: false,
  soundEnabled: false,
  exploreMode: false,
  introComplete: false,
  simulationNow: initialNow,
  serialCounter: 1303,
  spawnAccumulator: 0,
  telemetryAccumulator: 0,
  chartAccumulator: 0,
  faultCountdown: getNextFaultDelay("NORMAL"),
  demo: { active: false, step: 0, elapsed: 0, message: "", previousSpeed: null, previousFaultMode: null, partId: null },

  tick: (realDeltaSeconds) =>
    set((state) => {
      if (state.paused || !state.introComplete) return state;
      const deltaSeconds = Math.min(Math.max(realDeltaSeconds, 0), 0.25) * state.speed;
      const now = state.simulationNow + deltaSeconds * 1000;
      let parts = state.parts;
      let serialCounter = state.serialCounter;
      let spawnAccumulator = state.spawnAccumulator + deltaSeconds;
      const freshEvents: ProductionEvent[] = [];

      const activeCount = parts.filter((part) => part.status !== "COMPLETE" && part.status !== "REJECTED").length;
      if (spawnAccumulator >= 6 && activeCount < 8) {
        serialCounter += 1;
        const part = createPart(serialCounter, now);
        parts = [...parts, part];
        spawnAccumulator = 0;
        freshEvents.push(createEvent(`Raw material staged · ${part.serialNumber}`, "INFO", now));
      }

      const production = advanceProduction({
        parts,
        machines: state.machines,
        counters: state.counters,
        deltaSeconds,
        now,
      });
      parts = production.parts.filter((part, index, collection) => {
        if (part.status !== "COMPLETE" && part.status !== "REJECTED") return true;
        const completed = collection.filter((item) => item.status === part.status);
        return completed.indexOf(part) >= Math.max(0, completed.length - 12);
      });
      let machines = production.machines;
      let activeFaults = state.activeFaults;
      let faultCountdown = state.faultCountdown - deltaSeconds * 1000;

      if (faultCountdown <= 0 && state.faultMode !== "OFF" && !state.demo.active) {
        const candidates = MACHINE_IDS.filter((id) => machines[id].status === "RUNNING" && machines[id].kind !== "CMM");
        if (candidates.length) {
          const target = candidates[Math.floor(Math.random() * candidates.length)];
          const faultResult = applyFault(machines, activeFaults, target, undefined, now);
          machines = faultResult.machines;
          activeFaults = faultResult.faults;
          if (faultResult.event) freshEvents.push(faultResult.event);
        }
        faultCountdown = getNextFaultDelay(state.faultMode);
      }

      let telemetryAccumulator = state.telemetryAccumulator + deltaSeconds;
      if (telemetryAccumulator >= 0.5) {
        machines = updateTelemetry(machines);
        telemetryAccumulator = 0;
      }

      const demo = { ...state.demo };
      let selectedMachineId = state.selectedMachineId;
      let diagnosingMachineId = state.diagnosingMachineId;
      if (demo.active && demo.partId) {
        demo.elapsed += deltaSeconds;
        const demoPart = parts.find((part) => part.id === demo.partId);
        if (demoPart) {
          const stationStep: Partial<Record<typeof demoPart.currentStation, [number, string, MachineId | null]>> = {
            RAW: [0, "Staging a traceable raw blank", "CNC-01"],
            "CNC-01": [1, "CNC-01 is rough-machining the demo part", "CNC-01"],
            "CNC-02": [2, "CNC-02 is completing the finish operation", "CNC-02"],
            CONVEYOR: [3, "The conveyor is transferring work in process", null],
            "ROBOT-01": [4, "ROBOT-01 is loading automated inspection", "ROBOT-01"],
            "CMM-01": [5, "CMM-01 is validating critical dimensions", "CMM-01"],
            FINISHED: [6, "Inspection passed. KPI history updated from the event.", "CMM-01"],
          };
          const guide = stationStep[demoPart.currentStation];
          if (guide) {
            demo.step = guide[0];
            demo.message = guide[1];
            if (guide[2]) selectedMachineId = guide[2];
          }
          if (demoPart.currentStation === "FINISHED" && !activeFaults["CNC-02"]) {
            const faultResult = applyFault(machines, activeFaults, "CNC-02", "MTR-104", now);
            machines = faultResult.machines;
            activeFaults = faultResult.faults;
            if (faultResult.event) freshEvents.push(faultResult.event);
            selectedMachineId = "CNC-02";
            diagnosingMachineId = "CNC-02";
            demo.step = 7;
            demo.message = "MTR-104 detected. Use live readings to diagnose the failure.";
          }
        }
      }

      const kpis = calculateKpis(machines, production.counters, now);
      let chartAccumulator = state.chartAccumulator + deltaSeconds;
      let chartData = state.chartData;
      if (chartAccumulator >= 5) {
        chartData = [
          ...chartData,
          {
            timestamp: now,
            label: new Date(now).toLocaleTimeString([], { minute: "2-digit", second: "2-digit" }),
            throughput: kpis.throughput,
            oee: Number(kpis.oee.toFixed(1)),
          },
        ].slice(-MAX_CHART_HISTORY);
        chartAccumulator = 0;
      }

      const events = [...freshEvents, ...production.events].reverse();
      return {
        ...state,
        parts,
        machines,
        counters: production.counters,
        kpis,
        events: [...events, ...state.events].slice(0, MAX_EVENT_HISTORY),
        activeFaults,
        selectedMachineId,
        diagnosingMachineId,
        simulationNow: now,
        serialCounter,
        spawnAccumulator,
        telemetryAccumulator,
        chartAccumulator,
        chartData,
        faultCountdown,
        demo,
      };
    }),

  setView: (view) => set((state) => ({ view, exploreMode: view === "FACTORY" ? state.exploreMode : false })),
  selectMachine: (selectedMachineId) => set({ selectedMachineId }),
  startMachine: (machineId) =>
    set((state) => {
      if (state.activeFaults[machineId]) return state;
      const machine = state.machines[machineId];
      return {
        machines: { ...state.machines, [machineId]: { ...machine, status: "RUNNING" } },
        events: [createEvent(`${machineId} started by operator`, "SUCCESS", state.simulationNow, machineId), ...state.events].slice(0, MAX_EVENT_HISTORY),
      };
    }),
  stopMachine: (machineId) =>
    set((state) => {
      const machine = state.machines[machineId];
      if (machine.status === "FAULT") return state;
      return {
        machines: { ...state.machines, [machineId]: { ...machine, status: "IDLE" } },
        events: [createEvent(`${machineId} stopped by operator`, "WARNING", state.simulationNow, machineId), ...state.events].slice(0, MAX_EVENT_HISTORY),
      };
    }),
  triggerFault: (machineId, code) =>
    set((state) => {
      const candidates = MACHINE_IDS.filter((id) => state.machines[id].status !== "FAULT" && state.machines[id].kind !== "CMM");
      const target = machineId ?? candidates[Math.floor(Math.random() * candidates.length)];
      if (!target) return state;
      const result = applyFault(state.machines, state.activeFaults, target, code, state.simulationNow);
      return {
        machines: result.machines,
        activeFaults: result.faults,
        selectedMachineId: target,
        events: result.event ? [result.event, ...state.events].slice(0, MAX_EVENT_HISTORY) : state.events,
        faultCountdown: getNextFaultDelay(state.faultMode),
      };
    }),
  openDiagnosis: (machineId) =>
    set((state) => {
      const fault = state.activeFaults[machineId];
      if (!fault) return state;
      return {
        diagnosingMachineId: machineId,
        activeFaults: { ...state.activeFaults, [machineId]: { ...fault, diagnosed: true } },
      };
    }),
  closeDiagnosis: () => set({ diagnosingMachineId: null }),
  submitDiagnosis: (machineId, choiceId) =>
    set((state) => {
      const active = state.activeFaults[machineId];
      if (!active) return state;
      const definition = FAULT_DEFINITIONS.find((fault) => fault.code === active.code);
      return {
        activeFaults: {
          ...state.activeFaults,
          [machineId]: { ...active, selectedChoiceId: choiceId, answerCorrect: definition?.correctChoiceId === choiceId },
        },
      };
    }),
  repairMachine: (machineId) =>
    set((state) => {
      const active = state.activeFaults[machineId];
      if (!active?.answerCorrect) return state;
      const machine = state.machines[machineId];
      const activeFaults = { ...state.activeFaults };
      delete activeFaults[machineId];
      const demo = state.demo.active
        ? {
            active: false,
            step: 0,
            elapsed: 0,
            message: "",
            previousSpeed: null,
            previousFaultMode: null,
            partId: null,
          }
        : state.demo;
      return {
        machines: { ...state.machines, [machineId]: { ...machine, status: "IDLE", activeFaultCode: null } },
        activeFaults,
        diagnosingMachineId: null,
        demo,
        speed: state.demo.previousSpeed ?? state.speed,
        faultMode: state.demo.previousFaultMode ?? state.faultMode,
        events: [createEvent(`${machineId} repair complete · machine ready`, "SUCCESS", state.simulationNow, machineId), ...state.events].slice(0, MAX_EVENT_HISTORY),
      };
    }),
  setSpeed: (speed) => set({ speed }),
  setFaultMode: (faultMode) => set({ faultMode, faultCountdown: getNextFaultDelay(faultMode) }),
  togglePause: () => set((state) => ({ paused: !state.paused })),
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
  setExploreMode: (exploreMode) => set({ exploreMode }),
  completeIntro: () => set({ introComplete: true }),
  startDemo: () =>
    set((state) => {
      let parts = state.parts;
      let serialCounter = state.serialCounter;
      let demoPart = parts.find((part) => !part.demo && part.status !== "COMPLETE" && part.status !== "REJECTED");
      if (demoPart) {
        parts = parts.map((part) => (part.id === demoPart?.id ? { ...part, demo: true } : part));
        demoPart = parts.find((part) => part.id === demoPart?.id);
      } else {
        serialCounter += 1;
        demoPart = createPart(serialCounter, state.simulationNow, true);
        parts = [...parts, demoPart];
      }
      const demoPartId = demoPart?.id;
      if (!demoPartId) return state;
      return {
        view: "FACTORY",
        parts,
        serialCounter,
        speed: 1,
        faultMode: "OFF",
        paused: false,
        selectedMachineId: "CNC-01",
        diagnosingMachineId: null,
        demo: {
          active: true,
          step: 0,
          elapsed: 0,
          message: "Staging a traceable raw blank",
          previousSpeed: state.speed,
          previousFaultMode: state.faultMode,
          partId: demoPartId,
        },
      };
    }),
  cancelDemo: () =>
    set((state) => ({
      speed: state.demo.previousSpeed ?? state.speed,
      faultMode: state.demo.previousFaultMode ?? state.faultMode,
      demo: { active: false, step: 0, elapsed: 0, message: "", previousSpeed: null, previousFaultMode: null, partId: null },
    })),
}));
