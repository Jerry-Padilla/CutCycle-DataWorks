"use client";

import { Line } from "@react-three/drei";
import { useRef, type RefObject } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import type { Group } from "three";
import { MachineLabel } from "@/components/factory/MachineLabel";
import { cncToolpathOffset, spindleDisplayAngularVelocity, type CncToolpath } from "@/lib/simulation/kinematics";
import { useFactoryStore } from "@/store/useFactoryStore";
import type { MachineId, MachineStatus } from "@/types/factory";

const statusColor: Record<MachineStatus, string> = { RUNNING: "#42dc8b", IDLE: "#f0c555", FAULT: "#ff514b", MAINTENANCE: "#4baee7" };
const rectanglePath: [number, number, number][] = [
  [-.77,.91,1.3],[-.13,.91,1.3],[-.13,.91,1.66],[-.77,.91,1.66],[-.77,.91,1.3],
];
const circlePath: [number, number, number][] = Array.from({ length: 33 }, (_, index) => {
  const angle = (index / 32) * Math.PI * 2;
  return [-.45 + Math.cos(angle) * .32, .91, 1.48 + Math.sin(angle) * .18];
});

interface CncShellProps {
  label: string;
  status: MachineStatus;
  position: [number, number, number];
  rotationY?: number;
  selected?: boolean;
  spindle: RefObject<Group | null>;
  spindleCarriage: RefObject<Group | null>;
  toolpath: CncToolpath | null;
  onClick?: (event: ThreeEvent<MouseEvent>) => void;
  machineId?: MachineId;
}

function CncShell({ label, status, position, rotationY = 0, selected = false, spindle, spindleCarriage, toolpath, onClick, machineId }: CncShellProps) {
  return (
    <group position={position} rotation={[0,rotationY,0]} onClick={onClick} userData={machineId ? { machineId } : { auxiliaryEquipment: true }}>
      <mesh position={[0,1.45,0]} castShadow receiveShadow><boxGeometry args={[3,2.9,2.65]} /><meshStandardMaterial color="#303b42" roughness={.35} metalness={.55} /></mesh>
      <mesh position={[0,2.45,1.34]} castShadow><boxGeometry args={[3.02,.62,.12]} /><meshStandardMaterial color="#202a30" metalness={.65} roughness={.3} /></mesh>
      <mesh position={[-.44,1.25,1.39]} castShadow><boxGeometry args={[1.72,1.72,.12]} /><meshStandardMaterial color="#182329" metalness={.5} roughness={.26} /></mesh>
      <mesh position={[-.44,1.25,1.47]}><planeGeometry args={[1.42,1.42]} /><meshPhysicalMaterial color="#264655" transparent opacity={.42} roughness={.15} metalness={.2} /></mesh>
      {toolpath && <Line points={toolpath === "circle" ? circlePath : rectanglePath} color="#70d0f3" lineWidth={.8} transparent opacity={.34} />}
      <mesh position={[-.45,.82,1.48]} castShadow><boxGeometry args={[1.08,.12,.7]} /><meshStandardMaterial color="#56656c" metalness={.78} roughness={.24} /></mesh>
      <mesh position={[-.45,.9,1.48]}><boxGeometry args={[.72,.05,.48]} /><meshStandardMaterial color="#aab7bc" metalness={.82} roughness={.2} /></mesh>
      <mesh position={[.92,1.55,1.43]} castShadow><boxGeometry args={[.63,1.16,.18]} /><meshStandardMaterial color="#161f24" /></mesh>
      <mesh position={[.92,1.78,1.54]}><planeGeometry args={[.42,.34]} /><meshBasicMaterial color={status === "FAULT" ? "#a82e2b" : "#1b6a83"} /></mesh>
      <group position={[-.45,1.68,1.48]}>
        <group ref={spindleCarriage}>
          <mesh position={[0,.25,0]} castShadow><boxGeometry args={[.56,.54,.52]} /><meshStandardMaterial color="#46555c" metalness={.68} roughness={.26} /></mesh>
          <group ref={spindle} userData={{ rotationAxis: "Y", assembly: "vertical-cnc-spindle" }}>
            <mesh castShadow><cylinderGeometry args={[.19,.19,.5,24]} /><meshStandardMaterial color="#a7b3b8" metalness={.9} roughness={.14} /></mesh>
            <mesh position={[0,-.31,0]} castShadow><cylinderGeometry args={[.17,.1,.18,20]} /><meshStandardMaterial color="#69777d" metalness={.92} roughness={.12} /></mesh>
            <mesh position={[0,-.55,0]} castShadow><cylinderGeometry args={[.055,.055,.34,12]} /><meshStandardMaterial color="#d4dde0" metalness={.94} roughness={.1} /></mesh>
            <mesh position={[.06,-.72,0]} castShadow><boxGeometry args={[.055,.12,.04]} /><meshStandardMaterial color="#edf3f5" metalness={.9} roughness={.12} /></mesh>
            <mesh position={[-.06,-.72,0]} castShadow><boxGeometry args={[.055,.12,.04]} /><meshStandardMaterial color="#edf3f5" metalness={.9} roughness={.12} /></mesh>
          </group>
        </group>
      </group>
      <mesh position={[0,3.08,.7]}><cylinderGeometry args={[.1,.1,.24,10]} /><meshStandardMaterial color="#69747a" metalness={.7} /></mesh>
      <mesh position={[0,3.28,.7]}><cylinderGeometry args={[.14,.14,.18,12]} /><meshStandardMaterial color={statusColor[status]} emissive={statusColor[status]} emissiveIntensity={2.4} /></mesh>
      <mesh position={[0,1.45,0]} visible={selected}><boxGeometry args={[3.12,3.02,2.77]} /><meshBasicMaterial color="#73caef" wireframe transparent opacity={.7} depthTest={false} /></mesh>
      <mesh position={[0,1.45,0]} visible={false}><boxGeometry args={[3.35,3.25,3]} /><meshBasicMaterial /></mesh>
      <MachineLabel id={label} status={status} position={[0,3.75,0]} />
    </group>
  );
}

export function CNC({ id, position, rotationY = 0 }: { id: Extract<MachineId, "CNC-01" | "CNC-02">; position: [number, number, number]; rotationY?: number }) {
  const machine = useFactoryStore((state) => state.machines[id]);
  const selected = useFactoryStore((state) => state.selectedMachineId === id);
  const select = useFactoryStore((state) => state.selectMachine);
  const paused = useFactoryStore((state) => state.paused);
  const speed = useFactoryStore((state) => state.speed);
  const spindle = useRef<Group>(null);
  const spindleCarriage = useRef<Group>(null);
  const toolpath: CncToolpath = id === "CNC-01" ? "rectangle" : "circle";

  useFrame((_, delta) => {
    if (spindleCarriage.current) {
      const [x,z] = cncToolpathOffset(toolpath, machine.progress);
      spindleCarriage.current.position.set(x,0,z);
    }
    if (!spindle.current || paused || machine.status !== "RUNNING" || machine.telemetry.kind !== "CNC") return;
    const displayAngularVelocity = spindleDisplayAngularVelocity(machine.telemetry.spindleRpm);
    spindle.current.rotation.y -= delta * displayAngularVelocity * speed;
  });

  const click = (event: ThreeEvent<MouseEvent>) => { event.stopPropagation(); select(id); };
  return <CncShell label={id} status={machine.status} position={position} rotationY={rotationY} selected={selected} spindle={spindle} spindleCarriage={spindleCarriage} toolpath={toolpath} onClick={click} machineId={id} />;
}

export function AuxiliaryCNC({ label, position, rotationY = 0 }: { label: string; position: [number, number, number]; rotationY?: number }) {
  const spindle = useRef<Group>(null);
  const spindleCarriage = useRef<Group>(null);
  const active = useFactoryStore((state) => state.parts.some((part) => part.currentStation === label));
  const paused = useFactoryStore((state) => state.paused);
  const speed = useFactoryStore((state) => state.speed);
  const toolpath: CncToolpath = Number(label.slice(-2)) % 2 === 0 ? "circle" : "rectangle";
  useFrame((_, delta) => {
    const part = useFactoryStore.getState().parts.find((candidate) => candidate.currentStation === label);
    if (spindleCarriage.current && part) {
      const [x, z] = cncToolpathOffset(toolpath, part.progress);
      spindleCarriage.current.position.set(x, 0, z);
    }
    if (spindle.current && active && !paused) spindle.current.rotation.y -= delta * 18 * speed;
  });
  return <CncShell label={label} status={active && !paused ? "RUNNING" : "IDLE"} position={position} rotationY={rotationY} spindle={spindle} spindleCarriage={spindleCarriage} toolpath={toolpath} />;
}
