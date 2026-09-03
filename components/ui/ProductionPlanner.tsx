"use client";

import { DollarSign, TrendingUp } from "lucide-react";
import { plannedProfitPerHour, PRODUCT_DEFINITIONS, profitPerProductionHour, unitProfit } from "@/lib/simulation/productMix";
import { useFactoryStore } from "@/store/useFactoryStore";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export function ProductionPlanner() {
  const targets = useFactoryStore((state) => state.productTargets);
  const counts = useFactoryStore((state) => state.counters.productCounts);
  const setTarget = useFactoryStore((state) => state.setProductTarget);
  const realizedRevenue = PRODUCT_DEFINITIONS.reduce((sum, product) => sum + counts[product.id] * product.salePrice, 0);
  const realizedProfit = PRODUCT_DEFINITIONS.reduce((sum, product) => sum + counts[product.id] * unitProfit(product.id), 0);
  const weightedHourlyProfit = plannedProfitPerHour(targets);
  const bestProduct = [...PRODUCT_DEFINITIONS].sort((a, b) => profitPerProductionHour(b.id) - profitPerProductionHour(a.id))[0];

  return (
    <article className="production-planner glass-panel">
      <div className="planner-head">
        <div><p className="eyebrow">Production economics</p><h2 className="chart-title">Product mix and profit planner</h2></div>
        <div className="planner-summary">
          <span><DollarSign size={14} /> Realized revenue <strong>{money.format(realizedRevenue)}</strong></span>
          <span><TrendingUp size={14} /> Realized gross profit <strong>{money.format(realizedProfit)}</strong></span>
          <span>Planned profit rate <strong>{money.format(weightedHourlyProfit)}/hr</strong></span>
        </div>
      </div>
      <p className="planner-note">Move any slider to change the live order scheduler. The other products rebalance automatically so the plan always totals 100%. Prices and costs are illustrative.</p>
      <div className="planner-table">
        <div className="planner-row planner-labels"><span>Product</span><span>Mix</span><span>Price</span><span>Cost</span><span>Cycle</span><span>Profit / unit</span><span>Profit / hour</span></div>
        {PRODUCT_DEFINITIONS.map((product) => {
          const cost = product.materialCost + product.variableCost;
          const hourly = profitPerProductionHour(product.id);
          return (
            <div className="planner-row" key={product.id}>
              <strong style={{ color: product.color }}>{product.shortLabel}{product.id === bestProduct.id && <small> Best rate</small>}</strong>
              <label className="mix-control"><span>{targets[product.id]}%</span><input aria-label={`${product.shortLabel} target production mix`} type="range" min="0" max="100" step="1" value={targets[product.id]} onChange={(event) => setTarget(product.id, Number(event.target.value))} style={{ accentColor: product.color }} /></label>
              <span>{money.format(product.salePrice)}</span><span>{money.format(cost)}</span><span>{product.cncCycleSeconds}s</span>
              <span>{money.format(unitProfit(product.id))}</span><strong>{money.format(hourly)}/hr</strong>
            </div>
          );
        })}
      </div>
    </article>
  );
}
