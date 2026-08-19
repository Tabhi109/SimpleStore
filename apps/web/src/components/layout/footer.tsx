export function Footer() {
  return (
    <footer className="w-full border-t border-border/40 py-8 text-center text-xs text-muted-foreground bg-background">
      <div className="container max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-left">
          <strong>SimpleStore</strong> — Your store. Without the complexity.
          <br />
          Built with Next.js 14, FastAPI, PostgreSQL, Redis, and Sarvam AI.
        </p>
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            System Operational
          </span>
        </div>
      </div>
    </footer>
  );
}
