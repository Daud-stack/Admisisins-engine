"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function getIssues() {
  try {
    const issues = await prisma.issue.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        capturedBy: { select: { name: true } },
        responsible: { select: { name: true } },
      }
    })
    return { success: true, data: issues }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateIssueStatus(issueId: string, status: string, comment?: string) {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error("Unauthorized")

  try {
    const data: any = { status }
    
    if (status === "Closed") {
      data.dateResolved = new Date()
    }

    if (comment) {
      // For now, we simple append to comments string. 
      // In a real app we might have an IssueComments model.
      const existing = await prisma.issue.findUnique({ where: { id: issueId } })
      const timestamp = new Date().toLocaleString()
      const newComment = `${existing?.comments || ""}\n[${timestamp}] ${session.user?.name}: ${comment}`.trim()
      data.comments = newComment
    }

    await prisma.issue.update({
      where: { id: issueId },
      data
    })

    revalidatePath("/tracker")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
