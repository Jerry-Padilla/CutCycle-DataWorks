import { describe, expect, it } from "vitest";
import {
  CMM_STATIONS,
  CNC_LINES,
  FACTORY_SIGNAGE,
  FRONT_INFEED_CONVEYORS,
  MAINTENANCE_PLACEMENTS,
  OPERATOR_CELLS,
  ROBOT_STATIONS,
  SAW_STATIONS,
  SHIPPING_DEPOT_POSITION,
} from "@/lib/factory/layout";

describe("factory line layout", () => {
  it("places six CNCs on each side of the parallel front conveyors", () => {
    expect(CNC_LINES).toHaveLength(2);
    expect(CNC_LINES.map((line) => line.machines.length)).toEqual([6, 6]);
  });

  it("uses two saws and two distinct parallel infeed conveyors", () => {
    expect(FRONT_INFEED_CONVEYORS).toHaveLength(2);
    expect(FRONT_INFEED_CONVEYORS.map((conveyor) => conveyor.lineId)).toEqual(["south", "north"]);
    expect(FRONT_INFEED_CONVEYORS.every((conveyor) => conveyor.length === 24 && conveyor.width === 1.15)).toBe(true);
    expect(SAW_STATIONS).toHaveLength(2);
    expect(SAW_STATIONS.every((saw) => saw.position[0] < -12)).toBe(true);
    expect(new Set(SAW_STATIONS.map((saw) => saw.lineId))).toEqual(new Set(["south", "north"]));
  });

  it("assigns one front-loading operator to every two CNCs", () => {
    expect(OPERATOR_CELLS).toHaveLength(6);
    expect(OPERATOR_CELLS.every((cell) => cell.machines.length === 2)).toBe(true);
    expect(new Set(OPERATOR_CELLS.flatMap((cell) => cell.machines.map((machine) => machine.label))).size).toBe(12);
  });

  it("keeps both conveyor lanes in front and the production CMM to the right", () => {
    for (const line of CNC_LINES) {
      const lineConveyor = FRONT_INFEED_CONVEYORS.find((conveyor) => conveyor.lineId === line.id);
      expect(lineConveyor).toBeDefined();
      const frontDirection = Math.sign(Math.cos(line.rotationY));
      expect(Math.sign(line.frontZ - line.machineZ)).toBe(frontDirection);

      const machineFrontZ = line.machineZ + frontDirection * 1.325;
      const conveyorEdgeFacingMachine = lineConveyor!.position[2] - frontDirection * (lineConveyor!.width ?? 1.15) / 2;
      expect(Math.abs(machineFrontZ - conveyorEdgeFacingMachine)).toBeGreaterThan(0.7);
    }
    expect(CMM_STATIONS.find((cmm) => cmm.instrumented)?.position[0]).toBeGreaterThan(12);
  });

  it("places a straight, evenly spaced bank of three CMMs behind each robot", () => {
    expect(ROBOT_STATIONS).toHaveLength(2);
    expect(CMM_STATIONS).toHaveLength(6);

    for (const robot of ROBOT_STATIONS) {
      const bank = CMM_STATIONS.filter((cmm) => cmm.robotLabel === robot.label);
      expect([...bank].sort((a, b) => a.position[2] - b.position[2]).map((cmm) => cmm.label)).toEqual(bank.map((cmm) => cmm.label));
      expect(bank).toHaveLength(3);
      expect(new Set(bank.map((cmm) => cmm.position[0])).size).toBe(1);
      expect(bank.map((cmm) => cmm.position[2]).sort((a, b) => a - b)).toEqual([
        robot.position[2] - 2.9,
        robot.position[2],
        robot.position[2] + 2.9,
      ]);
    }
  });

  it("provides service positions at every instrumented machine", () => {
    expect(Object.keys(MAINTENANCE_PLACEMENTS).sort()).toEqual(["CMM-01", "CNC-01", "CNC-02", "ROBOT-01"]);
    expect(MAINTENANCE_PLACEMENTS["CNC-01"].position[2]).toBeGreaterThan(CNC_LINES[0].machineZ);
    expect(MAINTENANCE_PLACEMENTS["CNC-02"].position[2]).toBeGreaterThan(CNC_LINES[0].machineZ);
  });

  it("defines the named shop departments and an outbound shipping depot", () => {
    expect(FACTORY_SIGNAGE.map((sign) => sign.label)).toEqual([
      "JERRY'S AUTOMATED MACHINE SHOP",
      "SAW DEPARTMENT",
      "CNC MILLING · SOUTH LINE",
      "CNC MILLING · NORTH LINE",
      "SHIPPING DEPOT",
    ]);
    expect(SHIPPING_DEPOT_POSITION[0]).toBeGreaterThan(CMM_STATIONS[0].position[0]);
  });
});
