"use client";

import { Bug, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useFactoryStore } from "@/store/useFactoryStore";
import type { FaultMode, SimulationSpeed } from "@/types/factory";

const speeds: SimulationSpeed[] = [0.5, 1, 2, 4];

export function SimulationControls() {
  const speed = useFactoryStore((state) => state.speed);
  const setSpeed = useFactoryStore((state) => state.setSpeed);
  const faultMode = useFactoryStore((state) => state.faultMode);
  const setFaultMode = useFactoryStore((state) => state.setFaultMode);
  const paused = useFactoryStore((state) => state.paused);
  const togglePause = useFactoryStore((state) => state.togglePause);
  const sound = useFactoryStore((state) => state.soundEnabled);
  const toggleSound = useFactoryStore((state) => state.toggleSound);
  const triggerFault = useFactoryStore((state) => state.triggerFault);
  return (
    <aside className="sim-controls glass-panel" aria-label="Simulation controls">
      <p className="eyebrow">Simulation</p>
      <div className="control-row">
        <span className="metric-label">Speed</span>
        <div className="segmented" aria-label="Simulation speed">
          {speeds.map((value) => <button key={value} className={`segment ${speed === value ? "active" : ""}`} onClick={() => setSpeed(value)}>{value}x</button>)}
        </div>
      </div>
      <div className="control-row">
        <label className="metric-label" htmlFor="fault-mode">Fault mode</label>
        <select id="fault-mode" className="select-control" value={faultMode} onChange={(event) => setFaultMode(event.target.value as FaultMode)}>
          <option>OFF</option><option>LOW</option><option>NORMAL</option><option>HIGH</option>
        </select>
      </div>
      <div className="button-row">
        <button className="button button-fill" onClick={togglePause}>{paused ? <Play size={12} /> : <Pause size={12} />}<span>{paused ? "Resume" : "Pause"}</span></button>
        <button className="button" onClick={toggleSound} aria-label={`Turn sound ${sound ? "off" : "on"}`}>{sound ? <Volume2 size={13} /> : <VolumeX size={13} />}</button>
        <button className="button button-danger" onClick={() => triggerFault()} aria-label="Trigger random fault"><Bug size={13} /></button>
      </div>
    </aside>
  );
}
