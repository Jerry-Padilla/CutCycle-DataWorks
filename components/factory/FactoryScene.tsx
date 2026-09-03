"use client";

import { ContactShadows, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { AuxiliaryCNC, CNC } from "@/components/factory/CNC";
import { Conveyor } from "@/components/factory/Conveyor";
import { ExploreController } from "@/components/factory/ExploreController";
import { FactoryFloor } from "@/components/factory/FactoryFloor";
import { FactorySignage } from "@/components/factory/FactorySignage";
import { InspectionStation } from "@/components/factory/InspectionStation";
import { MaintenanceTechnicians } from "@/components/factory/MaintenanceTechnicians";
import { OperatorLoader } from "@/components/factory/OperatorLoader";
import { Part } from "@/components/factory/Part";
import { RobotArm } from "@/components/factory/RobotArm";
import { SawStation } from "@/components/factory/SawStation";
import { ShippingDepot } from "@/components/factory/ShippingDepot";
import {
  CMM_STATIONS,
  CNC_LINES,
  FRONT_INFEED_CONVEYORS,
  OPERATOR_CELLS,
  ROBOT_STATIONS,
  SAW_STATIONS,
} from "@/lib/factory/layout";
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
      <directionalLight position={[4,14,7]} intensity={2.2} color="#d8f2ff" castShadow shadow-mapSize={[1024,1024]} shadow-camera-far={38} shadow-camera-left={-18} shadow-camera-right={24} shadow-camera-top={14} shadow-camera-bottom={-14} />
      <pointLight position={[-5,6,-3]} intensity={24} distance={12} color="#8fd6ff" />
      <pointLight position={[7,6,3]} intensity={20} distance={12} color="#d9efff" />
      <pointLight position={[14,7,0]} intensity={18} distance={11} color="#bfe8ff" />
      <group onPointerMissed={() => select(null)}>
        <FactoryFloor />
        <ShippingDepot />
        <FactorySignage />
        {CNC_LINES.flatMap((line) => line.machines).map((machine) => machine.instrumentedId ? (
          <CNC key={machine.label} id={machine.instrumentedId} position={machine.position} rotationY={machine.rotationY} />
        ) : (
          <AuxiliaryCNC key={machine.label} label={machine.label} position={machine.position} rotationY={machine.rotationY} />
        ))}
        {FRONT_INFEED_CONVEYORS.map((conveyor) => <Conveyor key={conveyor.id} position={conveyor.position} length={conveyor.length} width={conveyor.width} rotationY={conveyor.id === "inspection-merge" ? Math.PI / 2 : 0} lineId={conveyor.lineId} productionLane />)}
        {SAW_STATIONS.map((saw) => <SawStation key={saw.label} label={saw.label} position={saw.position} />)}
        {OPERATOR_CELLS.map((cell, index) => <OperatorLoader key={cell.id} cell={cell} colorIndex={index} />)}
        <MaintenanceTechnicians />
        {ROBOT_STATIONS.map((robot) => <RobotArm key={robot.label} {...robot} />)}
        {CMM_STATIONS.map((cmm) => cmm.instrumented ? (
          <InspectionStation key={cmm.label} position={cmm.position} rotationY={cmm.rotationY} />
        ) : (
          <InspectionStation key={cmm.label} position={cmm.position} rotationY={cmm.rotationY} auxiliaryLabel={cmm.label} />
        ))}
        {parts.map((part,index) => <Part key={part.id} part={part} stackIndex={index} />)}
      </group>
      <ContactShadows position={[0,.03,0]} opacity={.32} scale={34} blur={2.8} far={8} frames={1} />
      {explore ? <ExploreController /> : <OrbitControls makeDefault target={[3,1,0]} minDistance={11} maxDistance={52} maxPolarAngle={Math.PI/2.08} enableDamping dampingFactor={.08} />}
    </>
  );
}

export default function FactoryScene() {
  return <Canvas shadows dpr={[1,1.5]} camera={{ position:[28,19,29],fov:44,near:.1,far:90 }} gl={{ antialias:true,powerPreference:"high-performance" }}><Cell /></Canvas>;
}
