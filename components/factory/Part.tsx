"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { Vector3 } from "three";
import { getPartPosition } from "@/lib/simulation/simulationEngine";
import { hasFinishedMachining } from "@/lib/simulation/workpieceState";
import type { Part as PartType, ProductType } from "@/types/factory";

function Metal({ color }: { color: string }) {
  return <meshStandardMaterial color={color} metalness={0.82} roughness={0.2} />;
}

function MountingPlate({ color }: { color: string }) {
  const holes = [[-0.24, -0.16], [-0.24, 0.16], [0.24, -0.16], [0.24, 0.16]];
  return (
    <group>
      <mesh castShadow><boxGeometry args={[0.68, 0.13, 0.48]} /><Metal color={color} /></mesh>
      <mesh position={[0, 0.085, 0]} castShadow><cylinderGeometry args={[0.13, 0.13, 0.07, 24]} /><Metal color="#819097" /></mesh>
      {holes.map(([x, z]) => <mesh key={`${x}-${z}`} position={[x, 0.071, z]}><cylinderGeometry args={[0.045, 0.045, 0.012, 16]} /><meshStandardMaterial color="#1a2328" metalness={0.7} roughness={0.25} /></mesh>)}
    </group>
  );
}

function Impeller({ color }: { color: string }) {
  return (
    <group>
      <mesh castShadow><cylinderGeometry args={[0.13, 0.16, 0.2, 24]} /><Metal color={color} /></mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.28, 0.045, 10, 32]} /><Metal color={color} /></mesh>
      {Array.from({ length: 6 }, (_, index) => {
        const angle = index * Math.PI / 3;
        return <group key={angle} rotation={[0, angle, 0]}><mesh position={[0.21, 0, 0]} rotation={[0, 0.32, 0.18]} castShadow><boxGeometry args={[0.28, 0.1, 0.07]} /><Metal color={color} /></mesh></group>;
      })}
    </group>
  );
}

function RocketNozzle({ color }: { color: string }) {
  return (
    <group rotation={[0, 0, Math.PI / 2]}>
      <mesh castShadow><cylinderGeometry args={[0.13, 0.25, 0.32, 28, 1, true]} /><Metal color={color} /></mesh>
      <mesh position={[0, 0.18, 0]} castShadow><cylinderGeometry args={[0.13, 0.13, 0.08, 28]} /><Metal color="#819097" /></mesh>
      <mesh position={[0, -0.18, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.25, 0.025, 10, 28]} /><Metal color={color} /></mesh>
      <mesh position={[0, -0.205, 0]}><cylinderGeometry args={[0.19, 0.19, 0.012, 28]} /><meshStandardMaterial color="#172127" metalness={0.75} roughness={0.2} /></mesh>
    </group>
  );
}

function FinishedProduct({ productType, color }: { productType: ProductType; color: string }) {
  if (productType === "IMPELLER") return <Impeller color={color} />;
  if (productType === "ROCKET_NOZZLE") return <RocketNozzle color={color} />;
  return <MountingPlate color={color} />;
}

export function Part({ part, stackIndex }: { part: PartType; stackIndex: number }) {
  const group = useRef<Group>(null);
  const target = useMemo(() => new Vector3(...getPartPosition(part, stackIndex)), [part, stackIndex]);
  useFrame((_, delta) => {
    if (!group.current) return;
    group.current.position.lerp(target, Math.min(1, delta * 7));
  });
  const isCutBlank = !hasFinishedMachining(part);
  const releasedFromSaw = part.currentStation !== "RAW" || part.progress >= 28;
  const color = part.status === "REJECTED" ? "#a84642" : part.status === "COMPLETE" ? "#5bb98a" : "#b9c4c8";
  return (
    <group ref={group} position={target} visible={releasedFromSaw} userData={{ traceablePartId: part.id, productType: part.productType }}>
      <mesh castShadow visible={isCutBlank}><boxGeometry args={[.52,.42,.46]} /><meshStandardMaterial color={color} metalness={.84} roughness={.2} /></mesh>
      <group visible={!isCutBlank}><FinishedProduct productType={part.productType} color={color} /></group>
    </group>
  );
}
