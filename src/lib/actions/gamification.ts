"use server"

import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function getClerkRankings() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    const users = await prisma.user.findMany({
      where: { role: "CLERK" },
      include: {
        checks: {
          include: { peerAudits: true }
        },
        achievements: true
      }
    })

    const rankings = users.map(user => {
      // Calculate Average Precision
      const peerAudits = user.checks.flatMap(c => c.peerAudits)
      const totalScore = peerAudits.reduce((sum, a) => sum + (a.score || 0), 0)
      const avgPrecision = peerAudits.length > 0 ? totalScore / peerAudits.length : 100

      // Efficiency Factor (Audits per day)
      const auditCount = user.checks.length

      return {
        id: user.id,
        name: user.name,
        avgPrecision,
        auditCount,
        achievements: user.achievements,
        totalPoints: (avgPrecision * 10) + (auditCount * 5)
      }
    })

    return {
      success: true,
      data: rankings.sort((a,b) => b.totalPoints - a.totalPoints)
    }
  } catch (error) {
    console.error("Error in getClerkRankings:", error)
    return { success: false, error: "An internal error occurred" }
  }
}

export async function checkAndUnlockAchievements(userId: string) {
  const session = await getServerSession(authOptions)
  if (!session) return

  try {
    // Logic to check if user deserves a badge
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { checks: { include: { peerAudits: true } }, achievements: true }
    })

    if (!user) return

    const auditCount = user.checks.length
    const peerAudits = user.checks.flatMap(c => c.peerAudits)
    const perfectAudits = peerAudits.filter(a => a.score === 100).length

    const currentBadges = new Set(user.achievements.map(a => a.type))

    // Badge 1: Accuracy Master (5 perfect audits)
    if (perfectAudits >= 5 && !currentBadges.has("AccuracyMaster")) {
      await prisma.achievement.create({
        data: { userId, type: "AccuracyMaster", level: 1 }
      })
    }

    // Badge 2: Volume King (50 audits)
    if (auditCount >= 50 && !currentBadges.has("VolumeKing")) {
      await prisma.achievement.create({
        data: { userId, type: "VolumeKing", level: 1 }
      })
    }
  } catch (error) {
    console.error("Error in checkAndUnlockAchievements:", error)
    // No return since it's a void function logically in its usage, but catching avoids crashing the caller
  }
}
