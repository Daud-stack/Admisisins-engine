import { describe, it, expect, beforeAll, afterAll, setSystemTime } from "bun:test";
import { calculateSLADeadline } from "../intelligence";

describe("calculateSLADeadline", () => {
  const MOCK_DATE_STR = "2024-01-01T12:00:00.000Z";

  beforeAll(() => {
    // Set system time to a fixed date for deterministic tests
    setSystemTime(new Date(MOCK_DATE_STR));
  });

  afterAll(() => {
    // Restore system time
    setSystemTime();
  });

  it("calculates CRITICAL priority correctly (+4 hours)", () => {
    const deadline = calculateSLADeadline("CRITICAL");
    expect(deadline.toISOString()).toBe("2024-01-01T16:00:00.000Z");
  });

  it("calculates HIGH priority correctly (+12 hours)", () => {
    const deadline = calculateSLADeadline("HIGH");
    expect(deadline.toISOString()).toBe("2024-01-02T00:00:00.000Z");
  });

  it("calculates MEDIUM priority correctly (+24 hours)", () => {
    const deadline = calculateSLADeadline("MEDIUM");
    expect(deadline.toISOString()).toBe("2024-01-02T12:00:00.000Z");
  });

  it("calculates LOW priority correctly (+72 hours)", () => {
    const deadline = calculateSLADeadline("LOW");
    expect(deadline.toISOString()).toBe("2024-01-04T12:00:00.000Z");
  });

  it("calculates UNKNOWN/default priority correctly (+48 hours)", () => {
    const deadline = calculateSLADeadline("UNKNOWN");
    expect(deadline.toISOString()).toBe("2024-01-03T12:00:00.000Z");

    const deadlineEmpty = calculateSLADeadline("");
    expect(deadlineEmpty.toISOString()).toBe("2024-01-03T12:00:00.000Z");

    const deadlineRandom = calculateSLADeadline("RANDOM");
    expect(deadlineRandom.toISOString()).toBe("2024-01-03T12:00:00.000Z");
  });

  it("is case-insensitive", () => {
    const deadline1 = calculateSLADeadline("critical");
    expect(deadline1.toISOString()).toBe("2024-01-01T16:00:00.000Z");

    const deadline2 = calculateSLADeadline("CrItIcAl");
    expect(deadline2.toISOString()).toBe("2024-01-01T16:00:00.000Z");

    const deadline3 = calculateSLADeadline("high");
    expect(deadline3.toISOString()).toBe("2024-01-02T00:00:00.000Z");
  });
});
