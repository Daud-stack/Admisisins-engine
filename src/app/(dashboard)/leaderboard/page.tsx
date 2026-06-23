import { getClerkRankings } from "@/lib/actions/gamification"
import { 
  Trophy, 
  Target, 
  Zap, 
  Award, 
  TrendingUp, 
  Medal,
  Star,
  Users
} from "lucide-react"
import { cn } from "@/lib/utils"

export const dynamic = 'force-dynamic'

export default async function LeaderboardPage() {
  const response = await getClerkRankings()
  const rankings = response.success ? response.data || [] : []

  const getBadgeIcon = (type: string) => {
    switch (type) {
      case 'AccuracyMaster': return <Target className="h-3 w-3 text-primary" />
      case 'VolumeKing': return <Zap className="h-3 w-3 text-warn" />
      default: return <Award className="h-3 w-3 text-muted-foreground" />
    }
  }

  if (!response.success && response.error === 'Unauthorized') {
    return (
      <div className="max-w-6xl mx-auto py-8 text-center text-red-500">
        You must be logged in to view the leaderboard.
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-10 animate-in fade-in duration-700">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Performance Command</h1>
          <p className="text-muted-foreground mt-1 font-mono uppercase text-[10px] tracking-widest">Global Clerk Rankings · Clinical Precision Index</p>
        </div>
        <Trophy className="h-8 w-8 text-warn opacity-20" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Top 3 Spotlight */}
        <div className="lg:col-span-1 space-y-6">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Medal className="h-5 w-5 text-primary" /> Station Elite
          </h3>
          <div className="space-y-4">
            {rankings.slice(0, 3).map((clerk: any, idx: number) => (
              <div key={clerk.id} className={cn(
                "p-6 rounded-3xl border relative overflow-hidden group transition-all",
                idx === 0 ? "bg-primary/10 border-primary/30" : "bg-surface border-border"
              )}>
                {idx === 0 && <Star className="absolute -right-2 -top-2 h-12 w-12 text-primary opacity-10" />}
                <div className="flex items-center gap-4 mb-4">
                  <div className={cn(
                    "h-12 w-12 rounded-2xl flex items-center justify-center font-bold text-lg border",
                    idx === 0 ? "bg-primary text-primary-foreground border-primary" : "bg-surface-2 border-border text-muted-foreground"
                  )}>
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-bold text-foreground line-clamp-1">{clerk.name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-mono tracking-widest">Lvl {Math.floor(clerk.totalPoints / 100) + 1} Operative</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
                  <div>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase">Precision</p>
                    <p className="text-lg font-bold text-foreground">{clerk.avgPrecision.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase">Points</p>
                    <p className="text-lg font-bold text-primary">{Math.floor(clerk.totalPoints)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Global Standings Table */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" /> Global Standings
            </h3>
            <span className="text-[10px] font-bold text-muted-foreground uppercase bg-surface px-3 py-1 rounded-full border border-border">
              {rankings.length} Active Operatives
            </span>
          </div>
          
          <div className="bg-surface border border-border rounded-3xl overflow-hidden shadow-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-2/50 border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  <th className="px-8 py-5">Rank & operative</th>
                  <th className="px-8 py-5 text-center">Workload</th>
                  <th className="px-8 py-5 text-center">Precision Score</th>
                  <th className="px-8 py-5">Badges Earned</th>
                  <th className="px-8 py-5 text-right">Intel Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {rankings.map((clerk: any, idx: number) => (
                  <tr key={clerk.id} className="hover:bg-white/2 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-mono text-muted-foreground">#{idx + 1}</span>
                        <span className="text-sm font-bold text-foreground">{clerk.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-mono">{clerk.auditCount}</span>
                        <span className="text-[8px] font-bold text-muted-foreground uppercase">Audits</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background border border-border">
                        <div className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          clerk.avgPrecision > 95 ? "bg-success shadow-[0_0_8px_rgba(34,197,94,0.5)]" : 
                          clerk.avgPrecision > 85 ? "bg-primary shadow-[0_0_8px_rgba(0,201,167,0.5)]" : "bg-warn"
                        )} />
                        <span className="text-[10px] font-bold">{clerk.avgPrecision.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex gap-2">
                        {clerk.achievements.map((a: any) => (
                          <div key={a.id} className="p-1.5 rounded-lg bg-background border border-border hover:border-primary/30 transition-colors" title={a.type}>
                            {getBadgeIcon(a.type)}
                          </div>
                        ))}
                        {clerk.achievements.length === 0 && <span className="text-[10px] text-muted-foreground italic tracking-widest uppercase">No Badges</span>}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <span className="text-sm font-black text-primary font-mono tracking-tighter">
                        {Math.floor(clerk.totalPoints).toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
