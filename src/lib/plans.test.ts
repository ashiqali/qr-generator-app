import { describe, expect, it } from "vitest";
import { getCurrentPeriod } from "./plans";

describe("getCurrentPeriod", () => {
  it("formats as YYYY-MM with zero-padded month", () => {
    expect(getCurrentPeriod(new Date(2026, 0, 15))).toBe("2026-01");
    expect(getCurrentPeriod(new Date(2026, 10, 3))).toBe("2026-11");
  });
});
