import { test, expect, mock, describe, beforeEach } from "bun:test";

// Mock next-auth
mock.module("next-auth", () => ({
  getServerSession: mock(() => Promise.resolve(null)),
}));

// Mock Prisma
mock.module("@/lib/prisma", () => ({
  default: {
    systemLog: {
      findMany: mock(() => Promise.resolve([])),
    },
    user: {
      findMany: mock(() => Promise.resolve([])),
    },
    shiftSignoff: {
      findMany: mock(() => Promise.resolve([])),
    }
  }
}));

import { getAuditTrail, getSignoffHistory } from "../audit-actions";
import { getServerSession } from "next-auth";

describe("audit-actions", () => {
  beforeEach(() => {
    (getServerSession as any).mockClear();
  });

  test("getAuditTrail should return unauthorized when session is null", async () => {
    (getServerSession as any).mockResolvedValueOnce(null);
    const result = await getAuditTrail();
    expect(result).toEqual({ success: false, error: "Unauthorized" });
  });

  test("getSignoffHistory should return unauthorized when session is null", async () => {
    (getServerSession as any).mockResolvedValueOnce(null);
    const result = await getSignoffHistory();
    expect(result).toEqual({ success: false, error: "Unauthorized" });
  });

  test("getAuditTrail should proceed when session is valid", async () => {
    (getServerSession as any).mockResolvedValueOnce({ user: { name: "Test User" } });
    const result = await getAuditTrail();
    expect(result.success).toBe(true);
  });
});
