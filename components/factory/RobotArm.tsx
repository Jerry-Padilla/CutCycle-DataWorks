"use client";

import { useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import type { Group } from "three";
import { MachineLabel } from "@/components/factory/MachineLabel";
import { useFactoryStore } from "@/store/useFactoryStore";
import type { MachineStatus } from "@/types/factory";

const colors: Record<MachineStatus,string> = { RUNNING:"#42dc8b",IDLE:"#f0c555",FAULT:"#ff514b",MAINTENANCE:"#4baee7" };

export function RobotArm() {
  const machine = useFactoryStore((state) => state.machines["ROBOT-01"]);
  const selected = useFactoryStore((state) => state.selectedMachineId === "ROBOT-01");
  const select = useFactoryStore((state) => state.selectMachine);
  const base = useRef<Group>(null); const shoulder = useRef<Group>(null); const elbow = useRef<Group>(null);
  useFrame(() => {
    const t = machine.progress / 100;
    const swing = t < .5 ? t * 2 : (1-t) * 2;
    if (base.current) base.current.rotation.y = -1.05 + swing * 2.05;
    if (shoulder.current) shoulder.current.rotation.z = -.3 - Math.sin(t*Math.PI)*.7;
    if (elbow.current) elbow.current.rotation.z = .65 + Math.sin(t*Math.PI)*.45;
  });
  const click = (event: ThreeEvent<MouseEvent>) => { event.stopPropagation(); select("ROBOT-01"); };
  return (
    <group position={[5.4,0,0]} onClick={click} userData={{ machineId:"ROBOT-01" }}>
      <mesh position={[0,.25,0]} castShadow><cylinderGeometry args={[.72,.88,.5,20]} /><meshStandardMaterial color="#313d44" metalness={.65} roughness={.34} /></mesh>
      <group ref={base} position={[0,.48,0]}>
        <mesh position={[0,.55,0]} castShadow><cylinderGeometry args={[.42,.52,1.1,16]} /><meshStandardMaterial color="#d2a934" metalness={.45} roughness={.36} /></mesh>
        <group ref={shoulder} position={[0,1.08,0]} rotation={[0,0,-.3]}>
          <mesh position={[0,1,0]} castShadow><boxGeometry args={[.56,2.15,.65]} /><meshStandardMaterial color="#e0b63c" metalness={.4} roughness={.32} /></mesh>
          <mesh position={[0,2.02,0]}><sphereGeometry args={[.45,16,12]} /><meshStandardMaterial color="#2e3940" metalness={.72} roughness={.28} /></mesh>
          <group ref={elbow} position={[0,2.02,0]} rotation={[0,0,.65]}>
            <mesh position={[0,.82,0]} castShadow><boxGeometry args={[.45,1.75,.52]} /><meshStandardMaterial color="#d9ae37" metalness={.4} roughness={.33} /></mesh>
            <mesh position={[0,1.72,0]}><cylinderGeometry args={[.2,.2,.5,12]} /><meshStandardMaterial color="#353f44" metalness={.75} /></mesh>
            <mesh position={[-.18,1.98,0]}><boxGeometry args={[.1,.48,.12]} /><meshStandardMaterial color="#5b6970" metalness={.7} /></mesh>
            <mesh position={[.18,1.98,0]}><boxGeometry args={[.1,.48,.12]} /><meshStandardMaterial color="#5b6970" metalness={.7} /></mesh>
          </group>
        </group>
      </group>
      <mesh position={[0,.25,0]} visible={selected}><cylinderGeometry args={[.96,.96,.62,24]} /><meshBasicMaterial color="#73caef" wireframe transparent opacity={.8} depthTest={false} /></mesh>
      <mesh position={[0,.25,0]} visible={false}><cylinderGeometry args={[1.3,1.3,1,16]} /><meshBasicMaterial /></mesh>
      <mesh position={[.62,.7,0]}><sphereGeometry args={[.11,10,8]} /><meshStandardMaterial color={colors[machine.status]} emissive={colors[machine.status]} emissiveIntensity={2.5} /></mesh>
      <MachineLabel id="ROBOT-01" status={machine.status} position={[0,4.35,0]} />
    </group>
  );
}
