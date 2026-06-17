"use server"

import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function getManagementKPIs() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    throw new Error("Admin privileges required")
  }

  try {
    const [
      totalAdmissions,
      totalIssues,
      openIssues,
      totalUsers,
      totalSignoffs,
      checksWithIssues
    ] = await Promise.all([
      prisma.admissionCheck.count(),
      prisma.issue.count(),
      prisma.issue.count({ where: { status: "Open" } }),
      prisma.user.count({ where: { status: "Active" } }),
      prisma.shiftSignoff.count(),
      prisma.admissionCheck.count({ where: { issueCat: { not: null } } })
    ])

    const complianceRate = totalAdmissions > 0
      ? ((totalAdmissions - checksWithIssues) / totalAdmissions) * 100
      : 100

    // Revenue from auth data
    const authData = await prisma.ingestedData.findMany({
      where: { type: 'AUTH' },
      select: { data: true }
    })

    let totalRevenue = 0
    authData.forEach(r => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const d = r.data as any
      totalRevenue += parseFloat(String(d.Amount || d.Total || 0).replace(/[$,]/g, ''))
    })

    // SLA Health: % of issues resolved before deadline
    const resolvedIssues = await prisma.issue.findMany({
      where: { status: "Closed", deadline: { not: null }, dateResolved: { not: null } },
      select: { deadline: true, dateResolved: true }
    })

    const onTimeCount = resolvedIssues.filter(i =>
      i.dateResolved && i.deadline && i.dateResolved <= i.deadline
    ).length
    const slaHealth = resolvedIssues.length > 0
      ? (onTimeCount / resolvedIssues.length) * 100
      : 100

    return {
      success: true,
      data: {
        totalAdmissions,
        complianceRate: Math.round(complianceRate * 10) / 10,
        totalRevenue,
        openIssues,
        totalIssues,
        activeStaff: totalUsers,
        totalSignoffs,
        slaHealth: Math.round(slaHealth * 10) / 10,
      }
    }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getStaffPerformanceSummary() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    throw new Error("Admin privileges required")
  }

  try {
    const users = await prisma.user.findMany({
      where: { role: "CLERK", status: "Active" },
      include: {
        checks: {
          select: { issueCat: true, createdAt: true }
        },
        peerAudits: {
          select: { score: true }
        }
      }
    })

    const summary = users.map(user => {
      const totalAudits = user.checks.length
      const issueAudits = user.checks.filter(c => c.issueCat).length
      const precisionRate = totalAudits > 0
        ? ((totalAudits - issueAudits) / totalAudits) * 100
        : 100

      const peerScores = user.peerAudits.map(a => a.score || 0)
      const avgPeerScore = peerScores.length > 0
        ? peerScores.reduce((a, b) => a + b, 0) / peerScores.length
        : 0

      return {
        id: user.id,
        name: user.name,
        dept: user.dept,
        totalAudits,
        issueAudits,
        precisionRate: Math.round(precisionRate * 10) / 10,
        avgPeerScore: Math.round(avgPeerScore * 10) / 10,
        status: precisionRate >= 95 ? "Excellent" : precisionRate >= 85 ? "Good" : "Needs Improvement"
      }
    }).sort((a, b) => b.precisionRate - a.precisionRate)

    return { success: true, data: summary }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getOperationalTimeline() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    throw new Error("Admin privileges required")
  }

  try {
    const events = await prisma.systemLog.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        event: true,
        userId: true,
        shift: true,
        data: true,
        createdAt: true
      }
    })

    return { success: true, data: events }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getIngestionHistory() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    throw new Error("Admin privileges required")
  }

  try {
    const history = await prisma.fileIngestion.findMany({
      orderBy: { uploadedAt: 'desc' },
      take: 20
    })

    return { success: true, data: history }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
