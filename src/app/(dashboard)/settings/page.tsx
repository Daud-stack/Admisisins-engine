import {
  Settings as SettingsIcon,
  User,
  Shield,
  Database,
  Cpu,
  Terminal,
  Moon,
  Users,
  Crown
} from "lucide-react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getUsers } from "@/lib/actions/users"
import UserManagementPanel from "@/components/dashboard/user-management-panel"

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  const userRole = (session?.user as any)?.role || "CLERK"
  const isAdmin = userRole === "ADMIN"

  let users: any[] = []
  if (isAdmin) {
    try {
      const res = await getUsers()
      users = res.data || []
    } catch { /* Non-admin won't see this */ }
  }

  const sections = [
    {
      title: "Station Profile",
      desc: "Local station identity and supervisor credentials",
      icon: User,
      fields: [
        { label: "Station Name", value: "Admissions Primary Command" },
        { label: "Active User", value: session?.user?.name || "Unknown" },
        { label: "Department", value: "Admissions & Revenue" },
        { label: "Role", value: userRole },
      ]
    },
    {
      title: "Intelligence Protocols",
      desc: "Z-Score thresholds and AI feedback loops",
      icon: Cpu,
      fields: [
        { label: "Anomaly Threshold", value: "2.5 σ (Standard Deviations)" },
        { label: "Root Cause Mode", value: "Automated Patterns" },
        { label: "SLA Sensitivity", value: "Clinical Standard (High/Med/Low)" },
        { label: "Forecast Model", value: "Holt Double Exponential (α=0.3, β=0.1)" },
      ]
    },
    {
      title: "Database Hub",
      desc: "PostgreSQL node status and Prisma instance",
      icon: Database,
      fields: [
        { label: "PostgreSQL Version", value: "15.x (Dockerized)" },
        { label: "Prisma Client", value: "v7.7.0" },
        { label: "Connection Pool", value: "8 Active Connections" },
        { label: "Data Dedup", value: "FNV-1a Hash · Snapshot Merge" },
      ]
    }
  ]

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Station Configuration</h1>
          <p className="text-muted-foreground mt-1 font-mono uppercase text-[10px] tracking-widest">Global Settings · System Baseline Protocols</p>
        </div>
        <SettingsIcon className="h-8 w-8 text-primary opacity-20" />
      </div>

      {/* System Config Sections */}
      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.title} className="bg-surface border border-border rounded-3xl p-8 space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 text-primary">
                <section.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{section.title}</h3>
                <p className="text-xs text-muted-foreground">{section.desc}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-border/50">
              {section.fields.map((field) => (
                <div key={field.label} className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{field.label}</p>
                  <p className="text-sm font-semibold text-foreground/80">{field.value}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* User Management (ADMIN only) */}
      {isAdmin && (
        <div className="bg-surface border border-border rounded-3xl p-8 space-y-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-danger/10 border border-danger/20 text-danger">
              <Crown className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">User Management</h3>
              <p className="text-xs text-muted-foreground">Role assignment and access control governance</p>
            </div>
            <span className="ml-auto px-3 py-1 rounded-full text-[10px] font-black bg-danger/10 text-danger border border-danger/20 uppercase">
              Admin Only
            </span>
          </div>

          <div className="pt-6 border-t border-border/50">
            <UserManagementPanel users={users} currentUserId={(session?.user as any)?.id} />
          </div>
        </div>
      )}

      {/* Debug Console */}
      {isAdmin && (
        <div className="bg-gradient-to-br from-primary/5 to-transparent border border-primary/20 rounded-3xl p-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-black/20 text-primary">
              <Terminal className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Debug Console Access</p>
              <p className="text-xs text-muted-foreground">Authorized administrator override only</p>
            </div>
          </div>
          <button className="bg-surface border border-border px-6 py-2 rounded-xl text-xs font-bold hover:bg-white/5 transition-all">
            Open Terminal
          </button>
        </div>
      )}

      <div className="flex items-center justify-center gap-8 pt-10 opacity-30">
        <div className="flex items-center gap-2">
           <Moon className="h-3 w-3" />
           <span className="text-[10px] font-bold uppercase tracking-widest">Dark Mode Active</span>
        </div>
        <div className="flex items-center gap-2">
           <Shield className="h-3 w-3" />
           <span className="text-[10px] font-bold uppercase tracking-widest">Encrypted Stream</span>
        </div>
      </div>
    </div>
  )
}
