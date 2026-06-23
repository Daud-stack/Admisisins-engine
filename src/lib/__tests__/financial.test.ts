import { describe, expect, it } from 'bun:test';
import { getCashFlowForecast } from '../financial';

describe('getCashFlowForecast', () => {
  it('should return an empty array if dailyCollections is empty', () => {
    const result = getCashFlowForecast([], 30);
    expect(result).toEqual([]);
  });

  it('should handle a constant trend correctly', () => {
    const dailyCollections = Array.from({ length: 14 }).map((_, i) => ({
      date: `2024-01-${String(i + 1).padStart(2, '0')}`,
      amount: 100
    }));

    const result = getCashFlowForecast(dailyCollections, 5);

    // Total result length: 14 historical + 5 forecast = 19
    expect(result.length).toBe(19);

    // Verify historical points
    expect(result[0].cumulative).toBe(100);
    expect(result[13].cumulative).toBe(1400);
    expect(result[13].projected).toBe(100);

    // Verify forecast points
    expect(result[14].date).toBe('2024-01-15');
    expect(result[14].projected).toBe(100);
    expect(result[14].cumulative).toBe(1500);

    expect(result[18].date).toBe('2024-01-19');
    expect(result[18].projected).toBe(100);
    expect(result[18].cumulative).toBe(1900);
  });

  it('should handle a growth trend correctly', () => {
    // prior 7 days = 100 each (avg 100)
    // recent 7 days = 150 each (avg 150)
    // growthRate = (150 - 100) / 100 = 0.5
    const prior = Array.from({ length: 7 }).map((_, i) => ({
      date: `2024-01-${String(i + 1).padStart(2, '0')}`,
      amount: 100
    }));
    const recent = Array.from({ length: 7 }).map((_, i) => ({
      date: `2024-01-${String(i + 8).padStart(2, '0')}`,
      amount: 150
    }));

    const dailyCollections = [...prior, ...recent];
    const horizon = 10;
    const result = getCashFlowForecast(dailyCollections, horizon);

    expect(result.length).toBe(24);

    // Historical cumulative = 7 * 100 + 7 * 150 = 700 + 1050 = 1750
    expect(result[13].cumulative).toBe(1750);

    // First projected day: recentAvg * (1 + growthRate * (1 / 10))
    // 150 * (1 + 0.5 * 0.1) = 150 * 1.05 = 157.5 -> rounded 158
    expect(result[14].projected).toBe(158);
    expect(result[14].cumulative).toBe(1750 + 158);

    // Last projected day: recentAvg * (1 + growthRate * (10 / 10))
    // 150 * (1 + 0.5 * 1.0) = 150 * 1.5 = 225
    expect(result[23].projected).toBe(225);
  });

  it('should generate future dates deterministically based on input timezone-agnostic strings', () => {
    const dailyCollections = [
      { date: '2024-02-28', amount: 50 },
      { date: '2024-02-29', amount: 50 } // Leap year test
    ];

    const result = getCashFlowForecast(dailyCollections, 3);

    expect(result.length).toBe(5); // 2 hist + 3 forecast

    expect(result[2].date).toBe('2024-03-01');
    expect(result[3].date).toBe('2024-03-02');
    expect(result[4].date).toBe('2024-03-03');
  });
});
