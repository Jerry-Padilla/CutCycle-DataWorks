import type { MachineId } from "@/types/factory";

export type FactoryVector = [number, number, number];

export interface CncLayout {
  label: string;
  position: FactoryVector;
  rotationY: number;
  instrumentedId?: Extract<MachineId, "CNC-01" | "CNC-02">;
}

export interface CncLineLayout {
  id: "south" | "north";
  machineZ: number;
  frontZ: number;
  rotationY: number;
  machines: CncLayout[];
}

export interface ConveyorLayout {
  id: string;
  lineId: CncLineLayout["id"] | "central";
  position: FactoryVector;
  length: number;
  width?: number;
  infeedLanes?: number;
}

export interface OperatorCellLayout {
  id: string;
  lineId: CncLineLayout["id"];
  phaseOffset: number;
  machineZ: number;
  infeedZ: number;
  rotationY: number;
  machines: CncLayout[];
}

export interface MaintenancePlacement {
  position: FactoryVector;
  rotationY: number;
}

const CNC_X_POSITIONS = [-9, -5.4, -1.8, 1.8, 5.4, 9];

function createMachines(
  labels: string[],
  z: number,
  rotationY: number,
  instrumentedIds: Partial<Record<string, CncLayout["instrumentedId"]>> = {},
): CncLayout[] {
  return labels.map((label, index) => ({
    label,
    position: [CNC_X_POSITIONS[index], 0, z],
    rotationY,
    instrumentedId: instrumentedIds[label],
  }));
}

export const CNC_LINES: CncLineLayout[] = [
  {
    id: "south",
    machineZ: -4.2,
    frontZ: -0.9,
    rotationY: 0,
    machines: createMachines(
      ["CNC-01", "CNC-02", "CNC-03", "CNC-04", "CNC-05", "CNC-06"],
      -4.2,
      0,
      { "CNC-01": "CNC-01", "CNC-02": "CNC-02" },
    ),
  },
  {
    id: "north",
    machineZ: 4.2,
    frontZ: 0.9,
    rotationY: Math.PI,
    machines: createMachines(
      ["CNC-07", "CNC-08", "CNC-09", "CNC-10", "CNC-11", "CNC-12"],
      4.2,
      Math.PI,
    ),
  },
];

export const FRONT_INFEED_CONVEYORS: ConveyorLayout[] = [{
  id: "central-front-infeed",
  lineId: "central",
  position: [0, 0.78, 0],
  length: 24,
  width: 3,
  infeedLanes: 2,
}];

export const SAW_STATIONS: { label: string; lineId: CncLineLayout["id"]; position: FactoryVector }[] = CNC_LINES.map(
  (line, index) => ({
    label: `SAW-${String(index + 1).padStart(2, "0")}`,
    lineId: line.id,
    position: [-13.5, 0, line.id === "south" ? -1 : 1],
  }),
);

export const OPERATOR_CELLS: OperatorCellLayout[] = CNC_LINES.flatMap((line, lineIndex) =>
  [0, 1, 2].map((branchIndex) => ({
    id: `OP-${String(lineIndex * 3 + branchIndex + 1).padStart(2, "0")}`,
    lineId: line.id,
    phaseOffset: (lineIndex * 3 + branchIndex) * 0.13,
    machineZ: line.machineZ,
    infeedZ: line.frontZ,
    rotationY: line.rotationY,
    machines: line.machines.slice(branchIndex * 2, branchIndex * 2 + 2),
  })),
);

export const CMM_STATIONS: { label: string; position: FactoryVector; instrumented: boolean }[] = [
  { label: "CMM-01", position: [14.2, 0, -4.7], instrumented: true },
  { label: "CMM-02", position: [14, 0, 0], instrumented: false },
  { label: "CMM-03", position: [14.2, 0, 4.7], instrumented: false },
];

export const MAINTENANCE_PLACEMENTS: Record<MachineId, MaintenancePlacement> = {
  "CNC-01": { position: [-8.1, 0, -2.38], rotationY: Math.PI },
  "CNC-02": { position: [-4.5, 0, -2.38], rotationY: Math.PI },
  "ROBOT-01": { position: [13.05, 0, -2.25], rotationY: -2.3 },
  "CMM-01": { position: [13.1, 0, -5.95], rotationY: 0 },
};
