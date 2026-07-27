"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ArrowLeft, Save, BadgeCheck, Clock3, HandCoins } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const paymentStatuses = [
  {
    value: "PAID",
    label: "Paid",
    description: "The full invoice amount has been received.",
    icon: BadgeCheck,
    activeClassName: "border-emerald-400/60 bg-emerald-500/10 text-emerald-300",
  },
  {
    value: "PARTIALLY_PAID",
    label: "Advance",
    description: "An advance payment has been received.",
    icon: HandCoins,
    activeClassName: "border-amber-400/60 bg-amber-500/10 text-amber-300",
  },
  {
    value: "SENT",
    label: "Unpaid",
    description: "Payment is still pending from the client.",
    icon: Clock3,
    activeClassName: "border-sky-400/60 bg-sky-500/10 text-sky-300",
  },
] as const;

type PaymentStatus = (typeof paymentStatuses)[number]["value"];
type Client = { id: string; name: string; companyName: string };
type InvoiceItem = { description: string; quantity: number; rate: number };

export default function CreateInvoiceForm({ clients }: { clients: Client[] }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    clientId: "",
    dueDate: "",
    discount: 0,
    advanceAmount: 0,
    status: "SENT" as PaymentStatus
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

  const updateItem = <Field extends keyof InvoiceItem>(index: number, field: Field, value: InvoiceItem[Field]) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.rate), 0);
  const tax = withGst ? subtotal * 0.18 : 0;
  const grandTotal = subtotal + tax - formData.discount;
  const balanceDue = Math.max(0, grandTotal - formData.advanceAmount);

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
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card overflow-hidden rounded-2xl border border-white/5">
      <div className="flex flex-col gap-4 border-b border-white/10 bg-black/10 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-center gap-4">
          <Link href="/invoices" aria-label="Back to invoices" className="rounded-full p-2 transition-colors hover:bg-white/10">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </Link>
          <div>
            <h2 className="text-xl font-semibold text-foreground">New invoice</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">Add billing details, items, and payment status.</p>
          </div>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50 sm:w-auto"
        >
          <Save className="w-4 h-4" />
          {isLoading ? "Saving..." : "Save Invoice"}
        </button>
      </div>

      <div className="space-y-8 p-5 sm:p-6">
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl">
            {error}
          </div>
        )}

        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
          <div className="mb-5">
            <h3 className="font-semibold text-foreground">Invoice details</h3>
            <p className="mt-1 text-sm text-muted-foreground">Select the client and when this invoice is due.</p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Client</label>
            <select
              required
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              className="w-full appearance-none rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-foreground transition-all focus:border-primary/50 focus:outline-none"
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
            <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Due date</label>
            <input
              type="date"
              required
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-foreground transition-all focus:border-primary/50 focus:outline-none"
            />
          </div>
          </div>
        </section>

        <fieldset>
          <legend className="text-base font-semibold text-foreground">Payment status</legend>
          <p className="mt-1 text-sm text-muted-foreground">Choose the current payment state for this invoice.</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {paymentStatuses.map(({ value, label, description, icon: Icon, activeClassName }) => {
              const isSelected = formData.status === value;

              return (
                <label
                  key={value}
                  className={`group relative flex cursor-pointer gap-3 rounded-xl border p-4 transition-all ${
                    isSelected
                      ? activeClassName
                      : "border-white/10 bg-white/[0.02] text-foreground hover:border-white/25 hover:bg-white/[0.04]"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentStatus"
                    value={value}
                    checked={isSelected}
                    onChange={() => setFormData({ ...formData, status: value })}
                    className="sr-only"
                  />
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                    isSelected ? "bg-white/10" : "bg-white/[0.06] text-muted-foreground"
                  }`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block font-semibold">{label}</span>
                    <span className={`mt-0.5 block text-xs leading-5 ${isSelected ? "opacity-80" : "text-muted-foreground"}`}>
                      {description}
                    </span>
                  </span>
                  <span className={`absolute right-4 top-4 h-4 w-4 rounded-full border-2 ${
                    isSelected ? "border-current bg-current shadow-[inset_0_0_0_3px_rgba(10,10,10,0.9)]" : "border-white/30"
                  }`} />
                </label>
              );
            })}
          </div>
        </fieldset>

        {formData.status === "PARTIALLY_PAID" && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-amber-400/30 bg-amber-500/[0.06] p-4 sm:p-5"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex-1">
                <label htmlFor="advanceAmount" className="block text-sm font-semibold text-amber-200">
                  Advance amount received (₹)
                </label>
                <p className="mt-1 text-sm text-amber-100/70">Enter the amount already paid by the client.</p>
                <input
                  id="advanceAmount"
                  type="number"
                  min="0.01"
                  max={Math.max(0, grandTotal)}
                  step="0.01"
                  required
                  value={formData.advanceAmount}
                  onChange={(e) => setFormData({ ...formData, advanceAmount: parseFloat(e.target.value) || 0 })}
                  className="mt-3 w-full rounded-xl border border-amber-300/30 bg-black/20 px-4 py-3 text-foreground transition-all focus:border-amber-300/70 focus:outline-none sm:max-w-sm"
                />
              </div>
              <div className="rounded-xl border border-amber-300/20 bg-black/20 px-4 py-3 sm:min-w-48">
                <p className="text-xs font-medium uppercase tracking-wider text-amber-100/60">Balance due</p>
                <p className="mt-1 text-xl font-bold text-amber-200">₹{balanceDue.toFixed(2)}</p>
              </div>
            </div>
          </motion.div>
        )}

        <section>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Line items</h3>
              <p className="mt-1 text-sm text-muted-foreground">Add each product or service to be billed.</p>
            </div>
            <button
              type="button"
              onClick={handleAddItem}
              className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm font-medium text-primary transition-colors hover:border-white/25 hover:bg-white/[0.04] hover:text-primary/80"
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
        </section>

        <div className="flex justify-end pt-6 border-t border-white/10">
          <div className="w-full max-w-sm space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
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
            {formData.status === "PARTIALLY_PAID" && (
              <div className="flex justify-between text-amber-300">
                <span>Advance paid</span>
                <span>₹{formData.advanceAmount.toFixed(2)}</span>
              </div>
            )}
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
