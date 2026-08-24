"use client";

import { CheckCircle2, X, XCircle } from "lucide-react";
import { getFaultDefinition } from "@/lib/simulation/faultEngine";
import { useFactoryStore } from "@/store/useFactoryStore";

export function DiagnosisPanel() {
  const machineId = useFactoryStore((state) => state.diagnosingMachineId);
  const active = useFactoryStore((state) => machineId ? state.activeFaults[machineId] : undefined);
  const close = useFactoryStore((state) => state.closeDiagnosis);
  const submit = useFactoryStore((state) => state.submitDiagnosis);
  const repair = useFactoryStore((state) => state.repairMachine);
  if (!machineId || !active) return null;
  const fault = getFaultDefinition(active.code);
  if (!fault) return null;
  return (
    <div className="diagnosis-backdrop" role="dialog" aria-modal="true" aria-label={`Diagnose ${machineId}`}>
      <section className="diagnosis-panel glass-panel">
        <div className="panel-head">
          <div><p className="eyebrow">Fault detected · {machineId}</p><h2 className="section-heading" style={{ fontSize: 23 }}>{fault.code} · {fault.title}</h2></div>
          <button className="icon-button" onClick={close} aria-label="Close diagnosis"><X size={15} /></button>
        </div>
        <div className="diagnostic-grid">
          {fault.readings.map((reading) => (
            <div className={`reading ${reading.alarm ? "alarm" : ""}`} key={reading.label}>
              <div className="metric-label">{reading.label}</div><div className="reading-value">{reading.value}</div>
              {reading.expected && <div className="reading-expected">Expected · {reading.expected}</div>}
            </div>
          ))}
        </div>
        <p className="eyebrow" style={{ marginBottom: 9 }}>What should you inspect first?</p>
        <div className="choice-grid">
          {fault.choices.map((choice) => {
            const selected = active.selectedChoiceId === choice.id;
            const resultClass = selected && active.answerCorrect === false ? "wrong" : selected && active.answerCorrect ? "correct" : selected ? "selected" : "";
            return <button className={`choice ${resultClass}`} key={choice.id} onClick={() => submit(machineId, choice.id)}>{choice.id.toUpperCase()}. {choice.label}</button>;
          })}
        </div>
        {active.answerCorrect === false && <div className="explanation" style={{ borderColor: "var(--red)" }}><XCircle size={14} style={{ display: "inline", marginRight: 7, color: "var(--red)" }} />That action does not address the evidence. Recheck the command, feedback, and measured load.</div>}
        {active.answerCorrect && <div className="explanation"><CheckCircle2 size={14} style={{ display: "inline", marginRight: 7, color: "var(--green)" }} />{fault.explanation}</div>}
        <div className="button-row" style={{ justifyContent: "flex-end", marginTop: 16 }}>
          <button className="button" onClick={close}>Return to cell</button>
          <button className="button button-success" disabled={!active.answerCorrect} onClick={() => repair(machineId)}>Perform repair</button>
        </div>
      </section>
    </div>
  );
}
