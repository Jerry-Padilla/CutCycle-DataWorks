"use client";

import { useEffect, useRef } from "react";
import { AboutProject } from "@/components/ui/AboutProject";
import { Dashboard } from "@/components/ui/Dashboard";
import { FactoryView } from "@/components/ui/FactoryView";
import { IntroOverlay } from "@/components/ui/IntroOverlay";
import { SystemsArchitecture } from "@/components/ui/SystemsArchitecture";
import { TopNavigation } from "@/components/ui/TopNavigation";
import { useFactoryStore } from "@/store/useFactoryStore";

function SimulationRunner() {
  const tick = useFactoryStore((state) => state.tick);
  useEffect(() => {
    let frame = 0;
    let previous = performance.now();
    let accumulated = 0;
    const update = (time: number) => {
      accumulated += (time - previous) / 1000;
      previous = time;
      if (accumulated >= 0.08) {
        tick(accumulated);
        accumulated = 0;
      }
      frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [tick]);
  return null;
}

function AudioController() {
  const enabled = useFactoryStore((state) => state.soundEnabled);
  const latestEvent = useFactoryStore((state) => state.events[0]);
  const contextRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const lastAlertRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      void contextRef.current?.close();
      contextRef.current = null;
      gainRef.current = null;
      return;
    }
    const context = new AudioContext();
    const gain = context.createGain();
    gain.gain.value = 0.018;
    gain.connect(context.destination);
    const low = context.createOscillator();
    const high = context.createOscillator();
    low.type = "sine";
    high.type = "triangle";
    low.frequency.value = 58;
    high.frequency.value = 116;
    low.connect(gain);
    high.connect(gain);
    low.start();
    high.start();
    contextRef.current = context;
    gainRef.current = gain;
    return () => {
      low.stop();
      high.stop();
      void context.close();
      contextRef.current = null;
      gainRef.current = null;
    };
  }, [enabled]);

  useEffect(() => {
    const context = contextRef.current;
    const output = gainRef.current;
    if (!enabled || !context || !output || latestEvent?.severity !== "FAULT" || latestEvent.id === lastAlertRef.current) return;
    lastAlertRef.current = latestEvent.id;
    const alarm = context.createOscillator();
    const alarmGain = context.createGain();
    alarm.type = "square";
    alarm.frequency.setValueAtTime(680, context.currentTime);
    alarm.frequency.setValueAtTime(520, context.currentTime + 0.14);
    alarmGain.gain.setValueAtTime(0.09, context.currentTime);
    alarmGain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.32);
    alarm.connect(alarmGain);
    alarmGain.connect(context.destination);
    alarm.start();
    alarm.stop(context.currentTime + 0.33);
  }, [enabled, latestEvent]);
  return null;
}

export default function ClientApplication() {
  const view = useFactoryStore((state) => state.view);
  return (
    <div className="app-shell">
      <SimulationRunner />
      <AudioController />
      <TopNavigation />
      <main className="app-main">
        {view === "FACTORY" && <FactoryView />}
        {view === "DASHBOARD" && <Dashboard />}
        {view === "SYSTEMS" && <SystemsArchitecture />}
        {view === "ABOUT" && <AboutProject />}
      </main>
      <IntroOverlay />
    </div>
  );
}
