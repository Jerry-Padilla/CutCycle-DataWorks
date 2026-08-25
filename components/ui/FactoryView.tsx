"use client";

import dynamic from "next/dynamic";
import { Component, type ReactNode, useState } from "react";
import { Box, CircleHelp, Gamepad2 } from "lucide-react";
import { DemoOverlay } from "@/components/ui/DemoOverlay";
import { DiagnosisPanel } from "@/components/ui/DiagnosisPanel";
import { GameGuide } from "@/components/ui/GameGuide";
import { HUD } from "@/components/ui/HUD";
import { MachinePanel } from "@/components/ui/MachinePanel";
import { MobileExploreControls } from "@/components/ui/MobileExploreControls";
import { SimulationControls } from "@/components/ui/SimulationControls";
import { useFactoryStore } from "@/store/useFactoryStore";

const FactoryScene = dynamic(() => import("@/components/factory/FactoryScene"), {
  ssr: false,
  loading: () => <div className="boot-shell"><div className="brand-mark">F</div><p className="eyebrow">Preparing 3D cell</p><div className="boot-line" /></div>,
});

class SceneErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch { return false; }
}

function WebGLFallback() {
  const setView = useFactoryStore((state) => state.setView);
  return <div className="webgl-fallback"><div className="fallback-card glass-panel"><Box size={32} /><h2>3D view unavailable</h2><p>Your browser does not currently support WebGL. The live simulation and analytics remain available.</p><button className="button button-primary" onClick={() => setView("DASHBOARD")}>View dashboard</button></div></div>;
}

export function FactoryView() {
  const [webgl] = useState(supportsWebGL);
  const explore = useFactoryStore((state) => state.exploreMode);
  const diagnosisOpen = useFactoryStore((state) => state.diagnosingMachineId !== null);
  const helpOpen = useFactoryStore((state) => state.helpOpen);
  const setExplore = useFactoryStore((state) => state.setExploreMode);
  const setHelpOpen = useFactoryStore((state) => state.setHelpOpen);
  return (
    <section className={`factory-view${diagnosisOpen || helpOpen ? " scene-labels-hidden" : ""}`} aria-label="3D manufacturing cell">
      <div className="scene-wrap">
        {webgl ? <SceneErrorBoundary fallback={<WebGLFallback />}><FactoryScene /></SceneErrorBoundary> : <WebGLFallback />}
      </div>
      {!explore && <><HUD /><SimulationControls /><MachinePanel /><div className="scene-footer"><button className="button glass-panel" onClick={() => setExplore(true)}><Gamepad2 size={13} /> Explore mode</button><button className="button glass-panel" onClick={() => setHelpOpen(true)}><CircleHelp size={13} /> How to play</button><div className="control-help glass-panel">DRAG ORBIT · SCROLL ZOOM · TAP EQUIPMENT</div></div></>}
      {explore && <MobileExploreControls />}
      <DemoOverlay />
      <GameGuide />
      <DiagnosisPanel />
    </section>
  );
}
