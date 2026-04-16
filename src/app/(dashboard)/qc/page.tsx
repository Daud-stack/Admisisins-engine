import DQCForm from "@/components/dashboard/dqc-form"

export default function QCPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Data Quality Control</h1>
        <p className="text-muted-foreground mt-1 font-mono uppercase text-[10px] tracking-widest">Station Protocol · Active Record Entry</p>
      </div>

      <DQCForm />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-60">
        <div className="p-6 bg-surface/30 border border-border rounded-2xl flex gap-4">
          <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            All records are time-stamped and linked to your active session. Failed compliance items will automatically escalate to the Issue Tracker.
          </p>
        </div>
        <div className="p-6 bg-surface/30 border border-border rounded-2xl flex gap-4">
          <div className="h-2 w-2 rounded-full bg-warn mt-1.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Ensure ADM numbers are correctly formatted (AD-XXXX) for successful cross-referencing with HIS Throughput datasets.
          </p>
        </div>
      </div>
    </div>
  )
}
