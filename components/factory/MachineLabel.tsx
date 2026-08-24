"use client";

import { Html } from "@react-three/drei";
import type { MachineStatus } from "@/types/factory";

export function MachineLabel({ id, status, position }: { id: string; status: MachineStatus; position: [number, number, number] }) {
  return (
    <Html position={position} center distanceFactor={15} style={{ pointerEvents: "none" }}>
      <div className="machine-label"><strong>{id}</strong><span className={`machine-label-status status-${status}`}><i />{status}</span></div>
    </Html>
  );
}
