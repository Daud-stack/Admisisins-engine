import LoginForm from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4 flex-col gap-8">
      {/* Decorative radial gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--border)_1px,_transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none opacity-20"></div>
      
      <div className="relative z-10">
        <LoginForm />
      </div>
      
      <footer className="relative z-10 text-[10px] text-muted font-mono uppercase tracking-tighter opacity-40">
        Admissions QA Engine v1.0.0-Next
      </footer>
    </main>
  )
}
