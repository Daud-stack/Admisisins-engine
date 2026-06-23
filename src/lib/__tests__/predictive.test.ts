import { describe, expect, test } from "bun:test";
import { doubleExponentialSmoothing } from "../predictive";

describe("doubleExponentialSmoothing", () => {
  test("handles empty array by returning array of 0s based on horizon", () => {
    const result = doubleExponentialSmoothing([], 0.3, 0.1, 5);
    expect(result).toHaveLength(5);
    expect(result).toEqual([0, 0, 0, 0, 0]);
  });

  test("handles single element array by returning array of that element based on horizon", () => {
    const result = doubleExponentialSmoothing([5], 0.3, 0.1, 3);
    expect(result).toHaveLength(3);
    expect(result).toEqual([5, 5, 5]);
  });

  test("calculates double exponential smoothing for a simple linear trend", () => {
    // A perfect line: y = x, so the next values should be 4, 5, 6
    // Since alpha and beta have an effect, it won't be exactly 4, 5, 6 immediately
    // unless alpha=1, beta=1
    const data = [1, 2, 3];
    const result = doubleExponentialSmoothing(data, 1.0, 1.0, 3);
    expect(result).toHaveLength(3);
    // with alpha=1, level exactly follows data
    // with beta=1, trend exactly follows difference in level
    // level: 1 -> 2 -> 3
    // trend: 1 -> 1 -> 1
    // forecast: 3+1*1=4, 3+2*1=5, 3+3*1=6
    expect(result).toEqual([4, 5, 6]);
  });

  test("calculates double exponential smoothing with default parameters", () => {
    const data = [10, 12, 15, 18, 22];
    const result = doubleExponentialSmoothing(data);
    expect(result).toHaveLength(7); // default horizon
    // We expect the forecast to continue the upward trend
    expect(result[0]).toBeGreaterThan(22);
    expect(result[1]).toBeGreaterThan(result[0]);
  });

  test("prevents negative forecasts", () => {
    // A strong downward trend
    const data = [100, 50, 0];
    const result = doubleExponentialSmoothing(data, 0.5, 0.5, 5);
    // Even if the linear projection goes negative, the function should cap it at 0 via Math.max(0, ...)
    expect(result.every((val) => val >= 0)).toBe(true);
  });
});
