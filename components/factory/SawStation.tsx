"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";
import { MachineLabel } from "@/components/factory/MachineLabel";
import { useFactoryStore } from "@/store/useFactoryStore";

export function SawStation({ label, position }: { label: string; position: [number, number, number] }) {
  const paused = useFactoryStore((state) => state.paused);
  const speed = useFactoryStore((state) => state.speed);
  const blank = useRef<Mesh>(null);
  const blade = useRef<Mesh>(null);
  const phase = useRef(0);

  useFrame((_, delta) => {
    if (paused) return;
    phase.current = (phase.current + delta * .18 * speed) % 1;
    if (blank.current) {
      blank.current.position.x = .15 + phase.current * 2.25;
      blank.current.rotation.x -= delta * 1.8 * speed;
      blank.current.visible = phase.current < .94;
    }
    if (blade.current) blade.current.position.y = 1.12 + Math.sin(phase.current * Math.PI * 12) * .018;
  });

  return (
    <group position={position} userData={{ auxiliaryEquipment:true, equipmentKind:"saw-feeder" }}>
      <mesh position={[0,.34,0]} castShadow receiveShadow><boxGeometry args={[2.5,.68,1.5]} /><meshStandardMaterial color="#35434a" metalness={.58} roughness={.38} /></mesh>
      <mesh position={[.68,.72,0]} castShadow><boxGeometry args={[1.7,.12,1.12]} /><meshStandardMaterial color="#738087" metalness={.78} roughness={.24} /></mesh>
      {[-.62,.62].map((z) => <mesh key={z} position={[.68,.82,z]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.055,.055,1.7,10]} /><meshStandardMaterial color="#a2afb4" metalness={.84} roughness={.2} /></mesh>)}
      <mesh position={[-.62,1.4,0]} castShadow><boxGeometry args={[.26,1.75,1.42]} /><meshStandardMaterial color="#26343a" metalness={.52} roughness={.4} /></mesh>
      <mesh position={[-.05,2.2,0]} castShadow><boxGeometry args={[1.35,.28,1.42]} /><meshStandardMaterial color="#26343a" metalness={.52} roughness={.4} /></mesh>
      {[-.42,.42].map((x) => <mesh key={x} position={[x,2.2,.02]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.34,.34,.12,18]} /><meshStandardMaterial color="#56656c" metalness={.68} roughness={.28} /></mesh>)}
      <mesh ref={blade} position={[.34,1.12,0]} castShadow><boxGeometry args={[.028,1.35,.05]} /><meshStandardMaterial color="#d0d8db" metalness={.94} roughness={.1} /></mesh>
      <mesh ref={blank} position={[.15,.92,0]} rotation={[0,0,Math.PI/2]} castShadow><cylinderGeometry args={[.18,.18,.46,14]} /><meshStandardMaterial color="#aebbc0" metalness={.82} roughness={.22} /></mesh>
      <mesh position={[-1.02,2.16,.78]}><sphereGeometry args={[.11,10,8]} /><meshStandardMaterial color={paused ? "#f0c555" : "#42dc8b"} emissive={paused ? "#f0c555" : "#42dc8b"} emissiveIntensity={2.2} /></mesh>
      <MachineLabel id={`${label} · FEED`} status={paused ? "IDLE" : "RUNNING"} position={[-.25,2.95,0]} />
    </group>
  );
}
