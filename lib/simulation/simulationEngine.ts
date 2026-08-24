import type { Part, StationId } from "@/types/factory";

export type FactoryPosition = [number, number, number];

const POSITIONS: Record<StationId, FactoryPosition> = {
  RAW: [-12.4, 1.2, -4.2],
  "CNC-01": [-8.9, 1.2, -4.2],
  "CNC-02": [-5.3, 1.2, -4.2],
  CONVEYOR: [2.7, 1.15, -1.1],
  "ROBOT-01": [7.4, 1.2, 0],
  "CMM-01": [10.2, 1.1, -3],
  FINISHED: [13.4, 1.3, 4.6],
  REJECT: [7.4, 0.75, 5],
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
      return mix(POSITIONS["CNC-01"], [-7.7, 1.2, -4.2], t);
    case "CNC-02":
      return mix(POSITIONS["CNC-02"], [-4.1, 1.2, -4.2], t);
    case "CONVEYOR":
      return mix([-1.25, 1.15, -1.1], [6.65, 1.15, -1.1], t);
    case "ROBOT-01": {
      const lift = Math.sin(t * Math.PI) * 1.8;
      const p = mix([6.65, 1.15, -1.1], [9.5, 1.25, -2.6], t);
      return [p[0], p[1] + lift, p[2]];
    }
    case "CMM-01":
      return POSITIONS["CMM-01"];
    case "FINISHED":
      return [POSITIONS.FINISHED[0] + (stackIndex % 3) * 0.45, POSITIONS.FINISHED[1] + Math.floor(stackIndex / 3) * 0.22, POSITIONS.FINISHED[2]];
    case "REJECT":
      return [POSITIONS.REJECT[0], POSITIONS.REJECT[1] + Math.min(stackIndex, 4) * 0.12, POSITIONS.REJECT[2]];
  }
}
