"use client";

import { SHIPPING_DEPOT_POSITION } from "@/lib/factory/layout";

function Pallet({ position, crateColor = "#6d5237" }: { position: [number, number, number]; crateColor?: string }) {
  return <group position={position}>
    {[[-.48,-.34], [0,-.34], [.48,-.34], [-.48,.34], [0,.34], [.48,.34]].map(([x,z], index) => <mesh key={index} position={[x,.1,z]} castShadow><boxGeometry args={[.42,.16,.58]} /><meshStandardMaterial color="#80633c" roughness={.68} /></mesh>)}
    <mesh position={[0,.65,0]} castShadow><boxGeometry args={[1.35,1.05,1.05]} /><meshStandardMaterial color={crateColor} roughness={.58} metalness={.08} /></mesh>
    <mesh position={[0,.66,.535]}><boxGeometry args={[1.15,.12,.025]} /><meshBasicMaterial color="#c8b279" /></mesh>
  </group>;
}

export function ShippingDepot() {
  return (
    <group position={SHIPPING_DEPOT_POSITION} userData={{ department: "shipping-depot" }}>
      <mesh position={[0,.035,0]} receiveShadow><boxGeometry args={[6.2,.07,18]} /><meshStandardMaterial color="#283137" roughness={.82} /></mesh>
      <mesh position={[3,2.5,0]} castShadow><boxGeometry args={[.3,5,18]} /><meshStandardMaterial color="#344149" metalness={.5} roughness={.46} /></mesh>
      {[-5.7,0,5.7].map((z) => <group key={z} position={[2.82,2.15,z]} rotation={[0,Math.PI/2,0]}>
        <mesh castShadow><boxGeometry args={[3.7,3.55,.08]} /><meshStandardMaterial color="#75848b" metalness={.7} roughness={.32} /></mesh>
        {[-1.25,-.75,-.25,.25,.75,1.25].map((y) => <mesh key={y} position={[0,y,.046]}><boxGeometry args={[3.45,.035,.02]} /><meshBasicMaterial color="#29373e" /></mesh>)}
      </group>)}
      {[-7.8,-3.9,0,3.9,7.8].map((z) => <mesh key={z} position={[-1.1,.025,z]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[3.5,.06]} /><meshBasicMaterial color="#d3b547" /></mesh>)}
      <Pallet position={[-.9,0,-6.5]} crateColor="#475d67" />
      <Pallet position={[-.8,0,-3.9]} />
      <Pallet position={[-.9,0,3.9]} crateColor="#475d67" />
      <Pallet position={[-.8,0,6.5]} />
      <group position={[.8,0,-1.8]}>
        <mesh position={[0,.42,0]} castShadow><boxGeometry args={[1.5,.65,.92]} /><meshStandardMaterial color="#d28b32" metalness={.35} roughness={.44} /></mesh>
        <mesh position={[-.45,1.25,0]} castShadow><boxGeometry args={[.12,1.5,.9]} /><meshStandardMaterial color="#4a5960" metalness={.65} /></mesh>
        {[-.52,.52].map((z) => <mesh key={z} position={[-.42,.26,z]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.27,.27,.18,16]} /><meshStandardMaterial color="#171d20" roughness={.7} /></mesh>)}
        <mesh position={[-1.2,.17,-.3]}><boxGeometry args={[1.5,.09,.1]} /><meshStandardMaterial color="#7d898e" metalness={.8} /></mesh>
        <mesh position={[-1.2,.17,.3]}><boxGeometry args={[1.5,.09,.1]} /><meshStandardMaterial color="#7d898e" metalness={.8} /></mesh>
      </group>
    </group>
  );
}
