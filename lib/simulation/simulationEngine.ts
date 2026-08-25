import type { Part, StationId } from "@/types/factory";
import { cncServicedPartPosition, type OperatorPath } from "@/lib/simulation/operatorKinematics";

export type FactoryPosition = [number, number, number];

const POSITIONS: Record<StationId, FactoryPosition> = {
  RAW: [-14.8, 1.2, -8.8],
  "CNC-01": [-9, 1.2, -4.2],
  "CNC-02": [-5.4, 1.2, -4.2],
  CONVEYOR: [0, 1.15, -6.1],
  "ROBOT-01": [12, 1.2, -3.2],
  "CMM-01": [14, 1.1, -6.1],
  FINISHED: [15.2, 1.3, -8.8],
  REJECT: [12, 0.75, -8.2],
};

const PRIMARY_CNC_LOADING_PATH: OperatorPath = {
  machineXs: [-9, -5.4],
  machineZ: -4.2,
  infeedZ: -0.9,
  rotationY: 0,
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const mix = (from: FactoryPosition, to: FactoryPosition, progress: number): FactoryPosition => [
  lerp(from[0], to[0], progress),
  lerp(from[1], to[1], progress),
  lerp(from[2], to[2], progress),
];

export function getPartPosition(part: Part, stackIndex = 0): FactoryPosition {
  const t = Math.min(1, Math.max(0, part.progress / 100));
  switch (part.currentStation) {
    case "RAW":
      return [POSITIONS.RAW[0], POSITIONS.RAW[1] + stackIndex * 0.18, POSITIONS.RAW[2] + (stackIndex % 3) * 0.45];
    case "CNC-01":
      return cncServicedPartPosition(PRIMARY_CNC_LOADING_PATH, 0, t);
    case "CNC-02":
      return cncServicedPartPosition(PRIMARY_CNC_LOADING_PATH, 1, t);
    case "ROBOT-01": {
      if (t < 0.62) return mix([-5.85, 1.18, -0.9], [10.6, 1.18, -0.9], t / 0.62);
      const transfer = (t - 0.62) / 0.38;
      const lift = Math.sin(transfer * Math.PI) * 1.8;
      const p = mix([10.6, 1.18, -0.9], [11.6, 1.15, -6.1], transfer);
      return [p[0], p[1] + lift, p[2]];
    }
    case "CONVEYOR":
      return mix([11.6, 1.15, -6.1], [13.4, 1.15, -6.1], t);
    case "CMM-01":
      return POSITIONS["CMM-01"];
    case "FINISHED":
      return [POSITIONS.FINISHED[0] + (stackIndex % 3) * 0.45, POSITIONS.FINISHED[1] + Math.floor(stackIndex / 3) * 0.22, POSITIONS.FINISHED[2]];
    case "REJECT":
      return [POSITIONS.REJECT[0], POSITIONS.REJECT[1] + Math.min(stackIndex, 4) * 0.12, POSITIONS.REJECT[2]];
  }
}
