import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Users, CheckSquare, FileText, Settings, LogOut, CreditCard, FolderOpen } from "lucide-react";
import NotificationsBell from "@/components/NotificationsBell";
import { prisma } from "@/lib/prisma";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id, isRead: false },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="flex h-screen bg-background overflow-hidden print:h-auto print:overflow-visible">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-card/50 backdrop-blur-xl flex flex-col transition-all z-50 print:hidden">
        <div className="p-6 pb-2">
          <h1 className="text-2xl font-bold text-gradient tracking-tight mb-6">Enclekta</h1>
          <div className="flex items-center gap-3 mb-2 px-2">
            <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center font-bold text-primary shrink-0">
              {session.user?.name?.charAt(0) || "U"}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-foreground truncate">{session.user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{session.user?.role}</p>
            </div>
            <div className="ml-auto">
              <NotificationsBell initialNotifications={notifications} />
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto mt-2">
          <NavItem href="/dashboard" icon={<LayoutDashboard className="w-5 h-5" />} label="Dashboard" />
          <NavItem href="/clients" icon={<Users className="w-5 h-5" />} label="Clients" />
          <NavItem href="/projects" icon={<FolderOpen className="w-5 h-5" />} label="Projects" />
          <NavItem href="/tasks" icon={<CheckSquare className="w-5 h-5" />} label="Tasks" />
          <NavItem href="/invoices" icon={<FileText className="w-5 h-5" />} label="Invoices" />
          <NavItem href="/payments" icon={<CreditCard className="w-5 h-5" />} label="Payments" />
        </nav>

        <div className="p-4 border-t border-white/10">
          <Link href="/api/auth/signout" className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Sign Out</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative print:overflow-visible">
        <div className="p-4 md:p-8 h-full print:p-0">
          {children}
        </div>
      </main>
    </div>
  );
}

function NavItem({ href, icon, label }: { href: string, icon: React.ReactNode, label: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all group">
      <span className="group-hover:text-primary transition-colors">{icon}</span>
      <span className="font-medium text-sm">{label}</span>
    </Link>
  );
}
