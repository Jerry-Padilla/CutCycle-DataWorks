import type { MachineId, MachineRuntime } from "@/types/factory";

const approach = (current: number, target: number, factor: number) => current + (target - current) * factor;
const jitter = (min: number, max: number, random: () => number) => min + (max - min) * random();

export function updateTelemetry(
  machines: Record<MachineId, MachineRuntime>,
  random = Math.random,
): Record<MachineId, MachineRuntime> {
  return Object.fromEntries(
    Object.entries(machines).map(([id, machine]) => {
      const next = { ...machine, telemetry: { ...machine.telemetry } } as MachineRuntime;
      const running = machine.status === "RUNNING";

      if (next.telemetry.kind === "CNC") {
        const fault = machine.activeFaultCode;
        const rpmTarget = running ? jitter(7800, 8200, random) : 0;
        const loadTarget = running ? jitter(55, 78, random) : 0;
        const temperatureTarget =
          fault === "MTR-104" ? 74 : fault === "CLT-203" ? 64 : running ? jitter(42, 58, random) : 34;
        next.telemetry.spindleRpm = approach(next.telemetry.spindleRpm, rpmTarget, 0.22);
        next.telemetry.spindleLoad = approach(next.telemetry.spindleLoad, loadTarget, 0.2);
        next.telemetry.temperature = approach(next.telemetry.temperature, temperatureTarget, 0.08);
        next.telemetry.cycleTime = machine.nominalCycle + jitter(-0.3, 0.4, random);
      } else if (next.telemetry.kind === "ROBOT") {
        next.telemetry.jointSpeed = approach(next.telemetry.jointSpeed, running ? jitter(36, 52, random) : 0, 0.2);
        next.telemetry.temperature = approach(next.telemetry.temperature, running ? jitter(36, 43, random) : 32, 0.08);
        next.telemetry.cycleProgress = machine.progress;
        next.telemetry.gripperClosed = machine.progress > 34 && machine.progress < 78;
      } else {
        next.telemetry.inspectionProgress = machine.progress;
        next.telemetry.currentPart = machine.currentPartId;
      }
      return [id, next];
    }),
  ) as Record<MachineId, MachineRuntime>;
}
