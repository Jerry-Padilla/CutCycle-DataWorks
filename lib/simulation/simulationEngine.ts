import { CMM_STATIONS, CNC_LINES, OPERATOR_CELLS, ROBOT_STATIONS } from "@/lib/factory/layout";
import { cncServicedPartPosition, type OperatorPath } from "@/lib/simulation/operatorKinematics";
import { rawStockPosition } from "@/lib/simulation/stockFlow";
import { liveTransferRobotPose, robotBaseRotationToward, robotEndEffectorPosition } from "@/lib/simulation/robotKinematics";
import type { CncStationId, Part } from "@/types/factory";

export type FactoryPosition = [number, number, number];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const mix = (from: FactoryPosition, to: FactoryPosition, progress: number): FactoryPosition => [
  lerp(from[0], to[0], progress),
  lerp(from[1], to[1], progress),
  lerp(from[2], to[2], progress),
];

function cncPlacement(cncId: CncStationId) {
  const line = CNC_LINES.find((candidate) => candidate.machines.some((machine) => machine.label === cncId)) ?? CNC_LINES[0];
  const cell = OPERATOR_CELLS.find((candidate) => candidate.machines.some((machine) => machine.label === cncId)) ?? OPERATOR_CELLS[0];
  const machineIndex = Math.max(0, cell.machines.findIndex((machine) => machine.label === cncId));
  const path: OperatorPath = {
    machineXs: cell.machines.map((machine) => machine.position[0]),
    machineZ: cell.machineZ,
    infeedZ: cell.infeedZ,
    rotationY: cell.rotationY,
  };
  const machine = line.machines.find((candidate) => candidate.label === cncId) ?? line.machines[0];
  return { path, machineIndex, pickupX: machine.position[0] - 0.45 * Math.cos(machine.rotationY), laneZ: line.frontZ };
}

function cmmPosition(part: Part): FactoryPosition {
  const cmm = CMM_STATIONS.find((station) => station.label === part.assignedCmm) ?? CMM_STATIONS[0];
  return [cmm.position[0], 1.1, cmm.position[2]];
}

function robotPosition(part: Part): FactoryPosition {
  const robot = ROBOT_STATIONS.find((station) => station.label === part.assignedRobot) ?? ROBOT_STATIONS[0];
  return [robot.position[0], 1.2, robot.position[2]];
}

export function getPartPosition(part: Part, stackIndex = 0): FactoryPosition {
  const t = Math.min(1, Math.max(0, part.progress / 100));
  const cnc = cncPlacement(part.assignedCnc);
  if (part.currentStation === "RAW") return rawStockPosition(t, cnc.pickupX, cnc.laneZ);
  if (part.currentStation.startsWith("CNC-")) return cncServicedPartPosition(cnc.path, cnc.machineIndex, t);
  if (part.currentStation === "CONVEYOR") {
    const conveyorStart = cncServicedPartPosition(cnc.path, cnc.machineIndex, 1);
    return mix(conveyorStart, [10.6, 1.3, cnc.laneZ], t);
  }
  if (part.currentStation.startsWith("ROBOT-")) {
    const robot = ROBOT_STATIONS.find((station) => station.label === part.assignedRobot) ?? ROBOT_STATIONS[0];
    const target = cmmPosition(part);
    const pickup: FactoryPosition = [10.6, 1.3, cnc.laneZ];
    const pose = liveTransferRobotPose(t, robotBaseRotationToward(robot.position, pickup), robotBaseRotationToward(robot.position, target));
    return robotEndEffectorPosition(robot.position, pose);
  }
  if (part.currentStation.startsWith("CMM-")) return cmmPosition(part);
  if (part.currentStation === "FINISHED") {
    const target = cmmPosition(part);
    return [target[0] + (stackIndex % 2) * 0.38, target[1] + Math.floor(stackIndex / 2) * 0.18, target[2]];
  }
  const robot = robotPosition(part);
  return [robot[0], 0.75 + Math.min(stackIndex, 4) * 0.12, part.lineId === "south" ? -8.2 : 8.2];
}
