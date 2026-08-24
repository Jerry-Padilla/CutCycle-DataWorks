import type { MachineId, StationId } from "@/types/factory";

export const GITHUB_URL = "https://github.com/Jerry-Padilla/FactoryOS";

export const MACHINE_IDS: MachineId[] = ["CNC-01", "CNC-02", "ROBOT-01", "CMM-01"];

export const STATION_DURATIONS: Partial<Record<StationId, number>> = {
  "CNC-01": 8,
  "CNC-02": 7,
  CONVEYOR: 3,
  "ROBOT-01": 3,
  "CMM-01": 5,
};

export const STATION_CAPACITY: Partial<Record<StationId, number>> = {
  "CNC-01": 1,
  "CNC-02": 1,
  CONVEYOR: 2,
  "ROBOT-01": 1,
  "CMM-01": 1,
};

export const MAX_EVENT_HISTORY = 100;
export const MAX_CHART_HISTORY = 60;
