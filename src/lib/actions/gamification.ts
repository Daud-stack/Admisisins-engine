"use server"

import prisma from "@/lib/prisma"

export async function getClerkRankings() {
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
    let totalScore = 0;
    let peerAuditsCount = 0;

    for (let i = 0; i < user.checks.length; i++) {
      const audits = user.checks[i].peerAudits;
      const len = audits.length;
      peerAuditsCount += len;
      for (let j = 0; j < len; j++) {
        totalScore += audits[j].score || 0;
      }
    }

    const avgPrecision = peerAuditsCount > 0 ? totalScore / peerAuditsCount : 100

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
}

export async function checkAndUnlockAchievements(userId: string) {
  // Logic to check if user deserves a badge
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { checks: { include: { peerAudits: true } }, achievements: true }
  })

  if (!user) return

  const auditCount = user.checks.length

  let perfectAudits = 0;
  for (let i = 0; i < user.checks.length; i++) {
    const audits = user.checks[i].peerAudits;
    const len = audits.length;
    for (let j = 0; j < len; j++) {
      if (audits[j].score === 100) {
        perfectAudits++;
      }
    }
  }

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
}
