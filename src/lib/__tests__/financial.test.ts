import { describe, expect, it } from 'bun:test';
import { calculateBadDebtRisk } from '../financial';

describe('calculateBadDebtRisk', () => {
  it('should return an empty array if input is empty', () => {
    expect(calculateBadDebtRisk([])).toEqual([]);
  });

  const baseRecord = (dataOverrides = {}, loadedAtOffset = 0) => {
    const loadedAt = new Date();
    loadedAt.setDate(loadedAt.getDate() - loadedAtOffset);
    return {
      data: {
        Amount: 100, // Minimal amount so it doesn't skew score unless overridden
        Status: 'APPROVED', // 0 risk points
        Scheme: 'Medical Aid', // 0 risk points
        ...dataOverrides,
      },
      loadedAt,
    };
  };

  describe('Status Factor Scoring', () => {
    it('scores 40 points for REJECTED or DECLINED', () => {
      const results = calculateBadDebtRisk([baseRecord({ Status: 'REJECTED' }), baseRecord({ Status: 'DECLINED' })]);
      expect(results[0].riskScore).toBe(40);
      expect(results[1].riskScore).toBe(40);
    });

    it('scores 25 points for PENDING or TBA', () => {
      const results = calculateBadDebtRisk([baseRecord({ Status: 'PENDING' }), baseRecord({ Status: 'TBA' })]);
      expect(results[0].riskScore).toBe(25);
      expect(results[1].riskScore).toBe(25);
    });

    it('scores 15 points for PARTIAL', () => {
      const results = calculateBadDebtRisk([baseRecord({ Status: 'PARTIAL' })]);
      expect(results[0].riskScore).toBe(15);
    });

    it('scores 0 points for APPROVED or PAID', () => {
      const results = calculateBadDebtRisk([baseRecord({ Status: 'APPROVED' }), baseRecord({ Status: 'PAID' })]);
      expect(results[0].riskScore).toBe(0);
      expect(results[1].riskScore).toBe(0);
    });

    it('scores 20 points for unknown status', () => {
      const results = calculateBadDebtRisk([baseRecord({ Status: 'UNKNOWN_BLAH' }), baseRecord({ Status: null })]);
      expect(results[0].riskScore).toBe(20);
      expect(results[1].riskScore).toBe(20);
    });
  });

  describe('Aging Factor Scoring', () => {
    it('scores 30 points for > 90 days', () => {
      const results = calculateBadDebtRisk([baseRecord({}, 95)]);
      expect(results[0].riskScore).toBe(30); // Status is APPROVED, so only aging applies
    });

    it('scores 22 points for > 60 days', () => {
      const results = calculateBadDebtRisk([baseRecord({}, 65)]);
      expect(results[0].riskScore).toBe(22);
    });

    it('scores 15 points for > 30 days', () => {
      const results = calculateBadDebtRisk([baseRecord({}, 35)]);
      expect(results[0].riskScore).toBe(15);
    });

    it('scores 8 points for > 14 days', () => {
      const results = calculateBadDebtRisk([baseRecord({}, 20)]);
      expect(results[0].riskScore).toBe(8);
    });

    it('scores 0 points for <= 14 days', () => {
      const results = calculateBadDebtRisk([baseRecord({}, 10)]);
      expect(results[0].riskScore).toBe(0);
    });
  });

  describe('Amount Factor Scoring', () => {
    it('scores 20 points for amount > 50000', () => {
      const results = calculateBadDebtRisk([baseRecord({ Amount: 50001 })]);
      expect(results[0].riskScore).toBe(20);
    });

    it('scores 15 points for amount > 20000', () => {
      const results = calculateBadDebtRisk([baseRecord({ Amount: 20001 })]);
      expect(results[0].riskScore).toBe(15);
    });

    it('scores 10 points for amount > 10000', () => {
      const results = calculateBadDebtRisk([baseRecord({ Amount: 10001 })]);
      expect(results[0].riskScore).toBe(10);
    });

    it('scores 5 points for amount > 5000', () => {
      const results = calculateBadDebtRisk([baseRecord({ Amount: 5001 })]);
      expect(results[0].riskScore).toBe(5);
    });

    it('scores 0 points for amount <= 5000', () => {
      const results = calculateBadDebtRisk([baseRecord({ Amount: 5000 })]);
      expect(results[0].riskScore).toBe(0);
    });

    it('handles formatted amounts', () => {
      const results = calculateBadDebtRisk([baseRecord({ Amount: "$50,001.00" })]);
      expect(results[0].riskScore).toBe(20);
    });
  });

  describe('Scheme Factor Scoring', () => {
    it('scores 10 points for CASH or SELF schemes', () => {
      const results = calculateBadDebtRisk([baseRecord({ Scheme: 'CASH' }), baseRecord({ Scheme: 'SELF' })]);
      expect(results[0].riskScore).toBe(10);
      expect(results[1].riskScore).toBe(10);
    });

    it('scores 0 points for other schemes', () => {
      const results = calculateBadDebtRisk([baseRecord({ Scheme: 'DISCOVERY' })]);
      expect(results[0].riskScore).toBe(0);
    });
  });

  describe('Risk Levels', () => {
    it('assigns critical for score >= 75', () => {
      const results = calculateBadDebtRisk([baseRecord({ Status: 'REJECTED', Amount: 50001, Scheme: 'CASH', }, 100)]);
      expect(results[0].riskScore).toBe(100); // 40 (status) + 30 (aging) + 20 (amount) + 10 (scheme) = 100 capped
      expect(results[0].riskLevel).toBe('critical');
    });

    it('assigns high for 50 <= score < 75', () => {
      const results = calculateBadDebtRisk([baseRecord({ Status: 'REJECTED', Amount: 10001 })]); // 40 + 10 = 50
      expect(results[0].riskScore).toBe(50);
      expect(results[0].riskLevel).toBe('high');
    });

    it('assigns medium for 30 <= score < 50', () => {
      const results = calculateBadDebtRisk([baseRecord({ Status: 'PENDING', Amount: 5001 })]); // 25 + 5 = 30
      expect(results[0].riskScore).toBe(30);
      expect(results[0].riskLevel).toBe('medium');
    });

    it('assigns low for score < 30', () => {
      const results = calculateBadDebtRisk([baseRecord({ Status: 'UNKNOWN' })]); // 20
      expect(results[0].riskScore).toBe(20);
      expect(results[0].riskLevel).toBe('low');
    });
  });

  describe('General behaviors', () => {
    it('caps risk score at 100', () => {
      // 40 (REJECTED) + 30 (>90d) + 20 (>50000) + 10 (CASH) + 20 (Unknown? no it is REJECTED)
      // Max possible is 40 + 30 + 20 + 10 = 100 exactly. Let's try to break it by giving it multiple bad things? No, they are mutually exclusive.
      // But let's just make sure it stays at 100.
      const results = calculateBadDebtRisk([baseRecord({ Status: 'REJECTED', Amount: 60000, Scheme: 'CASH' }, 100)]);
      expect(results[0].riskScore).toBe(100);
    });

    it('sorts the result array descending by riskScore', () => {
      const results = calculateBadDebtRisk([
        baseRecord({ Status: 'PARTIAL' }), // 15
        baseRecord({ Status: 'REJECTED', Amount: 60000, Scheme: 'CASH' }, 100), // 100
        baseRecord({ Status: 'PENDING' }) // 25
      ]);

      expect(results[0].riskScore).toBe(100);
      expect(results[1].riskScore).toBe(25);
      expect(results[2].riskScore).toBe(15);
    });
  });
});
