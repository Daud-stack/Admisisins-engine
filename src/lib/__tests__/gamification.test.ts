import { expect, test, describe, mock, beforeEach } from "bun:test"

// Mock NextAuth getServerSession
mock.module("next-auth", () => {
  return {
    getServerSession: mock(() => Promise.resolve(null)),
  }
})

// Mock Prisma
mock.module("@/lib/prisma", () => {
  return {
    default: {
      user: {
        findMany: mock(() => Promise.resolve([])),
        findUnique: mock(() => Promise.resolve(null)),
      },
      achievement: {
        create: mock(() => Promise.resolve({})),
      }
    }
  }
})

import { getClerkRankings, checkAndUnlockAchievements } from "../actions/gamification"
import { getServerSession } from "next-auth"

describe("Gamification Actions - Authorization", () => {
  beforeEach(() => {
    (getServerSession as any).mockClear()
  })

  test("getClerkRankings should return Unauthorized if no session", async () => {
    (getServerSession as any).mockResolvedValueOnce(null)
    const result = await getClerkRankings()
    expect(result).toEqual({ success: false, error: "Unauthorized" })
  })

  test("getClerkRankings should succeed if session exists", async () => {
    (getServerSession as any).mockResolvedValueOnce({ user: { id: "1" } })
    const result = await getClerkRankings()
    expect(result.success).toBe(true)
  })

  test("checkAndUnlockAchievements should return Unauthorized if no session", async () => {
    (getServerSession as any).mockResolvedValueOnce(null)
    const result = await checkAndUnlockAchievements("user-1")
    expect(result).toEqual({ success: false, error: "Unauthorized" })
  })

  test("checkAndUnlockAchievements should return Unauthorized if session user id does not match", async () => {
    (getServerSession as any).mockResolvedValueOnce({ user: { id: "user-2" } })
    const result = await checkAndUnlockAchievements("user-1")
    expect(result).toEqual({ success: false, error: "Unauthorized" })
  })

  test("checkAndUnlockAchievements should succeed if session user id matches", async () => {
    (getServerSession as any).mockResolvedValueOnce({ user: { id: "user-1" } })
    const result = await checkAndUnlockAchievements("user-1")
    expect(result.success).toBe(false) // Because user is not found in mocked prisma
    expect(result.error).toBe("User not found")
  })
})
