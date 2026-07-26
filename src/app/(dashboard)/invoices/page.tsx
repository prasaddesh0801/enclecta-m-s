import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Search, FileText, Download, MoreVertical } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function InvoicesPage() {
  const invoices = await prisma.invoice.findMany({
    include: {
      client: { select: { name: true, companyName: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT": return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      case "SENT": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "PARTIALLY_PAID": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "PAID": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "OVERDUE": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "CANCELLED": return "bg-gray-800/50 text-gray-500 border-gray-700";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Invoices</h1>
          <p className="text-muted-foreground mt-1">Manage billing and track payments</p>
        </div>
        <Link 
          href="/invoices/create"
          className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)]"
        >
          <Plus className="w-5 h-5" />
          Create Invoice
        </Link>
      </header>

      <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search by invoice # or client..." 
              className="w-full pl-10 pr-4 py-2.5 bg-black/20 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-black/20 text-muted-foreground text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Invoice #</th>
                <th className="px-6 py-4 font-medium">Client</th>
                <th className="px-6 py-4 font-medium">Date / Due</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {invoices.length > 0 ? invoices.map(invoice => (
                <tr key={invoice.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 font-medium text-foreground">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      {invoice.invoiceNo}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">{invoice.client.companyName}</div>
                    <div className="text-xs text-muted-foreground">{invoice.client.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-foreground">{new Date(invoice.createdAt).toLocaleDateString()}</div>
                    <div className="text-xs text-muted-foreground">Due: {new Date(invoice.dueDate).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-foreground">
                    ₹{invoice.grandTotal.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusColor(invoice.status)}`}>
                      {invoice.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/invoices/${invoice.id}`} className="p-2 hover:bg-white/10 rounded-lg text-white hover:text-primary transition-colors">
                        View
                      </Link>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No invoices found. Create one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
