"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group, Mesh } from "three";
import { MachineLabel } from "@/components/factory/MachineLabel";
import { RAW_CUT_RELEASE_PROGRESS } from "@/lib/simulation/stockFlow";
import { useFactoryStore } from "@/store/useFactoryStore";

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const smoothstep = (value: number) => {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
};

export function SawStation({ label, position }: { label: string; position: [number, number, number] }) {
  const paused = useFactoryStore((state) => state.paused);
  const bow = useRef<Group>(null);
  const blade = useRef<Mesh>(null);
  const stock = useRef<Mesh>(null);
  const lineId = label === "SAW-01" ? "south" : "north";
  const rawSerialNumber = useFactoryStore((state) => state.parts.find((part) => part.currentStation === "RAW" && part.lineId === lineId)?.serialNumber ?? null);
  const active = rawSerialNumber !== null;

  useFrame(() => {
    const rawPart = useFactoryStore.getState().parts.find((part) => part.currentStation === "RAW" && part.lineId === lineId);
    const phase = active && rawPart ? rawPart.progress / 100 : 0;
    const feed = smoothstep(phase / 0.16);
    const descent = smoothstep((phase - 0.1) / 0.09);
    const rise = smoothstep((phase - 0.23) / 0.08);
    const lowered = descent * (1 - rise);
    const cutting = active && phase >= 0.18 && phase < RAW_CUT_RELEASE_PROGRESS;

    if (bow.current) {
      bow.current.position.y = 1.83 - lowered * 0.42;
      bow.current.rotation.x = -0.045 + lowered * 0.035;
    }
    if (blade.current) blade.current.position.x = cutting ? Math.sin(phase * Math.PI * 120) * 0.012 : 0;
    if (stock.current) {
      stock.current.position.x = -1.18 + feed * 1.22;
      stock.current.visible = active && phase < RAW_CUT_RELEASE_PROGRESS;
    }
  });

  return (
    <group position={position} userData={{ auxiliaryEquipment: true, equipmentKind: "horizontal-band-saw" }}>
      <mesh position={[0, 0.34, 0]} castShadow receiveShadow><boxGeometry args={[3, 0.68, 1.85]} /><meshStandardMaterial color="#3b474b" metalness={0.56} roughness={0.42} /></mesh>
      <mesh position={[0.25, 0.72, 0]} castShadow><boxGeometry args={[2.15, 0.13, 1.42]} /><meshStandardMaterial color="#77858a" metalness={0.8} roughness={0.24} /></mesh>
      <mesh position={[0.25, 0.8, 0]}><boxGeometry args={[2, 0.05, 1.24]} /><meshStandardMaterial color="#20292d" metalness={0.54} roughness={0.44} /></mesh>
      {[-0.7, -0.15, 0.4, 0.95].map((x) => (
        <mesh key={x} position={[x, 0.86, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.055, 0.055, 1.2, 10]} />
          <meshStandardMaterial color="#a5b0b4" metalness={0.86} roughness={0.18} />
        </mesh>
      ))}
      {[-0.42, 0.42].map((z) => (
        <group key={z} position={[0.05, 1.02, z]}>
          <mesh castShadow><boxGeometry args={[0.58, 0.43, 0.14]} /><meshStandardMaterial color="#526066" metalness={0.74} roughness={0.3} /></mesh>
          <mesh position={[0, 0, -Math.sign(z) * 0.09]}><boxGeometry args={[0.48, 0.22, 0.045]} /><meshStandardMaterial color="#b2bdc1" metalness={0.9} roughness={0.15} /></mesh>
        </group>
      ))}
      <mesh position={[-0.78, 1.29, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[0.16, 0.16, 1.55, 16]} /><meshStandardMaterial color="#4c595e" metalness={0.7} roughness={0.3} /></mesh>
      {[-0.67, 0.67].map((z) => <mesh key={z} position={[-0.78, 1.27, z]} castShadow><boxGeometry args={[0.24, 1.05, 0.18]} /><meshStandardMaterial color="#556267" metalness={0.64} roughness={0.34} /></mesh>)}
      <group ref={bow} position={[-0.04, 1.83, 0]}>
        <mesh castShadow><boxGeometry args={[0.58, 0.58, 1.48]} /><meshStandardMaterial color="#248a87" metalness={0.4} roughness={0.34} /></mesh>
        {[-0.8, 0.8].map((z) => (
          <group key={z} position={[0, 0, z]}>
            <mesh rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[0.29, 0.29, 0.2, 20]} /><meshStandardMaterial color="#248a87" metalness={0.4} roughness={0.34} /></mesh>
            <mesh position={[-0.305, 0, 0]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.205, 0.205, 0.025, 18]} /><meshStandardMaterial color="#182226" metalness={0.6} roughness={0.36} /></mesh>
          </group>
        ))}
        <mesh position={[-0.3, 0, 0]}><boxGeometry args={[0.035, 0.33, 1.42]} /><meshStandardMaterial color="#192428" metalness={0.58} roughness={0.32} /></mesh>
        <mesh ref={blade} position={[0, -0.36, 0]} castShadow><boxGeometry args={[0.035, 0.045, 1.58]} /><meshStandardMaterial color="#d7dfe1" metalness={0.95} roughness={0.08} /></mesh>
        <mesh position={[0.31, 0.02, 0.46]}><boxGeometry args={[0.055, 0.25, 0.42]} /><meshBasicMaterial color="#76d1c4" transparent opacity={0.55} /></mesh>
      </group>
      <mesh ref={stock} position={[-1.18, 1.08, 0]} castShadow><boxGeometry args={[1.45, 0.42, 0.46]} /><meshStandardMaterial color="#9da8ac" metalness={0.86} roughness={0.22} /></mesh>
      <group position={[-1.25, 1.13, 1.12]} rotation={[0, -0.2, 0]}>
        <mesh castShadow><boxGeometry args={[0.58, 0.92, 0.42]} /><meshStandardMaterial color="#465358" metalness={0.55} roughness={0.4} /></mesh>
        <mesh position={[0, 0.15, 0.225]}><planeGeometry args={[0.42, 0.27]} /><meshBasicMaterial color="#172a30" /></mesh>
        <mesh position={[-0.14, -0.2, 0.24]}><sphereGeometry args={[0.065, 10, 8]} /><meshStandardMaterial color="#45d68a" emissive="#45d68a" emissiveIntensity={1.3} /></mesh>
        <mesh position={[0.04, -0.2, 0.24]}><sphereGeometry args={[0.065, 10, 8]} /><meshStandardMaterial color="#e4b73d" emissive="#e4b73d" emissiveIntensity={0.8} /></mesh>
        <mesh position={[0.22, -0.2, 0.24]}><sphereGeometry args={[0.065, 10, 8]} /><meshStandardMaterial color="#ca4943" /></mesh>
      </group>
      <mesh position={[-1.18, 0.92, -0.86]}><sphereGeometry args={[0.11, 10, 8]} /><meshStandardMaterial color={paused || !active ? "#f0c555" : "#42dc8b"} emissive={paused || !active ? "#f0c555" : "#42dc8b"} emissiveIntensity={2.2} /></mesh>
      <MachineLabel id={`${label} · BAND SAW`} status={paused || !active ? "IDLE" : "RUNNING"} position={[0, 2.85, 0]} />
    </group>
  );
}
