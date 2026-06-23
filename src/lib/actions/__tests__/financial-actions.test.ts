import { expect, test, describe, mock, beforeEach, Mock } from "bun:test";
import { getTreasuryOverview } from "../financial-actions";
import prisma from "@/lib/prisma";

mock.module("@/lib/prisma", () => {
  return {
    default: {
      ingestedData: {
        findMany: mock(),
      },
    },
  };
});

// Helper type to avoid 'any' when casting mocked functions
type MockedFunction = Mock<(...args: unknown[]) => unknown>;

describe("getTreasuryOverview", () => {
  beforeEach(() => {
    mock.restore();
  });

  test("handles database errors correctly", async () => {
    (prisma.ingestedData.findMany as MockedFunction).mockRejectedValueOnce(
      new Error("Database connection failed")
    );

    const result = await getTreasuryOverview();

    expect(result).toEqual({
      success: false,
      error: "Database connection failed",
    });
    expect(prisma.ingestedData.findMany).toHaveBeenCalledWith({
      where: { type: 'AUTH' }
    });
  });

  test("processes valid data correctly", async () => {
    (prisma.ingestedData.findMany as MockedFunction).mockResolvedValueOnce([
      {
        data: {
          Amount: "$1,000",
          Paid: "500",
          Status: "APPROVED"
        }
      },
      {
        data: {
          Total: 2000,
          Collected: "$0",
          Status: "REJECTED"
        }
      }
    ]);

    const result = await getTreasuryOverview();

    expect(result).toEqual({
      success: true,
      data: {
        totalRevenue: 3000,
        totalCollected: 500,
        totalOutstanding: 2500,
        rejectedValue: 2000,
        badDebtRate: (2000 / 3000) * 100,
        collectionRate: (500 / 3000) * 100,
        episodeCount: 2
      }
    });
  });

  test("handles empty data correctly", async () => {
    (prisma.ingestedData.findMany as MockedFunction).mockResolvedValueOnce([]);

    const result = await getTreasuryOverview();

    expect(result).toEqual({
      success: true,
      data: {
        totalRevenue: 0,
        totalCollected: 0,
        totalOutstanding: 0,
        rejectedValue: 0,
        badDebtRate: 0,
        collectionRate: 0,
        episodeCount: 0
      }
    });
  });
});
