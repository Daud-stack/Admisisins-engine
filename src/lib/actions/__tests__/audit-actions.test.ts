import { describe, expect, test, mock, beforeEach } from "bun:test";
import { getAuditTrail } from "../audit-actions";

// Mock the modules
mock.module("next-auth", () => ({
  getServerSession: mock(() => Promise.resolve(null)),
}));

mock.module("@/lib/auth", () => ({
  authOptions: {},
}));

mock.module("@/lib/prisma", () => ({
  default: {
    systemLog: {
      findMany: mock(() => Promise.resolve([])),
    },
    user: {
      findMany: mock(() => Promise.resolve([])),
    },
  },
}));

describe("audit-actions", () => {
  let getServerSessionMock: any;
  let prismaMock: any;

  beforeEach(async () => {
    const nextAuth = await import("next-auth");
    getServerSessionMock = nextAuth.getServerSession as ReturnType<typeof mock>;
    getServerSessionMock.mockClear();

    const prisma = (await import("@/lib/prisma")).default;
    prismaMock = prisma;
    prismaMock.systemLog.findMany.mockClear();
    prismaMock.user.findMany.mockClear();

    // Mock console.error to avoid noise in test output
    console.error = mock();
  });

  describe("getAuditTrail", () => {
    test("returns generic error and logs to console when unauthenticated", async () => {
      getServerSessionMock.mockResolvedValueOnce(null);

      const result = await getAuditTrail();

      expect(result).toEqual({
        success: false,
        error: "An internal error occurred",
        data: []
      });
      expect(console.error).toHaveBeenCalled();
      // The error logged should be Error("Unauthorized")
      const loggedError = (console.error as any).mock.calls[0][1];
      expect(loggedError.message).toBe("Unauthorized");
    });

    test("returns data when authenticated", async () => {
      // Mock an active session
      getServerSessionMock.mockResolvedValueOnce({ user: { name: "Test User" } });

      const mockLogs = [
        {
          id: "log1",
          event: "TEST_EVENT",
          shift: "MORNING",
          data: { details: "test" },
          createdAt: new Date("2023-01-01T00:00:00.000Z"),
          userId: "user1"
        }
      ];

      const mockUsers = [
        {
          id: "user1",
          name: "Test User",
          email: "test@example.com",
          role: "ADMIN"
        }
      ];

      prismaMock.systemLog.findMany.mockResolvedValueOnce(mockLogs);
      prismaMock.user.findMany.mockResolvedValueOnce(mockUsers);

      const result = await getAuditTrail();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toEqual({
        id: "log1",
        event: "TEST_EVENT",
        shift: "MORNING",
        data: { details: "test" },
        createdAt: "2023-01-01T00:00:00.000Z",
        userName: "Test User",
        userRole: "ADMIN",
        userEmail: "test@example.com"
      });
    });

    test("returns generic error when database fails", async () => {
      // Mock an active session
      getServerSessionMock.mockResolvedValueOnce({ user: { name: "Test User" } });

      const dbError = new Error("Database connection failed");
      prismaMock.systemLog.findMany.mockRejectedValueOnce(dbError);

      const result = await getAuditTrail();

      expect(result).toEqual({
        success: false,
        error: "An internal error occurred",
        data: []
      });
      expect(console.error).toHaveBeenCalledWith("Error in getAuditTrail:", dbError);
    });
  });
});
