import { describe, expect, it } from "vitest";
import { FAULT_DEFINITIONS, faultsForKind, getNextFaultDelay } from "@/lib/simulation/faultEngine";

describe("fault engine", () => {
  it("provides the complete CNC and robot fault catalog", () => {
    expect(faultsForKind("CNC").map((item) => item.code)).toEqual(["MTR-104", "CLT-203", "SAF-011"]);
    expect(faultsForKind("ROBOT").map((item) => item.code)).toEqual(["ROB-221", "ROB-310"]);
    expect(FAULT_DEFINITIONS.every((fault) => fault.choices.some((choice) => choice.id === fault.correctChoiceId))).toBe(true);
  });

  it("uses the documented automatic fault windows", () => {
    expect(getNextFaultDelay("OFF")).toBe(Number.POSITIVE_INFINITY);
    expect(getNextFaultDelay("LOW", () => 0)).toBe(240_000);
    expect(getNextFaultDelay("NORMAL", () => 1)).toBe(240_000);
    expect(getNextFaultDelay("HIGH", () => 0)).toBe(45_000);
  });
});
