import type { MachineId, StationId } from "@/types/factory";
import { CNC_STATIONS } from "@/lib/simulation/productionRouting";

export const GITHUB_URL = "https://github.com/Jerry-Padilla/CutCycle-DataWorks";

export const MACHINE_IDS: MachineId[] = ["CNC-01", "CNC-02", "ROBOT-01", "CMM-01"];

export const STATION_DURATIONS: Partial<Record<StationId, number>> = {
  RAW: 4,
  ...Object.fromEntries(CNC_STATIONS.map((station) => [station, station === "CNC-01" ? 8 : station === "CNC-02" ? 7 : 24])),
  CONVEYOR: 3,
  "ROBOT-01": 3,
  "ROBOT-02": 3,
  "CMM-01": 5,
  "CMM-02": 5,
  "CMM-03": 5,
  "CMM-04": 5,
  "CMM-05": 5,
  "CMM-06": 5,
};

export const STATION_CAPACITY: Partial<Record<StationId, number>> = {
  RAW: 2,
  ...Object.fromEntries(CNC_STATIONS.map((station) => [station, 1])),
  CONVEYOR: 4,
  "ROBOT-01": 1,
  "ROBOT-02": 1,
  "CMM-01": 1,
  "CMM-02": 1,
  "CMM-03": 1,
  "CMM-04": 1,
  "CMM-05": 1,
  "CMM-06": 1,
};

export const MAX_EVENT_HISTORY = 100;
export const MAX_CHART_HISTORY = 60;
export const MAX_ACTIVE_WIP = 20;
export const SAW_RELOAD_DELAY = 0.5;
