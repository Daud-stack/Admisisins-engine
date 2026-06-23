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
  } catch (error: unknown) {
    console.error("Error in issues action:", error)
    return { success: false, error: 'An internal error occurred' }
  }
}

export async function updateIssueStatus(issueId: string, status: string, comment?: string) {
  const session = await getServerSession(authOptions)
  if (!session) return { success: false, error: 'Unauthorized' }


  try {
    const existing = await prisma.issue.findUnique({ where: { id: issueId } })
    if (!existing) {
      return { success: false, error: 'Issue not found' }
    }

    const userRole = (session.user as { role?: string }).role || "CLERK";
    const userId = (session.user as { id?: string }).id;
    const isAuthorizedRole = ["SUPERVISOR", "MANAGER", "ADMIN"].includes(userRole);
    const isOwner = existing.capturedById === userId;
    const isAssignee = existing.responsibleId === userId;

    if (!isAuthorizedRole && !isOwner && !isAssignee) {
      return { success: false, error: 'Unauthorized to update this issue' }
    }

    const data: Record<string, unknown> = { status }
    
    if (status === "Closed") {
      data.dateResolved = new Date()
    }

    if (comment) {
      // For now, we simple append to comments string. 
      // In a real app we might have an IssueComments model.
      const timestamp = new Date().toLocaleString()
      const newComment = `${existing.comments || ""}\n[${timestamp}] ${session.user?.name}: ${comment}`.trim()
      data.comments = newComment
    }


    await prisma.issue.update({
      where: { id: issueId },
      data
    })

    revalidatePath("/tracker")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error: unknown) {
    console.error("Error in issues action:", error)
    return { success: false, error: 'An internal error occurred' }
  }
}
