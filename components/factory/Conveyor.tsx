"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { conveyorRollerAngleDelta } from "@/lib/simulation/kinematics";
import { useFactoryStore } from "@/store/useFactoryStore";

interface ConveyorProps {
  position: [number, number, number];
  length?: number;
  rotationY?: number;
  productionLane?: boolean;
  width?: number;
}

export function Conveyor({ position, length = 8, width = 1.15, rotationY = 0, productionLane = false }: ConveyorProps) {
  const rollers = useRef<Group>(null);
  const paused = useFactoryStore((state) => state.paused);
  const speed = useFactoryStore((state) => state.speed);
  const hasPartInTransfer = useFactoryStore((state) => state.parts.some((part) => part.currentStation === "CONVEYOR"));
  const rollerPositions = useMemo(() => {
    const count = Math.max(2, Math.floor((length - .5) / .58) + 1);
    const spacing = (length - .7) / (count - 1);
    return Array.from({ length: count }, (_, index) => -length / 2 + .35 + spacing * index);
  }, [length]);
  useFrame((_, delta) => {
    if (!paused && rollers.current && (!productionLane || hasPartInTransfer)) {
      const angleDelta = conveyorRollerAngleDelta(delta, speed);
      rollers.current.children.forEach((roller) => { roller.rotation.z += angleDelta; });
    }
  });
  return (
    <group position={position} rotation={[0,rotationY,0]}>
      <mesh castShadow receiveShadow><boxGeometry args={[length,.28,width]} /><meshStandardMaterial color="#27343b" metalness={.62} roughness={.42} /></mesh>
      <mesh position={[0,.18,0]}><boxGeometry args={[length - .2,.12,width - .23]} /><meshStandardMaterial color="#151c20" roughness={.76} /></mesh>
      <group ref={rollers} position={[0,.27,0]}>
        {rollerPositions.map((x) => (
          <group key={x} position={[x,0,0]} userData={{ rotationAxis: "Z", assembly: "conveyor-roller" }}>
            <mesh rotation={[Math.PI/2,0,0]} castShadow><cylinderGeometry args={[.08,.08,width - .23,14]} /><meshStandardMaterial color="#718087" metalness={.82} roughness={.24} /></mesh>
            <mesh position={[0,.078,0]}><boxGeometry args={[.026,.018,width - .33]} /><meshStandardMaterial color="#b7c5ca" metalness={.72} roughness={.2} /></mesh>
          </group>
        ))}
      </group>
      {width > 2 && <mesh position={[0,.43,0]}><boxGeometry args={[length - .3,.08,.055]} /><meshStandardMaterial color="#d2b548" metalness={.55} roughness={.35} /></mesh>}
      {[-length / 2 + .3,length / 2 - .3].map((x) => [-width / 2 + .115,width / 2 - .115].map((z) => <mesh key={`${x}-${z}`} position={[x,-.65,z]}><boxGeometry args={[.12,1.25,.12]} /><meshStandardMaterial color="#606d73" metalness={.7} /></mesh>))}
    </group>
  );
}
