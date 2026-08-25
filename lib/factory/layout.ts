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

export interface RobotLayout {
  label: "ROBOT-01" | "ROBOT-02";
  position: FactoryVector;
  instrumented: boolean;
  phaseOffsetSeconds: number;
}

export interface CmmLayout {
  label: string;
  position: FactoryVector;
  rotationY: number;
  instrumented: boolean;
  robotLabel: RobotLayout["label"];
  bankIndex: 0 | 1 | 2;
}

export interface FactorySignLayout {
  id: string;
  label: string;
  position: FactoryVector;
  width: number;
  accent: string;
  primary?: boolean;
  rotationY?: number;
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

export const FRONT_INFEED_CONVEYORS: ConveyorLayout[] = [
  { id: "south-front-infeed", lineId: "south", position: [0, 0.78, -0.8], length: 24, width: 1.15, infeedLanes: 1 },
  { id: "north-front-infeed", lineId: "north", position: [0, 0.78, 0.8], length: 24, width: 1.15, infeedLanes: 1 },
];

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

export const ROBOT_STATIONS: RobotLayout[] = [
  { label: "ROBOT-01", position: [12, 0, -4.5], instrumented: true, phaseOffsetSeconds: 0 },
  { label: "ROBOT-02", position: [12, 0, 4.5], instrumented: false, phaseOffsetSeconds: 6 },
];

const CMM_BANK_X = 15.3;
const CMM_BANK_OFFSETS = [0, -2.9, 2.9] as const;

function createCmmBank(robot: RobotLayout, firstNumber: number): CmmLayout[] {
  return CMM_BANK_OFFSETS.map((offset, index) => ({
    label: `CMM-${String(firstNumber + index).padStart(2, "0")}`,
    position: [CMM_BANK_X, 0, robot.position[2] + offset],
    rotationY: 0,
    instrumented: robot.instrumented && index === 0,
    robotLabel: robot.label,
    bankIndex: index as 0 | 1 | 2,
  }));
}

export const CMM_STATIONS: CmmLayout[] = [
  ...createCmmBank(ROBOT_STATIONS[0], 1),
  ...createCmmBank(ROBOT_STATIONS[1], 4),
];

export const SHIPPING_DEPOT_POSITION: FactoryVector = [20, 0, 0];

export const FACTORY_SIGNAGE: FactorySignLayout[] = [
  { id: "shop", label: "JERRY'S AUTOMATED MACHINE SHOP", position: [-2, 6.1, -9.8], width: 10.5, accent: "#5eb7e8", primary: true },
  { id: "saw", label: "SAW DEPARTMENT", position: [-13.2, 3.65, 0], width: 4.2, accent: "#38c6b4" },
  { id: "cnc", label: "CNC DEPARTMENT", position: [0, 4.3, -5.75], width: 4.6, accent: "#5eb7e8" },
  { id: "milling", label: "MILLING DEPARTMENT", position: [0, 4.3, 5.75], width: 5.2, accent: "#d6ad45" },
  { id: "shipping", label: "SHIPPING DEPOT", position: [22.78, 4.25, 0], width: 5.4, accent: "#55d995", rotationY: Math.PI / 2 },
];

export const MAINTENANCE_PLACEMENTS: Record<MachineId, MaintenancePlacement> = {
  "CNC-01": { position: [-8.1, 0, -2.38], rotationY: Math.PI },
  "CNC-02": { position: [-4.5, 0, -2.38], rotationY: Math.PI },
  "ROBOT-01": { position: [10.95, 0, -4.55], rotationY: -0.8 },
  "CMM-01": { position: [14.35, 0, -4.7], rotationY: 0 },
};
