"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";
import { MAINTENANCE_PLACEMENTS } from "@/lib/factory/layout";
import { useFactoryStore } from "@/store/useFactoryStore";
import type { ActiveFault } from "@/types/factory";

function RepairTechnician({ fault, index }: { fault: ActiveFault; index: number }) {
  const figure = useRef<Group>(null);
  const toolArm = useRef<Group>(null);
  const supportArm = useRef<Group>(null);
  const placement = MAINTENANCE_PLACEMENTS[fault.machineId];

  useFrame(() => {
    const simulationSeconds = useFactoryStore.getState().simulationNow / 1000;
    const work = Math.sin(simulationSeconds * 4.2 + index * 1.7);
    if (figure.current) figure.current.position.y = fault.diagnosed ? -0.14 : Math.abs(work) * 0.018;
    if (toolArm.current) {
      toolArm.current.rotation.x = -0.72 + work * 0.24;
      toolArm.current.rotation.z = -0.18;
    }
    if (supportArm.current) supportArm.current.rotation.x = -0.52 - work * 0.12;
  });

  const resolvedColor = fault.answerCorrect ? "#50d994" : fault.diagnosed ? "#58b9e8" : "#f0c555";

  return (
    <group position={placement.position} rotation={[0, placement.rotationY, 0]} userData={{ technicianFor: fault.machineId, faultCode: fault.code }}>
      <group ref={figure}>
        <mesh position={[0, 1.06, 0]} castShadow><boxGeometry args={[0.5, 0.72, 0.32]} /><meshStandardMaterial color="#24658a" roughness={0.54} /></mesh>
        <mesh position={[0, 1.1, 0.175]}><boxGeometry args={[0.45, 0.09, 0.025]} /><meshBasicMaterial color="#d6e85b" /></mesh>
        <mesh position={[0, 0.91, 0.175]}><boxGeometry args={[0.45, 0.055, 0.025]} /><meshBasicMaterial color="#d6e85b" /></mesh>
        {[-0.13, 0.13].map((x) => (
          <group key={x} position={[x, 0.68, 0]} rotation={[fault.diagnosed ? -0.75 : 0, 0, 0]}>
            <mesh position={[0, -0.3, 0]} castShadow><cylinderGeometry args={[0.09, 0.1, 0.6, 10]} /><meshStandardMaterial color="#23323c" roughness={0.62} /></mesh>
            <mesh position={[0, -0.61, 0.08]} castShadow><boxGeometry args={[0.2, 0.1, 0.33]} /><meshStandardMaterial color="#141d22" roughness={0.72} /></mesh>
          </group>
        ))}
        <group ref={toolArm} position={[0.32, 1.34, 0]}>
          <mesh position={[0, -0.27, 0]} castShadow><cylinderGeometry args={[0.075, 0.09, 0.54, 10]} /><meshStandardMaterial color="#24658a" roughness={0.54} /></mesh>
          <mesh position={[0, -0.58, 0]}><sphereGeometry args={[0.085, 10, 8]} /><meshStandardMaterial color="#a96e50" roughness={0.64} /></mesh>
          <mesh position={[0, -0.77, 0.02]} rotation={[0, 0, 0.22]} castShadow><boxGeometry args={[0.055, 0.42, 0.055]} /><meshStandardMaterial color="#c1cbce" metalness={0.9} roughness={0.12} /></mesh>
          <mesh position={[0.04, -0.98, 0.02]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.1, 0.028, 8, 14, Math.PI * 1.45]} /><meshStandardMaterial color="#cbd4d6" metalness={0.92} roughness={0.1} /></mesh>
        </group>
        <group ref={supportArm} position={[-0.32, 1.34, 0]}>
          <mesh position={[0, -0.27, 0]} castShadow><cylinderGeometry args={[0.075, 0.09, 0.54, 10]} /><meshStandardMaterial color="#24658a" roughness={0.54} /></mesh>
          <mesh position={[0, -0.58, 0]}><sphereGeometry args={[0.085, 10, 8]} /><meshStandardMaterial color="#a96e50" roughness={0.64} /></mesh>
        </group>
        <mesh position={[0, 1.57, 0]} castShadow><sphereGeometry args={[0.18, 14, 10]} /><meshStandardMaterial color="#a96e50" roughness={0.64} /></mesh>
        <mesh position={[0, 1.76, 0]} castShadow><cylinderGeometry args={[0.2, 0.23, 0.13, 16]} /><meshStandardMaterial color="#ecf1f2" roughness={0.38} /></mesh>
        <mesh position={[0, 1.71, 0.13]} castShadow><boxGeometry args={[0.48, 0.055, 0.2]} /><meshStandardMaterial color="#ecf1f2" roughness={0.38} /></mesh>
      </group>
      <group position={[0.55, 0.22, -0.15]}>
        <mesh castShadow><boxGeometry args={[0.58, 0.38, 0.34]} /><meshStandardMaterial color="#29373e" metalness={0.58} roughness={0.42} /></mesh>
        <mesh position={[0, 0.24, 0]}><torusGeometry args={[0.16, 0.025, 8, 14, Math.PI]} /><meshStandardMaterial color="#a9b4b8" metalness={0.82} roughness={0.2} /></mesh>
        <mesh position={[0.22, 0.2, 0.19]}><sphereGeometry args={[0.055, 10, 8]} /><meshStandardMaterial color={resolvedColor} emissive={resolvedColor} emissiveIntensity={2} /></mesh>
      </group>
    </group>
  );
}

export function MaintenanceTechnicians() {
  const activeFaults = useFactoryStore((state) => state.activeFaults);
  const faults = Object.values(activeFaults).filter((fault): fault is ActiveFault => Boolean(fault));
  return faults.map((fault, index) => <RepairTechnician key={`${fault.machineId}-${fault.occurredAt}`} fault={fault} index={index} />);
}
