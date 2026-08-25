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
  rearZ: number;
  rotationY: number;
  machines: CncLayout[];
}

export interface ConveyorLayout {
  id: string;
  lineId: CncLineLayout["id"];
  position: FactoryVector;
  length: number;
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
    frontZ: -1.5,
    rearZ: -6.1,
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
    frontZ: 1.5,
    rearZ: 6.1,
    rotationY: Math.PI,
    machines: createMachines(
      ["CNC-07", "CNC-08", "CNC-09", "CNC-10", "CNC-11", "CNC-12"],
      4.2,
      Math.PI,
    ),
  },
];

export const REAR_OUTFEED_CONVEYORS: ConveyorLayout[] = CNC_LINES.map((line) => ({
  id: `${line.id}-rear-outfeed`,
  lineId: line.id,
  position: [0, 0.78, line.rearZ],
  length: 24,
}));

export const FRONT_INFEED_CONVEYORS: ConveyorLayout[] = CNC_LINES.flatMap((line) =>
  [-5.4, 5.4].map((x, index) => ({
    id: `${line.id}-front-infeed-${index + 1}`,
    lineId: line.id,
    position: [x, 0.78, line.frontZ] as FactoryVector,
    length: 10.4,
  })),
);

export const SAW_STATIONS: { label: string; lineId: CncLineLayout["id"]; position: FactoryVector }[] = CNC_LINES.flatMap(
  (line, lineIndex) => [-12, -1.2].map((x, branchIndex) => ({
    label: `SAW-${String(lineIndex * 2 + branchIndex + 1).padStart(2, "0")}`,
    lineId: line.id,
    position: [x, 0, line.frontZ] as FactoryVector,
  })),
);

export const OPERATOR_CELLS: OperatorCellLayout[] = CNC_LINES.flatMap((line, lineIndex) =>
  [0, 1].map((branchIndex) => ({
    id: `OP-${String(lineIndex * 2 + branchIndex + 1).padStart(2, "0")}`,
    lineId: line.id,
    phaseOffset: (lineIndex * 2 + branchIndex) * 0.19,
    machineZ: line.machineZ,
    infeedZ: line.frontZ,
    rotationY: line.rotationY,
    machines: line.machines.slice(branchIndex * 3, branchIndex * 3 + 3),
  })),
);

export const CMM_STATIONS: { label: string; position: FactoryVector; instrumented: boolean }[] = [
  { label: "CMM-01", position: [14, 0, -6.1], instrumented: true },
  { label: "CMM-02", position: [14, 0, 0], instrumented: false },
  { label: "CMM-03", position: [14, 0, 6.1], instrumented: false },
];
