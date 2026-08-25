import { describe, expect, it } from "vitest";
import { createPart } from "@/lib/simulation/productionEngine";
import { getPartPosition } from "@/lib/simulation/simulationEngine";
import type { Part, StationId } from "@/types/factory";

function expectPositionClose(actual: [number, number, number], expected: [number, number, number]) {
  actual.forEach((coordinate, index) => expect(coordinate).toBeCloseTo(expected[index]));
}

function partAt(station: StationId, progress: number): Part {
  return {
    ...createPart(1, 0),
    currentStation: station,
    status: station === "FINISHED" ? "COMPLETE" : "MOVING",
    progress,
  };
}

describe("3D part routing", () => {
  it("joins the CNC unload, shared conveyor, robot, and right CMM without a rear transfer", () => {
    const cncUnload = getPartPosition(partAt("CNC-02", 100));
    const conveyorStart = getPartPosition(partAt("CONVEYOR", 0));
    const conveyorEnd = getPartPosition(partAt("CONVEYOR", 100));
    const robotStart = getPartPosition(partAt("ROBOT-01", 0));
    const robotMidpoint = getPartPosition(partAt("ROBOT-01", 50));
    const robotEnd = getPartPosition(partAt("ROBOT-01", 100));
    const inspection = getPartPosition(partAt("CMM-01", 0));
    const finished = getPartPosition(partAt("FINISHED", 0));

    expectPositionClose(cncUnload, [-5.85, 1.3, -0.9]);
    expect(conveyorStart[0]).toBeCloseTo(cncUnload[0]);
    expect(conveyorStart[2]).toBeCloseTo(cncUnload[2]);
    expectPositionClose(conveyorEnd, robotStart);
    expect(robotMidpoint[1]).toBeGreaterThan(robotStart[1]);
    expectPositionClose(robotEnd, inspection);
    expectPositionClose(finished, inspection);
    expect(inspection[0]).toBeGreaterThan(12);
  });
});
