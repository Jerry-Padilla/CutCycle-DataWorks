import { describe, expect, it } from "vitest";
import {
  CMM_STATIONS,
  CNC_LINES,
  FRONT_INFEED_CONVEYORS,
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

  it("keeps two saw-fed front branches on each CNC line", () => {
    expect(FRONT_INFEED_CONVEYORS).toHaveLength(4);
    expect(SAW_STATIONS).toHaveLength(4);

    for (const line of CNC_LINES) {
      expect(FRONT_INFEED_CONVEYORS.filter((conveyor) => conveyor.lineId === line.id)).toHaveLength(2);
      expect(SAW_STATIONS.filter((saw) => saw.lineId === line.id)).toHaveLength(2);
    }
  });

  it("keeps the infeed in front and the CMM outfeed behind each machine row", () => {
    for (const line of CNC_LINES) {
      const frontDirection = Math.sign(Math.cos(line.rotationY));
      expect(Math.sign(line.frontZ - line.machineZ)).toBe(frontDirection);
      expect(Math.sign(line.rearZ - line.machineZ)).toBe(-frontDirection);
      expect(CMM_STATIONS.some((cmm) => cmm.position[2] === line.rearZ)).toBe(true);
    }
  });
});
