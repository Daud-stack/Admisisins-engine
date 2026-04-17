"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ClipboardCheck,
  AlertCircle,
  BarChart3,
  Upload,
  ShieldCheck,
  Settings,
  LogOut,
  ChevronRight,
  BrainCircuit,
  Landmark,
  Building2,
  Trophy,
  UserCheck
} from "lucide-react"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import { checkPermission, ROLE_HIERARCHY, type UserRole } from "@/lib/rbac"

interface NavItem {
  name: string
  href: string
  icon: any
  section?: string
}

const allNavigation: NavItem[] = [
  // Station Control
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, section: 'Station Control' },
  { name: 'QC Entry', href: '/qc', icon: ClipboardCheck, section: 'Station Control' },
  { name: 'Issue Tracker', href: '/tracker', icon: AlertCircle, section: 'Station Control' },
  { name: 'Intelligence', href: '/analytics', icon: BarChart3, section: 'Station Control' },
  // Command Center
  { name: 'Predictive Intel', href: '/predictive', icon: BrainCircuit, section: 'Command Center' },
  { name: 'Financial Intel', href: '/financial', icon: Landmark, section: 'Command Center' },
  { name: 'Management', href: '/management', icon: Building2, section: 'Command Center' },
  // Operations
  { name: 'Data Ingest', href: '/ingest', icon: Upload, section: 'Operations' },
  { name: 'Sign-offs', href: '/signoffs', icon: ShieldCheck, section: 'Operations' },
  { name: 'Peer Review', href: '/peer-review', icon: UserCheck, section: 'Operations' },
  { name: 'Leaderboard', href: '/leaderboard', icon: Trophy, section: 'Operations' },
]

interface SidebarProps {
  userRole?: string
  userName?: string
}

export default function Sidebar({ userRole = "CLERK", userName = "User" }: SidebarProps) {
  const pathname = usePathname()

  // Filter navigation based on role permissions
  const filteredNav = allNavigation.filter(item =>
    checkPermission(userRole, item.href)
  )

  // Group by section
  const sections: Record<string, NavItem[]> = {}
  filteredNav.forEach(item => {
    const section = item.section || "Other"
    if (!sections[section]) sections[section] = []
    sections[section].push(item)
  })

  const roleInfo = ROLE_HIERARCHY[userRole.toUpperCase() as UserRole] || ROLE_HIERARCHY.CLERK
  const initials = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()

  return (
    <div className="flex h-screen w-64 flex-col bg-surface border-r border-border fixed left-0 top-0 z-50">
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
            <div className="h-4 w-4 rounded-full bg-primary shadow-[0_0_10px_rgba(0,201,167,0.5)]" />
          </div>
          <span className="font-bold text-foreground tracking-tight">Admissions QA Engine</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-4 overflow-y-auto">
        {Object.entries(sections).map(([sectionName, items]) => (
          <div key={sectionName} className="mb-4">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-2 mb-2">
              {sectionName}
            </div>
            {items.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200",
                    isActive
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground border border-transparent"
                  )}
                >
                  <item.icon className={cn(
                    "h-4 w-4 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )} />
                  <span className="flex-1">{item.name}</span>
                  {isActive && <ChevronRight className="h-3 w-3 opacity-50" />}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-border/50 space-y-2">
        {checkPermission(userRole, "/settings") && (
          <Link
            href="/settings"
            className={cn(
              "flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors rounded-lg",
              pathname === "/settings" ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        )}
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-all cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          Disconnect
        </button>
      </div>

      <div className="p-4 bg-background/50 border-t border-border/50">
        <div className="flex items-center gap-3">
          <div className={cn(
            "h-8 w-8 rounded-full border flex items-center justify-center text-[10px] font-bold",
            roleInfo.color, "border-current/20 bg-current/5"
          )}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">{userName}</p>
            <p className={cn("text-[10px] truncate uppercase font-mono", roleInfo.color)}>
              {roleInfo.label}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
