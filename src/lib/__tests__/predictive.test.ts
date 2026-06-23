import { describe, it, expect } from "bun:test";
import { movingAverage } from "../predictive";

describe("predictive module", () => {
  describe("movingAverage", () => {
    it("should return the original array if the window size is greater than the array length", () => {
      const data = [1, 2];
      const window = 3;
      const result = movingAverage(data, window);
      expect(result).toEqual([1, 2]);
    });

    it("should return the original array if the array is empty", () => {
      const data: number[] = [];
      const window = 3;
      const result = movingAverage(data, window);
      expect(result).toEqual([]);
    });

    it("should correctly compute the moving average with window size 2", () => {
      const data = [1, 3, 5, 7, 9];
      const window = 2;
      const result = movingAverage(data, window);
      // [ (1+3)/2, (3+5)/2, (5+7)/2, (7+9)/2 ]
      // [ 2, 4, 6, 8 ]
      expect(result).toEqual([2, 4, 6, 8]);
    });

    it("should correctly compute the moving average with window size 3", () => {
      const data = [1, 2, 3, 4, 5];
      const window = 3;
      const result = movingAverage(data, window);
      // [ (1+2+3)/3, (2+3+4)/3, (3+4+5)/3 ]
      // [ 2, 3, 4 ]
      expect(result).toEqual([2, 3, 4]);
    });

    it("should compute exactly one result if the window size equals the array length", () => {
      const data = [10, 20, 30];
      const window = 3;
      const result = movingAverage(data, window);
      // [ (10+20+30)/3 ]
      // [ 20 ]
      expect(result).toEqual([20]);
    });

    it("should return the identical array if window size is 1", () => {
      const data = [1, 2, 3, 4];
      const window = 1;
      const result = movingAverage(data, window);
      expect(result).toEqual([1, 2, 3, 4]);
    });
  });
});
