export interface RobotPose {
  baseRotation: number;
  shoulderRotation: number;
  elbowRotation: number;
  gripperClosed: boolean;
}

const LOW_SHOULDER = -1.08;
const LOW_ELBOW = -0.92;
const SERVICE_CYCLE_SECONDS = 16;
const SERVICE_BASE_ROTATIONS = [Math.PI / 4, 0, -Math.PI / 4, 0, Math.PI / 4];

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const smoothstep = (value: number) => {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
};
const lerp = (from: number, to: number, progress: number) => from + (to - from) * progress;

export function restRobotPose(): RobotPose {
  return {
    baseRotation: 0,
    shoulderRotation: LOW_SHOULDER,
    elbowRotation: LOW_ELBOW,
    gripperClosed: false,
  };
}

export function liveTransferRobotPose(progress: number): RobotPose {
  const t = clamp01(progress);
  const transfer = smoothstep(t);
  const lift = Math.sin(t * Math.PI);
  return {
    baseRotation: lerp(-2.08, 0, transfer),
    shoulderRotation: LOW_SHOULDER + lift * 0.38,
    elbowRotation: LOW_ELBOW - lift * 0.22,
    gripperClosed: t >= 0.05 && t < 0.96,
  };
}

export function serviceRobotPose(elapsedSeconds: number, phaseOffsetSeconds = 0): RobotPose {
  const wrappedSeconds = ((elapsedSeconds + phaseOffsetSeconds) % SERVICE_CYCLE_SECONDS + SERVICE_CYCLE_SECONDS) % SERVICE_CYCLE_SECONDS;
  const scaled = wrappedSeconds / SERVICE_CYCLE_SECONDS * 4;
  const segment = Math.min(3, Math.floor(scaled));
  const local = scaled - segment;
  const travel = smoothstep((local - 0.36) / 0.64);
  const lift = Math.sin(travel * Math.PI);
  return {
    baseRotation: lerp(SERVICE_BASE_ROTATIONS[segment], SERVICE_BASE_ROTATIONS[segment + 1], travel),
    shoulderRotation: LOW_SHOULDER + lift * 0.3,
    elbowRotation: LOW_ELBOW - lift * 0.18,
    gripperClosed: local < 0.32,
  };
}
