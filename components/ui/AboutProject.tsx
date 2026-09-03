"use client";

import { Activity, Bot, Boxes, ChartNoAxesCombined, ExternalLink, ShieldCheck, Wrench } from "lucide-react";
import { GITHUB_URL } from "@/lib/constants";

const tech = ["Next.js", "TypeScript", "React", "Three.js", "React Three Fiber", "Zustand", "Recharts", "Tailwind CSS"];
const capabilities = [
  { icon: Boxes, label: "Production flow and work-in-process tracking" },
  { icon: Activity, label: "Live equipment telemetry and state modeling" },
  { icon: Wrench, label: "Evidence-led equipment troubleshooting" },
  { icon: ShieldCheck, label: "Quality inspection and reject simulation" },
  { icon: ChartNoAxesCombined, label: "Event-derived manufacturing KPIs" },
  { icon: Bot, label: "Robotic handling and 3D visualization" },
];

export function AboutProject() {
  return (
    <section className="content-view" aria-labelledby="about-title">
      <header className="content-header"><div><p className="eyebrow">Engineering portfolio project</p><h1 className="section-heading" id="about-title">CutCycle DataWorks</h1><p className="section-subtitle">An interactive manufacturing simulation and analytics experience built to explore how equipment state, production flow, machine faults, and quality metrics influence factory performance.</p></div><a className="button button-primary" href={GITHUB_URL} target="_blank" rel="noreferrer">View source <ExternalLink size={12} /></a></header>
      <div className="content-grid about-grid">
        <article className="about-card glass-panel"><p className="eyebrow">The project</p><h2 className="panel-title">A working engineering software prototype</h2><div className="about-copy"><p>The branded Jerry&apos;s Automated Machine Shop floor models two enclosed horizontal band saws, two outward-facing conveyor lanes, two back-to-back six-machine CNC rows staffed at one operator per two machines, and a merged inspection conveyor feeding two articulated robots. Each robot serves a straight bank of three square CMMs. Department wayfinding identifies Saw, CNC, Milling, and Shipping areas; the outbound depot includes dock doors, staged freight, and material-handling equipment.</p><p>A capacity-controlled WIP dispatcher alternates the two saw lines and routes uniquely serialized billets across all 12 CNCs, both robots, and all six CMMs. CutCycle DataWorks combines manufacturing systems thinking with modern frontend engineering: OEE and every supporting metric are calculated from accumulated runtime, cycle, and inspection data, while accepted product counts drive an operator-adjustable product-mix scheduler and profit model.</p></div><div className="tech-badges">{tech.map((item) => <span className="tech-badge" key={item}>{item}</span>)}</div></article>
        <article className="about-card glass-panel"><p className="eyebrow">Demonstrated capabilities</p><div className="capability-list">{capabilities.map(({icon:Icon,label}) => <div className="capability" key={label}><Icon size={15} />{label}</div>)}</div></article>
      </div>
    </section>
  );
}
