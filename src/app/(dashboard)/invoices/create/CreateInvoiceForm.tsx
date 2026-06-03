"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function CreateInvoiceForm({ clients }: { clients: any[] }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    clientId: "",
    dueDate: "",
    discount: 0,
    status: "DRAFT"
  });

  const [withGst, setWithGst] = useState(false);

  const [items, setItems] = useState([
    { description: "", quantity: 1, rate: 0 }
  ]);

  const handleAddItem = () => {
    setItems([...items, { description: "", quantity: 1, rate: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.rate), 0);
  const tax = withGst ? subtotal * 0.18 : 0;
  const grandTotal = subtotal + tax - formData.discount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          withGst,
          items
        })
      });

      if (res.ok) {
        const invoice = await res.json();
        router.push(`/invoices/${invoice.id}`);
      } else {
        const data = await res.json();
        setError(data.message || "Failed to create invoice");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card rounded-2xl border border-white/5 overflow-hidden">
      <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/10">
        <div className="flex items-center gap-4">
          <Link href="/invoices" className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </Link>
          <h2 className="text-xl font-semibold text-foreground">Invoice Details</h2>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-semibold hover:bg-primary/90 transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isLoading ? "Saving..." : "Save Invoice"}
        </button>
      </div>

      <div className="p-6 space-y-8">
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Client</label>
            <select
              required
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-foreground focus:outline-none focus:border-primary/50 transition-all appearance-none"
            >
              <option value="" className="bg-background">Select a client...</option>
              {clients.map(client => (
                <option key={client.id} value={client.id} className="bg-background">
                  {client.companyName} ({client.name})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Due Date</label>
            <input
              type="date"
              required
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-foreground focus:outline-none focus:border-primary/50 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-foreground focus:outline-none focus:border-primary/50 transition-all appearance-none"
            >
              <option value="DRAFT" className="bg-background">Draft</option>
              <option value="SENT" className="bg-background">Sent</option>
              <option value="PARTIALLY_PAID" className="bg-background">Partially Paid</option>
              <option value="PAID" className="bg-background">Paid</option>
            </select>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-foreground">Line Items</h3>
            <button
              type="button"
              onClick={handleAddItem}
              className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Item
            </button>
          </div>

          <div className="hidden md:grid grid-cols-12 gap-4 px-4 pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-white/5 mb-4">
            <div className="col-span-5">Description</div>
            <div className="col-span-2">Quantity</div>
            <div className="col-span-2">Price</div>
            <div className="col-span-2 text-right">Amount</div>
            <div className="col-span-1"></div>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={index} 
                className="grid grid-cols-12 gap-4 items-center bg-white/[0.02] p-4 rounded-xl border border-white/5"
              >
                <div className="col-span-12 md:col-span-5">
                  <label className="block text-xs font-medium text-muted-foreground mb-1 md:hidden">Description</label>
                  <input
                    type="text"
                    required
                    value={item.description}
                    onChange={(e) => updateItem(index, "description", e.target.value)}
                    placeholder="Item description"
                    className="w-full px-3 py-2 rounded-lg bg-black/20 border border-white/10 focus:border-primary/50"
                  />
                </div>
                <div className="col-span-4 md:col-span-2">
                  <label className="block text-xs font-medium text-muted-foreground mb-1 md:hidden">Qty</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={item.quantity}
                    onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg bg-black/20 border border-white/10 focus:border-primary/50"
                  />
                </div>
                <div className="col-span-4 md:col-span-2">
                  <label className="block text-xs font-medium text-muted-foreground mb-1 md:hidden">Price</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={item.rate}
                    onChange={(e) => updateItem(index, "rate", parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg bg-black/20 border border-white/10 focus:border-primary/50"
                  />
                </div>
                <div className="col-span-3 md:col-span-2 text-right">
                  <label className="block text-xs font-medium text-muted-foreground mb-1 md:hidden">Amount</label>
                  <span className="font-medium">₹{(item.quantity * item.rate).toFixed(2)}</span>
                </div>
                <div className="col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    disabled={items.length === 1}
                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-white/10">
          <div className="w-full max-w-sm space-y-4">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-muted-foreground py-2">
              <span>Apply GST (18%)</span>
              <button 
                type="button"
                onClick={() => setWithGst(!withGst)}
                className={`w-12 h-6 rounded-full transition-colors relative ${withGst ? 'bg-primary' : 'bg-white/10'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${withGst ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
            {withGst && (
              <div className="flex justify-between text-muted-foreground">
                <span>GST Amount</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Discount</span>
              <div className="flex items-center">
                <span className="mr-2 text-muted-foreground">₹</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                  className="w-24 px-3 py-1 rounded-lg bg-black/20 border border-white/10 focus:border-primary/50 text-right"
                />
              </div>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-white/10">
              <span className="text-lg font-bold text-foreground">Grand Total</span>
              <span className="text-2xl font-bold text-primary">₹{Math.max(0, grandTotal).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
