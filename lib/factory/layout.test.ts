import { describe, expect, it } from "vitest";
import {
  CMM_STATIONS,
  CNC_LINES,
  FRONT_INFEED_CONVEYORS,
  MAINTENANCE_PLACEMENTS,
  OPERATOR_CELLS,
  ROBOT_STATIONS,
  SAW_STATIONS,
} from "@/lib/factory/layout";

describe("factory line layout", () => {
  it("places six CNCs on each side of the shared front conveyor", () => {
    expect(CNC_LINES).toHaveLength(2);
    expect(CNC_LINES.map((line) => line.machines.length)).toEqual([6, 6]);
  });

  it("uses two saws at the end of one combined central infeed conveyor", () => {
    expect(FRONT_INFEED_CONVEYORS).toHaveLength(1);
    expect(FRONT_INFEED_CONVEYORS[0]).toMatchObject({ lineId: "central", length: 24, width: 3, infeedLanes: 2 });
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
    const centralInfeed = FRONT_INFEED_CONVEYORS[0];
    for (const line of CNC_LINES) {
      const frontDirection = Math.sign(Math.cos(line.rotationY));
      expect(Math.sign(line.frontZ - line.machineZ)).toBe(frontDirection);

      const machineFrontZ = line.machineZ + frontDirection * 1.325;
      const conveyorEdgeFacingMachine = centralInfeed.position[2] - frontDirection * (centralInfeed.width ?? 1.15) / 2;
      expect(Math.abs(machineFrontZ - conveyorEdgeFacingMachine)).toBeGreaterThan(0.7);
    }
    expect(CMM_STATIONS.find((cmm) => cmm.instrumented)?.position[0]).toBeGreaterThan(12);
  });

  it("gives each of two robots one front and two 45-degree CMM stations", () => {
    expect(ROBOT_STATIONS).toHaveLength(2);
    expect(CMM_STATIONS).toHaveLength(6);

    for (const robot of ROBOT_STATIONS) {
      const cmmFan = CMM_STATIONS.filter((cmm) => cmm.robotLabel === robot.label);
      expect(cmmFan).toHaveLength(3);
      expect(cmmFan.map((cmm) => cmm.serviceAngle).sort((a, b) => a - b)).toEqual([
        -Math.PI / 4,
        0,
        Math.PI / 4,
      ]);
      for (const cmm of cmmFan) {
        const reach = Math.hypot(cmm.position[0] - robot.position[0], cmm.position[2] - robot.position[2]);
        expect(reach).toBeCloseTo(3.3);
      }
    }
  });

  it("provides service positions at every instrumented machine", () => {
    expect(Object.keys(MAINTENANCE_PLACEMENTS).sort()).toEqual(["CMM-01", "CNC-01", "CNC-02", "ROBOT-01"]);
    expect(MAINTENANCE_PLACEMENTS["CNC-01"].position[2]).toBeGreaterThan(CNC_LINES[0].machineZ);
    expect(MAINTENANCE_PLACEMENTS["CNC-02"].position[2]).toBeGreaterThan(CNC_LINES[0].machineZ);
  });
});
