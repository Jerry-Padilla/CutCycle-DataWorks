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
        <planeGeometry args={[34, 22]} />
        <meshStandardMaterial color="#20282d" roughness={0.8} metalness={0.08} />
      </mesh>
      <gridHelper args={[34, 34, "#52616a", "#303b42"]} position={[0, 0.012, 0]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, .02, -9]}>
        <planeGeometry args={[31, .07]} /><meshBasicMaterial color="#e2bd52" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, .02, 9]}>
        <planeGeometry args={[31, .07]} /><meshBasicMaterial color="#e2bd52" />
      </mesh>
      <Rack position={[-14.8, 0, -7.8]} />
      <Rack position={[-14.8, 0, 7.8]} />
      <Rack position={[15.2, 0, -7.8]} finished />
      <Rack position={[15.2, 0, 7.8]} finished />
      <group position={[12, 0, -7.2]}>
        <mesh position={[0,.45,0]} castShadow><boxGeometry args={[1.45,.9,1.25]} /><meshStandardMaterial color="#7c2e2e" roughness={.65} /></mesh>
        <mesh position={[0,.94,0]}><boxGeometry args={[1.52,.08,1.32]} /><meshStandardMaterial color="#b54d48" /></mesh>
      </group>
      <SafetyBarrier />
    </group>
  );
}

function SafetyBarrier() {
  const posts: [number, number, number][] = [[7.2,1.1,6.4],[9.1,1.1,6.4],[11,1.1,6.4],[12.9,1.1,6.4]];
  return (
    <group>
      {posts.map((position,index) => <mesh key={index} position={position} castShadow><boxGeometry args={[.09,2.2,.09]} /><meshStandardMaterial color="#e7bd42" metalness={.55} roughness={.35} /></mesh>)}
      {[8.15,10.05,11.95].map((x) => <mesh key={x} position={[x,1.1,6.4]}><planeGeometry args={[1.8,2]} /><meshPhysicalMaterial color="#8bc6d8" transparent opacity={.1} side={THREE.DoubleSide} roughness={.12} transmission={.2} /></mesh>)}
    </group>
  );
}
