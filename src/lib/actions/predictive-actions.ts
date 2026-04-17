"use server"

import prisma from "@/lib/prisma"
import {
  forecastAdmissionVolume,
  predictErrorRate,
  predictSLABreachRisk,
  linearRegression,
} from "@/lib/predictive"

export async function getAdmissionForecast() {
  try {
    // Get daily throughput counts from IngestedData
    const throughputData = await prisma.ingestedData.findMany({
      where: { type: 'THROUGHPUT' },
      select: { loadedAt: true }
    })

    // Group by date
    const dailyCounts: Record<string, number> = {}
    throughputData.forEach(item => {
      const d = item.loadedAt.toISOString().split('T')[0]
      dailyCounts[d] = (dailyCounts[d] || 0) + 1
    })

    // Also include DQC records for volume if no throughput
    if (Object.keys(dailyCounts).length < 5) {
      const dqcRecords = await prisma.admissionCheck.findMany({
        select: { date: true }
      })
      dqcRecords.forEach(r => {
        const d = r.date.toISOString().split('T')[0]
        dailyCounts[d] = (dailyCounts[d] || 0) + 1
      })
    }

    const historicalData = Object.entries(dailyCounts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))

    const forecast = forecastAdmissionVolume(historicalData, 7)

    return { success: true, data: forecast }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getErrorTrendForecast() {
  try {
    const audits = await prisma.admissionCheck.findMany({
      select: { date: true, issueCat: true },
      orderBy: { date: 'asc' }
    })

    // Group by date
    const dailyStats: Record<string, { total: number; errors: number }> = {}
    audits.forEach(a => {
      const d = a.date.toISOString().split('T')[0]
      if (!dailyStats[d]) dailyStats[d] = { total: 0, errors: 0 }
      dailyStats[d].total++
      if (a.issueCat) dailyStats[d].errors++
    })

    const dates = Object.keys(dailyStats).sort()
    const errors = dates.map(d => dailyStats[d].errors)
    const volumes = dates.map(d => dailyStats[d].total)

    const prediction = predictErrorRate(errors, volumes)
    const trend = linearRegression(errors, 7)

    return {
      success: true,
      data: {
        ...prediction,
        trendData: dates.map((d, i) => ({
          date: d,
          errors: errors[i],
          volume: volumes[i],
          rate: volumes[i] > 0 ? (errors[i] / volumes[i]) * 100 : 0
        })),
        regression: trend
      }
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getSLARiskMatrix() {
  try {
    const openIssues = await prisma.issue.findMany({
      where: { status: { in: ["Open", "Pending"] } },
      select: {
        id: true,
        patientName: true,
        admNo: true,
        category: true,
        priority: true,
        deadline: true,
        createdAt: true,
      }
    })

    const riskItems = predictSLABreachRisk(openIssues)

    // Summary stats
    const criticalCount = riskItems.filter(r => r.riskLevel === "critical").length
    const highCount = riskItems.filter(r => r.riskLevel === "high").length
    const avgProbability = riskItems.length > 0
      ? riskItems.reduce((sum, r) => sum + r.breachProbability, 0) / riskItems.length
      : 0

    return {
      success: true,
      data: {
        items: riskItems,
        summary: { criticalCount, highCount, total: riskItems.length, avgProbability }
      }
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getPredictiveSummary() {
  try {
    const [forecast, errorTrend, slaRisk] = await Promise.all([
      getAdmissionForecast(),
      getErrorTrendForecast(),
      getSLARiskMatrix()
    ])

    return {
      success: true,
      data: {
        forecast: forecast.data,
        errorTrend: errorTrend.data,
        slaRisk: slaRisk.data
      }
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
