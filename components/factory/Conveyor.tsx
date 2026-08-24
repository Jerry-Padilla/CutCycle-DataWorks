"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";

export function Conveyor() {
  const rollers = useRef<Group>(null);
  useFrame((_, delta) => { if (rollers.current) rollers.current.children.forEach((roller) => { roller.rotation.z -= delta * 2.4; }); });
  const angle = -Math.atan2(1.9, 3.6);
  return (
    <group position={[2.7,.78,-1.3]} rotation={[0,angle,0]}>
      <mesh castShadow receiveShadow><boxGeometry args={[4.25,.28,1.15]} /><meshStandardMaterial color="#27343b" metalness={.62} roughness={.42} /></mesh>
      <mesh position={[0,.18,0]}><boxGeometry args={[4.05,.12,.92]} /><meshStandardMaterial color="#151c20" roughness={.76} /></mesh>
      <group ref={rollers} position={[0,.27,0]}>
        {[-1.7,-1.1,-.5,.1,.7,1.3,1.8].map((x) => <mesh key={x} position={[x,0,0]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.08,.08,.92,10]} /><meshStandardMaterial color="#718087" metalness={.82} roughness={.24} /></mesh>)}
      </group>
      {[-1.8,1.8].map((x) => [-.46,.46].map((z) => <mesh key={`${x}-${z}`} position={[x,-.65,z]}><boxGeometry args={[.12,1.25,.12]} /><meshStandardMaterial color="#606d73" metalness={.7} /></mesh>))}
    </group>
  );
}
