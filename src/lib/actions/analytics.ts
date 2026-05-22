"use server"

import prisma from "@/lib/prisma"
import { unstable_cache } from "next/cache"

export const getKPIMetrics = unstable_cache(
  async () => {
    try {
      // Parallelize all data fetching for performance
      const [peerAudits, auditCount, issueCount, recentAudits] = await Promise.all([
        prisma.peerAudit.findMany({
          where: { status: "Validated" },
          select: { score: true }
        }),
        prisma.admissionCheck.count(),
        prisma.issue.count({
          where: { status: "Open" }
        }),
        prisma.admissionCheck.findMany({
          take: 20,
          orderBy: { createdAt: 'desc' },
          select: { issueCat: true }
        })
      ])

      // 1. Calculate Station Precision (Average of all validated Peer Audits)
      const avgPrecision = peerAudits.length > 0
        ? peerAudits.reduce((acc, a) => acc + (a.score || 0), 0) / peerAudits.length
        : 98.2 // Fallback to baseline if no audits yet

      // 4. Shift Risk Index (Calculated from recent error density)
      const failureRate = recentAudits.length > 0
        ? recentAudits.filter(a => a.issueCat).length / recentAudits.length
        : 0

      const riskIndex = failureRate > 0.3 ? "High" : failureRate > 0.1 ? "Medium" : "Low"

      return {
        success: true,
        data: {
          precision: avgPrecision.toFixed(1) + "%",
          volume: auditCount,
          flags: issueCount,
          risk: riskIndex,
          precisionTrend: "+1.2%", // Mock trend for now
          volumeTrend: "+5%",
          flagsTrend: "-2"
        }
      }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },
  ["kpi-metrics"],
  { revalidate: 300, tags: ["analytics"] }
)

export async function getShiftHeatmapData() {
  const audits = await prisma.admissionCheck.findMany({
    select: {
      date: true,
      shift: true,
      issueCat: true
    }
  })

  const heatmap: Record<string, number> = {}
  const shifts = ["MORNING", "AFTERNOON", "NIGHT"]
  
  for (let day = 0; day < 7; day++) {
    for (const shift of shifts) {
      heatmap[`${day}-${shift}`] = 0
    }
  }

  audits.forEach(audit => {
    if (audit.issueCat) {
      const day = new Date(audit.date).getDay()
      const key = `${day}-${audit.shift}`
      heatmap[key] = (heatmap[key] || 0) + 1
    }
  })

  return { success: true, data: heatmap }
}

export async function getVolumeErrorCorrelation() {
  // 1. Get total admissions from IngestedData (Throughput)
  const throughputData = await prisma.ingestedData.findMany({
    where: { type: 'THROUGHPUT' },
    select: { loadedAt: true }
  })

  // 2. Get error counts from AdmissionCheck
  const audits = await prisma.admissionCheck.findMany({
    select: { date: true, issueCat: true }
  })

  const dailyStats: Record<string, { total: number, errors: number }> = {}

  // Process Throughput (Total Volume)
  throughputData.forEach(item => {
    const d = item.loadedAt.toISOString().split('T')[0]
    if (!dailyStats[d]) dailyStats[d] = { total: 0, errors: 0 }
    dailyStats[d].total++
  })

  // Process Audits (Error Volume)
  audits.forEach(a => {
    const d = a.date.toISOString().split('T')[0]
    if (!dailyStats[d]) dailyStats[d] = { total: 0, errors: 0 }
    // If no throughput record for this date, count audit as part of total too
    if (dailyStats[d].total === 0) dailyStats[d].total++ 
    if (a.issueCat) dailyStats[d].errors++
  })

  const chartData = Object.entries(dailyStats).map(([date, stats]) => ({
    date,
    ...stats
  })).sort((a,b) => a.date.localeCompare(b.date))

  return { success: true, data: chartData }
}
