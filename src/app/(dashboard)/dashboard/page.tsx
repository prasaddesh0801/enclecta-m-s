import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Users, FileText, CheckSquare, CreditCard, Clock, Activity, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  // Database Queries for PRD metrics
  const totalClients = await prisma.client.count();
  const activeClients = await prisma.client.count({ where: { status: "ACTIVE" } });

  const openTasks = await prisma.task.count({ where: { status: { notIn: ["COMPLETED", "CANCELLED"] } } });
  
  const now = new Date();
  const overdueTasks = await prisma.task.count({ 
    where: { 
      status: { notIn: ["COMPLETED", "CANCELLED"] },
      dueDate: { lt: now }
    } 
  });

  const totalInvoicesCount = await prisma.invoice.count();
  const overdueInvoicesCount = await prisma.invoice.count({ where: { status: "OVERDUE" } });

  // Revenue Calcs
  const invoices = await prisma.invoice.findMany({ select: { grandTotal: true } });
  const totalInvoiceAmount = invoices.reduce((acc, curr) => acc + curr.grandTotal, 0);
  
  const payments = await prisma.payment.findMany({ select: { amount: true } });
  const paidAmount = payments.reduce((acc, curr) => acc + curr.amount, 0);
  const pendingAmount = Math.max(0, totalInvoiceAmount - paidAmount);

  // Recent Activities
  let activities = [];
  
  const recentLogs = await prisma.activityLog.findMany({
    take: 5, orderBy: { createdAt: 'desc' }, include: { user: true }
  });

  if (recentLogs.length > 0) {
    activities = recentLogs.map(log => ({
      id: log.id,
      icon: Activity,
      color: 'text-primary',
      text: log.description,
      date: log.createdAt
    }));
  } else {
    // Fallback if logs are empty (for backward compatibility during transition)
    const recentTasks = await prisma.task.findMany({
      take: 3, orderBy: { updatedAt: 'desc' }, include: { assignee: true }
    });
    const recentPayments = await prisma.payment.findMany({
      take: 3, orderBy: { createdAt: 'desc' }, include: { invoice: { include: { client: true } } }
    });

    activities = [
      ...recentTasks.map(t => ({ id: `t-${t.id}`, icon: CheckSquare, color: 'text-blue-500', text: `${t.assignee?.name || 'Someone'} updated task: ${t.title}`, date: t.updatedAt })),
      ...recentPayments.map(p => ({ id: `p-${p.id}`, icon: CreditCard, color: 'text-emerald-500', text: `Payment of ₹${p.amount} received from ${p.invoice.client.companyName}`, date: p.createdAt }))
    ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);
  }

  return (
    <div className="flex flex-col h-full gap-6 pb-2 max-w-7xl mx-auto">
      <header className="flex justify-between items-end shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, {session?.user?.name}</p>
        </div>
      </header>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
        <StatCard title="Total Clients" value={totalClients.toString()} sub={`${activeClients} active`} icon={<Users className="w-4 h-4" />} />
        <StatCard title="Open Tasks" value={openTasks.toString()} sub={`${overdueTasks} overdue`} icon={<CheckSquare className="w-4 h-4" />} alert={overdueTasks > 0} />
        <StatCard title="Total Invoices" value={totalInvoicesCount.toString()} sub={`${overdueInvoicesCount} overdue`} icon={<FileText className="w-4 h-4" />} alert={overdueInvoicesCount > 0} />
        <StatCard title="Pending Amount" value={`₹${pendingAmount.toLocaleString()}`} sub={`₹${paidAmount.toLocaleString()} paid`} icon={<CreditCard className="w-4 h-4" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Revenue Overview Placeholder */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-white/5 flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
            <Activity className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground">Revenue Overview</h3>
          <p className="text-muted-foreground text-sm mt-1 text-center max-w-sm">
            Revenue charting and visual analytics will be activated in the next development phase.
          </p>
        </div>

        {/* Recent Activity Feed */}
        <div className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col">
          <h3 className="text-lg font-medium text-foreground mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-muted-foreground" />
            Recent Activity
          </h3>
          <div className="flex-1 space-y-6">
            {activities.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                No recent activity.
              </div>
            ) : (
              activities.map(activity => (
                <div key={activity.id} className="flex gap-4">
                  <div className={`mt-0.5 ${activity.color}`}>
                    <activity.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground leading-snug">{activity.text}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {activity.date.toLocaleDateString()} at {activity.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, sub, icon, alert = false }: { title: string, value: string, sub: string, icon: React.ReactNode, alert?: boolean }) {
  return (
    <div className="glass-card p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className="text-muted-foreground bg-white/5 p-1.5 rounded-lg">
          {icon}
        </div>
      </div>
      <p className="text-2xl md:text-3xl font-bold text-foreground">{value}</p>
      <div className={`mt-2 text-xs font-medium inline-flex items-center gap-1.5 ${alert ? 'text-destructive' : 'text-muted-foreground'}`}>
        {alert && <AlertCircle className="w-3 h-3" />}
        {sub}
      </div>
    </div>
  );
}
