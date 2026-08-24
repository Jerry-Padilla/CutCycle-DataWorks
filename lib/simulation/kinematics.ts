export type CncToolpath = "rectangle" | "circle";

export const CONVEYOR_PATH_AXIS = [1, 0, 0] as const;
export const CONVEYOR_ROLLER_AXIS = [0, 0, 1] as const;

export function conveyorRollerAngleDelta(deltaSeconds: number, simulationSpeed: number): number {
  return -deltaSeconds * 2.4 * simulationSpeed;
}

export function spindleDisplayAngularVelocity(spindleRpm: number): number {
  return Math.min(18, Math.max(2, spindleRpm / 650));
}

export function cncToolpathOffset(toolpath: CncToolpath, progress: number): [number, number] {
  const t = ((progress % 100) + 100) % 100 / 100;
  if (toolpath === "circle") return [Math.cos(t * Math.PI * 2) * .32, Math.sin(t * Math.PI * 2) * .25];
  const segment = t * 4;
  if (segment < 1) return [-.32 + segment * .64, -.25];
  if (segment < 2) return [.32, -.25 + (segment - 1) * .5];
  if (segment < 3) return [.32 - (segment - 2) * .64, .25];
  return [-.32, .25 - (segment - 3) * .5];
}
