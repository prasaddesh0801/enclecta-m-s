import { prisma } from "@/lib/prisma";
import CreateInvoiceForm from "./CreateInvoiceForm";

export const dynamic = "force-dynamic";

export default async function CreateInvoicePage() {
  const clients = await prisma.client.findMany({
    select: { id: true, name: true, companyName: true },
    orderBy: { companyName: "asc" }
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Create Invoice</h1>
        <p className="text-muted-foreground mt-1">Generate a new billing document</p>
      </header>

      <CreateInvoiceForm clients={clients} />
    </div>
  );
}
