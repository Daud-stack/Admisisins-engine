import { describe, expect, test, mock, beforeEach } from "bun:test"
import { getAdmissionForecast, getErrorTrendForecast, getSLARiskMatrix, getPredictiveSummary } from "../predictive-actions"

// Mock the dependencies
const mockGetServerSession = mock()
mock.module("next-auth", () => ({
  getServerSession: mockGetServerSession,
}))

// Minimal mock for authOptions
mock.module("@/lib/auth", () => ({
  authOptions: {},
}))

mock.module("@/lib/prisma", () => ({
  default: {
    ingestedData: { findMany: mock(() => Promise.resolve([])) },
    admissionCheck: { findMany: mock(() => Promise.resolve([])) },
    issue: { findMany: mock(() => Promise.resolve([])) }
  }
}))

describe("Predictive Actions Authorization", () => {
  beforeEach(() => {
    mockGetServerSession.mockReset()
  })

  test("getAdmissionForecast requires authentication", async () => {
    mockGetServerSession.mockResolvedValue(null)
    const result = await getAdmissionForecast()
    expect(result).toEqual({ success: false, error: 'Unauthorized' })
  })

  test("getErrorTrendForecast requires authentication", async () => {
    mockGetServerSession.mockResolvedValue(null)
    const result = await getErrorTrendForecast()
    expect(result).toEqual({ success: false, error: 'Unauthorized' })
  })

  test("getSLARiskMatrix requires authentication", async () => {
    mockGetServerSession.mockResolvedValue(null)
    const result = await getSLARiskMatrix()
    expect(result).toEqual({ success: false, error: 'Unauthorized' })
  })

  test("getPredictiveSummary requires authentication", async () => {
    mockGetServerSession.mockResolvedValue(null)
    const result = await getPredictiveSummary()
    expect(result).toEqual({ success: false, error: 'Unauthorized' })
  })

  test("getAdmissionForecast allows authenticated users", async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: "1" } })
    const result = await getAdmissionForecast()
    // It should proceed past the auth check (might return empty data due to mocked prisma)
    expect(result.error).not.toEqual('Unauthorized')
  })
})
