"use client";

import { AlertTriangle, ArrowUpRight, CirclePause } from "lucide-react";
import { deriveEquipmentStatus } from "@/lib/simulation/equipmentStatus";
import { useFactoryStore } from "@/store/useFactoryStore";

export function EquipmentStatusPanel() {
  const machines = useFactoryStore((state) => state.machines);
  const activeFaults = useFactoryStore((state) => state.activeFaults);
  const parts = useFactoryStore((state) => state.parts);
  const paused = useFactoryStore((state) => state.paused);
  const selectMachine = useFactoryStore((state) => state.selectMachine);
  const setView = useFactoryStore((state) => state.setView);
  const rows = deriveEquipmentStatus({ machines, activeFaults, parts, paused });
  const faults = rows.filter((row) => row.condition === "FAULT").length;
  const blocked = rows.filter((row) => row.condition === "BLOCKED").length;

  const inspect = (selectableId: (typeof rows)[number]["selectableId"]) => {
    if (!selectableId) return;
    selectMachine(selectableId);
    setView("FACTORY");
  };

  return (
    <article className="equipment-status-card glass-panel">
      <div className="panel-head">
        <div><p className="eyebrow">Live equipment exceptions</p><h2 className="chart-title">Stopped, blocked, and idle machines</h2></div>
        <div className="equipment-summary"><span className={faults ? "has-fault" : ""}><AlertTriangle size={12} />{faults} faults</span><span><CirclePause size={12} />{blocked} blocked</span></div>
      </div>
      <div className="equipment-table" role="table" aria-label="Current stopped equipment and reasons">
        <div className="equipment-row equipment-head" role="row"><span>Machine</span><span>Status</span><span>Reason / error</span><span>Part</span><span /></div>
        {rows.map((row) => (
          <div className="equipment-row" role="row" key={row.id}>
            <strong>{row.id}<small>{row.kind}</small></strong>
            <span><i className={`condition-dot condition-${row.condition}`} />{row.condition}</span>
            <span className="equipment-reason">{row.reason}</span>
            <span className="equipment-part">{row.currentPart ?? "—"}</span>
            <button className="icon-button equipment-inspect" disabled={!row.selectableId} onClick={() => inspect(row.selectableId)} aria-label={`Inspect ${row.id}`}><ArrowUpRight size={13} /></button>
          </div>
        ))}
      </div>
    </article>
  );
}
