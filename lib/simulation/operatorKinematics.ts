import type { FactoryVector } from "@/lib/factory/layout";

export const OPERATOR_LOAD_CYCLE_SECONDS = 9;

export interface OperatorPath {
  machineXs: number[];
  machineZ: number;
  infeedZ: number;
  rotationY: number;
}

export interface OperatorLoadingPose {
  machineIndex: number;
  operatorPosition: FactoryVector;
  operatorRotationY: number;
  partPosition: FactoryVector;
  partVisible: boolean;
  reach: number;
  legSwing: number;
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const OPERATOR_STANDOFF_FROM_INFEED = 1.2;
const lerp = (from: number, to: number, progress: number) => from + (to - from) * progress;
const smoothstep = (value: number) => {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
};

const mix = (from: FactoryVector, to: FactoryVector, progress: number): FactoryVector => [
  lerp(from[0], to[0], progress),
  lerp(from[1], to[1], progress),
  lerp(from[2], to[2], progress),
];

function normalizedIndex(index: number, count: number) {
  return ((index % count) + count) % count;
}

export function frontLoadPartPosition(path: OperatorPath, machineIndex: number, progress: number): FactoryVector {
  const index = normalizedIndex(machineIndex, path.machineXs.length);
  const machineX = path.machineXs[index];
  const facingZ = Math.cos(path.rotationY);
  const directionToMachine = Math.sign(path.machineZ - path.infeedZ);
  const operatorZ = path.infeedZ + directionToMachine * OPERATOR_STANDOFF_FROM_INFEED;
  const workpieceX = machineX - 0.45 * Math.cos(path.rotationY);
  const staging: FactoryVector = [workpieceX, 1.08, path.infeedZ];
  const hands: FactoryVector = [workpieceX, 1.28, operatorZ + directionToMachine * 0.2];
  const workholding: FactoryVector = [workpieceX, 0.98, path.machineZ + facingZ * 1.48];
  const t = clamp01(progress);

  if (t < 0.35) return mix(staging, hands, smoothstep(t / 0.35));
  return mix(hands, workholding, smoothstep((t - 0.35) / 0.65));
}

export function frontUnloadPartPosition(path: OperatorPath, machineIndex: number, progress: number): FactoryVector {
  const index = normalizedIndex(machineIndex, path.machineXs.length);
  const machineX = path.machineXs[index];
  const facingZ = Math.cos(path.rotationY);
  const directionToMachine = Math.sign(path.machineZ - path.infeedZ);
  const operatorZ = path.infeedZ + directionToMachine * OPERATOR_STANDOFF_FROM_INFEED;
  const workpieceX = machineX - 0.45 * Math.cos(path.rotationY);
  const workholding: FactoryVector = [workpieceX, 0.98, path.machineZ + facingZ * 1.48];
  const hands: FactoryVector = [workpieceX, 1.32, operatorZ + directionToMachine * 0.2];
  const staging: FactoryVector = [workpieceX, 1.08, path.infeedZ];
  const t = clamp01(progress);
  if (t < 0.65) return mix(workholding, hands, smoothstep(t / 0.65));
  return mix(hands, staging, smoothstep((t - 0.65) / 0.35));
}

export function cncServicedPartPosition(path: OperatorPath, machineIndex: number, cycleProgress: number): FactoryVector {
  const t = clamp01(cycleProgress);
  if (t < 0.3) return frontLoadPartPosition(path, machineIndex, t / 0.3);
  if (t < 0.78) return frontLoadPartPosition(path, machineIndex, 1);
  return frontUnloadPartPosition(path, machineIndex, (t - 0.78) / 0.22);
}

export function operatorPoseAtPhase(
  path: OperatorPath,
  machineIndex: number,
  phase: number,
  previousMachineIndex = machineIndex,
): OperatorLoadingPose {
  const count = path.machineXs.length;
  const index = normalizedIndex(machineIndex, count);
  const previousIndex = normalizedIndex(previousMachineIndex, count);
  const t = clamp01(phase);
  const directionToMachine = Math.sign(path.machineZ - path.infeedZ);
  const walkProgress = smoothstep(t / 0.16);
  const operatorX = lerp(path.machineXs[previousIndex], path.machineXs[index], walkProgress);
  const operatorRestZ = path.infeedZ + directionToMachine * OPERATOR_STANDOFF_FROM_INFEED;
  const loadProgress = clamp01((t - 0.16) / 0.68);
  const lean = Math.sin(loadProgress * Math.PI) * 0.16;
  const walking = t < 0.16 && previousIndex !== index;
  const reachIn = smoothstep((t - 0.12) / 0.24);
  const reachOut = 1 - smoothstep((t - 0.82) / 0.14);

  return {
    machineIndex: index,
    operatorPosition: [operatorX, walking ? Math.abs(Math.sin(t / 0.16 * Math.PI * 4)) * 0.035 : 0, operatorRestZ + directionToMachine * lean],
    operatorRotationY: directionToMachine > 0 ? 0 : Math.PI,
    partPosition: frontLoadPartPosition(path, index, loadProgress),
    partVisible: t < 0.84,
    reach: Math.max(0, Math.min(reachIn, reachOut)),
    legSwing: walking ? Math.sin(t / 0.16 * Math.PI * 4) * 0.48 : 0,
  };
}

export function operatorUnloadPoseAtProgress(
  path: OperatorPath,
  machineIndex: number,
  progress: number,
): OperatorLoadingPose {
  const index = normalizedIndex(machineIndex, path.machineXs.length);
  const t = clamp01(progress);
  const directionToMachine = Math.sign(path.machineZ - path.infeedZ);
  const operatorRestZ = path.infeedZ + directionToMachine * OPERATOR_STANDOFF_FROM_INFEED;
  const lean = (1 - smoothstep(t)) * 0.16;

  return {
    machineIndex: index,
    operatorPosition: [path.machineXs[index], 0, operatorRestZ + directionToMachine * lean],
    operatorRotationY: directionToMachine > 0 ? 0 : Math.PI,
    partPosition: frontUnloadPartPosition(path, index, t),
    partVisible: true,
    reach: 1 - smoothstep(t),
    legSwing: 0,
  };
}

export function operatorCyclePose(path: OperatorPath, elapsedSeconds: number, phaseOffset = 0): OperatorLoadingPose {
  const cyclePosition = elapsedSeconds / OPERATOR_LOAD_CYCLE_SECONDS + phaseOffset;
  const cycleIndex = Math.floor(cyclePosition);
  const phase = cyclePosition - cycleIndex;
  const machineIndex = normalizedIndex(cycleIndex, path.machineXs.length);
  const previousMachineIndex = normalizedIndex(cycleIndex - 1, path.machineXs.length);
  if (phase < 0.48) return operatorPoseAtPhase(path, machineIndex, phase / 0.48, previousMachineIndex);
  if (phase < 0.62) return operatorPoseAtPhase(path, machineIndex, 1, machineIndex);
  return operatorUnloadPoseAtProgress(path, machineIndex, (phase - 0.62) / 0.38);
}
