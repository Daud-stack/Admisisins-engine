"use server"

import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function getPendingSignoffs() {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error("Unauthorized")

  // Group DQC records by Date and Shift that don't have a signoffId
  const pending = await prisma.admissionCheck.groupBy({
    by: ['date', 'shift'],
    where: { signoffId: null },
    _count: { id: true },
  })

  return { success: true, data: pending }
}

export async function performSignoff(date: string, shift: string) {
  const session = await getServerSession(authOptions)
  if (!session || !(session.user as any).role.includes("SUPERVISOR")) {
    throw new Error("Supervisor privileges required")
  }

  try {
    const targetDate = new Date(date)
    
    const result = await prisma.$transaction(async (tx) => {
      // 1. Get the count of records to be signed
      const dqcCount = await tx.admissionCheck.count({
        where: { date: targetDate, shift, signoffId: null }
      })

      if (dqcCount === 0) throw new Error("No pending records for this shift")

      // 2. Create the Signoff record
      const signoff = await tx.shiftSignoff.create({
        data: {
          date: targetDate,
          shift,
          supervisorId: (session.user as any).id,
          dqcCount
        }
      })

      // 3. Link records to signoff (Locking them)
      await tx.admissionCheck.updateMany({
        where: { date: targetDate, shift, signoffId: null },
        data: { signoffId: signoff.id }
      })

      return signoff
    })

    revalidatePath("/signoffs")
    revalidatePath("/dashboard")
    return { success: true, data: result }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
