"use client";

import * as THREE from "three";

function Rack({ position, finished = false }: { position: [number, number, number]; finished?: boolean }) {
  return (
    <group position={position}>
      {[-1.05, 1.05].map((x) => <mesh key={x} position={[x, 1.25, 0]} castShadow><boxGeometry args={[0.12, 2.5, 1.35]} /><meshStandardMaterial color="#52616a" metalness={0.75} roughness={0.35} /></mesh>)}
      {[0.15, 1.2, 2.25].map((y) => <mesh key={y} position={[0, y, 0]} castShadow><boxGeometry args={[2.2, 0.1, 1.35]} /><meshStandardMaterial color="#697780" metalness={0.7} roughness={0.38} /></mesh>)}
      <mesh position={[0, 2.72, 0]}><boxGeometry args={[2.2, .36, 1.35]} /><meshStandardMaterial color={finished ? "#274b41" : "#243843"} /></mesh>
    </group>
  );
}

export function FactoryFloor() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[25, 18]} />
        <meshStandardMaterial color="#20282d" roughness={0.8} metalness={0.08} />
      </mesh>
      <gridHelper args={[24, 24, "#52616a", "#303b42"]} position={[0, 0.012, 0]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, .02, -4.7]}>
        <planeGeometry args={[21, .07]} /><meshBasicMaterial color="#e2bd52" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, .02, 5.9]}>
        <planeGeometry args={[21, .07]} /><meshBasicMaterial color="#e2bd52" />
      </mesh>
      <Rack position={[-8.2, 0, -2.5]} />
      <Rack position={[8.5, 0, 5.2]} finished />
      <group position={[5.7, 0, 4.6]}>
        <mesh position={[0,.45,0]} castShadow><boxGeometry args={[1.45,.9,1.25]} /><meshStandardMaterial color="#7c2e2e" roughness={.65} /></mesh>
        <mesh position={[0,.94,0]}><boxGeometry args={[1.52,.08,1.32]} /><meshStandardMaterial color="#b54d48" /></mesh>
      </group>
      <SafetyBarrier />
    </group>
  );
}

function SafetyBarrier() {
  const posts: [number, number, number][] = [[3.5,1.1,2.5],[5.5,1.1,2.5],[7.5,1.1,2.5],[9.5,1.1,2.5]];
  return (
    <group>
      {posts.map((position,index) => <mesh key={index} position={position} castShadow><boxGeometry args={[.09,2.2,.09]} /><meshStandardMaterial color="#e7bd42" metalness={.55} roughness={.35} /></mesh>)}
      {[4.5,6.5,8.5].map((x) => <mesh key={x} position={[x,1.1,2.5]}><planeGeometry args={[1.9,2]} /><meshPhysicalMaterial color="#8bc6d8" transparent opacity={.1} side={THREE.DoubleSide} roughness={.12} transmission={.2} /></mesh>)}
    </group>
  );
}
