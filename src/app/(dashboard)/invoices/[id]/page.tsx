import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Printer, Download, CreditCard } from "lucide-react";
import PrintButton from "./PrintButton";
import InvoiceStatusUpdater from "./InvoiceStatusUpdater";

export const dynamic = "force-dynamic";

export default async function InvoiceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      client: true,
      items: true
    }
  });

  if (!invoice) notFound();

  return (
    <div className="space-y-6 max-w-4xl mx-auto print:max-w-none print:mx-0 print:w-full print:space-y-0">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 print:hidden">
        <div className="flex items-center gap-4">
          <Link href="/invoices" className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Invoice {invoice.invoiceNo}</h1>
        </div>
        <div className="flex items-center gap-3">
          <InvoiceStatusUpdater invoiceId={invoice.id} currentStatus={invoice.status} />
          <PrintButton />
          <a 
            href={`/api/invoices/${invoice.id}/pdf`} 
            download 
            className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-xl font-medium transition-colors hover:bg-white/90"
          >
            <Download className="w-4 h-4" />
            PDF
          </a>
        </div>
      </header>

      <div id="invoice-printable-area" className="bg-white rounded-2xl border border-white/10 overflow-hidden text-slate-900 shadow-xl print:shadow-none print:border-none print:m-0 print:p-0">
        <div className="p-10">
          <div className="flex justify-between items-start border-b border-slate-200 pb-8 mb-8">
            <div>
              <h1 className="text-4xl font-extrabold text-indigo-600 tracking-tight">INVOICE</h1>
              <p className="text-slate-500 font-medium mt-1">{invoice.invoiceNo}</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold text-slate-800">Enclekta Inc.</h2>
              <p className="text-slate-500 text-sm mt-1">123 Tech Boulevard<br/>Suite 400<br/>San Francisco, CA 94105</p>
            </div>
          </div>

          <div className="flex justify-between mb-12">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Billed To</p>
              <h3 className="text-lg font-bold text-slate-800">{invoice.client.companyName}</h3>
              <p className="text-slate-600">{invoice.client.name}</p>
              <p className="text-slate-500 text-sm mt-1">{invoice.client.email}</p>
              {invoice.client.address && <p className="text-slate-500 text-sm">{invoice.client.address}</p>}
            </div>
            <div className="text-right">
              <div className="mb-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Issue Date</p>
                <p className="font-medium text-slate-800">{new Date(invoice.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Due Date</p>
                <p className="font-medium text-slate-800">{new Date(invoice.dueDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <table className="w-full text-left mb-12">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="py-3 font-bold text-slate-800">Description</th>
                <th className="py-3 font-bold text-slate-800 text-center">Qty</th>
                <th className="py-3 font-bold text-slate-800 text-right">Rate</th>
                <th className="py-3 font-bold text-slate-800 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoice.items.map((item, i) => (
                <tr key={i}>
                  <td className="py-4 text-slate-600">{item.description}</td>
                  <td className="py-4 text-slate-600 text-center">{item.quantity}</td>
                  <td className="py-4 text-slate-600 text-right">₹{item.rate.toFixed(2)}</td>
                  <td className="py-4 font-medium text-slate-800 text-right">₹{item.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end">
            <div className="w-1/2 min-w-[250px]">
              <div className="flex justify-between py-2 text-slate-600">
                <span>Subtotal</span>
                <span>₹{invoice.subtotal.toFixed(2)}</span>
              </div>
              {invoice.tax > 0 && (
                <div className="flex justify-between py-2 text-slate-600">
                  <span>Tax</span>
                  <span>₹{invoice.tax.toFixed(2)}</span>
                </div>
              )}
              {invoice.discount > 0 && (
                <div className="flex justify-between py-2 text-emerald-600">
                  <span>Discount</span>
                  <span>-₹{invoice.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between py-4 border-t-2 border-slate-800 mt-2">
                <span className="text-xl font-bold text-slate-800">Grand Total</span>
                <span className={`text-xl font-bold ${invoice.status === 'PAID' ? 'text-emerald-600' : 'text-indigo-600'}`}>
                  ₹{invoice.grandTotal.toFixed(2)}
                </span>
              </div>
              
              <div className="flex justify-end mt-4">
                <div className={`px-4 py-2 font-bold uppercase tracking-wider rounded-lg border-2 ${
                  invoice.status === 'PAID' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  invoice.status === 'OVERDUE' ? 'bg-red-50 text-red-700 border-red-200' :
                  invoice.status === 'PARTIALLY_PAID' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                  'bg-slate-50 text-slate-600 border-slate-200'
                }`}>
                  {invoice.status === 'PAID' ? 'PAID SUCCESSFULLY' : `STATUS: ${invoice.status.replace("_", " ")}`}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-slate-200 text-slate-500 text-sm text-center">
            {invoice.status === 'PAID' ? (
              <p className="font-medium text-emerald-600 text-base">Payment received in full. Thank you for your business!</p>
            ) : (
              <>
                <p>Please make payment within 30 days of receiving this invoice.</p>
                <p className="font-medium mt-1">Thank you for your business!</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
