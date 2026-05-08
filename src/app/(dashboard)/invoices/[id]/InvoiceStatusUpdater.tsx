"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function InvoiceStatusUpdater({ invoiceId, currentStatus }: { invoiceId: string, currentStatus: string }) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  const STAGES = [
    { id: "DRAFT", label: "Draft" },
    { id: "SENT", label: "Sent" },
    { id: "PARTIALLY_PAID", label: "Partially Paid" },
    { id: "PAID", label: "Paid" },
    { id: "OVERDUE", label: "Overdue" },
    { id: "CANCELLED", label: "Cancelled" }
  ];

  const handleUpdate = async (newStatus: string) => {
    if (newStatus === currentStatus) return;
    
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to update status", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <select
        disabled={isUpdating}
        value={currentStatus}
        onChange={(e) => handleUpdate(e.target.value)}
        className={`px-4 py-2 bg-black/20 border border-white/10 rounded-xl text-sm font-medium focus:outline-none focus:border-primary/50 transition-colors cursor-pointer appearance-none disabled:opacity-50
          ${currentStatus === 'PAID' ? 'text-emerald-400' : ''}
          ${currentStatus === 'OVERDUE' ? 'text-red-400' : ''}
        `}
      >
        {STAGES.map(stage => (
          <option key={stage.id} value={stage.id} className="bg-background text-foreground">
            {stage.label}
          </option>
        ))}
      </select>
    </div>
  );
}
