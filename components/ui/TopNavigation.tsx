"use client";

import { ExternalLink, Play } from "lucide-react";
import { GITHUB_URL } from "@/lib/constants";
import { useFactoryStore } from "@/store/useFactoryStore";
import type { AppView } from "@/types/factory";

const views: { id: AppView; label: string }[] = [
  { id: "FACTORY", label: "Factory" },
  { id: "DASHBOARD", label: "Dashboard" },
  { id: "SYSTEMS", label: "Systems" },
  { id: "ABOUT", label: "About project" },
];

export function TopNavigation() {
  const view = useFactoryStore((state) => state.view);
  const setView = useFactoryStore((state) => state.setView);
  const startDemo = useFactoryStore((state) => state.startDemo);
  return (
    <header className="top-nav">
      <button className="brand button-ghost" onClick={() => setView("FACTORY")} aria-label="Open Factory view">
        <span className="brand-mark">C</span>
        <span className="brand-copy"><strong>CutCycle <span className="brand-divider" aria-hidden="true">|</span> DataWorks</strong><span className="brand-subtitle">Automated Machining Intelligence</span></span>
      </button>
      <nav className="nav-links" aria-label="Primary navigation">
        {views.map((item) => (
          <button key={item.id} className={`nav-button ${view === item.id ? "active" : ""}`} onClick={() => setView(item.id)}>
            {item.label}
          </button>
        ))}
        <a className="nav-button external" href={GITHUB_URL} target="_blank" rel="noreferrer">
          GitHub <ExternalLink size={10} aria-hidden="true" />
        </a>
      </nav>
      <div className="nav-spacer" />
      <button className="button button-primary" onClick={startDemo}><Play size={12} fill="currentColor" /> <span>Run demo</span></button>
      <div className="system-live"><span className="live-dot" /> Live simulation</div>
    </header>
  );
}
