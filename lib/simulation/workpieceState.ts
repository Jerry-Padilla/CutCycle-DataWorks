import type { Part } from "@/types/factory";

export function hasFinishedMachining(part: Pick<Part, "currentStation" | "progress">): boolean {
  if (part.currentStation === "RAW") return false;
  if (part.currentStation.startsWith("CNC-")) return part.progress >= 100;
  return true;
}
