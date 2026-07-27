import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CreditCard, Calendar, FileText } from "lucide-react";
import RecordPaymentModal from "./RecordPaymentModal";
import { formatDate } from "@/lib/date";

export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // Fetch all payments
  const payments = await prisma.payment.findMany({
    include: {
      invoice: {
        include: { client: true }
      }
    },
    orderBy: { paymentDate: "desc" },
  });

  // Fetch unpaid invoices for the modal
  const unpaidInvoices = await prisma.invoice.findMany({
    where: {
      status: { in: ["DRAFT", "SENT", "PARTIALLY_PAID", "OVERDUE"] }
    },
    include: { client: true, payments: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Payments</h1>
          <p className="text-muted-foreground mt-1">Track and record client payments</p>
        </div>
        <RecordPaymentModal invoices={unpaidInvoices} />
      </header>

      <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-black/20 border-b border-white/5">
              <tr>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Invoice</th>
                <th className="px-6 py-4 font-semibold">Client</th>
                <th className="px-6 py-4 font-semibold">Mode</th>
                <th className="px-6 py-4 font-semibold text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    <CreditCard className="w-8 h-8 mx-auto mb-3 opacity-20" />
                    No payments recorded yet.
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {formatDate(payment.paymentDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        <span className="font-medium text-foreground">{payment.invoice.invoiceNo}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-foreground">{payment.invoice.client.companyName}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-start gap-1">
                        <span className="px-2.5 py-1 text-xs font-medium rounded-full border border-white/10 bg-white/5 text-muted-foreground">
                          {payment.paymentMode.replace('_', ' ')}
                        </span>
                        {payment.transactionId && (
                          <span className="text-[10px] text-muted-foreground/70 font-mono" title="Transaction ID">
                            {payment.transactionId}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-emerald-400">
                      ₹{payment.amount.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
