"use client";

import { useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import type { Group, Mesh } from "three";
import { MachineLabel } from "@/components/factory/MachineLabel";
import { useFactoryStore } from "@/store/useFactoryStore";
import type { MachineId, MachineStatus } from "@/types/factory";

const statusColor: Record<MachineStatus, string> = { RUNNING: "#42dc8b", IDLE: "#f0c555", FAULT: "#ff514b", MAINTENANCE: "#4baee7" };

export function CNC({ id, position }: { id: Extract<MachineId, "CNC-01" | "CNC-02">; position: [number, number, number] }) {
  const machine = useFactoryStore((state) => state.machines[id]);
  const selected = useFactoryStore((state) => state.selectedMachineId === id);
  const select = useFactoryStore((state) => state.selectMachine);
  const spindle = useRef<Mesh>(null);
  const group = useRef<Group>(null);
  useFrame((_, delta) => { if (spindle.current && machine.status === "RUNNING") spindle.current.rotation.z -= delta * 10; });
  const click = (event: ThreeEvent<MouseEvent>) => { event.stopPropagation(); select(id); };
  return (
    <group ref={group} position={position} onClick={click} userData={{ machineId: id }}>
      <mesh position={[0,1.45,0]} castShadow receiveShadow><boxGeometry args={[3,2.9,2.65]} /><meshStandardMaterial color="#303b42" roughness={.35} metalness={.55} /></mesh>
      <mesh position={[0,2.45,1.34]} castShadow><boxGeometry args={[3.02,.62,.12]} /><meshStandardMaterial color="#202a30" metalness={.65} roughness={.3} /></mesh>
      <mesh position={[-.44,1.25,1.39]} castShadow><boxGeometry args={[1.72,1.72,.12]} /><meshStandardMaterial color="#182329" metalness={.5} roughness={.26} /></mesh>
      <mesh position={[-.44,1.25,1.47]}><planeGeometry args={[1.42,1.42]} /><meshPhysicalMaterial color="#264655" transparent opacity={.52} roughness={.15} metalness={.2} /></mesh>
      <mesh position={[.92,1.55,1.43]} castShadow><boxGeometry args={[.63,1.16,.18]} /><meshStandardMaterial color="#161f24" /></mesh>
      <mesh position={[.92,1.78,1.54]}><planeGeometry args={[.42,.34]} /><meshBasicMaterial color={machine.status === "FAULT" ? "#a82e2b" : "#1b6a83"} /></mesh>
      <mesh ref={spindle} position={[-.45,1.38,1.58]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.24,.24,.35,16]} /><meshStandardMaterial color="#a7b3b8" metalness={.86} roughness={.18} /></mesh>
      <mesh position={[0,3.08,.7]}><cylinderGeometry args={[.1,.1,.24,10]} /><meshStandardMaterial color="#69747a" metalness={.7} /></mesh>
      <mesh position={[0,3.28,.7]}><cylinderGeometry args={[.14,.14,.18,12]} /><meshStandardMaterial color={statusColor[machine.status]} emissive={statusColor[machine.status]} emissiveIntensity={2.4} /></mesh>
      <mesh position={[0,1.45,0]} visible={selected}><boxGeometry args={[3.12,3.02,2.77]} /><meshBasicMaterial color="#73caef" wireframe transparent opacity={.7} depthTest={false} /></mesh>
      <mesh position={[0,1.45,0]} visible={false}><boxGeometry args={[3.35,3.25,3]} /><meshBasicMaterial /></mesh>
      <MachineLabel id={id} status={machine.status} position={[0,3.75,0]} />
    </group>
  );
}
