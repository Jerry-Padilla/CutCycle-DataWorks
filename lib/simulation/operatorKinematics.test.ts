import { describe, expect, it } from "vitest";
import {
  cncServicedPartPosition,
  frontLoadPartPosition,
  frontUnloadPartPosition,
  operatorIdlePose,
  operatorPoseAtPhase,
  type OperatorPath,
} from "@/lib/simulation/operatorKinematics";

const southPath: OperatorPath = { machineXs: [-9, -5.4], machineZ: -4.2, infeedZ: -0.9, rotationY: 0 };
const northPath: OperatorPath = { machineXs: [-9, -5.4], machineZ: 4.2, infeedZ: 0.9, rotationY: Math.PI };

describe("operator front-loading kinematics", () => {
  it("moves a staged part from the front conveyor into the south CNC workholding", () => {
    const staged = frontLoadPartPosition(southPath, 0, 0);
    const lifted = frontLoadPartPosition(southPath, 0, 0.35);
    const loaded = frontLoadPartPosition(southPath, 0, 1);

    expect(staged[2]).toBe(southPath.infeedZ);
    expect(lifted[1]).toBeGreaterThan(staged[1]);
    expect(loaded[2]).toBeLessThan(staged[2]);
    expect(loaded).toEqual([-9.45, 0.98, -2.72]);
  });

  it("mirrors the front-loading path for the north-facing CNC row", () => {
    const staged = frontLoadPartPosition(northPath, 0, 0);
    const loaded = frontLoadPartPosition(northPath, 0, 1);

    expect(loaded[2]).toBeGreaterThan(staged[2]);
    expect(loaded[0]).toBeCloseTo(-8.55);
    expect(loaded[2]).toBeCloseTo(2.72);
  });

  it("positions the operator between the infeed and machine while loading", () => {
    const pose = operatorPoseAtPhase(southPath, 1, 0.55);
    expect(pose.operatorPosition[2]).toBeLessThan(southPath.infeedZ);
    expect(pose.operatorPosition[2]).toBeGreaterThan(southPath.machineZ);
    expect(pose.reach).toBeGreaterThan(0.9);
  });

  it("returns the completed part through the front door to the same conveyor lane", () => {
    const machined = frontUnloadPartPosition(southPath, 1, 0);
    const held = frontUnloadPartPosition(southPath, 1, 0.65);
    const returned = frontUnloadPartPosition(southPath, 1, 1);

    expect(held[2]).toBeGreaterThan(machined[2]);
    expect(held[1]).toBeGreaterThan(machined[1]);
    expect(returned[0]).toBeCloseTo(-5.85);
    expect(returned[1]).toBeCloseTo(1.3);
    expect(returned[2]).toBeCloseTo(southPath.infeedZ);
    expect(cncServicedPartPosition(southPath, 1, 1)).toEqual(returned);
  });

  it("keeps an unassigned operator idle without a pretend workpiece", () => {
    const pose = operatorIdlePose(southPath);
    expect(pose.operatorPosition[0]).toBe(-7.2);
    expect(pose.partVisible).toBe(false);
    expect(pose.reach).toBe(0);
  });
});
