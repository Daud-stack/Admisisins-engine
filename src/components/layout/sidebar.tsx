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
  ChevronRight
} from "lucide-react"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'QC Entry', href: '/qc', icon: ClipboardCheck },
  { name: 'Issue Tracker', href: '/tracker', icon: AlertCircle },
  { name: 'Intelligence', href: '/analytics', icon: BarChart3 },
  { name: 'Data Ingest', href: '/ingest', icon: Upload },
  { name: 'Sign-offs', href: '/signoffs', icon: ShieldCheck },
]

export default function Sidebar() {
  const pathname = usePathname()

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

      <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
        <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-2 mb-4">
          Station Control
        </div>
        {navigation.map((item) => {
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
      </nav>

      <div className="p-4 border-t border-border/50 space-y-2">
        <Link 
          href="/settings"
          className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
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
          <div className="h-8 w-8 rounded-full bg-surface-2 border border-border flex items-center justify-center text-[10px] font-bold">
            AD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">Admin Station</p>
            <p className="text-[10px] text-muted-foreground truncate uppercase font-mono">Supervisor Mode</p>
          </div>
        </div>
      </div>
    </div>
  )
}
