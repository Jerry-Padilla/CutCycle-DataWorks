import { CMM_STATIONS, ROBOT_STATIONS, SAW_STATIONS } from "@/lib/factory/layout";
import { MACHINE_IDS, MAX_ACTIVE_WIP } from "@/lib/constants";
import { getFaultDefinition } from "@/lib/simulation/faultEngine";
import { CNC_STATIONS } from "@/lib/simulation/productionRouting";
import type { ActiveFault, EquipmentId, MachineId, MachineRuntime, Part } from "@/types/factory";

export type EquipmentCondition = "FAULT" | "STOPPED" | "BLOCKED" | "IDLE" | "PAUSED";

export interface EquipmentStatusRow {
  id: string;
  kind: "Saw" | "CNC mill" | "Robot" | "CMM";
  condition: EquipmentCondition;
  reason: string;
  currentPart: string | null;
  selectableId: EquipmentId | null;
}

interface EquipmentStatusInput {
  machines: Record<MachineId, MachineRuntime>;
  activeFaults: Partial<Record<MachineId, ActiveFault>>;
  parts: Part[];
  paused: boolean;
}

const activePartAt = (parts: Part[], station: string) => parts.find((part) => part.currentStation === station);

function runtimeStop(id: EquipmentId, machines: Record<MachineId, MachineRuntime>, faults: Partial<Record<MachineId, ActiveFault>>): EquipmentStatusRow | null {
  if (!MACHINE_IDS.includes(id as MachineId)) return null;
  const machineId = id as MachineId;
  const machine = machines[machineId];
  const fault = faults[machineId];
  if (fault) {
    const definition = getFaultDefinition(fault.code);
    return { id, kind: machine.kind === "CNC" ? "CNC mill" : machine.kind === "ROBOT" ? "Robot" : "CMM", condition: "FAULT", reason: `${fault.code} · ${definition?.title ?? "Equipment fault"}`, currentPart: machine.currentPartId, selectableId: id };
  }
  if (machine.status === "MAINTENANCE") return { id, kind: machine.kind === "CNC" ? "CNC mill" : machine.kind === "ROBOT" ? "Robot" : "CMM", condition: "STOPPED", reason: "Maintenance lockout active", currentPart: machine.currentPartId, selectableId: id };
  if (machine.status === "IDLE") return { id, kind: machine.kind === "CNC" ? "CNC mill" : machine.kind === "ROBOT" ? "Robot" : "CMM", condition: "STOPPED", reason: "Stopped by operator · restart required", currentPart: machine.currentPartId, selectableId: id };
  return null;
}

export function deriveEquipmentStatus({ machines, activeFaults, parts, paused }: EquipmentStatusInput): EquipmentStatusRow[] {
  const activeWip = parts.filter((part) => part.status !== "COMPLETE" && part.status !== "REJECTED").length;
  const rows: EquipmentStatusRow[] = [];
  const add = (id: string, kind: EquipmentStatusRow["kind"], reason: string, condition: EquipmentCondition, part: Part | undefined, selectableId: EquipmentId | null) => {
    rows.push({ id, kind, reason, condition, currentPart: part?.serialNumber ?? null, selectableId });
  };

  for (const saw of SAW_STATIONS) {
    const part = parts.find((candidate) => candidate.currentStation === "RAW" && candidate.lineId === saw.lineId);
    if (paused) add(saw.label, "Saw", "Simulation paused", "PAUSED", part, null);
    else if (part?.progress === 100) add(saw.label, "Saw", `Waiting to load ${part.assignedCnc}`, "BLOCKED", part, null);
    else if (!part) add(saw.label, "Saw", activeWip >= MAX_ACTIVE_WIP ? `WIP buffer full · ${activeWip}/${MAX_ACTIVE_WIP}` : "Awaiting next stock release", activeWip >= MAX_ACTIVE_WIP ? "BLOCKED" : "IDLE", undefined, null);
  }

  for (const id of CNC_STATIONS) {
    const part = activePartAt(parts, id);
    const stopped = runtimeStop(id, machines, activeFaults);
    if (paused) add(id, "CNC mill", "Simulation paused", "PAUSED", part, id);
    else if (stopped) rows.push({ ...stopped, currentPart: part?.serialNumber ?? stopped.currentPart });
    else if (part?.progress === 100) add(id, "CNC mill", "Machining complete · downstream conveyor at capacity", "BLOCKED", part, id);
    else if (!part) add(id, "CNC mill", "Idle · awaiting assigned billet", "IDLE", undefined, id);
  }

  for (const robot of ROBOT_STATIONS) {
    const id = robot.label;
    const part = activePartAt(parts, id);
    const stopped = runtimeStop(id, machines, activeFaults);
    if (paused) add(id, "Robot", "Simulation paused", "PAUSED", part, id);
    else if (stopped) rows.push({ ...stopped, currentPart: part?.serialNumber ?? stopped.currentPart });
    else if (part?.progress === 100) add(id, "Robot", `Waiting for ${part.assignedCmm} capacity`, "BLOCKED", part, id);
    else if (!part) add(id, "Robot", "Idle · awaiting machined part", "IDLE", undefined, id);
  }

  for (const cmm of CMM_STATIONS) {
    const id = cmm.label;
    const part = activePartAt(parts, id);
    const stopped = runtimeStop(id, machines, activeFaults);
    if (paused) add(id, "CMM", "Simulation paused", "PAUSED", part, id);
    else if (stopped) rows.push({ ...stopped, currentPart: part?.serialNumber ?? stopped.currentPart });
    else if (!part) add(id, "CMM", "Idle · awaiting robot load", "IDLE", undefined, id);
  }

  const priority: Record<EquipmentCondition, number> = { FAULT: 0, STOPPED: 1, BLOCKED: 2, PAUSED: 3, IDLE: 4 };
  return rows.sort((a, b) => priority[a.condition] - priority[b.condition] || a.id.localeCompare(b.id));
}
