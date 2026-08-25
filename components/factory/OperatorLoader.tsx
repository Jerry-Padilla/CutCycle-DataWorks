"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { Group } from "three";
import type { OperatorCellLayout } from "@/lib/factory/layout";
import {
  operatorIdlePose,
  operatorPoseAtPhase,
  operatorUnloadPoseAtProgress,
  type OperatorPath,
} from "@/lib/simulation/operatorKinematics";
import { useFactoryStore } from "@/store/useFactoryStore";

const vestColors = ["#e6a735", "#e27d3f", "#d7b83d", "#e58f38"];
const shirtColors = ["#263e4a", "#314653", "#253a47", "#354852"];

export function OperatorLoader({ cell, colorIndex }: { cell: OperatorCellLayout; colorIndex: number }) {
  const operator = useRef<Group>(null);
  const leftArm = useRef<Group>(null);
  const rightArm = useRef<Group>(null);
  const leftLeg = useRef<Group>(null);
  const rightLeg = useRef<Group>(null);
  const path = useMemo<OperatorPath>(() => ({
    machineXs: cell.machines.map((machine) => machine.position[0]),
    machineZ: cell.machineZ,
    infeedZ: cell.infeedZ,
    rotationY: cell.rotationY,
  }), [cell]);

  useFrame(() => {
    const state = useFactoryStore.getState();
    const liveHandling = state.parts.find((part) => {
      const machineIndex = cell.machines.findIndex((machine) => machine.instrumentedId === part.currentStation);
      return machineIndex >= 0 && (part.progress <= 30 || part.progress >= 78);
    });
    const liveMachineIndex = liveHandling
      ? cell.machines.findIndex((machine) => machine.instrumentedId === liveHandling.currentStation)
      : -1;
    const pose = liveHandling && liveMachineIndex >= 0
      ? liveHandling.progress <= 30
        ? operatorPoseAtPhase(path, liveMachineIndex, 0.16 + Math.min(1, liveHandling.progress / 30) * 0.68)
        : operatorUnloadPoseAtProgress(path, liveMachineIndex, (liveHandling.progress - 78) / 22)
      : operatorIdlePose(path);

    if (operator.current) {
      operator.current.position.set(...pose.operatorPosition);
      operator.current.rotation.y = pose.operatorRotationY;
    }
    if (leftArm.current) leftArm.current.rotation.x = -pose.reach * 1.22;
    if (rightArm.current) rightArm.current.rotation.x = -pose.reach * 1.22;
    if (leftLeg.current) leftLeg.current.rotation.x = pose.legSwing;
    if (rightLeg.current) rightLeg.current.rotation.x = -pose.legSwing;
  });

  const vest = vestColors[colorIndex % vestColors.length];
  const shirt = shirtColors[colorIndex % shirtColors.length];
  const loadingZoneZ = cell.infeedZ + Math.sign(cell.machineZ - cell.infeedZ) * 1.2;

  return (
    <group userData={{ operatorId: cell.id, task: "front-load-cnc" }}>
      {cell.machines.map((machine) => (
        <mesh key={machine.label} position={[machine.position[0], 0.024, loadingZoneZ]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.2, 0.42]} />
          <meshBasicMaterial color="#d9b94b" transparent opacity={0.18} depthWrite={false} />
        </mesh>
      ))}
      <group ref={operator}>
        <group ref={leftLeg} position={[-0.13, 0.68, 0]}>
          <mesh position={[0, -0.31, 0]} castShadow><cylinderGeometry args={[0.09, 0.1, 0.62, 10]} /><meshStandardMaterial color="#25323a" roughness={0.62} /></mesh>
          <mesh position={[0, -0.63, 0.07]} castShadow><boxGeometry args={[0.2, 0.1, 0.34]} /><meshStandardMaterial color="#151d22" roughness={0.7} /></mesh>
        </group>
        <group ref={rightLeg} position={[0.13, 0.68, 0]}>
          <mesh position={[0, -0.31, 0]} castShadow><cylinderGeometry args={[0.09, 0.1, 0.62, 10]} /><meshStandardMaterial color="#25323a" roughness={0.62} /></mesh>
          <mesh position={[0, -0.63, 0.07]} castShadow><boxGeometry args={[0.2, 0.1, 0.34]} /><meshStandardMaterial color="#151d22" roughness={0.7} /></mesh>
        </group>
        <mesh position={[0, 1.08, 0]} castShadow><boxGeometry args={[0.5, 0.72, 0.3]} /><meshStandardMaterial color={shirt} roughness={0.58} /></mesh>
        <mesh position={[0, 1.13, 0.165]}><boxGeometry args={[0.44, 0.5, 0.035]} /><meshStandardMaterial color={vest} roughness={0.48} /></mesh>
        <mesh position={[0, 1.12, 0.188]}><boxGeometry args={[0.46, 0.055, 0.015]} /><meshBasicMaterial color="#e8e1bd" /></mesh>
        <group ref={leftArm} position={[-0.32, 1.36, 0]}>
          <mesh position={[0, -0.27, 0]} castShadow><cylinderGeometry args={[0.075, 0.09, 0.54, 10]} /><meshStandardMaterial color={shirt} roughness={0.58} /></mesh>
          <mesh position={[0, -0.58, 0]} castShadow><sphereGeometry args={[0.09, 10, 8]} /><meshStandardMaterial color="#b97c5b" roughness={0.62} /></mesh>
        </group>
        <group ref={rightArm} position={[0.32, 1.36, 0]}>
          <mesh position={[0, -0.27, 0]} castShadow><cylinderGeometry args={[0.075, 0.09, 0.54, 10]} /><meshStandardMaterial color={shirt} roughness={0.58} /></mesh>
          <mesh position={[0, -0.58, 0]} castShadow><sphereGeometry args={[0.09, 10, 8]} /><meshStandardMaterial color="#b97c5b" roughness={0.62} /></mesh>
        </group>
        <mesh position={[0, 1.58, 0]} castShadow><sphereGeometry args={[0.18, 14, 10]} /><meshStandardMaterial color="#b97c5b" roughness={0.62} /></mesh>
        <mesh position={[0, 1.77, 0]} castShadow><cylinderGeometry args={[0.2, 0.23, 0.13, 16]} /><meshStandardMaterial color="#e4b83d" roughness={0.42} /></mesh>
        <mesh position={[0, 1.72, 0.13]} castShadow><boxGeometry args={[0.48, 0.055, 0.2]} /><meshStandardMaterial color="#e4b83d" roughness={0.42} /></mesh>
      </group>
    </group>
  );
}
