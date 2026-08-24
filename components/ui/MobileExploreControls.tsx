"use client";

import { useRef, useState } from "react";
import { ScanLine } from "lucide-react";
import { useFactoryStore } from "@/store/useFactoryStore";

function dispatchMove(x: number, y: number) {
  window.dispatchEvent(new CustomEvent("factoryos-move", { detail: { x, y } }));
}

export function MobileExploreControls() {
  const setExplore = useFactoryStore((state) => state.setExploreMode);
  const origin = useRef<{ x: number; y: number } | null>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  return (
    <div className="explore-ui">
      <div className="crosshair" />
      <button className="button explore-exit" onClick={() => setExplore(false)}>Exit explore</button>
      <div className="mobile-explore">
        <div
          className="virtual-joystick"
          onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); origin.current = { x: event.clientX, y: event.clientY }; }}
          onPointerMove={(event) => {
            if (!origin.current) return;
            const x = Math.max(-28, Math.min(28, event.clientX - origin.current.x));
            const y = Math.max(-28, Math.min(28, event.clientY - origin.current.y));
            setKnob({ x, y }); dispatchMove(x / 28, y / 28);
          }}
          onPointerUp={() => { origin.current = null; setKnob({ x: 0, y: 0 }); dispatchMove(0, 0); }}
        >
          <span className="joystick-knob" style={{ transform: `translate(${knob.x}px,${knob.y}px)` }} />
        </div>
        <button className="button button-primary mobile-interact" onClick={() => window.dispatchEvent(new Event("factoryos-interact"))}><ScanLine size={20} /> E</button>
      </div>
    </div>
  );
}
