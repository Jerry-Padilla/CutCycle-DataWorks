"use client";

import { AlertTriangle, BarChart3, Factory, Play, X } from "lucide-react";
import { useFactoryStore } from "@/store/useFactoryStore";

export function GameGuide() {
  const open = useFactoryStore((state) => state.helpOpen);
  const setOpen = useFactoryStore((state) => state.setHelpOpen);
  const triggerFault = useFactoryStore((state) => state.triggerFault);
  const setView = useFactoryStore((state) => state.setView);
  if (!open) return null;

  return (
    <aside className="game-guide glass-panel" role="dialog" aria-label="How to play FactoryOS">
      <div className="panel-head"><div><p className="eyebrow">Quick start</p><h2 className="panel-title">How to run the factory</h2></div><button className="icon-button" onClick={() => setOpen(false)} aria-label="Close game guide"><X size={15} /></button></div>
      <div className="guide-steps">
        <div><Factory size={16} /><p><strong>Keep production moving</strong><span>Saws feed independent CNC mills. Finished parts travel to a robot and assigned CMM.</span></p></div>
        <div><Play size={16} /><p><strong>Inspect and control equipment</strong><span>Select any machine. Instrumented assets support start, stop, telemetry, and fault controls.</span></p></div>
        <div><AlertTriangle size={16} /><p><strong>Diagnose malfunctions</strong><span>Faults stop only affected equipment, but blocked flow can propagate. Use the evidence to repair and restart it.</span></p></div>
        <div><BarChart3 size={16} /><p><strong>Watch the dashboard</strong><span>See OEE, uptime, every stopped machine, fault code, and exact blocking reason.</span></p></div>
      </div>
      <div className="button-row">
        <button className="button button-danger" onClick={() => { triggerFault(); setOpen(false); }}><AlertTriangle size={13} /> Induce malfunction</button>
        <button className="button button-primary button-fill" onClick={() => setOpen(false)}>Start operating</button>
        <button className="button" onClick={() => { setView("DASHBOARD"); setOpen(false); }}>Dashboard</button>
      </div>
    </aside>
  );
}
