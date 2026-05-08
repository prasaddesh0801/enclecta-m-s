import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, {session?.user?.name}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Placeholder cards for analytics */}
        <StatCard title="Total Clients" value="0" trend="+0% from last month" />
        <StatCard title="Active Projects" value="0" trend="0 completed this week" />
        <StatCard title="Pending Tasks" value="0" trend="0 due today" />
        <StatCard title="Outstanding Invoices" value="$0" trend="0 overdue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl h-96 flex flex-col items-center justify-center border border-white/5">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <span className="text-primary text-2xl">📊</span>
          </div>
          <h3 className="text-lg font-medium text-foreground">Revenue Overview</h3>
          <p className="text-muted-foreground text-sm mt-1">Chart will be implemented in Phase 2</p>
        </div>
        <div className="glass-card p-6 rounded-2xl h-96 flex flex-col border border-white/5">
          <h3 className="text-lg font-medium text-foreground mb-4">Recent Activity</h3>
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <p className="text-muted-foreground text-sm">No recent activity found.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, trend }: { title: string, value: string, trend: string }) {
  return (
    <div className="glass-card p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      <p className="text-3xl font-bold text-foreground mt-2">{value}</p>
      <div className="mt-4 text-xs text-primary/80 bg-primary/10 inline-block px-2 py-1 rounded-md">
        {trend}
      </div>
    </div>
  );
}
