import { describe, expect, it } from "vitest";
import { liveTransferRobotPose, restRobotPose, robotBaseRotationToward, robotEndEffectorPosition, serviceRobotPose } from "@/lib/simulation/robotKinematics";

describe("robot arm kinematics", () => {
  it("rests in a lowered working pose instead of pointing upward", () => {
    const rest = restRobotPose();
    expect(rest.shoulderRotation).toBeLessThan(-1);
    expect(rest.elbowRotation).toBeLessThan(-0.8);
  });

  it("lifts during transfer and lowers again at the front CMM", () => {
    const pickup = liveTransferRobotPose(0);
    const lifted = liveTransferRobotPose(0.5);
    const placed = liveTransferRobotPose(1);
    expect(pickup.baseRotation).toBeCloseTo(-2.08);
    expect(lifted.shoulderRotation).toBeGreaterThan(pickup.shoulderRotation);
    expect(placed.baseRotation).toBeCloseTo(0);
    expect(placed.shoulderRotation).toBeCloseTo(pickup.shoulderRotation);
  });

  it("services the left, front, and right CMM angles", () => {
    expect(serviceRobotPose(0).baseRotation).toBeCloseTo(Math.PI / 4);
    expect(serviceRobotPose(4).baseRotation).toBeCloseTo(0);
    expect(serviceRobotPose(8).baseRotation).toBeCloseTo(-Math.PI / 4);
  });

  it("aims at the assigned CMM and keeps the payload at the jaws", () => {
    const robot: [number, number, number] = [12, 0, -4.5];
    const left: [number, number, number] = [15.3, 1.1, -7.4];
    const center: [number, number, number] = [15.3, 1.1, -4.5];
    const right: [number, number, number] = [15.3, 1.1, -1.6];
    const rotations = [left, center, right].map((target) => robotBaseRotationToward(robot, target));
    expect(rotations[0]).toBeGreaterThan(rotations[1]);
    expect(rotations[1]).toBeCloseTo(0);
    expect(rotations[2]).toBeLessThan(rotations[1]);
    const endpoints = rotations.map((rotation) => robotEndEffectorPosition(robot, liveTransferRobotPose(1, 0, rotation)));
    expect(endpoints[0][2]).toBeLessThan(endpoints[1][2]);
    expect(endpoints[2][2]).toBeGreaterThan(endpoints[1][2]);
  });
});
