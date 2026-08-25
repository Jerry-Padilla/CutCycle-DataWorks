"use client";

import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useRef } from "react";
import type { Mesh } from "three";
import { MachineLabel } from "@/components/factory/MachineLabel";
import { useFactoryStore } from "@/store/useFactoryStore";
import type { MachineStatus } from "@/types/factory";

const colors: Record<MachineStatus,string> = { RUNNING:"#42dc8b",IDLE:"#f0c555",FAULT:"#ff514b",MAINTENANCE:"#4baee7" };

interface InspectionStationProps {
  position?: [number, number, number];
  auxiliaryLabel?: string;
}

export function InspectionStation({ position = [14,0,-6.1], auxiliaryLabel }: InspectionStationProps) {
  const machine = useFactoryStore((state) => state.machines["CMM-01"]);
  const selected = useFactoryStore((state) => !auxiliaryLabel && state.selectedMachineId === "CMM-01");
  const select = useFactoryStore((state) => state.selectMachine);
  const probe = useRef<Mesh>(null);
  const status: MachineStatus = auxiliaryLabel ? "IDLE" : machine.status;
  useFrame(() => { if (probe.current && !auxiliaryLabel) probe.current.position.y = 2.25 - Math.sin(machine.progress/100*Math.PI)*.65; });
  const click = (event: ThreeEvent<MouseEvent>) => { event.stopPropagation(); select("CMM-01"); };
  return (
    <group position={position} onClick={auxiliaryLabel ? undefined : click} userData={auxiliaryLabel ? { auxiliaryEquipment:true } : { machineId:"CMM-01" }}>
      <mesh position={[0,.35,0]} castShadow><boxGeometry args={[2.6,.7,2.4]} /><meshStandardMaterial color="#333f45" metalness={.64} roughness={.34} /></mesh>
      {[-1.05,1.05].map((x) => <mesh key={x} position={[x,1.75,0]} castShadow><boxGeometry args={[.26,2.8,.3]} /><meshStandardMaterial color="#91a1a8" metalness={.72} roughness={.28} /></mesh>)}
      <mesh position={[0,3.04,0]} castShadow><boxGeometry args={[2.35,.28,.36]} /><meshStandardMaterial color="#899aa2" metalness={.72} roughness={.28} /></mesh>
      <mesh ref={probe} position={[0,2.25,0]}><cylinderGeometry args={[.08,.08,1.1,10]} /><meshStandardMaterial color="#d0d8dc" metalness={.86} roughness={.16} /></mesh>
      <mesh position={[0,.76,0]}><boxGeometry args={[1.25,.12,1.2]} /><meshStandardMaterial color="#172127" metalness={.65} /></mesh>
      <mesh position={[1.28,1.52,.5]}><boxGeometry args={[.45,1.25,.2]} /><meshStandardMaterial color="#1d282e" /></mesh>
      <mesh position={[1.28,1.72,.62]}><planeGeometry args={[.31,.34]} /><meshBasicMaterial color="#21667d" /></mesh>
      <mesh position={[-.78,3.32,0]}><sphereGeometry args={[.11,10,8]} /><meshStandardMaterial color={colors[status]} emissive={colors[status]} emissiveIntensity={2.4} /></mesh>
      <mesh position={[0,1.5,0]} visible={selected}><boxGeometry args={[2.78,3.35,2.58]} /><meshBasicMaterial color="#73caef" wireframe transparent opacity={.75} depthTest={false} /></mesh>
      <mesh position={[0,1.5,0]} visible={false}><boxGeometry args={[3,3.6,2.8]} /><meshBasicMaterial /></mesh>
      <MachineLabel id={auxiliaryLabel ? `${auxiliaryLabel} · AUX` : "CMM-01"} status={status} position={[0,3.85,0]} />
    </group>
  );
}
