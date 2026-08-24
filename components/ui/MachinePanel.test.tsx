import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { DiagnosisPanel } from "@/components/ui/DiagnosisPanel";
import { MachinePanel } from "@/components/ui/MachinePanel";
import { createInitialMachines } from "@/lib/simulation/machineTypes";
import { useFactoryStore } from "@/store/useFactoryStore";

describe("machine interaction panels", () => {
  afterEach(cleanup);
  beforeEach(() => {
    useFactoryStore.setState({ machines: createInitialMachines(), selectedMachineId: "CNC-01", activeFaults: {}, diagnosingMachineId: null });
  });

  it("shows relevant start controls for an idle machine", () => {
    const machines = createInitialMachines();
    machines["CNC-01"].status = "IDLE";
    useFactoryStore.setState({ machines });
    render(<MachinePanel />);
    fireEvent.click(screen.getByRole("button", { name: /start machine/i }));
    expect(useFactoryStore.getState().machines["CNC-01"].status).toBe("RUNNING");
  });

  it("requires a correct diagnosis before repair", () => {
    act(() => useFactoryStore.getState().triggerFault("CNC-01", "MTR-104"));
    render(<><MachinePanel /><DiagnosisPanel /></>);
    fireEvent.click(screen.getByRole("button", { name: /diagnose/i }));
    const repair = screen.getByRole("button", { name: /perform repair/i });
    expect(repair).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: /inspect spindle motor/i }));
    expect(repair).toBeEnabled();
    fireEvent.click(repair);
    expect(useFactoryStore.getState().machines["CNC-01"].status).toBe("IDLE");
    expect(useFactoryStore.getState().activeFaults["CNC-01"]).toBeUndefined();
  });
});
