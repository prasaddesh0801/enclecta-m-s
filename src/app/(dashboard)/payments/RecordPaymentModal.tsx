"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { motion } from "framer-motion";

export default function RecordPaymentModal({ invoices }: { invoices: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    invoiceId: "",
    amount: "",
    paymentMode: "BANK_TRANSFER",
    paymentDate: new Date().toISOString().split('T')[0],
    transactionId: "",
  });

  const MODES = [
    { id: "BANK_TRANSFER", label: "Bank Transfer" },
    { id: "UPI", label: "UPI" },
    { id: "CASH", label: "Cash" },
    { id: "CHEQUE", label: "Cheque" },
    { id: "ONLINE", label: "Online Gateway" }
  ];

  // Auto-fill amount if an invoice is selected
  const handleInvoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const invId = e.target.value;
    const invoice = invoices.find(inv => inv.id === invId);
    
    if (invoice) {
      const paidAlready = invoice.advanceAmount + (invoice.payments?.reduce((acc: number, p: any) => acc + p.amount, 0) || 0);
      const remaining = Math.max(0, invoice.grandTotal - paidAlready);
      setFormData({ ...formData, invoiceId: invId, amount: remaining.toString() });
    } else {
      setFormData({ ...formData, invoiceId: invId, amount: "" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsOpen(false);
        setFormData({
          invoiceId: "",
          amount: "",
          paymentMode: "BANK_TRANSFER",
          paymentDate: new Date().toISOString().split('T')[0],
          transactionId: "",
        });
        router.refresh();
      } else {
        alert("Failed to record payment");
      }
    } catch (error) {
      console.error(error);
      alert("Error recording payment");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-medium hover:bg-primary/90 transition-colors"
      >
        <Plus className="w-4 h-4" /> Record Payment
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[#1c2128] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-white/10">
              <h2 className="text-xl font-semibold text-foreground">Record Payment</h2>
              <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Invoice</label>
                <select
                  required
                  value={formData.invoiceId}
                  onChange={handleInvoiceChange}
                  className="w-full px-4 py-2 rounded-lg bg-black/20 border border-white/10 text-foreground focus:outline-none focus:border-primary/50 transition-colors appearance-none"
                >
                  <option value="" className="bg-[#1c2128]">Select unpaid invoice...</option>
                  {invoices.map(inv => {
                    const paidAlready = inv.advanceAmount + (inv.payments?.reduce((acc: number, p: any) => acc + p.amount, 0) || 0);
                    const remaining = Math.max(0, inv.grandTotal - paidAlready);
                    return (
                      <option key={inv.id} value={inv.id} className="bg-[#1c2128]">
                        {inv.invoiceNo} - {inv.client.companyName} (Remaining: ₹{remaining.toFixed(2)})
                      </option>
                    )
                  })}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-black/20 border border-white/10 text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Payment Mode</label>
                  <select
                    required
                    value={formData.paymentMode}
                    onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-black/20 border border-white/10 text-foreground focus:outline-none focus:border-primary/50 transition-colors appearance-none"
                  >
                    {MODES.map(m => (
                      <option key={m.id} value={m.id} className="bg-[#1c2128]">{m.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={formData.paymentDate}
                    onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-black/20 border border-white/10 text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
              </div>

              {formData.paymentMode !== 'CASH' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                >
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Transaction ID / Reference</label>
                  <input
                    type="text"
                    required
                    value={formData.transactionId}
                    onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                    placeholder="e.g. TXN-12345678"
                    className="w-full px-4 py-2 rounded-lg bg-black/20 border border-white/10 text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </motion.div>
              )}

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !formData.invoiceId}
                  className="bg-primary text-primary-foreground px-5 py-2 rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isLoading ? "Saving..." : "Save Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
