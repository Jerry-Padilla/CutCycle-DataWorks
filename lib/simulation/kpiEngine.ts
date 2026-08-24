import { MACHINE_IDS } from "@/lib/constants";
import type { KpiSnapshot, MachineId, MachineRuntime, ProductionCounters } from "@/types/factory";

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));

export function calculateKpis(
  machines: Record<MachineId, MachineRuntime>,
  counters: ProductionCounters,
  now: number,
): KpiSnapshot {
  const utilization = Object.fromEntries(
    MACHINE_IDS.map((id) => {
      const machine = machines[id];
      return [id, clamp((machine.runningMs / Math.max(machine.scheduledMs, 1)) * 100)];
    }),
  ) as Record<MachineId, number>;

  const availability = MACHINE_IDS.reduce((sum, id) => sum + utilization[id], 0) / MACHINE_IDS.length;
  const averageCycleTime = counters.totalCompleted > 0 ? counters.totalCycleTime / counters.totalCompleted : 0;
  const idealCycleTime = 23;
  const performance = averageCycleTime > 0 ? clamp((idealCycleTime / averageCycleTime) * 100) : 0;
  const quality = counters.totalInspected > 0 ? clamp((counters.totalCompleted / counters.totalInspected) * 100) : 100;
  const oee = (availability / 100) * (performance / 100) * (quality / 100) * 100;
  const recentCompletions = counters.completionTimes.filter((timestamp) => now - timestamp <= 60_000).length;

  return {
    availability,
    performance,
    quality,
    oee,
    throughput: recentCompletions * 60,
    scrapRate: 100 - quality,
    partsProduced: counters.totalCompleted,
    machinesOnline: MACHINE_IDS.filter((id) => machines[id].status !== "FAULT" && machines[id].status !== "MAINTENANCE").length,
    averageCycleTime,
    utilization,
  };
}
