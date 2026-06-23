import { describe, it, expect, mock, beforeEach } from "bun:test"
import { clearDataset } from "../actions/ingest"

// Mock the next-auth getServerSession
mock.module("next-auth", () => ({
  getServerSession: mock(() => Promise.resolve(null)),
}))

// Mock the prisma client
mock.module("@/lib/prisma", () => ({
  default: {
    $transaction: mock(async (callback) => {
      // Create a dummy transaction object with mock methods
      const tx = {
        ingestedData: { deleteMany: mock(() => Promise.resolve({ count: 1 })) },
        fileIngestion: { deleteMany: mock(() => Promise.resolve({ count: 1 })) }
      }
      return callback(tx)
    })
  }
}))

// Mock next/cache
mock.module("next/cache", () => ({
  revalidatePath: mock(() => {})
}))

describe("clearDataset Security", () => {
  let getServerSessionMock: any;

  beforeEach(async () => {
    // Dynamically import the mocked function to update its implementation per test
    const nextAuth = await import("next-auth")
    getServerSessionMock = nextAuth.getServerSession as ReturnType<typeof mock>
    getServerSessionMock.mockClear()
  })

  it("should return Unauthorized when no session exists", async () => {
    getServerSessionMock.mockResolvedValueOnce(null)
    const result = await clearDataset("test-type")
    expect(result).toEqual({ success: false, error: 'Unauthorized' })
  })

  it("should return Unauthorized when role is CLERK", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { role: "CLERK" } })
    const result = await clearDataset("test-type")
    expect(result).toEqual({ success: false, error: 'Unauthorized' })
  })

  it("should return Unauthorized when role is MANAGER", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { role: "MANAGER" } })
    const result = await clearDataset("test-type")
    expect(result).toEqual({ success: false, error: 'Unauthorized' })
  })

  it("should return success when role is SUPERVISOR", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { role: "SUPERVISOR" } })
    const result = await clearDataset("test-type")
    expect(result).toEqual({ success: true })
  })

  it("should return success when role is ADMIN", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { role: "ADMIN" } })
    const result = await clearDataset("test-type")
    expect(result).toEqual({ success: true })
  })

  it("should handle internal errors gracefully without leaking info", async () => {
    // Ensure auth passes
    getServerSessionMock.mockResolvedValueOnce({ user: { role: "ADMIN" } })

    // Force prisma to throw an error
    const prisma = await import("@/lib/prisma")
    const originalTx = prisma.default.$transaction
    prisma.default.$transaction = mock(() => Promise.reject(new Error("Database connection failed completely and exposed secrets")))

    // Silence console.error for this specific test so it doesn't clutter output
    const consoleSpy = mock(() => {})
    const originalError = console.error
    console.error = consoleSpy

    const result = await clearDataset("test-type")

    // Restore
    console.error = originalError
    prisma.default.$transaction = originalTx

    expect(result).toEqual({ success: false, error: 'An internal error occurred' })
    expect(consoleSpy).toHaveBeenCalled()
  })
})
