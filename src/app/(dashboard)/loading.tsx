export default function DashboardLoading() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh]">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing ring */}
        <div className="absolute w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
        {/* Inner pulsing circle */}
        <div className="w-8 h-8 rounded-full bg-primary/40 animate-pulse shadow-[0_0_20px_-2px_rgba(99,102,241,0.6)]"></div>
      </div>
      <p className="mt-6 text-sm font-medium text-muted-foreground animate-pulse tracking-wide uppercase">
        Loading...
      </p>
    </div>
  );
}
