"use client";

import { useEffect, useState } from "react";
import { SkipForward } from "lucide-react";
import { useFactoryStore } from "@/store/useFactoryStore";

const checks = ["CNC-01", "CNC-02", "ROBOT-01", "CMM-01", "TELEMETRY"];

export function IntroOverlay() {
  const complete = useFactoryStore((state) => state.introComplete);
  const completeIntro = useFactoryStore((state) => state.completeIntro);
  const [progress, setProgress] = useState(4);

  useEffect(() => {
    if (complete) return;
    const started = performance.now();
    const timer = window.setInterval(() => {
      const elapsed = performance.now() - started;
      const next = Math.min(100, 4 + (elapsed / 3600) * 96);
      setProgress(next);
      if (next >= 100) completeIntro();
    }, 100);
    return () => window.clearInterval(timer);
  }, [complete, completeIntro]);

  if (complete) return null;
  const visibleChecks = Math.min(checks.length, Math.floor(progress / 17));
  return (
    <div className="intro-overlay" role="dialog" aria-label="Initializing FactoryOS">
      <div className="intro-card glass-panel">
        <div className="intro-brand">
          <span className="brand-mark brand-mark--large">F</span>
          <div><h1 className="intro-title">FactoryOS</h1><p className="intro-subtitle">Initializing digital twin</p></div>
        </div>
        <div className="intro-progress" aria-label={`Loading ${Math.round(progress)} percent`}><div style={{ width: `${progress}%` }} /></div>
        <div className="system-checks">
          {checks.slice(0, visibleChecks).map((check) => (
            <div className="system-check" key={check}><span>{check}</span><span>{check === "TELEMETRY" ? "CONNECTED" : "ONLINE"}</span></div>
          ))}
        </div>
        <div className="intro-foot">
          <p className="eyebrow">{progress > 88 ? "Factory ready" : "Loading manufacturing systems…"}</p>
          <button className="button button-ghost" onClick={completeIntro}>Skip <SkipForward size={12} /></button>
        </div>
      </div>
    </div>
  );
}
