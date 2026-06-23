import { describe, it, expect } from "bun:test";
import { linearRegression } from "../predictive";

describe("linearRegression", () => {
  it("should handle empty arrays", () => {
    const result = linearRegression([]);
    expect(result.slope).toBe(0);
    expect(result.intercept).toBe(0);
    expect(result.rSquared).toBe(0);
    expect(result.direction).toBe("stable");
    expect(result.forecast.length).toBe(7);
  });

  it("should handle arrays with a single element", () => {
    const result = linearRegression([10]);
    expect(result.slope).toBe(0);
    expect(result.intercept).toBe(10);
    expect(result.rSquared).toBe(0);
    expect(result.direction).toBe("stable");
    expect(result.forecast[0]).toBe(10);
  });

  it("should calculate a perfect rising line", () => {
    // Data: y = 2x + 5, x = [0, 1, 2, 3] => y = [5, 7, 9, 11]
    const data = [5, 7, 9, 11];
    const result = linearRegression(data, 3);

    expect(result.slope).toBeCloseTo(2);
    expect(result.intercept).toBeCloseTo(5);
    expect(result.rSquared).toBeCloseTo(1);
    expect(result.direction).toBe("rising");

    // Forecast for x = 4, 5, 6 => y = 13, 15, 17
    expect(result.forecast[0]).toBeCloseTo(13);
    expect(result.forecast[1]).toBeCloseTo(15);
    expect(result.forecast[2]).toBeCloseTo(17);
  });

  it("should calculate a perfect falling line", () => {
    // Data: y = -3x + 20, x = [0, 1, 2] => y = [20, 17, 14]
    const data = [20, 17, 14];
    const result = linearRegression(data, 2);

    expect(result.slope).toBeCloseTo(-3);
    expect(result.intercept).toBeCloseTo(20);
    expect(result.rSquared).toBeCloseTo(1);
    expect(result.direction).toBe("falling");

    // Forecast for x = 3, 4 => y = 11, 8
    expect(result.forecast[0]).toBeCloseTo(11);
    expect(result.forecast[1]).toBeCloseTo(8);
  });

  it("should identify a flat line (stable direction)", () => {
    const data = [10, 10, 10, 10];
    const result = linearRegression(data, 2);

    expect(result.slope).toBe(0);
    expect(result.intercept).toBe(10);
    expect(result.rSquared).toBe(0); // variance is 0, logic returns 0
    expect(result.direction).toBe("stable");
    expect(result.forecast[0]).toBe(10);
  });

  it("should identify a 'stable' direction for very small slopes", () => {
    // slope of 0.1 is less than the 0.5 threshold
    const data = [10, 10.1, 10.2, 10.3];
    const result = linearRegression(data);

    expect(result.direction).toBe("stable");
  });

  it("should handle non-perfect linear relationships", () => {
    // x = [0, 1, 2, 3]
    // y = [10, 14, 12, 16]
    // mean(x) = 1.5, mean(y) = 13
    // slope ≈ 1.6, intercept ≈ 10.6
    const data = [10, 14, 12, 16];
    const result = linearRegression(data, 2);

    expect(result.slope).toBeGreaterThan(0);
    expect(result.intercept).toBeGreaterThan(0);
    expect(result.rSquared).toBeGreaterThan(0);
    expect(result.rSquared).toBeLessThan(1);
    expect(result.direction).toBe("rising");

    expect(result.forecast.length).toBe(2);
  });

  it("should not return negative forecasts", () => {
    // Sharp decline that would theoretically go below 0
    const data = [100, 50, 0];
    const result = linearRegression(data, 3);

    // x=3 forecast would theoretically be -50
    expect(result.forecast[0]).toBe(0);
    expect(result.forecast[1]).toBe(0);
  });
});
