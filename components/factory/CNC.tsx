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
const chuckJawAngles = [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3];
const rectanglePath: [number, number, number][] = [
  [-.77,1.13,1.575],[-.13,1.13,1.575],[-.13,1.63,1.575],[-.77,1.63,1.575],[-.77,1.13,1.575],
];
const circlePath: [number, number, number][] = Array.from({ length: 33 }, (_, index) => {
  const angle = (index / 32) * Math.PI * 2;
  return [-.45 + Math.cos(angle) * .32, 1.38 + Math.sin(angle) * .25, 1.575];
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
      <mesh position={[.92,1.55,1.43]} castShadow><boxGeometry args={[.63,1.16,.18]} /><meshStandardMaterial color="#161f24" /></mesh>
      <mesh position={[.92,1.78,1.54]}><planeGeometry args={[.42,.34]} /><meshBasicMaterial color={status === "FAULT" ? "#a82e2b" : "#1b6a83"} /></mesh>
      <group position={[-.45,1.38,1.58]}>
        <group ref={spindleCarriage}>
          <group ref={spindle} userData={{ rotationAxis: "Z", assembly: "cnc-spindle" }}>
            <mesh rotation={[Math.PI/2,0,0]} castShadow><cylinderGeometry args={[.24,.24,.35,24]} /><meshStandardMaterial color="#a7b3b8" metalness={.86} roughness={.18} /></mesh>
            <mesh position={[0,0,.2]} rotation={[Math.PI/2,0,0]} castShadow><cylinderGeometry args={[.2,.2,.12,24]} /><meshStandardMaterial color="#64737a" metalness={.9} roughness={.15} /></mesh>
            <mesh position={[0,0,.27]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.075,.075,.025,18]} /><meshStandardMaterial color="#151c20" metalness={.35} roughness={.42} /></mesh>
            {chuckJawAngles.map((angle) => (
              <group key={angle} position={[0,0,.27]} rotation={[0,0,angle]}>
                <mesh position={[0,.13,0]} castShadow><boxGeometry args={[.085,.16,.085]} /><meshStandardMaterial color="#d5dde0" metalness={.92} roughness={.14} /></mesh>
              </group>
            ))}
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
      const [x,y] = cncToolpathOffset(toolpath, machine.progress);
      spindleCarriage.current.position.set(x,y,0);
    }
    if (!spindle.current || paused || machine.status !== "RUNNING" || machine.telemetry.kind !== "CNC") return;
    const displayAngularVelocity = spindleDisplayAngularVelocity(machine.telemetry.spindleRpm);
    spindle.current.rotation.z -= delta * displayAngularVelocity * speed;
  });

  const click = (event: ThreeEvent<MouseEvent>) => { event.stopPropagation(); select(id); };
  return <CncShell label={id} status={machine.status} position={position} rotationY={rotationY} selected={selected} spindle={spindle} spindleCarriage={spindleCarriage} toolpath={toolpath} onClick={click} machineId={id} />;
}

export function AuxiliaryCNC({ label, position, rotationY = 0 }: { label: string; position: [number, number, number]; rotationY?: number }) {
  const spindle = useRef<Group>(null);
  const spindleCarriage = useRef<Group>(null);
  return <CncShell label={`${label} · AUX`} status="IDLE" position={position} rotationY={rotationY} spindle={spindle} spindleCarriage={spindleCarriage} toolpath={null} />;
}
