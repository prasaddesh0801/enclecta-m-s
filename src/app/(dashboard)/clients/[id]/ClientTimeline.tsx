import { Activity } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function ClientTimeline({ clientId }: { clientId: string }) {
  const logs = await prisma.activityLog.findMany({
    where: { entityId: clientId, entityType: "CLIENT" },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  return (
    <div className="glass-card p-6 rounded-2xl border border-white/5 h-full flex flex-col">
      <h2 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5 text-muted-foreground" />
        Client Timeline
      </h2>
      
      <div className="flex-1 overflow-y-auto pr-2">
        {logs.length === 0 ? (
          <p className="text-sm text-muted-foreground italic mt-4">No recent activity found.</p>
        ) : (
          <div className="relative border-l border-white/10 ml-3 space-y-6 py-2">
            {logs.map(log => (
              <div key={log.id} className="relative pl-6">
                <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 bg-primary rounded-full ring-4 ring-[#0a0a0a]"></div>
                <p className="text-sm text-foreground">{log.description}</p>
                <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-semibold">
                  {new Date(log.createdAt).toLocaleDateString()} • {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
