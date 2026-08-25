export type MachineId = "CNC-01" | "CNC-02" | "ROBOT-01" | "CMM-01";
export type CncStationId = "CNC-01" | "CNC-02" | "CNC-03" | "CNC-04" | "CNC-05" | "CNC-06" | "CNC-07" | "CNC-08" | "CNC-09" | "CNC-10" | "CNC-11" | "CNC-12";
export type RobotStationId = "ROBOT-01" | "ROBOT-02";
export type CmmStationId = "CMM-01" | "CMM-02" | "CMM-03" | "CMM-04" | "CMM-05" | "CMM-06";
export type ProductionLineId = "south" | "north";
export type MachineKind = "CNC" | "ROBOT" | "CMM";
export type MachineStatus = "RUNNING" | "IDLE" | "FAULT" | "MAINTENANCE";
export type StationId = "RAW" | CncStationId | "CONVEYOR" | RobotStationId | CmmStationId | "FINISHED" | "REJECT";
export type PartStatus = "WAITING" | "MACHINING" | "MOVING" | "INSPECTION" | "COMPLETE" | "REJECTED";
export type ProductType = "MOUNTING_PLATE" | "IMPELLER" | "ROCKET_NOZZLE";
export type FaultMode = "OFF" | "LOW" | "NORMAL" | "HIGH";
export type SimulationSpeed = 0.5 | 1 | 2 | 4;
export type AppView = "FACTORY" | "DASHBOARD" | "SYSTEMS" | "ABOUT";

export interface CncTelemetry {
  kind: "CNC";
  spindleRpm: number;
  spindleLoad: number;
  temperature: number;
  cycleTime: number;
}

export interface RobotTelemetry {
  kind: "ROBOT";
  jointSpeed: number;
  cycleProgress: number;
  gripperClosed: boolean;
  temperature: number;
}

export interface CmmTelemetry {
  kind: "CMM";
  inspectionProgress: number;
  currentPart: string | null;
  lastResult: "PASS" | "FAIL" | null;
  totalInspected: number;
  rejectionCount: number;
}

export type MachineTelemetry = CncTelemetry | RobotTelemetry | CmmTelemetry;

export interface MachineRuntime {
  id: MachineId;
  name: string;
  kind: MachineKind;
  status: MachineStatus;
  telemetry: MachineTelemetry;
  currentPartId: string | null;
  progress: number;
  nominalCycle: number;
  partsProduced: number;
  faultsToday: number;
  scheduledMs: number;
  runningMs: number;
  baselineAvailability: number;
  activeFaultCode: string | null;
}

export interface Part {
  id: string;
  serialNumber: string;
  currentStation: StationId;
  status: PartStatus;
  qualityScore: number | null;
  createdAt: number;
  cycleTime: number;
  stationElapsed: number;
  progress: number;
  productType: ProductType;
  assignedCnc: CncStationId;
  assignedRobot: RobotStationId;
  assignedCmm: CmmStationId;
  lineId: ProductionLineId;
  demo?: boolean;
}

export interface DiagnosticReading {
  label: string;
  value: string;
  expected?: string;
  alarm?: boolean;
}

export interface DiagnosticChoice {
  id: string;
  label: string;
}

export interface FaultDefinition {
  code: string;
  title: string;
  machineKinds: MachineKind[];
  symptoms: string[];
  readings: DiagnosticReading[];
  choices: DiagnosticChoice[];
  correctChoiceId: string;
  explanation: string;
}

export interface ActiveFault {
  machineId: MachineId;
  code: string;
  occurredAt: number;
  diagnosed: boolean;
  selectedChoiceId: string | null;
  answerCorrect: boolean | null;
}

export type EventSeverity = "INFO" | "SUCCESS" | "WARNING" | "FAULT";

export interface ProductionEvent {
  id: string;
  timestamp: number;
  message: string;
  severity: EventSeverity;
  machineId?: MachineId;
  partId?: string;
}

export interface KpiSnapshot {
  availability: number;
  performance: number;
  quality: number;
  oee: number;
  throughput: number;
  scrapRate: number;
  partsProduced: number;
  machinesOnline: number;
  averageCycleTime: number;
  utilization: Record<MachineId, number>;
}

export interface ChartSample {
  timestamp: number;
  label: string;
  throughput: number;
  oee: number;
}

export interface ProductionCounters {
  totalStarted: number;
  totalCompleted: number;
  totalRejected: number;
  totalInspected: number;
  totalCycleTime: number;
  completionTimes: number[];
  productCounts: Record<ProductType, number>;
}

export interface DemoState {
  active: boolean;
  step: number;
  elapsed: number;
  message: string;
  previousSpeed: SimulationSpeed | null;
  previousFaultMode: FaultMode | null;
  partId: string | null;
}
