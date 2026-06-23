import { describe, expect, it } from 'bun:test';
import { getRootCauseSuggestion } from '../intelligence';

describe('getRootCauseSuggestion', () => {
  it('should return "N/A - Fully Compliant" when failures list is empty', () => {
    expect(getRootCauseSuggestion([])).toBe("N/A - Fully Compliant");
  });

  it('should return correct message for Pattern 1 (Missing GOP + Missing MedAid)', () => {
    const expected = "Potential Front-Office Oversight: Patient admitted before medical aid authorization or GOP was secured.";
    expect(getRootCauseSuggestion(['gop', 'medaid'])).toBe(expected);
    expect(getRootCauseSuggestion(['GOP', 'MedAid'])).toBe(expected); // Case insensitivity
    expect(getRootCauseSuggestion(['other', 'gop', 'medaid'])).toBe(expected); // With other failures
  });

  it('should return correct message for Pattern 2 (Missing Biometric + Missing Prenote)', () => {
    const expected = "Check-in Protocol Violation: Biometric verification and pre-notification skipped at source.";
    expect(getRootCauseSuggestion(['bio', 'prenote'])).toBe(expected);
    expect(getRootCauseSuggestion(['BIO', 'PreNote'])).toBe(expected); // Case insensitivity
    expect(getRootCauseSuggestion(['prenote', 'other', 'bio'])).toBe(expected); // With other failures
  });

  it('should return correct message for Pattern 3 (Missing Diagnosis)', () => {
    const expected = "Clinical Documentation Gap: ICD-10 or clinical diagnosis missing from HIS record.";
    expect(getRootCauseSuggestion(['diag'])).toBe(expected);
    expect(getRootCauseSuggestion(['DIAG'])).toBe(expected); // Case insensitivity
    expect(getRootCauseSuggestion(['other', 'diag'])).toBe(expected); // With other failures
  });

  it('should return default message for unrecognized failures', () => {
    const failures = ['id', 'signature'];
    const expected = "Incomplete data entry during shift. Follow-up required for missing components: id, signature";
    expect(getRootCauseSuggestion(failures)).toBe(expected);
  });

  it('should prioritize patterns correctly when multiple patterns match', () => {
    // Both Pattern 1 and Pattern 2 match. Pattern 1 should take precedence.
    const failures = ['gop', 'medaid', 'bio', 'prenote'];
    const expectedPattern1 = "Potential Front-Office Oversight: Patient admitted before medical aid authorization or GOP was secured.";
    expect(getRootCauseSuggestion(failures)).toBe(expectedPattern1);

    // Both Pattern 2 and Pattern 3 match. Pattern 2 should take precedence.
    const failures2 = ['bio', 'prenote', 'diag'];
    const expectedPattern2 = "Check-in Protocol Violation: Biometric verification and pre-notification skipped at source.";
    expect(getRootCauseSuggestion(failures2)).toBe(expectedPattern2);
  });
});
