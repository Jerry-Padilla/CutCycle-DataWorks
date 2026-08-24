import { describe, expect, it } from "vitest";
import {
  cncToolpathOffset,
  CONVEYOR_PATH_AXIS,
  CONVEYOR_ROLLER_AXIS,
  conveyorRollerAngleDelta,
  spindleDisplayAngularVelocity,
} from "@/lib/simulation/kinematics";

describe("factory kinematics", () => {
  it("keeps the conveyor roller shaft on local Z, perpendicular to local X travel", () => {
    const dot = CONVEYOR_PATH_AXIS[0] * CONVEYOR_ROLLER_AXIS[0]
      + CONVEYOR_PATH_AXIS[1] * CONVEYOR_ROLLER_AXIS[1]
      + CONVEYOR_PATH_AXIS[2] * CONVEYOR_ROLLER_AXIS[2];
    expect(CONVEYOR_ROLLER_AXIS).toEqual([0, 0, 1]);
    expect(dot).toBe(0);
  });

  it("uses negative Z rotation so the roller top surface moves forward on positive X", () => {
    const omegaZ = conveyorRollerAngleDelta(1, 1);
    const topSurfaceVelocityX = -omegaZ;
    expect(omegaZ).toBeLessThan(0);
    expect(topSurfaceVelocityX).toBeGreaterThan(0);
  });

  it("traverses all four corners of the rectangular CNC toolpath", () => {
    expect(cncToolpathOffset("rectangle", 0)).toEqual([-.32, -.25]);
    expect(cncToolpathOffset("rectangle", 25)).toEqual([.32, -.25]);
    expect(cncToolpathOffset("rectangle", 50)).toEqual([.32, .25]);
    expect(cncToolpathOffset("rectangle", 75)).toEqual([-.32, .25]);
  });

  it("traverses the cardinal points of the elliptical CNC toolpath", () => {
    const points = [0,25,50,75].map((progress) => cncToolpathOffset("circle", progress));
    expect(points[0]).toEqual([.32, 0]);
    expect(points[1][0]).toBeCloseTo(0, 10);
    expect(points[1][1]).toBeCloseTo(.25, 10);
    expect(points[2][0]).toBeCloseTo(-.32, 10);
    expect(points[2][1]).toBeCloseTo(0, 10);
    expect(points[3][0]).toBeCloseTo(0, 10);
    expect(points[3][1]).toBeCloseTo(-.25, 10);
  });

  it("scales spindle telemetry to a bounded visible rotation rate", () => {
    expect(spindleDisplayAngularVelocity(0)).toBe(2);
    expect(spindleDisplayAngularVelocity(8_000)).toBeCloseTo(12.3077, 4);
    expect(spindleDisplayAngularVelocity(20_000)).toBe(18);
  });
});
