import Sidebar from "@/components/layout/sidebar"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="pl-64 flex flex-col min-h-screen">
        <header className="h-16 border-b border-border bg-surface/50 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-semibold text-muted-foreground font-mono uppercase tracking-widest">
              Active Session: {session.user?.name}
            </h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase">System Uplink Active</span>
          </div>
        </header>
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
