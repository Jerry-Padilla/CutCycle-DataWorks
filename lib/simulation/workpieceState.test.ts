import { describe, expect, it } from "vitest";
import { hasFinishedMachining } from "@/lib/simulation/workpieceState";
import type { CncStationId } from "@/types/factory";

describe("workpiece visual state", () => {
  it("keeps the raw billet through loading and machining on every CNC", () => {
    for (let number = 1; number <= 12; number += 1) {
      const currentStation = `CNC-${String(number).padStart(2, "0")}` as CncStationId;
      expect(hasFinishedMachining({ currentStation, progress: 0 })).toBe(false);
      expect(hasFinishedMachining({ currentStation, progress: 55 })).toBe(false);
      expect(hasFinishedMachining({ currentStation, progress: 99.9 })).toBe(false);
    }
  });

  it("reveals the finished geometry only after machining completes", () => {
    expect(hasFinishedMachining({ currentStation: "CNC-08", progress: 100 })).toBe(true);
    expect(hasFinishedMachining({ currentStation: "CONVEYOR", progress: 0 })).toBe(true);
    expect(hasFinishedMachining({ currentStation: "CMM-04", progress: 0 })).toBe(true);
  });
});
