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
      <header className="content-header"><div><p className="eyebrow">Engineering portfolio project</p><h1 className="section-heading" id="about-title">FactoryOS</h1><p className="section-subtitle">An interactive manufacturing digital twin built to explore how equipment state, production flow, machine faults, and quality metrics influence factory performance.</p></div><a className="button button-primary" href={GITHUB_URL} target="_blank" rel="noreferrer">View source <ExternalLink size={12} /></a></header>
      <div className="content-grid about-grid">
        <article className="about-card glass-panel"><p className="eyebrow">The project</p><h2 className="panel-title">A working engineering software prototype</h2><div className="about-copy"><p>The visual factory models two enclosed horizontal band saws, two parallel central conveyors, two six-machine CNC rows staffed at one operator per two machines, and two articulated robots, each positioned in front of a straight bank of three square CMMs. A capacity-controlled WIP dispatcher alternates the two saw lines and routes uniquely serialized billets across all 12 CNCs, both robots, and all six CMMs. Each billet is visibly machined into its scheduled mounting plate, impeller, or rocket nozzle before inspection.</p><p>FactoryOS combines manufacturing systems thinking with modern frontend engineering. Its dashboard does not display decorative random values: OEE and every supporting metric are calculated from the cell&apos;s accumulated runtime, cycle, and inspection data. Accepted product counts also drive a 50/30/20 order scheduler, closing the loop between production history and the next physical product.</p></div><div className="tech-badges">{tech.map((item) => <span className="tech-badge" key={item}>{item}</span>)}</div></article>
        <article className="about-card glass-panel"><p className="eyebrow">Demonstrated capabilities</p><div className="capability-list">{capabilities.map(({icon:Icon,label}) => <div className="capability" key={label}><Icon size={15} />{label}</div>)}</div></article>
      </div>
    </section>
  );
}
