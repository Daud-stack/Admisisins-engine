import { describe, expect, it } from 'bun:test';
import { z } from 'zod';

const dqcSchema = z.object({
  date: z.string().or(z.date()),
  shift: z.enum(['MORNING', 'AFTERNOON', 'NIGHT']),
  patientName: z.string().min(1),
  admNo: z.string().min(1),
  ptype: z.enum(['MEDICAL AID', 'CASH', 'GUARANTEED', 'INTERNATIONAL MEDICAL INSURANCE']),
  prenote: z.enum(['Y', 'N', 'NA']),
  medaid: z.enum(['Y', 'N', 'NA']),
  diag: z.enum(['Y', 'N', 'NA']),
  receipt: z.enum(['Y', 'N', 'NA']),
  bio: z.enum(['Y', 'N', 'NA']),
  gop: z.enum(['Y', 'N', 'NA']),
  comment: z.string().optional().nullable()
});

describe('dqcSchema validation', () => {
  it('validates correct form data', () => {
    const validData = {
      date: '2023-10-27',
      shift: 'MORNING',
      patientName: 'John Doe',
      admNo: 'ADM123',
      ptype: 'MEDICAL AID',
      prenote: 'Y',
      medaid: 'N',
      diag: 'NA',
      receipt: 'Y',
      bio: 'Y',
      gop: 'NA',
      comment: 'All good'
    };

    const result = dqcSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('fails on invalid shift', () => {
    const invalidData = {
      date: '2023-10-27',
      shift: 'EVENING',
      patientName: 'John Doe',
      admNo: 'ADM123',
      ptype: 'MEDICAL AID',
      prenote: 'Y',
      medaid: 'N',
      diag: 'NA',
      receipt: 'Y',
      bio: 'Y',
      gop: 'NA'
    };

    const result = dqcSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
