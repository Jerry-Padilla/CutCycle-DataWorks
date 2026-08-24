"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { Vector3 } from "three";
import { getPartPosition } from "@/lib/simulation/simulationEngine";
import type { Part as PartType } from "@/types/factory";

export function Part({ part, stackIndex }: { part: PartType; stackIndex: number }) {
  const group = useRef<Group>(null);
  const target = useMemo(() => new Vector3(...getPartPosition(part, stackIndex)), [part, stackIndex]);
  useFrame((_, delta) => {
    if (!group.current) return;
    group.current.position.lerp(target, Math.min(1, delta * 7));
    if (part.status === "MOVING") group.current.rotation.y += delta * 1.4;
  });
  const color = part.status === "REJECTED" ? "#a84642" : part.status === "COMPLETE" ? "#5bb98a" : "#b9c4c8";
  return (
    <group ref={group} position={target}>
      <mesh castShadow><cylinderGeometry args={[.31,.31,.28,18]} /><meshStandardMaterial color={color} metalness={.78} roughness={.22} /></mesh>
      <mesh position={[0,.15,0]}><cylinderGeometry args={[.15,.15,.025,18]} /><meshStandardMaterial color="#425058" metalness={.8} roughness={.2} /></mesh>
    </group>
  );
}
