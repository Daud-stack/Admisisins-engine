"use server"

import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { getRootCauseSuggestion, calculateSLADeadline } from "@/lib/intelligence"
import { checkAndUnlockAchievements } from "@/lib/actions/gamification"

export async function createDQCRecord(formData: any) {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error("Unauthorized")

  const { 
    date, 
    shift, 
    patientName, 
    admNo, 
    ptype, 
    prenote, 
    medaid, 
    diag, 
    receipt, 
    bio, 
    gop, 
    comment 
  } = formData

  // Calculate Issue Category based on "N" responses
  const issues = []
  if (prenote === "N") issues.push("Prenote")
  if (medaid === "N") issues.push("MedAid")
  if (diag === "N") issues.push("Diagnosis")
  if (receipt === "N") issues.push("Receipt")
  if (bio === "N") issues.push("Biometric")
  if (gop === "N") issues.push("GOP")
  
  const issueCat = issues.join(", ")

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the DQC Record
      const dqc = await tx.admissionCheck.create({
        data: {
          date: new Date(date),
          shift,
          patientName,
          admNo,
          ptype,
          prenote,
          medaid,
          diag,
          receipt,
          bio,
          gop,
          issueCat: issueCat || null,
          comment,
          userId: (session.user as any).id,
        }
      })

      // 2. If there are issues, create a linked Issue in the tracker
      if (issueCat) {
        const rootCause = getRootCauseSuggestion(issues)
        const priority = issues.length > 2 ? 'High' : 'Medium'
        const deadline = calculateSLADeadline(priority)

        await tx.issue.create({
          data: {
            checkId: dqc.id,
            patientName,
            admNo,
            ptype,
            category: issueCat,
            description: `Auto-generated from DQC failure: ${issueCat}`,
            rootCause,
            priority,
            deadline,
            capturedById: (session.user as any).id,
            status: "Open",
          }
        })
      }

      // 3. Log System Event
      await tx.systemLog.create({
        data: {
          event: "AUDIT_CREATED",
          userId: (session.user as any).id,
          shift,
          data: { dqcId: dqc.id, issueCount: issues.length }
        }
      })

      // 5. Check for Achievement Unlocks
      await checkAndUnlockAchievements(session.user.id)

      return dqc
    })

    revalidatePath("/dashboard")
    revalidatePath("/qc")
    revalidatePath("/tracker")
    
    return { success: true, data: result }
  } catch (error: any) {
    console.error("DQC Create Error:", error)
    return { success: false, error: error.message }
  }
}
