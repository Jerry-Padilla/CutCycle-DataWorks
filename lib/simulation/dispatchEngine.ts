import { MAX_ACTIVE_WIP } from "@/lib/constants";
import { createProductionRoute, type ProductionRoute } from "@/lib/simulation/productionRouting";
import type { MachineId, MachineRuntime, Part } from "@/types/factory";

const INSTRUMENTED_CNC: Partial<Record<ProductionRoute["assignedCnc"], MachineId>> = {
  "CNC-01": "CNC-01",
  "CNC-02": "CNC-02",
};

export interface DispatchSelection {
  serial: number;
  route: ProductionRoute;
}

export function selectNextDispatch(serialCounter: number, parts: Part[], machines: Record<MachineId, MachineRuntime>): DispatchSelection | null {
  const active = parts.filter((part) => part.status !== "COMPLETE" && part.status !== "REJECTED");
  if (active.length >= MAX_ACTIVE_WIP) return null;
  const perLineLimit = MAX_ACTIVE_WIP / 2;

  for (let offset = 1; offset <= 24; offset += 1) {
    const serial = serialCounter + offset;
    const route = createProductionRoute(serial);
    const lineWip = active.filter((part) => part.lineId === route.lineId).length;
    if (lineWip >= perLineLimit) continue;
    const cncDemand = active.filter((part) => part.assignedCnc === route.assignedCnc && (part.currentStation === "RAW" || part.currentStation === route.assignedCnc)).length;
    if (cncDemand >= 2) continue;
    const machineId = INSTRUMENTED_CNC[route.assignedCnc];
    if (machineId && machines[machineId].status !== "RUNNING") continue;
    return { serial, route };
  }
  return null;
}
