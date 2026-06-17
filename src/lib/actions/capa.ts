"use server"

import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function createActionPlan(issueId: string, description: string, type: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return { success: false, error: "Unauthorized" }
    }

    const result = await prisma.actionPlan.create({
      data: {
        issueId,
        description,
        type,
        status: "Pending"
      }
    })

    revalidatePath("/tracker")
    return { success: true, data: result }
  } catch (error: any) {
    console.error("Error creating action plan:", error)
    return { success: false, error: "An internal error occurred" }
  }
}

export async function completeActionPlan(planId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return { success: false, error: "Unauthorized" }
    }

    await prisma.actionPlan.update({
      where: { id: planId },
      data: { status: "Completed" }
    })
    revalidatePath("/tracker")
    return { success: true }
  } catch (error: any) {
    console.error("Error completing action plan:", error)
    return { success: false, error: "An internal error occurred" }
  }
}
