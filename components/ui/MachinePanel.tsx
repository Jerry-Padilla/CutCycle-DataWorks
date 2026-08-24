"use client";

import { AlertTriangle, Play, Square, Wrench, X, Zap } from "lucide-react";
import { faultsForKind, getFaultDefinition } from "@/lib/simulation/faultEngine";
import { useFactoryStore } from "@/store/useFactoryStore";
import type { MachineRuntime } from "@/types/factory";

function telemetryCards(machine: MachineRuntime): { label: string; value: string }[] {
  const telemetry = machine.telemetry;
  if (telemetry.kind === "CNC") return [
    { label: "Spindle RPM", value: Math.round(telemetry.spindleRpm).toLocaleString() },
    { label: "Spindle load", value: `${telemetry.spindleLoad.toFixed(0)}%` },
    { label: "Temperature", value: `${telemetry.temperature.toFixed(1)} °C` },
    { label: "Cycle target", value: `${telemetry.cycleTime.toFixed(1)} s` },
    { label: "Parts produced", value: machine.partsProduced.toLocaleString() },
    { label: "Faults today", value: String(machine.faultsToday) },
  ];
  if (telemetry.kind === "ROBOT") return [
    { label: "Joint speed", value: `${telemetry.jointSpeed.toFixed(0)}%` },
    { label: "Arm temperature", value: `${telemetry.temperature.toFixed(1)} °C` },
    { label: "Gripper", value: telemetry.gripperClosed ? "CLOSED" : "OPEN" },
    { label: "Parts handled", value: machine.partsProduced.toLocaleString() },
  ];
  return [
    { label: "Current part", value: telemetry.currentPart ?? "—" },
    { label: "Last result", value: telemetry.lastResult ?? "—" },
    { label: "Total inspected", value: telemetry.totalInspected.toLocaleString() },
    { label: "Rejected", value: telemetry.rejectionCount.toLocaleString() },
  ];
}

export function MachinePanel() {
  const machineId = useFactoryStore((state) => state.selectedMachineId);
  const machine = useFactoryStore((state) => machineId ? state.machines[machineId] : null);
  const activeFault = useFactoryStore((state) => machineId ? state.activeFaults[machineId] : undefined);
  const selectMachine = useFactoryStore((state) => state.selectMachine);
  const startMachine = useFactoryStore((state) => state.startMachine);
  const stopMachine = useFactoryStore((state) => state.stopMachine);
  const triggerFault = useFactoryStore((state) => state.triggerFault);
  const openDiagnosis = useFactoryStore((state) => state.openDiagnosis);
  if (!machine || !machineId) return null;
  const fault = getFaultDefinition(activeFault?.code ?? null);
  const availableFaults = faultsForKind(machine.kind);
  return (
    <aside className="machine-panel glass-panel" aria-label={`${machineId} details`}>
      <div className="panel-head">
        <div><p className="eyebrow">Equipment inspection</p><h2 className="panel-title">{machine.id}</h2><p className="section-subtitle" style={{ fontSize: 10, marginTop: 3 }}>{machine.name}</p></div>
        <button className="icon-button" onClick={() => selectMachine(null)} aria-label="Close machine panel"><X size={15} /></button>
      </div>
      <div className={`status-pill status-${machine.status}`}><span className="live-dot" />{machine.status}</div>
      <div className="telemetry-grid">
        {telemetryCards(machine).map((item) => <div className="telemetry-card" key={item.label}><div className="metric-label">{item.label}</div><div className="metric-value">{item.value}</div></div>)}
      </div>
      <div className="telemetry-card" style={{ marginTop: 8 }}>
        <div className="panel-head"><span className="metric-label">Current part</span><span className="metric-label">{machine.progress.toFixed(0)}%</span></div>
        <div className="metric-value" style={{ fontSize: 13 }}>{machine.currentPartId ?? "NO PART LOADED"}</div>
        <div className="progress-track"><div className="progress-fill" style={{ width: `${machine.progress}%` }} /></div>
      </div>
      {fault && (
        <div className="fault-banner">
          <div className="fault-code"><AlertTriangle size={13} style={{ display: "inline", marginRight: 6 }} />{fault.code}</div>
          <h3 className="fault-title">{fault.title}</h3>
          <ul className="symptoms">{fault.symptoms.map((symptom) => <li key={symptom}>{symptom}</li>)}</ul>
          <button className="button button-danger button-fill" style={{ marginTop: 10 }} onClick={() => openDiagnosis(machineId)}><Wrench size={12} /> Diagnose</button>
        </div>
      )}
      <div className="button-row">
        {machine.status === "RUNNING" && <button className="button button-fill" onClick={() => stopMachine(machineId)}><Square size={11} /> Stop machine</button>}
        {machine.status === "IDLE" && <button className="button button-success button-fill" onClick={() => startMachine(machineId)}><Play size={11} /> Start machine</button>}
        {!activeFault && availableFaults.length > 0 && <button className="button button-danger" onClick={() => triggerFault(machineId)}><Zap size={12} /> Fault</button>}
      </div>
    </aside>
  );
}
