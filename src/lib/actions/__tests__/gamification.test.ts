import { describe, it, expect, mock, beforeEach } from "bun:test"
import { getClerkRankings } from "../gamification"
import { getServerSession } from "next-auth"

mock.module("next-auth", () => ({
  getServerSession: mock(() => Promise.resolve(null)),
}))

mock.module("@/lib/prisma", () => ({
  default: {
    user: {
      findMany: mock(() => Promise.resolve([])),
      findUnique: mock(() => Promise.resolve(null))
    },
    achievement: {
      create: mock(() => Promise.resolve({}))
    }
  }
}))

describe("Gamification Actions Security", () => {
  beforeEach(() => {
    mock.restore()
  })

  it("should return Unauthorized when session is missing in getClerkRankings", async () => {
    const result = await getClerkRankings()
    expect(result).toEqual({ success: false, error: "Unauthorized" })
  })
})
