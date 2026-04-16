"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createActionPlan(issueId: string, description: string, type: string) {
  try {
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
    return { success: false, error: error.message }
  }
}

export async function completeActionPlan(planId: string) {
  try {
    await prisma.actionPlan.update({
      where: { id: planId },
      data: { status: "Completed" }
    })
    revalidatePath("/tracker")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
