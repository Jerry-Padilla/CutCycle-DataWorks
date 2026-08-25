import { describe, expect, it } from "vitest";
import { deriveEquipmentStatus } from "@/lib/simulation/equipmentStatus";
import { createInitialMachines } from "@/lib/simulation/machineTypes";
import { createPart } from "@/lib/simulation/productionEngine";

describe("equipment status reporting", () => {
  it("shows fault codes and engineering messages for stopped machines", () => {
    const machines = createInitialMachines();
    machines["CNC-01"].status = "FAULT";
    const rows = deriveEquipmentStatus({ machines, parts: [], paused: false, activeFaults: { "CNC-01": { machineId: "CNC-01", code: "MTR-104", occurredAt: 0, diagnosed: false, selectedChoiceId: null, answerCorrect: null } } });
    expect(rows[0]).toMatchObject({ id: "CNC-01", condition: "FAULT" });
    expect(rows[0].reason).toContain("MTR-104 · Spindle Overcurrent");
  });

  it("identifies a completed CNC cycle blocked by downstream capacity", () => {
    const part = { ...createPart(1, 0), currentStation: "CNC-08" as const, progress: 100 };
    const rows = deriveEquipmentStatus({ machines: createInitialMachines(), parts: [part], paused: false, activeFaults: {} });
    expect(rows.find((row) => row.id === "CNC-08")).toMatchObject({ condition: "BLOCKED", currentPart: part.serialNumber });
  });
});
