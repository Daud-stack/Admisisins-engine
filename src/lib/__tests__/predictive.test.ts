import { describe, expect, it, beforeEach, afterEach, setSystemTime } from "bun:test";
import { predictSLABreachRisk } from "../predictive";

describe("predictSLABreachRisk", () => {
  beforeEach(() => {
    // Set a fixed time for all tests
    setSystemTime(new Date("2024-01-01T12:00:00Z"));
  });

  afterEach(() => {
    // Restore the original Date
    setSystemTime();
  });

  it("handles issues with no deadline based on priority", () => {
    const results = predictSLABreachRisk([
      {
        id: "1",
        patientName: "John",
        admNo: "A1",
        category: "Test",
        priority: "Low",
        deadline: null,
        createdAt: "2024-01-01T10:00:00Z",
      },
      {
        id: "2",
        patientName: "Jane",
        admNo: "A2",
        category: "Test",
        priority: "Medium",
        deadline: null,
        createdAt: "2024-01-01T10:00:00Z",
      },
      {
        id: "3",
        patientName: "Bob",
        admNo: "A3",
        category: "Test",
        priority: "High",
        deadline: null,
        createdAt: "2024-01-01T10:00:00Z",
      },
      {
        id: "4",
        patientName: "Alice",
        admNo: "A4",
        category: "Test",
        priority: "Critical",
        deadline: null,
        createdAt: "2024-01-01T10:00:00Z",
      },
      {
        id: "5",
        patientName: "Unknown",
        admNo: "A5",
        category: "Test",
        priority: "Unknown",
        deadline: null,
        createdAt: "2024-01-01T10:00:00Z",
      }
    ]);

    // Sorted by breach probability descending
    expect(results.length).toBe(5);

    const critical = results.find((r) => r.issueId === "4");
    // Default base is 0.5. Critical multiplier is 1.3
    // 0.5 * 1.3 = 0.65 -> 'medium'
    expect(critical?.breachProbability).toBe(0.65);
    expect(critical?.riskLevel).toBe("medium");

    const high = results.find((r) => r.issueId === "3");
    // 0.5 * 1.15 = 0.575 -> 'medium'
    expect(high?.breachProbability).toBe(0.575);
    expect(high?.riskLevel).toBe("medium");

    const medium = results.find((r) => r.issueId === "2");
    // 0.5 * 1.0 = 0.5 -> 'medium'
    expect(medium?.breachProbability).toBe(0.5);
    expect(medium?.riskLevel).toBe("medium");

    const low = results.find((r) => r.issueId === "1");
    // 0.5 * 0.8 = 0.4 -> 'low' (since > 0.4 is medium, exactly 0.4 is low)
    expect(low?.breachProbability).toBe(0.4);
    expect(low?.riskLevel).toBe("low");

    const unknown = results.find((r) => r.issueId === "5");
    // 0.5 * 1 (default) = 0.5
    expect(unknown?.breachProbability).toBe(0.5);
    expect(unknown?.riskLevel).toBe("medium");
  });

  it("handles already breached deadlines", () => {
    // Current time is 2024-01-01T12:00:00Z
    const results = predictSLABreachRisk([
      {
        id: "1",
        patientName: "John",
        admNo: "A1",
        category: "Test",
        priority: "Medium",
        deadline: "2024-01-01T10:00:00Z", // 2 hours ago
        createdAt: "2024-01-01T08:00:00Z",
      }
    ]);

    expect(results[0].hoursRemaining).toBe(0);
    expect(results[0].breachProbability).toBe(1.0);
    expect(results[0].riskLevel).toBe("critical");
  });

  it("handles approaching deadlines with sigmoid probability", () => {
    // Current time is 2024-01-01T12:00:00Z
    // Let's create an issue created at 02:00Z, deadline at 22:00Z (20 hours total, 10 hours remaining)
    // Elapsed time = 10 hours. elapsedRatio = 0.5

    // Let's create one created at 02:00Z, deadline at 14:30Z (12.5 hours total, 2.5 hours remaining)
    // Elapsed time = 10 hours. elapsedRatio = 10 / 12.5 = 0.8

    const results = predictSLABreachRisk([
      {
        id: "1",
        patientName: "50Percent",
        admNo: "A1",
        category: "Test",
        priority: "Medium",
        deadline: "2024-01-01T22:00:00Z",
        createdAt: "2024-01-01T02:00:00Z",
      },
      {
        id: "2",
        patientName: "80Percent",
        admNo: "A2",
        category: "Test",
        priority: "Medium",
        deadline: "2024-01-01T14:30:00Z",
        createdAt: "2024-01-01T02:00:00Z",
      }
    ]);

    const fifty = results.find(r => r.issueId === "1");
    // elapsedRatio = 0.5
    // k = 10
    // breachProbability = 1 / (1 + exp(-10 * (0.5 - 0.7))) ≈ 0.119
    expect(fifty?.hoursRemaining).toBe(10);
    expect(fifty?.breachProbability).toBeLessThan(0.4);
    expect(fifty?.riskLevel).toBe("low");

    const eighty = results.find(r => r.issueId === "2");
    // elapsedRatio = 0.8
    // breachProbability = 1 / (1 + exp(-10 * (0.8 - 0.7))) ≈ 0.731
    expect(eighty?.hoursRemaining).toBe(2.5);
    expect(eighty?.breachProbability).toBeGreaterThan(0.7);
    expect(eighty?.riskLevel).toBe("high");
  });

  it("handles edge case when totalHours is 0", () => {
    // Current time is 2024-01-01T12:00:00Z
    const results = predictSLABreachRisk([
      {
        id: "1",
        patientName: "ZeroHours",
        admNo: "A1",
        category: "Test",
        priority: "Medium",
        deadline: "2024-01-01T14:00:00Z",
        createdAt: "2024-01-01T14:00:00Z", // Same as deadline
      }
    ]);

    // totalHours = 0
    // hoursRemaining = 2
    // elapsed = 0 - 2 = -2
    // elapsedRatio = 1 (due to totalHours > 0 ? ... : 1 logic in the code)
    // probability = 1 / (1 + exp(-10 * (1 - 0.7))) = 1 / (1 + exp(-3)) ≈ 0.952

    expect(results[0].hoursRemaining).toBe(2);
    expect(results[0].breachProbability).toBeGreaterThan(0.9);
    expect(results[0].riskLevel).toBe("critical");
  });
});
