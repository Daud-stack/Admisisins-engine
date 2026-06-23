import { describe, expect, it } from "bun:test";
import { detectAuditAnomalies } from "../intelligence";

describe("detectAuditAnomalies", () => {
  it("should return an empty array if data length is less than 5", () => {
    const data = [10, 12, 11, 10];
    const labels = ["Shift 1", "Shift 2", "Shift 3", "Shift 4"];
    const result = detectAuditAnomalies(data, labels);
    expect(result).toEqual([]);
  });

  it("should return no insights for normal data without outliers", () => {
    // Array of 10 values around mean=10, std is small
    const data = [10, 11, 9, 10, 11, 9, 10, 10, 11, 9];
    const labels = data.map((_, i) => `Shift ${i + 1}`);
    const result = detectAuditAnomalies(data, labels);
    expect(result).toEqual([]);
  });

  it("should handle zero variance gracefully (std = 0)", () => {
    // All identical values, std becomes 0 but code falls back to 1
    const data = [5, 5, 5, 5, 5, 5];
    const labels = data.map((_, i) => `Shift ${i + 1}`);
    const result = detectAuditAnomalies(data, labels);
    expect(result).toEqual([]);
  });

  it("should flag a medium anomaly (2.0 < |Z| <= 3.0)", () => {
    // Mean = ~10. Anomaly at 16 (let's check Z score)
    // 9 values of 10, 1 value of 15
    // Sum = 105, Mean = 10.5
    // Variance = (9 * (-0.5)^2 + (4.5)^2) / 10 = (2.25 + 20.25) / 10 = 2.25
    // StdDev = sqrt(2.25) = 1.5
    // Z for 15 = (15 - 10.5) / 1.5 = 4.5 / 1.5 = 3.0 (exactly 3.0 is medium severity per logic Math.abs(z) > 3.0 is high, else medium)
    const data = [10, 10, 10, 10, 10, 10, 10, 10, 10, 15];
    const labels = data.map((_, i) => `Shift ${i + 1}`);
    const result = detectAuditAnomalies(data, labels);
    expect(result.length).toBe(1);
    expect(result[0].severity).toBe("medium");
    expect(result[0].value).toBe(15);
    expect(result[0].type).toBe("anomaly");
  });

  it("should flag a high anomaly (|Z| > 3.0)", () => {
    // 19 values of 10, 1 value of 25
    // Sum = 190 + 25 = 215, Mean = 10.75
    // Variance = (19 * (-0.75)^2 + (14.25)^2) / 20 = (10.6875 + 203.0625) / 20 = 213.75 / 20 = 10.6875
    // StdDev = sqrt(10.6875) = ~3.269
    // Z for 25 = (25 - 10.75) / 3.269 = 14.25 / 3.269 = 4.359 > 3.0 => high
    const data = Array(19).fill(10).concat([25]);
    const labels = data.map((_, i) => `Shift ${i + 1}`);
    const result = detectAuditAnomalies(data, labels);

    expect(result.length).toBe(1);
    expect(result[0].severity).toBe("high");
    expect(result[0].value).toBe(25);
    expect(result[0].type).toBe("anomaly");
  });

  it("should flag negative anomalies (low values)", () => {
    // 19 values of 10, 1 value of 0
    // Mean = 190/20 = 9.5
    // Variance = (19 * (0.5)^2 + (-9.5)^2) / 20 = (4.75 + 90.25) / 20 = 95 / 20 = 4.75
    // StdDev = sqrt(4.75) = ~2.179
    // Z for 0 = (0 - 9.5) / 2.179 = -9.5 / 2.179 = -4.359. |Z| = 4.359 > 3.0 => high
    const data = Array(19).fill(10).concat([0]);
    const labels = data.map((_, i) => `Shift ${i + 1}`);
    const result = detectAuditAnomalies(data, labels);

    expect(result.length).toBe(1);
    expect(result[0].severity).toBe("high");
    expect(result[0].value).toBe(0);
    expect(result[0].type).toBe("anomaly");
  });
});
