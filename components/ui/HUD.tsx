"use client";

import { useFactoryStore } from "@/store/useFactoryStore";

export function HUD() {
  const kpis = useFactoryStore((state) => state.kpis);
  return (
    <aside className="hud glass-panel" aria-label="Factory status">
      <p className="eyebrow">Factory status</p>
      <div className="hud-status"><span className="live-dot" /> Online</div>
      <div className="hud-grid">
        <div><div className="metric-label">OEE</div><div className="metric-value">{kpis.oee.toFixed(1)}<small>%</small></div></div>
        <div><div className="metric-label">Throughput</div><div className="metric-value">{Math.round(kpis.throughput)}<small>/hr</small></div></div>
        <div><div className="metric-label">Scrap</div><div className="metric-value">{kpis.scrapRate.toFixed(1)}<small>%</small></div></div>
        <div><div className="metric-label">Machines</div><div className="metric-value">{kpis.machinesOnline}<small>/4</small></div></div>
      </div>
    </aside>
  );
}
