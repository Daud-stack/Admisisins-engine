"use server"

import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function getChecksForReview() {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error("Unauthorized")

  // Fetch checks that haven't been peer-audited yet
  const checks = await prisma.admissionCheck.findMany({
    where: {
      peerAudits: { none: {} },
      userId: { not: (session.user as any).id } // Can't review your own work
    },
    include: {
      user: { select: { name: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: 20
  })

  return { success: true, data: checks }
}

export async function submitPeerAudit(checkId: string, status: string, score: number, comments: string) {
  const session = await getServerSession(authOptions)
  if (!session || !(session.user as any).role.includes("SUPERVISOR")) {
    throw new Error("Supervisor privileges required")
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the Peer Audit
      const audit = await tx.peerAudit.create({
        data: {
          checkId,
          supervisorId: (session.user as any).id,
          status,
          score,
          comments
        }
      })

      // 2. Mark the parent check as verified
      await tx.admissionCheck.update({
        where: { id: checkId },
        data: { isVerified: true }
      })

      // 3. Log event
      await tx.systemLog.create({
        data: {
          event: "PEER_AUDIT_COMPLETED",
          userId: (session.user as any).id,
          data: { checkId, score, status }
        }
      })

      return audit
    })

    revalidatePath("/peer-review")
    revalidatePath("/dashboard")
    return { success: true, data: result }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
