"use client";

import { useFactoryStore } from "@/store/useFactoryStore";
import { productLabel } from "@/lib/simulation/productMix";

export function HUD() {
  const kpis = useFactoryStore((state) => state.kpis);
  const activePart = useFactoryStore((state) => state.parts.find((part) => part.status !== "COMPLETE" && part.status !== "REJECTED"));
  return (
    <aside className="hud glass-panel" aria-label="Factory status">
      <p className="eyebrow">Factory status</p>
      <div className="hud-status"><span className="live-dot" /> Online</div>
      {activePart && <div className="active-order"><span>ACTIVE ORDER</span><strong>{productLabel(activePart.productType)}</strong><small>{activePart.serialNumber} · {activePart.currentStation}</small></div>}
      <div className="hud-grid">
        <div><div className="metric-label">OEE</div><div className="metric-value">{kpis.oee.toFixed(1)}<small>%</small></div></div>
        <div><div className="metric-label">Throughput</div><div className="metric-value">{Math.round(kpis.throughput)}<small>/hr</small></div></div>
        <div><div className="metric-label">Scrap</div><div className="metric-value">{kpis.scrapRate.toFixed(1)}<small>%</small></div></div>
        <div><div className="metric-label">Machines</div><div className="metric-value">{kpis.machinesOnline}<small>/4</small></div></div>
      </div>
    </aside>
  );
}
