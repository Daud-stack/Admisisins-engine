import { describe, it, expect, mock, beforeEach, spyOn } from "bun:test";
import { getIssues, updateIssueStatus } from "../issues";

// Mock next-auth
let mockSession: any = { user: { name: "Test User" } };
mock.module("next-auth", () => ({
  getServerSession: () => Promise.resolve(mockSession),
}));

// Mock next/cache
const mockRevalidatePath = mock(() => {});
mock.module("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
}));

// Mock @/lib/prisma
const mockUpdate = mock(() => Promise.resolve());
const mockFindUnique = mock(() => Promise.resolve({ comments: "Old comment" }));
const mockFindMany = mock(() => Promise.resolve([{ id: "1", status: "Open" }]));

mock.module("@/lib/prisma", () => ({
  default: {
    issue: {
      update: mockUpdate,
      findUnique: mockFindUnique,
      findMany: mockFindMany,
    },
  },
}));

describe("Issues Actions", () => {
  beforeEach(() => {
    mockSession = { user: { name: "Test User" } }; // Reset session
    mockUpdate.mockClear();
    mockFindUnique.mockClear();
    mockFindMany.mockClear();
    mockRevalidatePath.mockClear();
  });

  describe("getIssues", () => {
    it("should return issues on success", async () => {
      const result = await getIssues();
      expect(result).toEqual({ success: true, data: [{ id: "1", status: "Open" }] });
      expect(mockFindMany).toHaveBeenCalled();
    });

    it("should return a generic error and log it on failure", async () => {
      const errorSpy = spyOn(console, "error").mockImplementation(() => {});
      mockFindMany.mockRejectedValueOnce(new Error("Database error"));

      const result = await getIssues();

      expect(result).toEqual({ success: false, error: "An internal error occurred" });
      expect(errorSpy).toHaveBeenCalled();
      errorSpy.mockRestore();
    });
  });

  describe("updateIssueStatus", () => {
    it("should return Unauthorized if session is missing", async () => {
      mockSession = null;

      const result = await updateIssueStatus("1", "Closed");

      expect(result).toEqual({ success: false, error: "Unauthorized" });
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it("should successfully update an issue without comment", async () => {
      const result = await updateIssueStatus("1", "Open");

      expect(result).toEqual({ success: true });
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: "1" },
        data: { status: "Open" }
      });
      expect(mockRevalidatePath).toHaveBeenCalledWith("/tracker");
      expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard");
    });

    it("should append comment if provided", async () => {
      const result = await updateIssueStatus("1", "Open", "New comment");

      expect(result).toEqual({ success: true });
      expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: "1" } });

      const updateCall = mockUpdate.mock.calls[0][0];
      expect(updateCall.where).toEqual({ id: "1" });
      expect(updateCall.data.status).toBe("Open");
      expect(updateCall.data.comments).toContain("Old comment");
      expect(updateCall.data.comments).toContain("Test User: New comment");
    });

    it("should set dateResolved if status is Closed", async () => {
      const result = await updateIssueStatus("1", "Closed");

      expect(result).toEqual({ success: true });
      const updateCall = mockUpdate.mock.calls[0][0];
      expect(updateCall.data.status).toBe("Closed");
      expect(updateCall.data.dateResolved).toBeInstanceOf(Date);
    });

    it("should return a generic error and log it on findUnique failure", async () => {
      const errorSpy = spyOn(console, "error").mockImplementation(() => {});
      mockFindUnique.mockRejectedValueOnce(new Error("DB Connection Error"));

      const result = await updateIssueStatus("1", "Open", "Failing comment");

      expect(result).toEqual({ success: false, error: "An internal error occurred" });
      expect(errorSpy).toHaveBeenCalled();
      expect(mockUpdate).not.toHaveBeenCalled();

      errorSpy.mockRestore();
    });

    it("should return a generic error and log it on update failure", async () => {
      const errorSpy = spyOn(console, "error").mockImplementation(() => {});
      mockUpdate.mockRejectedValueOnce(new Error("DB Update Error"));

      const result = await updateIssueStatus("1", "Open");

      expect(result).toEqual({ success: false, error: "An internal error occurred" });
      expect(errorSpy).toHaveBeenCalled();

      errorSpy.mockRestore();
    });
  });
});
