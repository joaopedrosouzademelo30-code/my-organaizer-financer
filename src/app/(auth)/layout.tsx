import { AuthBackground } from "./AuthBackground";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen w-full bg-black overflow-hidden flex items-center justify-center p-4">
      <AuthBackground />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 pointer-events-none mix-blend-overlay"></div>
      
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/5 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/10 p-8 md:p-10 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  )
}
