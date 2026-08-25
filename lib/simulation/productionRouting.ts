import type { CmmStationId, CncStationId, ProductionLineId, RobotStationId } from "@/types/factory";

export interface ProductionRoute {
  assignedCnc: CncStationId;
  assignedRobot: RobotStationId;
  assignedCmm: CmmStationId;
  lineId: ProductionLineId;
}

export const CNC_STATIONS: readonly CncStationId[] = [
  "CNC-01", "CNC-02", "CNC-03", "CNC-04", "CNC-05", "CNC-06",
  "CNC-07", "CNC-08", "CNC-09", "CNC-10", "CNC-11", "CNC-12",
];

const SOUTH_CMMS: readonly CmmStationId[] = ["CMM-01", "CMM-02", "CMM-03"];
const NORTH_CMMS: readonly CmmStationId[] = ["CMM-04", "CMM-05", "CMM-06"];

export function createProductionRoute(sequence: number): ProductionRoute {
  const slot = ((sequence - 1) % CNC_STATIONS.length + CNC_STATIONS.length) % CNC_STATIONS.length;
  const lineId: ProductionLineId = slot % 2 === 0 ? "south" : "north";
  const lineIndex = Math.floor(slot / 2);
  const assignedCnc = CNC_STATIONS[(lineId === "south" ? 0 : 6) + lineIndex];
  return {
    assignedCnc,
    lineId,
    assignedRobot: lineId === "south" ? "ROBOT-01" : "ROBOT-02",
    assignedCmm: (lineId === "south" ? SOUTH_CMMS : NORTH_CMMS)[lineIndex % 3],
  };
}
