import { Link } from "react-router-dom";
import { HeartPulse } from "lucide-react";

export function BrandHeader({ right }: { right?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/60 backdrop-blur-xl font-nexora-sans">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link to="/login" className="group flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 glow-ring">
            <HeartPulse className="h-5 w-5 text-primary" />
          </span>
          <h1 className="font-display text-base font-semibold tracking-tight sm:text-lg">
            Nexora <span className="text-muted-foreground">—</span>{" "}
            <span className="text-gradient">Your Healthcare Intelligence</span>
          </h1>
        </Link>
        {right}
      </div>
    </header>
  );
}
