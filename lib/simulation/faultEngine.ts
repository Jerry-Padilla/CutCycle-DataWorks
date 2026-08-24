import type { FaultDefinition, FaultMode, MachineKind } from "@/types/factory";

export const FAULT_DEFINITIONS: FaultDefinition[] = [
  {
    code: "MTR-104",
    title: "Spindle Overcurrent",
    machineKinds: ["CNC"],
    symptoms: ["Spindle current elevated", "Temperature rising", "Machine stopped"],
    readings: [
      { label: "Motor current", value: "18.7 A", expected: "8–12 A", alarm: true },
      { label: "Spindle RPM", value: "0", expected: "7,800–8,200" },
      { label: "PLC command", value: "ON", expected: "ON" },
      { label: "Motor temperature", value: "74 °C", expected: "42–58 °C", alarm: true },
    ],
    choices: [
      { id: "a", label: "Replace the PLC" },
      { id: "b", label: "Inspect spindle motor and mechanical load" },
      { id: "c", label: "Replace the proximity sensor" },
      { id: "d", label: "Reset the machine repeatedly" },
    ],
    correctChoiceId: "b",
    explanation:
      "The PLC is commanding the spindle on, but motor current is abnormally high. This points to excessive mechanical load, motor damage, or a spindle-drive problem.",
  },
  {
    code: "CLT-203",
    title: "Coolant Flow Low",
    machineKinds: ["CNC"],
    symptoms: ["Coolant flow below threshold", "Temperature elevated", "Cycle paused"],
    readings: [
      { label: "Coolant flow", value: "4.1 L/min", expected: "9–12 L/min", alarm: true },
      { label: "Pump command", value: "ON", expected: "ON" },
      { label: "Reservoir level", value: "31%", expected: "> 45%", alarm: true },
      { label: "Spindle temperature", value: "63 °C", expected: "42–58 °C", alarm: true },
    ],
    choices: [
      { id: "a", label: "Inspect coolant level, filter, and pump" },
      { id: "b", label: "Increase spindle speed" },
      { id: "c", label: "Bypass the flow switch" },
      { id: "d", label: "Replace the CNC controller" },
    ],
    correctChoiceId: "a",
    explanation:
      "The pump is commanded on but measured flow is low. Check supply level, restrictions, and pump delivery before changing control hardware.",
  },
  {
    code: "SAF-011",
    title: "Door Interlock Open",
    machineKinds: ["CNC"],
    symptoms: ["Safety interlock open", "Machine cannot start", "Guard circuit not made"],
    readings: [
      { label: "Door channel A", value: "OPEN", expected: "CLOSED", alarm: true },
      { label: "Door channel B", value: "OPEN", expected: "CLOSED", alarm: true },
      { label: "Safety relay", value: "NOT READY", expected: "READY" },
    ],
    choices: [
      { id: "a", label: "Bypass the safety relay" },
      { id: "b", label: "Verify door closure and inspect the interlock" },
      { id: "c", label: "Replace the spindle motor" },
      { id: "d", label: "Raise the coolant pressure" },
    ],
    correctChoiceId: "b",
    explanation:
      "Both safety channels report open. Confirm the guard is fully seated, then inspect alignment, wiring, and the interlock device without bypassing it.",
  },
  {
    code: "ROB-221",
    title: "Position Sensor Fault",
    machineKinds: ["ROBOT"],
    symptoms: ["Axis position feedback invalid", "Motion inhibited", "Robot stopped"],
    readings: [
      { label: "Axis 2 command", value: "42.0°", expected: "42.0°" },
      { label: "Axis 2 feedback", value: "—", expected: "41.8–42.2°", alarm: true },
      { label: "Servo ready", value: "YES", expected: "YES" },
    ],
    choices: [
      { id: "a", label: "Inspect encoder connection and feedback cable" },
      { id: "b", label: "Replace the gripper" },
      { id: "c", label: "Increase robot speed" },
      { id: "d", label: "Ignore the feedback alarm" },
    ],
    correctChoiceId: "a",
    explanation:
      "The servo is ready and receives a command, but position feedback is missing. Inspect the encoder circuit and its connections first.",
  },
  {
    code: "ROB-310",
    title: "Gripper Sensor Fault",
    machineKinds: ["ROBOT"],
    symptoms: ["Part-present signal missing", "Transfer sequence paused", "Grip verification failed"],
    readings: [
      { label: "Close command", value: "ON", expected: "ON" },
      { label: "Gripper pressure", value: "5.8 bar", expected: "5–6 bar" },
      { label: "Part-present input", value: "OFF", expected: "ON", alarm: true },
    ],
    choices: [
      { id: "a", label: "Increase conveyor speed" },
      { id: "b", label: "Inspect gripper sensor alignment and wiring" },
      { id: "c", label: "Replace the robot base" },
      { id: "d", label: "Disable grip verification" },
    ],
    correctChoiceId: "b",
    explanation:
      "The gripper has adequate pressure and a valid close command, so verify the part-present sensor position and electrical signal path.",
  },
];

export function faultsForKind(kind: MachineKind): FaultDefinition[] {
  return FAULT_DEFINITIONS.filter((fault) => fault.machineKinds.includes(kind));
}

export function getFaultDefinition(code: string | null): FaultDefinition | undefined {
  return FAULT_DEFINITIONS.find((fault) => fault.code === code);
}

export function getNextFaultDelay(mode: FaultMode, random = Math.random): number {
  const ranges: Record<Exclude<FaultMode, "OFF">, [number, number]> = {
    LOW: [240, 360],
    NORMAL: [120, 240],
    HIGH: [45, 90],
  };
  if (mode === "OFF") return Number.POSITIVE_INFINITY;
  const [min, max] = ranges[mode];
  return (min + (max - min) * random()) * 1000;
}
