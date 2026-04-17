"use server"

import prisma from "@/lib/prisma"
import { calculateBadDebtRisk, getSchemeBreakdown, getCashFlowForecast } from "@/lib/financial"

export async function getTreasuryOverview() {
  try {
    const authData = await prisma.ingestedData.findMany({
      where: { type: 'AUTH' }
    })

    let totalRevenue = 0
    let totalCollected = 0
    let totalOutstanding = 0
    let rejectedValue = 0

    authData.forEach(record => {
      const data = record.data as any
      const amount = parseFloat(String(data.Amount || data.Total || 0).replace(/[$,]/g, ''))
      const paid = parseFloat(String(data.Paid || data.Collected || 0).replace(/[$,]/g, ''))
      const status = String(data.Status || "").toUpperCase()

      totalRevenue += amount
      totalCollected += paid
      if (status.includes("REJECTED") || status.includes("DECLINED")) {
        rejectedValue += amount
      }
    })

    totalOutstanding = totalRevenue - totalCollected

    const badDebtRate = totalRevenue > 0 ? (rejectedValue / totalRevenue) * 100 : 0
    const collectionRate = totalRevenue > 0 ? (totalCollected / totalRevenue) * 100 : 0

    return {
      success: true,
      data: {
        totalRevenue,
        totalCollected,
        totalOutstanding,
        rejectedValue,
        badDebtRate,
        collectionRate,
        episodeCount: authData.length
      }
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getBadDebtRiskReport() {
  try {
    const authData = await prisma.ingestedData.findMany({
      where: { type: 'AUTH' },
      select: { data: true, loadedAt: true }
    })

    const riskItems = calculateBadDebtRisk(authData)

    const totalAtRisk = riskItems
      .filter(r => r.riskLevel === "high" || r.riskLevel === "critical")
      .reduce((sum, r) => sum + r.amount, 0)
    const criticalCount = riskItems.filter(r => r.riskLevel === "critical").length

    return {
      success: true,
      data: {
        items: riskItems.slice(0, 50),
        summary: {
          totalAtRisk,
          criticalCount,
          highCount: riskItems.filter(r => r.riskLevel === "high").length,
          total: riskItems.length
        }
      }
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getSchemeProfitability() {
  try {
    const authData = await prisma.ingestedData.findMany({
      where: { type: 'AUTH' },
      select: { data: true }
    })

    const schemes = getSchemeBreakdown(authData)

    return { success: true, data: schemes }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getRevenueLeakage() {
  try {
    const dqcRecords = await prisma.admissionCheck.findMany({
      select: {
        admNo: true,
        patientName: true,
        ptype: true,
        date: true,
        issueCat: true
      }
    })

    const authData = await prisma.ingestedData.findMany({
      where: { type: 'AUTH' },
      select: { data: true, episodeNo: true }
    })

    const authedEpisodes = new Set(
      authData.map(a => (a.episodeNo || "").trim().toUpperCase()).filter(Boolean)
    )

    const leakage = dqcRecords
      .filter(r => !authedEpisodes.has(r.admNo.trim().toUpperCase()))
      .map(r => ({
        admNo: r.admNo,
        patientName: r.patientName,
        ptype: r.ptype,
        admissionDate: r.date.toISOString().split('T')[0],
        hasAuth: false,
        estimatedValue: r.ptype === "CASH" ? 2500 : 15000,
        leakCategory: r.ptype === "CASH" ? "Unreceipted Cash" : "Missing Authorization"
      }))

    const totalLeakage = leakage.reduce((sum, l) => sum + l.estimatedValue, 0)

    return {
      success: true,
      data: {
        items: leakage,
        summary: { count: leakage.length, totalEstimated: totalLeakage }
      }
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getCashFlowData() {
  try {
    const authData = await prisma.ingestedData.findMany({
      where: { type: 'AUTH' },
      select: { data: true, loadedAt: true }
    })

    const dailyCollections: Record<string, number> = {}
    authData.forEach(record => {
      const data = record.data as any
      const paid = parseFloat(String(data.Paid || data.Collected || 0).replace(/[$,]/g, ''))
      if (paid > 0) {
        const d = record.loadedAt.toISOString().split('T')[0]
        dailyCollections[d] = (dailyCollections[d] || 0) + paid
      }
    })

    const historical = Object.entries(dailyCollections)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date))

    const forecast = getCashFlowForecast(historical, 30)

    return { success: true, data: forecast }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
