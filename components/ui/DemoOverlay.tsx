"use client";

import { X } from "lucide-react";
import { useFactoryStore } from "@/store/useFactoryStore";

export function DemoOverlay() {
  const demo = useFactoryStore((state) => state.demo);
  const cancel = useFactoryStore((state) => state.cancelDemo);
  if (!demo.active) return null;
  return (
    <aside className="demo-callout glass-panel" aria-live="polite">
      <div className="demo-line">
        <div className="demo-step">{demo.step + 1}</div>
        <div><p className="eyebrow">Guided production run</p><div className="demo-message">{demo.message}</div></div>
        <button className="icon-button" onClick={cancel} aria-label="Cancel demo"><X size={14} /></button>
      </div>
    </aside>
  );
}
