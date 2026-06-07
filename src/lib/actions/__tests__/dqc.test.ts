import { test, expect, mock } from "bun:test";
import { createDQCRecord } from "../dqc";

// Mock the dependencies
mock.module("next-auth", () => ({
  getServerSession: () => Promise.resolve({ user: { id: "test-user-id" } })
}));

mock.module("@/lib/auth", () => ({
  authOptions: {}
}));

mock.module("next/cache", () => ({
  revalidatePath: () => {}
}));

mock.module("@/lib/intelligence", () => ({
  getRootCauseSuggestion: () => "test cause",
  calculateSLADeadline: () => new Date()
}));

mock.module("@/lib/actions/gamification", () => ({
  checkAndUnlockAchievements: () => Promise.resolve()
}));

mock.module("@/lib/prisma", () => ({
  default: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    $transaction: async (cb: any) => {
      return cb({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        admissionCheck: { create: async (args: any) => ({ id: "dqc-1", ...args.data }) },
        issue: { create: async () => ({}) },
        systemLog: { create: async () => ({}) }
      });
    }
  }
}));

test("createDQCRecord validates valid data", async () => {
  const result = await createDQCRecord({
    date: "2023-01-01",
    shift: "MORNING",
    patientName: "John Doe",
    admNo: "ADM001",
    ptype: "CASH",
    prenote: "Y",
    medaid: "Y",
    diag: "Y",
    receipt: "Y",
    bio: "Y",
    gop: "Y",
    comment: "All good"
  });

  expect(result.success).toBe(true);
});

test("createDQCRecord fails invalid shift", async () => {
  const result = await createDQCRecord({
    date: "2023-01-01",
    shift: "INVALID",
    patientName: "John Doe",
    admNo: "ADM001",
    ptype: "CASH",
    prenote: "Y",
    medaid: "Y",
    diag: "Y",
    receipt: "Y",
    bio: "Y",
    gop: "Y",
    comment: "All good"
  });

  expect(result.success).toBe(false);
  expect(result.error).toBe("Invalid input data");
});
