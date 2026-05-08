import { prisma } from "@/lib/prisma";
import ClientListClient from "./ClientListClient";

// Revalidate on every request or use dynamic rendering
export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { projects: true, invoices: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Clients</h1>
          <p className="text-muted-foreground mt-1">Manage your clients and onboarding pipeline</p>
        </div>
      </header>

      <ClientListClient initialClients={clients} />
    </div>
  );
}
