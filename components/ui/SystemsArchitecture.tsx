"use client";

import { useState } from "react";

const nodes = [
  { title: "3D factory", tech: "React Three Fiber", detail: "A low-poly procedural scene maps every equipment state, workpiece position, alarm light, and interaction target from the shared simulation store." },
  { title: "Simulation engine", tech: "Discrete time model", detail: "One frame-driven clock advances production with bounded deltas, accelerated time, downstream capacity checks, deterministic station durations, and pause-safe behavior." },
  { title: "State layer", tech: "Zustand", detail: "Machines, work in process, counters, faults, selection, controls, and bounded histories live in one typed client-side source of truth." },
  { title: "Telemetry", tech: "Signal generator", detail: "Equipment readings approach realistic moving targets instead of jumping randomly. Faults coherently override RPM, load, temperature, and sensor values." },
  { title: "KPI engine", tech: "OEE calculations", detail: "Availability, performance, quality, OEE, throughput, scrap, utilization, cycle time, and uptime by machine and machine type are derived from actual runtime and inspection counters." },
  { title: "Operations UI", tech: "React + Recharts", detail: "The factory HUD, troubleshooting workflows, production log, and responsive dashboard subscribe to focused slices of the same operational state." },
];

export function SystemsArchitecture() {
  const [active, setActive] = useState(0);
  return (
    <section className="content-view" aria-labelledby="systems-title">
      <header className="content-header"><div><p className="eyebrow">System architecture</p><h1 className="section-heading" id="systems-title">One simulation. Multiple operational views.</h1><p className="section-subtitle">FactoryOS separates manufacturing rules from presentation. Select a layer to inspect how information travels from the simulated cell to operator decisions.</p></div></header>
      <div className="content-grid architecture">
        {nodes.map((node,index) => <button key={node.title} className={`architecture-node glass-panel ${active===index?"active":""}`} onClick={() => setActive(index)}><div className="node-number">0{index+1}</div><h2 className="node-title">{node.title}</h2><div className="node-tech">{node.tech}</div></button>)}
      </div>
      <div className="node-detail glass-panel"><p className="eyebrow">{nodes[active].title} · implementation note</p>{nodes[active].detail}</div>
    </section>
  );
}
