"use client";

import { useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import type { Group, Mesh } from "three";
import { MachineLabel } from "@/components/factory/MachineLabel";
import { CMM_STATIONS, type RobotLayout } from "@/lib/factory/layout";
import { liveTransferRobotPose, restRobotPose, robotBaseRotationToward, serviceRobotPose } from "@/lib/simulation/robotKinematics";
import { useFactoryStore } from "@/store/useFactoryStore";
import type { MachineStatus } from "@/types/factory";

const colors: Record<MachineStatus,string> = { RUNNING:"#42dc8b",IDLE:"#f0c555",FAULT:"#ff514b",MAINTENANCE:"#4baee7" };

export function RobotArm({ label, position, instrumented, phaseOffsetSeconds }: RobotLayout) {
  const machine = useFactoryStore((state) => state.machines["ROBOT-01"]);
  const paused = useFactoryStore((state) => state.paused);
  const selected = useFactoryStore((state) => state.selectedMachineId === label);
  const select = useFactoryStore((state) => state.selectMachine);
  const base = useRef<Group>(null); const shoulder = useRef<Group>(null); const elbow = useRef<Group>(null);
  const leftFinger = useRef<Mesh>(null); const rightFinger = useRef<Mesh>(null);
  const status: MachineStatus = instrumented ? machine.status : paused ? "IDLE" : "RUNNING";
  useFrame((_, delta) => {
    const state = useFactoryStore.getState();
    const activePart = state.parts.find((part) => part.currentStation === label);
    const activeTransfer = activePart !== undefined;
    const shouldService = instrumented ? machine.status === "RUNNING" : !state.paused;
    const destination = activePart ? CMM_STATIONS.find((cmm) => cmm.label === activePart.assignedCmm)?.position : undefined;
    const pickup: [number, number, number] = [10.6, 1.3, activePart?.lineId === "north" ? 0.9 : -0.9];
    const pose = activeTransfer
      ? liveTransferRobotPose(
          activePart.progress / 100,
          robotBaseRotationToward(position, pickup),
          robotBaseRotationToward(position, destination ?? [15.3, 1.1, position[2]]),
        )
      : shouldService
        ? serviceRobotPose(state.simulationNow / 1000, phaseOffsetSeconds)
        : restRobotPose();
    const damping = Math.min(1, delta * 7);
    if (base.current) base.current.rotation.y = activeTransfer ? pose.baseRotation : base.current.rotation.y + (pose.baseRotation - base.current.rotation.y) * damping;
    if (shoulder.current) shoulder.current.rotation.z = activeTransfer ? pose.shoulderRotation : shoulder.current.rotation.z + (pose.shoulderRotation - shoulder.current.rotation.z) * damping;
    if (elbow.current) elbow.current.rotation.z = activeTransfer ? pose.elbowRotation : elbow.current.rotation.z + (pose.elbowRotation - elbow.current.rotation.z) * damping;
    const fingerOffset = pose.gripperClosed ? 0.1 : 0.2;
    if (leftFinger.current) leftFinger.current.position.x = activeTransfer ? -fingerOffset : leftFinger.current.position.x + (-fingerOffset - leftFinger.current.position.x) * damping;
    if (rightFinger.current) rightFinger.current.position.x = activeTransfer ? fingerOffset : rightFinger.current.position.x + (fingerOffset - rightFinger.current.position.x) * damping;
  });
  const click = (event: ThreeEvent<MouseEvent>) => { event.stopPropagation(); select(label); };
  return (
    <group position={position} onClick={click} userData={{ machineId: label }}>
      <mesh position={[0,.25,0]} castShadow><cylinderGeometry args={[.72,.88,.5,20]} /><meshStandardMaterial color="#313d44" metalness={.65} roughness={.34} /></mesh>
      <group ref={base} position={[0,.48,0]}>
        <mesh position={[0,.55,0]} castShadow><cylinderGeometry args={[.42,.52,1.1,16]} /><meshStandardMaterial color="#d2a934" metalness={.45} roughness={.36} /></mesh>
        <group ref={shoulder} position={[0,1.08,0]} rotation={[0,0,-1.08]}>
          <mesh position={[0,1,0]} castShadow><boxGeometry args={[.56,2.15,.65]} /><meshStandardMaterial color="#e0b63c" metalness={.4} roughness={.32} /></mesh>
          <mesh position={[0,2.02,0]}><sphereGeometry args={[.45,16,12]} /><meshStandardMaterial color="#2e3940" metalness={.72} roughness={.28} /></mesh>
          <group ref={elbow} position={[0,2.02,0]} rotation={[0,0,-.92]}>
            <mesh position={[0,.82,0]} castShadow><boxGeometry args={[.45,1.75,.52]} /><meshStandardMaterial color="#d9ae37" metalness={.4} roughness={.33} /></mesh>
            <mesh position={[0,1.72,0]}><cylinderGeometry args={[.2,.2,.5,12]} /><meshStandardMaterial color="#353f44" metalness={.75} /></mesh>
            <mesh ref={leftFinger} position={[-.2,1.98,0]}><boxGeometry args={[.1,.48,.12]} /><meshStandardMaterial color="#5b6970" metalness={.7} /></mesh>
            <mesh ref={rightFinger} position={[.2,1.98,0]}><boxGeometry args={[.1,.48,.12]} /><meshStandardMaterial color="#5b6970" metalness={.7} /></mesh>
          </group>
        </group>
      </group>
      <mesh position={[0,.25,0]} visible={selected}><cylinderGeometry args={[.96,.96,.62,24]} /><meshBasicMaterial color="#73caef" wireframe transparent opacity={.8} depthTest={false} /></mesh>
      <mesh position={[0,.25,0]} visible={false}><cylinderGeometry args={[1.3,1.3,1,16]} /><meshBasicMaterial /></mesh>
      <mesh position={[.62,.7,0]}><sphereGeometry args={[.11,10,8]} /><meshStandardMaterial color={colors[status]} emissive={colors[status]} emissiveIntensity={2.5} /></mesh>
      <MachineLabel id={instrumented ? label : `${label} · AUX`} status={status} position={[0,4.35,0]} />
    </group>
  );
}
