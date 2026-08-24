"use client";

import { ContactShadows, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { CNC } from "@/components/factory/CNC";
import { Conveyor } from "@/components/factory/Conveyor";
import { ExploreController } from "@/components/factory/ExploreController";
import { FactoryFloor } from "@/components/factory/FactoryFloor";
import { InspectionStation } from "@/components/factory/InspectionStation";
import { Part } from "@/components/factory/Part";
import { RobotArm } from "@/components/factory/RobotArm";
import { useFactoryStore } from "@/store/useFactoryStore";

function Cell() {
  const parts = useFactoryStore((state) => state.parts);
  const explore = useFactoryStore((state) => state.exploreMode);
  const select = useFactoryStore((state) => state.selectMachine);
  return (
    <>
      <color attach="background" args={["#0d171e"]} />
      <fog attach="fog" args={["#0d171e",20,38]} />
      <ambientLight intensity={.72} />
      <hemisphereLight args={["#bde8ff","#1a2328",1.1]} />
      <directionalLight position={[4,14,7]} intensity={2.2} color="#d8f2ff" castShadow shadow-mapSize={[1024,1024]} shadow-camera-far={30} shadow-camera-left={-14} shadow-camera-right={14} shadow-camera-top={12} shadow-camera-bottom={-12} />
      <pointLight position={[-5,6,-3]} intensity={24} distance={12} color="#8fd6ff" />
      <pointLight position={[7,6,3]} intensity={20} distance={12} color="#d9efff" />
      <group onPointerMissed={() => select(null)}>
        <FactoryFloor />
        <CNC id="CNC-01" position={[-4.6,0,-2.4]} />
        <CNC id="CNC-02" position={[-.8,0,-2.4]} />
        <Conveyor />
        <RobotArm />
        <InspectionStation />
        {parts.map((part,index) => <Part key={part.id} part={part} stackIndex={index} />)}
      </group>
      <ContactShadows position={[0,.03,0]} opacity={.32} scale={25} blur={2.8} far={8} frames={1} />
      {explore ? <ExploreController /> : <OrbitControls makeDefault target={[0,1,0]} minDistance={9} maxDistance={34} maxPolarAngle={Math.PI/2.08} enableDamping dampingFactor={.08} />}
    </>
  );
}

export default function FactoryScene() {
  return <Canvas shadows dpr={[1,1.5]} camera={{ position:[15,13,17],fov:42,near:.1,far:70 }} gl={{ antialias:true,powerPreference:"high-performance" }}><Cell /></Canvas>;
}
