"use server"

import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function getUsers() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "ADMIN") {
    throw new Error("Admin privileges required")
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      dept: true,
      status: true,
      isSupervisor: true,
      createdAt: true,
      _count: {
        select: { checks: true, issuesFound: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return { success: true, data: users }
}

export async function updateUserRole(userId: string, newRole: string) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "ADMIN") {
    throw new Error("Admin privileges required")
  }

  const validRoles = ["CLERK", "SUPERVISOR", "MANAGER", "ADMIN"]
  if (!validRoles.includes(newRole)) {
    throw new Error("Invalid role")
  }

  // Prevent self-demotion
  if ((session.user as any).id === userId && newRole !== "ADMIN") {
    throw new Error("Cannot demote yourself")
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { 
          role: newRole,
          isSupervisor: ["SUPERVISOR", "MANAGER", "ADMIN"].includes(newRole)
        }
      })

      // Audit trail
      await tx.auditTrail.create({
        data: {
          userId: (session.user as any).id,
          action: "ROLE_CHANGE",
          resource: `user:${userId}`,
          metadata: { newRole }
        }
      })
    })

    revalidatePath("/settings")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function toggleUserStatus(userId: string) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "ADMIN") {
    throw new Error("Admin privileges required")
  }

  // Prevent self-deactivation
  if ((session.user as any).id === userId) {
    throw new Error("Cannot deactivate yourself")
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new Error("User not found")

    const newStatus = user.status === "Active" ? "Inactive" : "Active"

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { status: newStatus }
      })

      await tx.auditTrail.create({
        data: {
          userId: (session.user as any).id,
          action: "STATUS_CHANGE",
          resource: `user:${userId}`,
          metadata: { newStatus }
        }
      })
    })

    revalidatePath("/settings")
    return { success: true, newStatus }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
