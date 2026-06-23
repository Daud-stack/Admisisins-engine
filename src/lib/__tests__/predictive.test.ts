import { describe, it, expect } from "bun:test";
import { exponentialSmoothing } from "../predictive";

describe("exponentialSmoothing", () => {
  it("should return an empty array if input data is empty", () => {
    expect(exponentialSmoothing([])).toEqual([]);
  });

  it("should return the same single element if input has length 1", () => {
    expect(exponentialSmoothing([42])).toEqual([42]);
  });

  it("should calculate correctly with default alpha (0.3)", () => {
    const data = [10, 20, 30];
    const expected = [
      10, // data[0]
      0.3 * 20 + 0.7 * 10, // 6 + 7 = 13
      0.3 * 30 + 0.7 * 13, // 9 + 9.1 = 18.1
    ];
    // Use toBeCloseTo for floating point comparisons if necessary, or just check rounded values
    const result = exponentialSmoothing(data);
    expect(result[0]).toBe(expected[0]);
    expect(result[1]).toBeCloseTo(expected[1], 5);
    expect(result[2]).toBeCloseTo(expected[2], 5);
  });

  it("should calculate correctly with custom alpha (0.5)", () => {
    const data = [10, 20, 30];
    const alpha = 0.5;
    const expected = [
      10,
      0.5 * 20 + 0.5 * 10, // 10 + 5 = 15
      0.5 * 30 + 0.5 * 15, // 15 + 7.5 = 22.5
    ];

    const result = exponentialSmoothing(data, alpha);
    expect(result[0]).toBe(expected[0]);
    expect(result[1]).toBeCloseTo(expected[1], 5);
    expect(result[2]).toBeCloseTo(expected[2], 5);
  });

  it("should just return the data itself if alpha is 1 (ignores history)", () => {
    const data = [10, 20, 30, 40];
    const result = exponentialSmoothing(data, 1);
    expect(result).toEqual(data);
  });

  it("should just return a flat array of the first element if alpha is 0 (ignores new data)", () => {
    const data = [10, 20, 30, 40];
    const result = exponentialSmoothing(data, 0);
    expect(result).toEqual([10, 10, 10, 10]);
  });
});
