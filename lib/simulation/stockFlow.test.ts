import { describe, expect, it } from "vitest";
import {
  CNC_01_PICKUP,
  RAW_CUT_RELEASE_PROGRESS,
  RAW_STOCK_START,
  rawStockPosition,
} from "@/lib/simulation/stockFlow";

describe("single cut-stock flow", () => {
  it("holds the blank at the saw until cutting is complete", () => {
    expect(rawStockPosition(0)).toEqual(RAW_STOCK_START);
    expect(rawStockPosition(RAW_CUT_RELEASE_PROGRESS)).toEqual(RAW_STOCK_START);
  });

  it("stops at CNC-01 instead of continuing down the conveyor", () => {
    const midpoint = rawStockPosition(0.65);
    expect(midpoint[0]).toBeGreaterThan(RAW_STOCK_START[0]);
    expect(midpoint[0]).toBeLessThan(CNC_01_PICKUP[0]);
    expect(rawStockPosition(1)).toEqual(CNC_01_PICKUP);
  });
});
