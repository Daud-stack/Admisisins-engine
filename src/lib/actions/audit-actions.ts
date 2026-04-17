"use server"

import prisma from "@/lib/prisma"

export async function getAuditTrail(limit: number = 30) {
  try {
    const logs = await prisma.systemLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' }
    })

    // Resolve user names for each log entry
    const userIds = [...new Set(logs.filter(l => l.userId).map(l => l.userId!))]
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true, role: true }
    })
    const userMap = new Map(users.map(u => [u.id, u]))

    const enriched = logs.map(log => {
      const user = log.userId ? userMap.get(log.userId) : null
      return {
        id: log.id,
        event: log.event,
        shift: log.shift,
        data: log.data as any,
        createdAt: log.createdAt.toISOString(),
        userName: user?.name || "System",
        userRole: user?.role || "SYSTEM",
        userEmail: user?.email || null,
      }
    })

    return { success: true, data: enriched }
  } catch (error: any) {
    return { success: false, error: error.message, data: [] }
  }
}

export async function getSignoffHistory(limit: number = 20) {
  try {
    const signoffs = await prisma.shiftSignoff.findMany({
      take: limit,
      orderBy: { signedAt: 'desc' },
      include: {
        supervisor: { select: { name: true, email: true } },
        _count: { select: { checks: true } }
      }
    })

    const data = signoffs.map(s => ({
      id: s.id,
      date: s.date.toISOString(),
      shift: s.shift,
      signedAt: s.signedAt.toISOString(),
      supervisorName: s.supervisor.name || "Unknown",
      recordCount: s._count.checks,
      dqcCount: s.dqcCount
    }))

    return { success: true, data }
  } catch (error: any) {
    return { success: false, error: error.message, data: [] }
  }
}
