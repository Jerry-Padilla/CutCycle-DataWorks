import { describe, expect, it } from "vitest";
import { liveTransferRobotPose, restRobotPose, serviceRobotPose } from "@/lib/simulation/robotKinematics";

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
});
