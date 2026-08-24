"use client";

import { ContactShadows, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { AuxiliaryCNC, CNC } from "@/components/factory/CNC";
import { Conveyor } from "@/components/factory/Conveyor";
import { ExploreController } from "@/components/factory/ExploreController";
import { FactoryFloor } from "@/components/factory/FactoryFloor";
import { InspectionStation } from "@/components/factory/InspectionStation";
import { Part } from "@/components/factory/Part";
import { RobotArm } from "@/components/factory/RobotArm";
import { SawStation } from "@/components/factory/SawStation";
import { useFactoryStore } from "@/store/useFactoryStore";

function Cell() {
  const parts = useFactoryStore((state) => state.parts);
  const explore = useFactoryStore((state) => state.exploreMode);
  const select = useFactoryStore((state) => state.selectMachine);
  return (
    <>
      <color attach="background" args={["#0d171e"]} />
      <fog attach="fog" args={["#0d171e",24,48]} />
      <ambientLight intensity={.72} />
      <hemisphereLight args={["#bde8ff","#1a2328",1.1]} />
      <directionalLight position={[4,14,7]} intensity={2.2} color="#d8f2ff" castShadow shadow-mapSize={[1024,1024]} shadow-camera-far={30} shadow-camera-left={-14} shadow-camera-right={14} shadow-camera-top={12} shadow-camera-bottom={-12} />
      <pointLight position={[-5,6,-3]} intensity={24} distance={12} color="#8fd6ff" />
      <pointLight position={[7,6,3]} intensity={20} distance={12} color="#d9efff" />
      <pointLight position={[14,7,0]} intensity={18} distance={11} color="#bfe8ff" />
      <group onPointerMissed={() => select(null)}>
        <FactoryFloor />
        <CNC id="CNC-01" position={[-9,0,-2.5]} />
        <CNC id="CNC-02" position={[-5.4,0,-2.5]} />
        <AuxiliaryCNC label="CNC-03" position={[-1.8,0,-2.5]} />
        <AuxiliaryCNC label="CNC-04" position={[1.8,0,-2.5]} />
        <AuxiliaryCNC label="CNC-05" position={[5.4,0,-2.5]} />
        <AuxiliaryCNC label="CNC-06" position={[9,0,-2.5]} />
        <AuxiliaryCNC label="CNC-07" position={[-9,0,2.5]} rotationY={Math.PI} />
        <AuxiliaryCNC label="CNC-08" position={[-5.4,0,2.5]} rotationY={Math.PI} />
        <AuxiliaryCNC label="CNC-09" position={[-1.8,0,2.5]} rotationY={Math.PI} />
        <AuxiliaryCNC label="CNC-10" position={[1.8,0,2.5]} rotationY={Math.PI} />
        <AuxiliaryCNC label="CNC-11" position={[5.4,0,2.5]} rotationY={Math.PI} />
        <AuxiliaryCNC label="CNC-12" position={[9,0,2.5]} rotationY={Math.PI} />
        <Conveyor position={[0,.78,-4.4]} length={24} productionLane />
        <Conveyor position={[0,.78,4.4]} length={24} />
        <SawStation label="SAW-01" position={[-13.4,0,-4.4]} />
        <SawStation label="SAW-02" position={[-13.4,0,4.4]} />
        <RobotArm />
        <InspectionStation />
        <InspectionStation position={[14,0,0]} auxiliaryLabel="CMM-02" />
        <InspectionStation position={[14,0,4.4]} auxiliaryLabel="CMM-03" />
        {parts.map((part,index) => <Part key={part.id} part={part} stackIndex={index} />)}
      </group>
      <ContactShadows position={[0,.03,0]} opacity={.32} scale={34} blur={2.8} far={8} frames={1} />
      {explore ? <ExploreController /> : <OrbitControls makeDefault target={[1,1,0]} minDistance={11} maxDistance={44} maxPolarAngle={Math.PI/2.08} enableDamping dampingFactor={.08} />}
    </>
  );
}

export default function FactoryScene() {
  return <Canvas shadows dpr={[1,1.5]} camera={{ position:[22,17,24],fov:43,near:.1,far:80 }} gl={{ antialias:true,powerPreference:"high-performance" }}><Cell /></Canvas>;
}
