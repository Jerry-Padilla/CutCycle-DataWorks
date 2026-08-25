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
  infeedLane?: boolean;
}

export function Conveyor({ position, length = 8, rotationY = 0, productionLane = false, infeedLane = false }: ConveyorProps) {
  const rollers = useRef<Group>(null);
  const infeedStock = useRef<Group>(null);
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
    if (infeedLane && infeedStock.current) {
      const simulationSeconds = useFactoryStore.getState().simulationNow / 1000;
      infeedStock.current.children.forEach((piece, index) => {
        const travel = (simulationSeconds / 7 + index * 0.47) % 1;
        piece.position.x = -length / 2 + 0.65 + travel * (length - 1.3);
      });
    }
  });
  return (
    <group position={position} rotation={[0,rotationY,0]}>
      <mesh castShadow receiveShadow><boxGeometry args={[length,.28,1.15]} /><meshStandardMaterial color="#27343b" metalness={.62} roughness={.42} /></mesh>
      <mesh position={[0,.18,0]}><boxGeometry args={[length - .2,.12,.92]} /><meshStandardMaterial color="#151c20" roughness={.76} /></mesh>
      <group ref={rollers} position={[0,.27,0]}>
        {rollerPositions.map((x) => (
          <group key={x} position={[x,0,0]} userData={{ rotationAxis: "Z", assembly: "conveyor-roller" }}>
            <mesh rotation={[Math.PI/2,0,0]} castShadow><cylinderGeometry args={[.08,.08,.92,14]} /><meshStandardMaterial color="#718087" metalness={.82} roughness={.24} /></mesh>
            <mesh position={[0,.078,0]}><boxGeometry args={[.026,.018,.82]} /><meshStandardMaterial color="#b7c5ca" metalness={.72} roughness={.2} /></mesh>
          </group>
        ))}
      </group>
      {infeedLane && (
        <group ref={infeedStock} position={[0, .52, 0]} userData={{ materialFlow: "saw-to-cnc-front" }}>
          {[0, 1].map((index) => (
            <mesh key={index} castShadow>
              <boxGeometry args={[.62, .34, .44]} />
              <meshStandardMaterial color="#aeb9bd" metalness={.86} roughness={.2} />
            </mesh>
          ))}
        </group>
      )}
      {[-length / 2 + .3,length / 2 - .3].map((x) => [-.46,.46].map((z) => <mesh key={`${x}-${z}`} position={[x,-.65,z]}><boxGeometry args={[.12,1.25,.12]} /><meshStandardMaterial color="#606d73" metalness={.7} /></mesh>))}
    </group>
  );
}
