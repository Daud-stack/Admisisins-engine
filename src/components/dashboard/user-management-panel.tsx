"use client"

import { useState, useTransition } from "react"
import { updateUserRole, toggleUserStatus } from "@/lib/actions/users"
import { cn } from "@/lib/utils"
import { Shield, UserX, UserCheck, Loader2 } from "lucide-react"

interface UserData {
  id: string
  name: string | null
  email: string | null
  role: string
  dept: string
  status: string
  isSupervisor: boolean
  createdAt: string
  _count: { checks: number; issuesFound: number }
}

interface UserManagementPanelProps {
  users: UserData[]
  currentUserId: string
}

const ROLES = ["CLERK", "SUPERVISOR", "MANAGER", "ADMIN"]

const ROLE_COLORS: Record<string, string> = {
  CLERK: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  SUPERVISOR: "bg-primary/10 text-primary border-primary/20",
  MANAGER: "bg-warn/10 text-warn border-warn/20",
  ADMIN: "bg-danger/10 text-danger border-danger/20",
}

export default function UserManagementPanel({ users, currentUserId }: UserManagementPanelProps) {
  const [isPending, startTransition] = useTransition()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const handleRoleChange = (userId: string, newRole: string) => {
    startTransition(async () => {
      setMessage(null)
      const res = await updateUserRole(userId, newRole)
      if (res.success) {
        setMessage(`Role updated successfully`)
        setEditingId(null)
      } else {
        setMessage(`Error: ${res.error}`)
      }
    })
  }

  const handleToggleStatus = (userId: string) => {
    startTransition(async () => {
      setMessage(null)
      const res = await toggleUserStatus(userId)
      if (res.success) {
        setMessage(`User status changed to ${res.newStatus}`)
      } else {
        setMessage(`Error: ${res.error}`)
      }
    })
  }

  return (
    <div className="space-y-4">
      {message && (
        <div className={cn(
          "p-3 rounded-xl text-xs font-bold uppercase tracking-tight flex items-center gap-2",
          message.startsWith("Error") ? "bg-danger/10 text-danger" : "bg-success/10 text-success"
        )}>
          <Shield className="h-3 w-3" />
          {message}
        </div>
      )}

      <div className="border border-border rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-2/30 border-b border-border">
              <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">User</th>
              <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center">Audits</th>
              <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center">Issues</th>
              <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Role</th>
              <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center">Status</th>
              <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {users.map((user) => {
              const isSelf = user.id === currentUserId
              return (
                <tr key={user.id} className={cn("transition-colors", isSelf ? "bg-primary/[0.02]" : "hover:bg-white/[0.02]")}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold border",
                        ROLE_COLORS[user.role] || ROLE_COLORS.CLERK
                      )}>
                        {(user.name || "U")[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">
                          {user.name || "Unnamed"}
                          {isSelf && <span className="text-[9px] text-primary ml-2">(You)</span>}
                        </p>
                        <p className="text-[10px] text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center font-mono text-sm">{user._count.checks}</td>
                  <td className="px-6 py-4 text-center font-mono text-sm">{user._count.issuesFound}</td>
                  <td className="px-6 py-4">
                    {editingId === user.id ? (
                      <div className="flex gap-1">
                        {ROLES.map(role => (
                          <button
                            key={role}
                            onClick={() => handleRoleChange(user.id, role)}
                            disabled={isPending}
                            className={cn(
                              "px-2 py-1 rounded-lg text-[9px] font-black border transition-all",
                              user.role === role ? ROLE_COLORS[role] : "bg-background border-border text-muted-foreground hover:border-primary/30"
                            )}
                          >
                            {role}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <span className={cn("px-3 py-1 rounded-full text-[10px] font-black border", ROLE_COLORS[user.role] || ROLE_COLORS.CLERK)}>
                        {user.role}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold",
                      user.status === "Active" ? "bg-success/10 text-success" : "bg-muted/30 text-muted-foreground"
                    )}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {isPending && (editingId === user.id) ? (
                        <Loader2 className="h-4 w-4 text-primary animate-spin" />
                      ) : (
                        <>
                          <button
                            onClick={() => setEditingId(editingId === user.id ? null : user.id)}
                            className="px-3 py-1 text-[10px] font-bold text-primary hover:bg-primary/10 rounded-lg transition-all"
                          >
                            {editingId === user.id ? "Cancel" : "Edit Role"}
                          </button>
                          {!isSelf && (
                            <button
                              onClick={() => handleToggleStatus(user.id)}
                              disabled={isPending}
                              className="p-1.5 rounded-lg hover:bg-danger/10 text-muted-foreground hover:text-danger transition-all"
                              title={user.status === "Active" ? "Deactivate" : "Activate"}
                            >
                              {user.status === "Active" ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
