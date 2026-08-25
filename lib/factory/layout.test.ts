import { describe, expect, it } from "vitest";
import {
  CMM_STATIONS,
  CNC_LINES,
  FRONT_INFEED_CONVEYORS,
  MAINTENANCE_PLACEMENTS,
  OPERATOR_CELLS,
  REAR_OUTFEED_CONVEYORS,
  SAW_STATIONS,
} from "@/lib/factory/layout";

describe("factory line layout", () => {
  it("places six CNCs on each of two rear outfeed lines", () => {
    expect(CNC_LINES).toHaveLength(2);
    expect(CNC_LINES.map((line) => line.machines.length)).toEqual([6, 6]);
    expect(REAR_OUTFEED_CONVEYORS).toHaveLength(2);

    for (const line of CNC_LINES) {
      const outfeed = REAR_OUTFEED_CONVEYORS.find((conveyor) => conveyor.lineId === line.id);
      expect(outfeed?.position[2]).toBe(line.rearZ);
      expect(outfeed?.length).toBeGreaterThan(18);
    }
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

  it("keeps the infeed in front and the CMM outfeed behind each machine row", () => {
    for (const line of CNC_LINES) {
      const frontDirection = Math.sign(Math.cos(line.rotationY));
      expect(Math.sign(line.frontZ - line.machineZ)).toBe(frontDirection);
      expect(Math.sign(line.rearZ - line.machineZ)).toBe(-frontDirection);
      expect(CMM_STATIONS.some((cmm) => cmm.position[2] === line.rearZ)).toBe(true);

      const machineFrontZ = line.machineZ + frontDirection * 1.325;
      const centralInfeed = FRONT_INFEED_CONVEYORS[0];
      const conveyorEdgeFacingMachine = centralInfeed.position[2] - frontDirection * (centralInfeed.width ?? 1.15) / 2;
      expect(Math.abs(machineFrontZ - conveyorEdgeFacingMachine)).toBeGreaterThan(0.7);
    }
  });

  it("provides service positions at every instrumented machine", () => {
    expect(Object.keys(MAINTENANCE_PLACEMENTS).sort()).toEqual(["CMM-01", "CNC-01", "CNC-02", "ROBOT-01"]);
    expect(MAINTENANCE_PLACEMENTS["CNC-01"].position[2]).toBeGreaterThan(CNC_LINES[0].machineZ);
    expect(MAINTENANCE_PLACEMENTS["CNC-02"].position[2]).toBeGreaterThan(CNC_LINES[0].machineZ);
  });
});
