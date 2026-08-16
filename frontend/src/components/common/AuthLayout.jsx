import { AmbientBackground } from "../nexora/AmbientBackground";
import { BrandHeader } from "../nexora/BrandHeader";

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen font-nexora-sans">
      <AmbientBackground />
      <BrandHeader />

      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-73px)] max-w-md items-center px-4 py-12 sm:px-6">
        <div className="glass-panel w-full rounded-3xl p-7 sm:p-9 animate-fade-in">{children}</div>
      </main>
    </div>
  );
}
