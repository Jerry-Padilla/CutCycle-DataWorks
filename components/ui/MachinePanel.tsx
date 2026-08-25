"use client";

import { AlertTriangle, Play, Square, Wrench, X, Zap } from "lucide-react";
import { MACHINE_IDS } from "@/lib/constants";
import { faultsForKind, getFaultDefinition } from "@/lib/simulation/faultEngine";
import { useFactoryStore } from "@/store/useFactoryStore";
import type { EquipmentId, MachineId, MachineRuntime } from "@/types/factory";

function instrumentedId(id: EquipmentId | null): MachineId | null {
  return id && MACHINE_IDS.includes(id as MachineId) ? id as MachineId : null;
}

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
  const runtimeId = instrumentedId(machineId);
  const machine = useFactoryStore((state) => runtimeId ? state.machines[runtimeId] : null);
  const activeFault = useFactoryStore((state) => runtimeId ? state.activeFaults[runtimeId] : undefined);
  const currentPart = useFactoryStore((state) => machineId ? state.parts.find((part) => part.currentStation === machineId) : undefined);
  const paused = useFactoryStore((state) => state.paused);
  const selectMachine = useFactoryStore((state) => state.selectMachine);
  const startMachine = useFactoryStore((state) => state.startMachine);
  const stopMachine = useFactoryStore((state) => state.stopMachine);
  const triggerFault = useFactoryStore((state) => state.triggerFault);
  const openDiagnosis = useFactoryStore((state) => state.openDiagnosis);
  if (!machineId) return null;
  if (!machine || !runtimeId) {
    const kind = machineId.startsWith("CNC-") ? "CNC machining center" : machineId.startsWith("CMM-") ? "coordinate measuring machine" : "material-handling robot";
    const status = currentPart && !paused ? "RUNNING" : "IDLE";
    return (
      <aside className="machine-panel glass-panel" aria-label={`${machineId} details`}>
        <div className="panel-head">
          <div><p className="eyebrow">Equipment inspection</p><h2 className="panel-title">{machineId}</h2><p className="section-subtitle" style={{ fontSize: 10, marginTop: 3 }}>{kind} · production-routed asset</p></div>
          <button className="icon-button" onClick={() => selectMachine(null)} aria-label="Close machine panel"><X size={15} /></button>
        </div>
        <div className={`status-pill status-${status}`}><span className="live-dot" />{status}</div>
        <div className="telemetry-grid">
          <div className="telemetry-card"><div className="metric-label">Current part</div><div className="metric-value">{currentPart?.serialNumber ?? "NONE"}</div></div>
          <div className="telemetry-card"><div className="metric-label">Cycle progress</div><div className="metric-value">{(currentPart?.progress ?? 0).toFixed(0)}%</div></div>
        </div>
        <div className="telemetry-card" style={{ marginTop: 8 }}><div className="metric-label">Telemetry level</div><div className="metric-value" style={{ fontSize: 13 }}>PRODUCTION STATUS</div><p className="section-subtitle" style={{ fontSize: 10, marginTop: 4 }}>Detailed controls, fault injection, and runtime telemetry are available on instrumented assets.</p></div>
      </aside>
    );
  }
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
          <button className="button button-danger button-fill" style={{ marginTop: 10 }} onClick={() => openDiagnosis(runtimeId)}><Wrench size={12} /> Diagnose</button>
        </div>
      )}
      <div className="button-row">
        {machine.status === "RUNNING" && <button className="button button-fill" onClick={() => stopMachine(runtimeId)}><Square size={11} /> Stop machine</button>}
        {machine.status === "IDLE" && <button className="button button-success button-fill" onClick={() => startMachine(runtimeId)}><Play size={11} /> Start machine</button>}
        {!activeFault && availableFaults.length > 0 && <button className="button button-danger" onClick={() => triggerFault(runtimeId)}><Zap size={12} /> Fault</button>}
      </div>
    </aside>
  );
}
