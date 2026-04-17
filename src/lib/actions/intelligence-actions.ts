"use server"

import prisma from "@/lib/prisma"
import { detectAuditAnomalies, forecastTrend, detectDriftPattern } from "@/lib/intelligence"

export async function getIntelligentFlags() {
  try {
    const flags: any[] = []

    // 1. Fetch SLA Breaches (High priority issues past deadline)
    const now = new Date()
    const slaBreaches = await prisma.issue.findMany({
      where: {
        status: "Open",
        priority: "High",
        deadline: { lt: now }
      },
      take: 3,
      orderBy: { deadline: 'asc' }
    })

    slaBreaches.forEach(issue => {
      flags.push({
        id: `sla-${issue.id}`,
        type: 'breach',
        severity: 'high',
        title: 'SLA Protocol Breach',
        description: `Critical delay in resolving incident for ${issue.patientName} (${issue.admNo}).`,
        category: issue.category
      })
    })

    // 2. Fetch Statistical Anomalies (Using Z-Score on last 14 days of throughput)
    const twoWeeksAgo = new Date()
    twoWeeksAgo.setDate(now.getDate() - 14)

    const fourWeeksAgo = new Date()
    fourWeeksAgo.setDate(now.getDate() - 28)

    const throughputData = await prisma.ingestedData.findMany({
      where: {
        type: 'THROUGHPUT',
        loadedAt: { gte: fourWeeksAgo }
      },
      select: { loadedAt: true }
    })

    // Group by date to get daily counts
    const dailyCounts: Record<string, number> = {}
    throughputData.forEach(item => {
      const d = item.loadedAt.toISOString().split('T')[0]
      dailyCounts[d] = (dailyCounts[d] || 0) + 1
    })

    const allDates = Object.keys(dailyCounts).sort()
    const allCounts = allDates.map(d => dailyCounts[d])

    // Split into current week (last 7 days) vs baseline (prior period)
    const recentDates = allDates.filter(d => new Date(d) >= twoWeeksAgo)
    const baselineDates = allDates.filter(d => new Date(d) < twoWeeksAgo)
    const recentCounts = recentDates.map(d => dailyCounts[d])
    const baselineCounts = baselineDates.map(d => dailyCounts[d])

    // 2a. Z-Score Anomalies
    const anomalies = detectAuditAnomalies(recentCounts, recentDates)
    anomalies.slice(0, 2).forEach(a => {
      flags.push({
        ...a,
        id: `anomaly-${a.id}`,
        category: 'STATISTICAL'
      })
    })

    // 3. Predictive Forecast Flag
    if (allCounts.length >= 5) {
      const forecast = forecastTrend(allCounts, 7)
      
      if (forecast.direction === 'rising') {
        const peakDay = forecast.predictions.indexOf(Math.max(...forecast.predictions)) + 1
        flags.push({
          id: 'forecast-rising',
          type: 'trend',
          severity: forecast.slope > 2 ? 'high' : 'medium',
          title: 'Volume Spike Predicted',
          description: `Linear regression projects a rising trend over the next 7 days. Peak expected in ~${peakDay} day(s). Slope: ${forecast.slope.toFixed(2)}/day.`,
          category: 'PREDICTIVE'
        })
      } else if (forecast.direction === 'falling') {
        flags.push({
          id: 'forecast-falling',
          type: 'trend',
          severity: 'low',
          title: 'Volume Decline Projected',
          description: `Audit volumes are trending downward. Projected slope: ${forecast.slope.toFixed(2)}/day over the next 7 days.`,
          category: 'PREDICTIVE'
        })
      }
    }

    // 4. Process Drift Detection
    const driftInsight = detectDriftPattern(recentCounts, baselineCounts)
    if (driftInsight) {
      flags.push({
        ...driftInsight,
        id: `drift-${driftInsight.id}`,
        category: 'DRIFT'
      })
    }

    // 5. Fallback to general open issues if list is short
    if (flags.length < 5) {
      const remainingIssues = await prisma.issue.findMany({
        where: { status: "Open" },
        take: 5 - flags.length,
        orderBy: { createdAt: 'desc' }
      })
      
      remainingIssues.forEach(issue => {
        if (!flags.find(f => f.id.includes(issue.id))) {
          flags.push({
            id: `issue-${issue.id}`,
            type: 'standard',
            severity: issue.priority.toLowerCase() as any,
            title: 'Audit Incident Flagged',
            description: `Active clinical gap: ${issue.rootCause || "Analyzing..."}`,
            patientName: issue.patientName,
            category: issue.category
          })
        }
      })
    }

    return { success: true, data: flags }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
